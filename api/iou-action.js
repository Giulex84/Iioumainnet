import { randomUUID } from 'node:crypto';
import { verifyPiUser, apiError } from '../lib/pi.js';
import { rememberUser, claimPendingIous, getIou, saveIou, enforceRateLimit, withIouLock } from '../lib/store.js';
import { safeRecordMetric } from '../lib/metrics.js';
const same=(a,b)=>String(a||'').toLowerCase()===String(b||'').toLowerCase();
function nextDueDate(value,frequency){if(!value||!['weekly','monthly'].includes(frequency))return null;const d=new Date(`${value}T00:00:00Z`);if(frequency==='weekly')d.setUTCDate(d.getUTCDate()+7);else{const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+1);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last))}return d.toISOString().slice(0,10)}
async function generateNextCycle(iou,now){const frequency=iou.recurrence?.frequency;if(!['weekly','monthly'].includes(frequency)||iou.recurrenceGeneratedId)return null;const id=randomUUID();const next={...iou,id,status:'proposed',dueDate:nextDueDate(iou.dueDate,frequency),createdAt:now,updatedAt:now,settledAt:null,settlementClaimedAt:null,partialPayments:[],reminders:[],archivedBy:[],recurrence:{frequency,seriesId:iou.recurrence.seriesId||iou.id,cycle:Number(iou.recurrence.cycle||1)+1},history:[{type:'recurring_cycle_created',by:'IIOU',at:now,previousIouId:iou.id}]};delete next.recurrenceGeneratedId;iou.recurrenceGeneratedId=id;await saveIou(next);return next}
export default async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,error:'Method not allowed'})}
  try{
    const user=await verifyPiUser(req);
    await enforceRateLimit(user.uid,'iou-action',30,60);
    await rememberUser(user);
    await claimPendingIous(user);
    const{id,action}=req.body||{};
    const cleanId=String(id||'');
    if(!cleanId)return res.status(400).json({success:false,error:'Missing IOU id'});
    return await withIouLock(cleanId,async()=>{
      const iou=await getIou(cleanId);
      if(!iou)return res.status(404).json({success:false,error:'IOU not found'});
      const isCreator=iou.creatorUid===user.uid||same(iou.creatorUsername,user.username);
      const isCounterparty=iou.counterpartyUid===user.uid||same(iou.counterpartyUsername,user.username);
      const isDebtor=same(iou.debtorUsername,user.username);
      const isCreditor=same(iou.creditorUsername,user.username);
      if(!isCreator&&!isCounterparty)return res.status(403).json({success:false,error:'You do not have access to this IOU'});
      let next=null;
      if(action==='accept'&&isCounterparty&&iou.status==='proposed')next='accepted';
      if(action==='decline'&&isCounterparty&&iou.status==='proposed')next='declined';
      if(action==='cancel'&&isCreator&&iou.status==='proposed')next='cancelled';
      if(action==='claim_paid'&&isDebtor&&iou.status==='accepted')next='payment_claimed';
      if(action==='confirm_paid'&&isCreditor&&iou.status==='payment_claimed')next='settled';
      if(action==='reject_payment_claim'&&isCreditor&&iou.status==='payment_claimed')next='accepted';
      if(!next)return res.status(409).json({success:false,error:'This action is not available for the current IOU state'});
      const now=new Date().toISOString();
      iou.status=next;iou.updatedAt=now;
      if(next==='payment_claimed')iou.settlementClaimedAt=now;
      if(next==='settled')iou.settledAt=now;
      if(action==='reject_payment_claim')iou.settlementClaimedAt=null;
      iou.history=Array.isArray(iou.history)?iou.history:[];
      iou.history.push({type:action,by:user.username,at:now});
      const recurring=next==='settled'?await generateNextCycle(iou,now):null;
      await saveIou(iou);
      await safeRecordMetric(user.uid,next==='settled'?'iou_settled':'iou_action',`${iou.id}:${action}`);
      if(recurring)await safeRecordMetric(user.uid,'recurring_cycle_generated',recurring.id);
      return res.status(200).json({success:true,status:iou.status,updatedAt:iou.updatedAt,nextIouId:recurring?.id||null});
    });
  }catch(error){
    if(error?.status===429&&error?.retryAfter)res.setHeader('Retry-After',String(error.retryAfter));
    return apiError(res,error);
  }
}
