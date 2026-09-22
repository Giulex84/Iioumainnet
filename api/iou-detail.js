import { randomUUID } from 'node:crypto';
import { verifyPiUser, apiError } from '../lib/pi.js';
import { rememberUser, claimPendingIous, getIou, saveIou, enforceRateLimit, withIouLock } from '../lib/store.js';
import { safeRecordMetric } from '../lib/metrics.js';
const same=(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase();
const terminal=s=>['settled','declined','cancelled','closed_by_agreement'].includes(s);
function allowed(iou,user){return iou.creatorUid===user.uid||iou.counterpartyUid===user.uid||same(iou.creatorUsername,user.username)||same(iou.counterpartyUsername,user.username)}
function view(iou,user){const isDebtor=same(iou.debtorUsername,user.username);const isCreditor=same(iou.creditorUsername,user.username);const confirmed=(iou.partialPayments||[]).filter(p=>p.status==='confirmed');const paid=Math.round(confirmed.reduce((s,p)=>s+Number(p.amount||0),0)*1e7)/1e7;const remaining=iou.status==='settled'?0:Math.max(0,Math.round((Number(iou.amount)-paid)*1e7)/1e7);const pending=(iou.partialPayments||[]).find(p=>p.status==='claimed')||null;const reminders=Array.isArray(iou.reminders)?iou.reminders:[];const mine=[...reminders].reverse().find(r=>same(r.by,user.username));const close=iou.closeRequest||null;const requestedByMe=close&&same(close.requestedBy,user.username);const canRemind=!terminal(iou.status)&&iou.status!=='closure_requested'&&(!mine||Date.now()-new Date(mine.at).getTime()>=259200000);return{id:iou.id,amount:iou.amount,note:iou.note,dueDate:iou.dueDate,status:iou.status,debtorUsername:iou.debtorUsername,creditorUsername:iou.creditorUsername,creatorUsername:iou.creatorUsername,counterpartyUsername:iou.counterpartyUsername,createdAt:iou.createdAt,updatedAt:iou.updatedAt,settledAt:iou.settledAt||null,settlementClaimedAt:iou.settlementClaimedAt||null,closedAt:iou.closedAt||null,closeRequest:close,recurrence:iou.recurrence||{frequency:'none'},installmentPlan:iou.installmentPlan||null,reminderCount:reminders.length,lastReminderAt:reminders.at(-1)?.at||null,role:isDebtor?'debtor':'creditor',history:Array.isArray(iou.history)?iou.history:[],partialPayments:iou.partialPayments||[],paidAmount:paid,effectivePaidAmount:iou.status==='settled'?Number(iou.amount):paid,remainingAmount:remaining,archived:Boolean((iou.archivedBy||[]).includes(user.uid)),permissions:{canAddNote:!terminal(iou.status),canRemind,canClaimPartial:isDebtor&&iou.status==='accepted'&&remaining>0&&!pending,canReviewPartial:isCreditor&&iou.status==='accepted'&&Boolean(pending),canRequestClose:iou.status==='accepted'&&!pending,canReviewClose:iou.status==='closure_requested'&&!requestedByMe,canCancelClose:iou.status==='closure_requested'&&requestedByMe,canArchive:terminal(iou.status)}}}
export default async function handler(req,res){
  try{
    const user=await verifyPiUser(req);
    await rememberUser(user);
    await claimPendingIous(user);
    const id=String(req.method==='GET'?req.query?.id:req.body?.id||'');
    if(!id)return res.status(400).json({success:false,error:'Missing IOU id'});
    if(req.method==='GET'){
      const iou=await getIou(id);
      if(!iou)return res.status(404).json({success:false,error:'IOU not found'});
      if(!allowed(iou,user))return res.status(403).json({success:false,error:'You do not have access to this IOU'});
      return res.status(200).json({success:true,iou:view(iou,user)});
    }
    if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({success:false,error:'Method not allowed'})}
    await enforceRateLimit(user.uid,'iou-detail-write',45,60);
    return await withIouLock(id,async()=>{
      const iou=await getIou(id);
      if(!iou)return res.status(404).json({success:false,error:'IOU not found'});
      if(!allowed(iou,user))return res.status(403).json({success:false,error:'You do not have access to this IOU'});
      const action=String(req.body?.action||'');
      const now=new Date().toISOString();
      iou.history=Array.isArray(iou.history)?iou.history:[];
      iou.partialPayments=Array.isArray(iou.partialPayments)?iou.partialPayments:[];
      iou.reminders=Array.isArray(iou.reminders)?iou.reminders:[];
      if(action==='add_note'){
        if(terminal(iou.status))return res.status(409).json({success:false,error:'Closed IOUs cannot receive new activity notes'});
        const text=String(req.body?.text||'').trim();
        if(!text||text.length>240)return res.status(400).json({success:false,error:'Note must be between 1 and 240 characters'});
        iou.history.push({type:'note',by:user.username,text,at:now});
      }else if(action==='send_reminder'){
        if(terminal(iou.status))return res.status(409).json({success:false,error:'Closed IOUs do not need reminders'});
        const previous=[...iou.reminders].reverse().find(r=>same(r.by,user.username));
        if(previous&&Date.now()-new Date(previous.at).getTime()<259200000)return res.status(429).json({success:false,error:'A reminder can be sent once every 72 hours'});
        const to=same(iou.debtorUsername,user.username)?iou.creditorUsername:iou.debtorUsername;
        iou.reminders.push({by:user.username,to,at:now});
        iou.history.push({type:'reminder_sent',by:user.username,to,at:now});
        await safeRecordMetric(user.uid,'reminder_sent',`${iou.id}:${now.slice(0,10)}`);
      }else if(action==='claim_partial'){
        if(!same(iou.debtorUsername,user.username)||iou.status!=='accepted')return res.status(409).json({success:false,error:'Partial payment claim is not available'});
        if(iou.partialPayments.some(p=>p.status==='claimed'))return res.status(409).json({success:false,error:'A partial payment is already awaiting confirmation'});
        const confirmed=iou.partialPayments.filter(p=>p.status==='confirmed').reduce((s,p)=>s+Number(p.amount||0),0);
        const remaining=Math.max(0,Number(iou.amount)-confirmed);
        const amount=Math.round(Number(req.body?.amount)*1e7)/1e7;
        if(!Number.isFinite(amount)||amount<=0||amount>=remaining)return res.status(400).json({success:false,error:'Partial amount must be greater than 0 and less than the remaining balance'});
        const payment={id:randomUUID(),amount,status:'claimed',claimedBy:user.username,claimedAt:now};
        iou.partialPayments.push(payment);
        iou.history.push({type:'partial_claimed',by:user.username,amount,paymentId:payment.id,at:now});
      }else if(action==='confirm_partial'||action==='reject_partial'){
        if(!same(iou.creditorUsername,user.username)||iou.status!=='accepted')return res.status(409).json({success:false,error:'Partial payment review is not available'});
        const p=iou.partialPayments.find(p=>p.status==='claimed'&&(!req.body?.paymentId||p.id===req.body.paymentId));
        if(!p)return res.status(404).json({success:false,error:'No pending partial payment found'});
        if(action==='confirm_partial'){p.status='confirmed';p.confirmedBy=user.username;p.confirmedAt=now;iou.history.push({type:'partial_confirmed',by:user.username,amount:p.amount,paymentId:p.id,at:now});await safeRecordMetric(user.uid,'partial_confirmed',p.id)}
        else{p.status='rejected';p.rejectedBy=user.username;p.rejectedAt=now;iou.history.push({type:'partial_rejected',by:user.username,amount:p.amount,paymentId:p.id,at:now})}
      }else if(action==='request_close'){
        if(iou.status!=='accepted'||iou.partialPayments.some(p=>p.status==='claimed'))return res.status(409).json({success:false,error:'This agreement cannot be closed while another confirmation is pending'});
        const reason=String(req.body?.reason||'other');
        if(!['created_by_mistake','duplicate','agreement_cancelled','other'].includes(reason))return res.status(400).json({success:false,error:'Choose a valid closure reason'});
        const text=String(req.body?.text||'').trim();if(text.length>160)return res.status(400).json({success:false,error:'Closure note is too long'});
        iou.closeRequest={requestedBy:user.username,reason,text,requestedAt:now};iou.status='closure_requested';
        iou.history.push({type:'close_requested',by:user.username,reason,text,at:now});await safeRecordMetric(user.uid,'closure_requested',iou.id);
      }else if(action==='confirm_close'||action==='reject_close'||action==='cancel_close'){
        if(iou.status!=='closure_requested'||!iou.closeRequest)return res.status(409).json({success:false,error:'There is no closure request to review'});
        const mine=same(iou.closeRequest.requestedBy,user.username);
        if(action==='cancel_close'&&!mine)return res.status(403).json({success:false,error:'Only the requester can cancel this request'});
        if(action!=='cancel_close'&&mine)return res.status(403).json({success:false,error:'The other participant must review this request'});
        if(action==='confirm_close'){iou.status='closed_by_agreement';iou.closedAt=now;iou.closedReason=iou.closeRequest.reason;iou.history.push({type:'close_confirmed',by:user.username,at:now});await safeRecordMetric(user.uid,'closed_by_agreement',iou.id)}
        else{iou.status='accepted';iou.history.push({type:action==='reject_close'?'close_rejected':'close_cancelled',by:user.username,at:now})}
        iou.closeRequest=null;
      }else if(action==='archive'||action==='unarchive'){
        if(!terminal(iou.status))return res.status(409).json({success:false,error:'Only closed IOUs can be archived'});
        iou.archivedBy=Array.isArray(iou.archivedBy)?iou.archivedBy:[];
        if(action==='archive'&&!iou.archivedBy.includes(user.uid))iou.archivedBy.push(user.uid);
        if(action==='unarchive')iou.archivedBy=iou.archivedBy.filter(uid=>uid!==user.uid);
      }else return res.status(400).json({success:false,error:'Unknown action'});
      iou.updatedAt=now;
      await saveIou(iou);
      return res.status(200).json({success:true,iou:view(iou,user)});
    });
  }catch(error){
    if(error?.status===429&&error?.retryAfter)res.setHeader('Retry-After',String(error.retryAfter));
    return apiError(res,error);
  }
}
