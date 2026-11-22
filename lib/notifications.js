import { getJson, setJson, getUserByUsername, reserveNotification } from './store.js';
import { piServerRequest } from './pi.js';
const key=uid=>`iiou-mainnet:notifications:preferences:${uid}`;
export async function notificationPreference(user, enabled) {
  if(typeof enabled==='boolean') {
    if(enabled&&!user.credentials?.scopes?.includes('in_app_notifications'))throw Object.assign(new Error('Notification permission was not granted by Pi'),{status:403});
    await setJson(key(user.uid),{enabled,updatedAt:new Date().toISOString()});
  }
  return Boolean((await getJson(key(user.uid)))?.enabled);
}
// Notifications never contain amounts, usernames, reasons or shared notes.
// Reserve before sending: ambiguous network failures are not automatically retried.
export async function notifyAgreement(iou, actor, event) {
  if(!['created','accept','decline','claim_paid','confirm_paid','reject_payment_claim','request_close','confirm_close','reject_close','claim_partial','confirm_partial','reject_partial','send_reminder'].includes(event))return 'skipped';
  try {
    const creator=iou.creatorUid===actor.uid;
    if(!creator&&iou.counterpartyUid!==actor.uid&&String(iou.counterpartyUsername).toLowerCase()!==String(actor.username).toLowerCase())return 'skipped';
    const recipient=await getUserByUsername(creator?iou.counterpartyUsername:iou.creatorUsername);
    const expected=creator?iou.counterpartyUid:iou.creatorUid;
    if(!recipient?.uid||recipient.uid===actor.uid||(expected&&expected!==recipient.uid))return 'skipped';
    if(!await notificationPreference(recipient))return 'disabled';
    if(!process.env.PI_API_KEY)return 'unavailable';
    const eventId=`${iou.id}:${event}:${iou.updatedAt}:${recipient.uid}`;
    if(!await reserveNotification(eventId,recipient.uid))return 'limited';
    const data=await piServerRequest('/in_app_notifications/notify',{method:'POST',signal:AbortSignal.timeout(3000),body:JSON.stringify({notifications:[{title:'IIOU',body:'You have an agreement update. Open IIOU to review it.',user_uid:recipient.uid,subroute:'/details.html?id='+encodeURIComponent(iou.id)}]})});
    return Array.isArray(data.delivered_notifications)&&data.delivered_notifications.some(n=>n.user_uid===recipient.uid)?'delivered':'not_delivered';
  } catch { return 'unavailable'; }
}
