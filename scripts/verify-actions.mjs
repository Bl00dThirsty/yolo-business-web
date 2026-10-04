import {chromium} from '../.local/business-ui-tests/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const uid='11111111-1111-4111-8111-111111111111',site='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const exp=Math.floor(Date.now()/1000)+3600;
const jwt=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.fake';
const session={access_token:jwt,refresh_token:'ui-test-only',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:uid,email:'owner@example.invalid',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{},user_metadata:{}}};
await page.addInitScript(({session})=>{localStorage.setItem('sb-rctklynkqyvxyebasfrp-auth-token',JSON.stringify(session));window.print=()=>{window.__printed=true};window.open=(url)=>{window.__shared=url;return null}}, {session});

let status='at_pickup',blocked=false,removed=false,cancelCalls=0,reissueCalls=0,fail=true,requestId;
page.on('dialog',()=>{throw Error('Native dialog used')});
await page.route('https://*.supabase.co/**',async route=>{
const url=route.request().url(),body=route.request().postDataJSON()||{};let result={};
if(url.includes('/auth/v1/user'))result=session.user;
else if(url.includes('/auth/v1/token'))result=session;
else if(url.includes('/rpc/operator_workspace'))result={is_admin:true,locations:[{id:site,name:'Boutique de validation',address:'Yaoundé',lat:3.848,lng:11.502,active:true,position_confirmed_at:new Date().toISOString()}]};
else if(url.includes('/rpc/operator_list_deliveries'))result=[{id:'d1',reference:'YL-001',status,recipient_name:'Client',dropoff_address:'Bastos',pickup_acknowledged_at:new Date().toISOString(),cash_to_collect:0,courier_fee:1500}];
else if(url.includes('/rpc/operator_release_delivery')){cancelCalls++;if(fail){fail=false;requestId=body.p_request_id;await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'Annulation indisponible, réessayez.',code:'P0001'})});return;}assert(body.p_request_id===requestId,'Cancellation retry keeps request identity');status='cancelled';result={ok:true};}
else if(url.includes('/rpc/operator_reissue_recipient_code')){reissueCalls++;assert(body.p_reason.length>=10,'Reissue reason validated');result={delivery_id:'d1',recipient_pin:'123456'};}
else if(url.includes('/rpc/admin_couriers'))result=[];
else if(url.includes('/rpc/business_workspace')){switch(body.p_action){case 'team':result={is_admin:true,can_manage:true,members:removed?[]:[{id:'m1',email:'member@example.invalid',manager:false,blocked,admin:false}],invitations:[]};break;case 'member_block':blocked=body.p_payload.blocked;result={ok:true};break;case 'member_remove':removed=true;result={ok:true};break;default:throw Error(body.p_action)}}
else throw Error('Unexpected call '+url);
await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
});
function assert(ok,label){if(!ok)throw Error(label);console.log('PASS '+label)}
await page.goto('http://127.0.0.1:5181/app');await page.getByRole('button',{name:'Livraisons',exact:true}).click();
await page.getByRole('button',{name:'Réémettre le code destinataire'}).click();let dialog=page.getByRole('dialog');await dialog.getByLabel('Motif de réémission').fill('court');await dialog.getByRole('button',{name:'Créer le nouveau code'}).click();assert(reissueCalls===0,'Short reason blocks submission');await dialog.getByLabel('Motif de réémission').fill('Destinataire vérifié par téléphone');await dialog.getByRole('button',{name:'Créer le nouveau code'}).click();await dialog.waitFor({state:'hidden'});
await page.getByRole('button',{name:'Annuler la livraison',exact:true}).click();await dialog.getByRole('button',{name:'Revenir'}).click();assert(cancelCalls===0,'Dismissal does not cancel delivery');await page.getByRole('button',{name:'Annuler la livraison',exact:true}).click();await dialog.getByRole('button',{name:'Annuler la livraison'}).click();await dialog.getByRole('alert').waitFor();assert(await dialog.isVisible(),'Failure keeps popup open');await dialog.getByRole('button',{name:'Annuler la livraison'}).click();await dialog.waitFor({state:'hidden'});await page.getByText('Annulée',{exact:true}).waitFor();assert(await page.getByRole('button',{name:'Annuler la livraison',exact:true}).count()===0,'Cancelled delivery cannot be cancelled again');
await page.getByRole('button',{name:'Équipe',exact:true}).click();
await page.getByRole('button',{name:'Actions pour member@example.invalid'}).click();await page.getByRole('menuitem',{name:'Bloquer',exact:true}).click();await dialog.getByRole('button',{name:'Bloquer',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.getByText('Bloqué',{exact:true}).waitFor();assert(blocked,'Block action applied');
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Actions pour member@example.invalid'}).click();await page.getByRole('menuitem',{name:'Débloquer',exact:true}).click();await dialog.waitFor();await page.screenshot({path:'.local/member-popup-mobile.png'});assert(await dialog.evaluate(el=>el.getBoundingClientRect().width<=window.innerWidth),'Popup fits mobile');await dialog.getByRole('button',{name:'Débloquer',exact:true}).click();await dialog.waitFor({state:'hidden'});assert(!blocked,'Unblock action applied');
await page.getByRole('button',{name:'Actions pour member@example.invalid'}).click();await page.getByRole('menuitem',{name:'Supprimer',exact:true}).click();await dialog.getByRole('button',{name:'Supprimer le collaborateur'}).click();await dialog.waitFor({state:'hidden'});assert(removed,'Delete action applied');assert(errors.length===0,'No browser runtime errors');await browser.close();
