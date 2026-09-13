import { verifyPiUser, piServerRequest, apiError } from '../lib/pi.js';

const AMOUNT = 0.01;
const MEMO = 'Support IIOU Mainnet';
const PRODUCT = 'iiou_support';

function sameAmount(value){return Math.abs(Number(value)-AMOUNT)<1e-9}
function validatePayment(payment,user){
  if(!payment) throw Object.assign(new Error('Payment not found'),{status:404});
  if(payment.user_uid!==user.uid) throw Object.assign(new Error('Payment user mismatch'),{status:403});
  if(payment.direction && payment.direction!=='user_to_app') throw Object.assign(new Error('Invalid payment direction'),{status:400});
  if(!sameAmount(payment.amount)) throw Object.assign(new Error('Invalid payment amount'),{status:400});
  if(payment.memo!==MEMO) throw Object.assign(new Error('Invalid payment memo'),{status:400});
  if(payment.metadata?.product!==PRODUCT) throw Object.assign(new Error('Invalid payment metadata'),{status:400});
  if(payment.network && payment.network!=='Pi Network') throw Object.assign(new Error('Payment is not on Pi Mainnet'),{status:400});
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({success:false,error:'Method not allowed'});
  try{
    const user=await verifyPiUser(req);
    const {action,paymentId,txid}=req.body||{};
    if(!paymentId) return res.status(400).json({success:false,error:'Missing paymentId'});
    const payment=await piServerRequest(`/payments/${encodeURIComponent(paymentId)}`);
    validatePayment(payment,user);

    if(action==='approve'){
      if(payment.status?.cancelled||payment.status?.user_cancelled) return res.status(409).json({success:false,error:'Payment was cancelled'});
      if(payment.status?.developer_approved) return res.json({success:true,payment});
      const approved=await piServerRequest(`/payments/${encodeURIComponent(paymentId)}/approve`,{method:'POST'});
      return res.json({success:true,payment:approved});
    }

    if(action==='complete'){
      if(!txid) return res.status(400).json({success:false,error:'Missing txid'});
      if(payment.transaction?.txid && payment.transaction.txid!==txid) return res.status(400).json({success:false,error:'Transaction mismatch'});
      if(payment.status?.developer_completed) return res.json({success:true,payment});
      const completed=await piServerRequest(`/payments/${encodeURIComponent(paymentId)}/complete`,{method:'POST',body:JSON.stringify({txid})});
      return res.json({success:true,payment:completed});
    }

    if(action==='recover'){
      const existingTxid=payment.transaction?.txid;
      if(payment.status?.developer_completed) return res.json({success:true,state:'completed'});
      if(existingTxid){
        const completed=await piServerRequest(`/payments/${encodeURIComponent(paymentId)}/complete`,{method:'POST',body:JSON.stringify({txid:existingTxid})});
        return res.json({success:true,state:'completed',payment:completed});
      }
      if(!payment.status?.developer_approved){
        const approved=await piServerRequest(`/payments/${encodeURIComponent(paymentId)}/approve`,{method:'POST'});
        return res.json({success:true,state:'approved',payment:approved});
      }
      return res.json({success:true,state:'approved'});
    }

    return res.status(400).json({success:false,error:'Invalid action'});
  }catch(error){return apiError(res,error)}
}
