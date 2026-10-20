import crypto from 'node:crypto';
import {recordMetric} from './store.js';
// Only successful Mainnet sign-ins are measured. All other calls are no-ops.
export async function safeRecordMetric(uid,event,dedupeId='',value=0,eventDay=new Date().toISOString().slice(0,10)){
 if(!uid||event!=='login')return false;
 try{const secret=(process.env.IIOU_METRICS_SECRET||process.env.PI_API_KEY||'').trim();if(!secret)return false;
 const subject=crypto.createHmac('sha256',secret).update(`user:${uid}`).digest('hex');
 return await recordMetric(eventDay,subject,'login');
 }catch{return false;}
}
