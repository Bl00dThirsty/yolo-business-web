import {chromium} from '../.local/business-ui-tests/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const uid='11111111-1111-4111-8111-111111111111',site='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';const exp=Math.floor(Date.now()/1000)+3600;
const jwt=btoa(JSON.stringify({alg:'HS256',typ:'JWT'}))+'.'+btoa(JSON.stringify({sub:uid,exp,role:'authenticated'}))+'.fake';
const session={access_token:jwt,refresh_token:'ui-test-only',expires_at:exp,expires_in:3600,token_type:'bearer',user:{id:uid,email:'owner@example.invalid',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{},user_metadata:{}}};
await page.addInitScript(({session})=>{localStorage.setItem('sb-rctklynkqyvxyebasfrp-auth-token',JSON.stringify(session));window.print=()=>{window.__printed=true};window.open=(url)=>{window.__shared=url;return null}}, {session});


let updateCalls=0, failVehicle=true, vehicle='Moto';
await page.route('https://*.supabase.co/**',async route=>{const url=route.request().url(),body=route.request().postDataJSON()||{};let result={};
if(url.includes('/auth/v1/user')){if(route.request().method()==='PUT')session.user.user_metadata={...session.user.user_metadata,...body.data};result=session.user;}
else if(url.includes('/auth/v1/token'))result=session;
else if(url.includes('/rpc/operator_workspace'))result={is_admin:true,locations:[{id:site,name:'Boutique de validation',address:'Yaoundé',lat:3.848,lng:11.502,active:true,position_confirmed_at:new Date().toISOString()}]};
else if(url.includes('/rpc/operator_list_deliveries'))result=[];
else if(url.includes('/rpc/admin_couriers'))result=[{id:'c1',full_name:'Livreur de validation',approval:'pending',max_active_parcels:6,vehicle,plate:'CE 123'}];
else if(url.includes('/rpc/admin_update_courier')){updateCalls++;if(failVehicle){failVehicle=false;await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'Enregistrement indisponible. Réessayez.',code:'P0001'})});return;}await new Promise(r=>setTimeout(r,300));vehicle=body.p_vehicle;result={ok:true};}
else if(url.includes('/auth/v1/logout'))result={};
else throw Error('Unexpected request '+url);
await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
});
function assert(ok,label){if(!ok)throw Error(label);console.log('PASS '+label)}
try{
await page.goto('http://127.0.0.1:5181/app');await page.getByRole('heading',{name:'Votre activité, en un coup d’œil.'}).waitFor();
assert(await page.getByRole('menuitem',{name:'Se déconnecter'}).count()===0,'Sign-out hidden until account menu opens');
await page.getByRole('region',{name:'Vos premiers pas'}).waitFor();
await page.getByRole('button',{name:'Masquer le guide de démarrage'}).click();await page.reload();await page.getByRole('heading',{name:'Votre activité, en un coup d’œil.'}).waitFor();assert(await page.getByRole('region',{name:'Vos premiers pas'}).count()===0,'Dismissed guide stays hidden after reload');
await page.getByRole('button',{name:'Ouvrir le menu de mon compte'}).click();await page.getByRole('menuitem',{name:'Guide de démarrage'}).click();await page.getByRole('region',{name:'Vos premiers pas'}).waitFor();
await page.getByRole('button',{name:'Masquer le guide de démarrage'}).click();await page.getByRole('button',{name:'Livraisons',exact:true}).click();await page.getByRole('button',{name:'Tableau de bord',exact:true}).click();assert(await page.getByRole('region',{name:'Vos premiers pas'}).count()===0,'Dismissed reopened guide stays hidden across navigation');await page.getByRole('button',{name:'Ouvrir le menu de mon compte'}).click();await page.getByRole('menuitem',{name:'Guide de démarrage'}).click();await page.getByRole('button',{name:'Aide : point de retrait'}).focus();await page.getByRole('tooltip').waitFor();await page.keyboard.press('Escape');assert(await page.getByRole('tooltip').count()===0,'Tooltip keyboard focus and Escape work');
await page.screenshot({path:'.local/workspace-onboarding-desktop.png',fullPage:true});
await page.getByRole('button',{name:'Ouvrir le menu de mon compte'}).click();await page.getByRole('menuitem',{name:'Mon compte et paramètres'}).click();await page.getByRole('button',{name:'Modifier : Nom affiché'}).click();await page.getByRole('textbox',{name:'Nom affiché',exact:true}).fill('Camille');await page.keyboard.press('Escape');assert(!session.user.user_metadata.display_name,'Escape discards edit without saving');
await page.getByRole('button',{name:'Modifier : Nom affiché'}).click();await page.getByRole('textbox',{name:'Nom affiché',exact:true}).fill('Camille');await page.keyboard.press('Enter');await page.getByRole('button',{name:'Modifier : Nom affiché'}).waitFor();assert(session.user.user_metadata.display_name==='Camille','Display name persisted through auth API');
await page.getByRole('button',{name:'Modifier : Véhicule'}).click();await page.getByRole('textbox',{name:'Véhicule',exact:true}).fill('Scooter');await page.keyboard.press('Enter');await page.getByText('Enregistrement indisponible. Réessayez.',{exact:true}).waitFor();assert(await page.getByRole('textbox',{name:'Véhicule',exact:true}).inputValue()==='Scooter','Failed save preserves draft inline');assert(vehicle==='Moto','Failure leaves stored value unchanged');await page.getByRole('button',{name:'Enregistrer : Véhicule'}).click();await page.getByRole('button',{name:'Modifier : Véhicule'}).waitFor();await page.waitForFunction(()=>document.querySelector('[aria-label="Modifier : Véhicule"]')?.textContent?.includes('Scooter') && !document.querySelector('[aria-label="Modifier : Véhicule"]')?.disabled);assert(vehicle==='Scooter'&&updateCalls===2,'Retry commits a single field without popup');
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Ouvrir le menu de mon compte'}).click();await page.getByRole('menuitem',{name:'Guide de démarrage'}).click();await page.getByRole('region',{name:'Vos premiers pas'}).waitFor();await page.screenshot({path:'.local/workspace-onboarding-mobile.png',fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No mobile horizontal overflow');
const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});await page.getByRole('button',{name:'Aide : point de retrait'}).dispatchEvent('click');await page.getByRole('tooltip').waitFor();assert(true,'Context help opens on click as well as keyboard');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Ouvrir le menu de mon compte'}).click();await page.screenshot({path:'.local/workspace-account-mobile.png'});assert(await page.getByRole('menuitem',{name:'Se déconnecter'}).isVisible(),'Account options available on mobile');assert(errors.length===0,'No runtime errors');
}finally{await browser.close();}
