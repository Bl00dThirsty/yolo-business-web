import {chromium} from '../.local/business-ui-tests/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const uid='11111111-1111-4111-8111-111111111111',site='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const exp=Math.floor(Date.now()/1000)+3600;
const jwt=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.fake';
const session={access_token:jwt,refresh_token:'ui-test-only',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:uid,email:'owner@example.invalid',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{},user_metadata:{}}};
await page.addInitScript(({session})=>{localStorage.setItem('sb-rctklynkqyvxyebasfrp-auth-token',JSON.stringify(session));window.print=()=>{window.__printed=true};window.open=(url)=>{window.__shared=url;return null}}, {session});
let failReads=false;let mutations=0;let invoices=[],createRequests=0;let invites=[];let interruptSave=true;let firstRequest;
await page.route('https://*.supabase.co/**',async route=>{const url=route.request().url();const body=route.request().postDataJSON()||{};let result={};
 if(url.includes('/auth/v1/user'))result=session.user;
 else if(url.includes('/auth/v1/token'))result=session;
 else if(url.includes('/rpc/operator_workspace'))result={is_admin:true,locations:[{id:site,name:'Boutique de validation',address:'Yaoundé',lat:3.848,lng:11.502,active:true,position_confirmed_at:new Date().toISOString()}]};
 else if(url.includes('/rpc/operator_set_ready')){mutations++;failReads=true;result={ok:true};}
 else if(url.includes('/rpc/operator_list_deliveries') && failReads){await route.abort('failed');return;}
 else if(url.includes('/rpc/operator_list_deliveries'))result=[{id:'d1',reference:'YL-001',status:'assigned',recipient_name:'Client',dropoff_address:'Bastos',cash_to_collect:0,courier_fee:1500}];
 else if(url.includes('/rpc/business_accept_invitation')){assert(body.p_token==='a'.repeat(64),'Invitation token sent');result={ok:true};}
 else if(url.includes('/rpc/admin_couriers'))result=[];
 else if(url.includes('/rpc/business_workspace')){switch(body.p_action){case'invoices':result=invoices;break;case'invoice_create':createRequests++;if(interruptSave){interruptSave=false;firstRequest=body.p_payload.request_id;await route.abort('failed');return;}assert(body.p_payload.request_id===firstRequest,'Retry preserves request identity after reload');result={id:'inv1',number:'FAC-2026-00000001',content:body.p_payload.content,issued_on:body.p_payload.content.date,total:body.p_payload.content.lines.reduce((a,l)=>a+l.quantity*l.unit_price,0),created_at:new Date().toISOString()};invoices=[result];break;case'team':result={is_admin:true,can_manage:true,members:[{id:uid,email:'owner@example.invalid',manager:true}],invitations:invites};break;case'invite':result={token:'a'.repeat(64)};invites=[{id:'i1',email:body.p_payload.email,expires_at:new Date(Date.now()+86400000).toISOString(),accepted_at:null,revoked_at:null}];break;default:throw Error('Unexpected action '+body.p_action)}}
 else throw Error('Unexpected network request '+url);
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
});
function assert(value,label){if(!value)throw Error(label);console.log('PASS '+label)}
await page.goto('http://127.0.0.1:5181/app');await page.getByRole('heading',{name:'Votre activité, en un coup d’œil.'}).waitFor();assert(!(await page.locator('body').innerText()).match(/ficti|démo|test|net commerçant|finances/i),'No simulated or financial content in live dashboard');

assert(await page.getByRole('button',{name:'Factures clients',exact:true}).count()===0,'Product invoicing absent from navigation');
await page.getByRole('button',{name:'Livraisons',exact:true}).click();
await page.getByRole('button',{name:'Nouvelle demande',exact:true}).click();
assert(await page.getByText('Espèces à collecter pour ce colis (FCFA)',{exact:true}).count()===0,'No product collection field');
await page.getByRole('button',{name:'Fermer le formulaire',exact:true}).click();
await page.locator('.bw-delivery-desktop .bw-delivery-title').click();await page.getByRole('button',{name:'Colis prêt',exact:true}).click();await page.keyboard.press('Escape');
await page.getByText('Le colis est prêt pour le retrait.',{exact:true}).waitFor();
await page.getByText('La liste n’a pas pu être actualisée. Réessayez pour consulter son état récent.',{exact:true}).waitFor();
assert(mutations===1,'Successful action not repeated when refresh fails');
await page.getByRole('button',{name:'Tableau de bord',exact:true}).click();
assert((await page.locator('.bw-stats').innerText()).includes('1'),'Existing data retained after failed refresh');
await page.screenshot({path:'.local/dashboard-feedback.png',fullPage:true});
await page.context().setOffline(true);await page.getByText('Vous êtes hors connexion.',{exact:false}).waitFor();assert(await page.getByRole('button',{name:'Nouvelle livraison',exact:true}).isDisabled(),'Offline mutations disabled');await page.context().setOffline(false);
failReads=false;await page.getByRole('button',{name:'Réessayer',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.bw-read-warning'));
await page.goto('http://127.0.0.1:5181/connexion?reset=1');
await page.getByRole('heading',{name:'Nouveau mot de passe',exact:true}).waitFor();
await page.locator('#auth-password').fill('New-Password-123');await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill('Different-123');await page.getByRole('button',{name:'Enregistrer le mot de passe'}).click();await page.getByRole('alert').waitFor();assert((await page.getByRole('alert').innerText()).includes('confirmez'),'Password confirmation enforced');
await page.getByLabel('Confirmer le mot de passe',{exact:true}).fill('New-Password-123');await page.getByRole('button',{name:'Enregistrer le mot de passe'}).click();await page.getByRole('button',{name:'Accéder à mon espace'}).waitFor();await page.getByRole('button',{name:'Accéder à mon espace'}).click();await page.getByRole('heading',{name:'Votre activité, en un coup d’œil.'}).waitFor();assert(new URL(page.url()).pathname==='/app','Successful recovery returns to workspace');assert(errors.length===0,'No browser runtime errors');await browser.close();
