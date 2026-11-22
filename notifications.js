window.IIOUNotifications={mount:async function(getToken,onIncomplete){
 const box=document.getElementById('notificationSettings');if(!box)return;
 box.hidden=false;
 box.innerHTML='<h3>Pi notifications</h3><p class="muted">Receive private agreement updates in the Pi app Notification Center. Optional; delivery depends on your Pi settings.</p><button type="button" class="secondary">Enable Pi notifications</button><p class="muted" role="status" aria-live="polite"></p>';
 const button=box.querySelector('button'),status=box.querySelector('[role="status"]');let enabled=false,busy=false;
 async function request(token,value){const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'notifications',...(typeof value==='boolean'?{enabled:value}:{})})});const data=await r.json();if(!r.ok)throw Error('notifications');return data.enabled===true;}
 function paint(){button.textContent=enabled?'Disable Pi notifications':'Enable Pi notifications';status.textContent=enabled?'Pi notifications enabled. Delivery is not guaranteed.':'Pi notifications are off.';}
 try{enabled=await request(getToken());paint()}catch{status.textContent='Unable to check notification settings. Try again.';}
 button.onclick=async()=>{if(busy)return;busy=true;button.disabled=true;try{let token=getToken();if(!enabled){const a=await Pi.authenticate(['username','in_app_notifications'],onIncomplete||(()=>{}));token=a.accessToken;}enabled=await request(token,!enabled);paint()}catch{status.textContent='Notification settings were not changed. Check Pi permissions and try again.';}finally{busy=false;button.disabled=false}};
}};
