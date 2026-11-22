import { notificationPreference } from '../lib/notifications.js';
import { verifyPiUser, apiError } from '../lib/pi.js';
import { rememberUser, claimPendingIous, listIousFor } from '../lib/store.js';
import { safeRecordMetric } from '../lib/metrics.js';
import { publicIou } from './ious.js';
export default async function handler(req,res){if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,error:'Method not allowed'})}try{const user=await verifyPiUser(req);if(req.body?.action==='notifications'){const enabled=await notificationPreference(user,req.body.enabled);return res.status(200).json({success:true,enabled})}await rememberUser(user);await claimPendingIous(user);const [items]=await Promise.all([listIousFor(user.uid),safeRecordMetric(user.uid,'login')]);return res.status(200).json({success:true,user:{uid:user.uid,username:user.username},ious:items.map(i=>publicIou(i,user))})}catch(error){return apiError(res,error)}}
