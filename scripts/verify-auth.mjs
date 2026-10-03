import {chromium} from '../.local/business-ui-tests/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
let attempts=0,resets=0;
await page.route('https://*.supabase.co/**',async route=>{
 const url=route.request().url();
 if(url.includes('/auth/v1/token')){attempts++;await new Promise(r=>setTimeout(r,400));return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'invalid_credentials',msg:'Invalid login credentials'})});}
 if(url.includes('/auth/v1/recover')){resets++;return route.fulfill({status:200,contentType:'application/json',body:'{}'});}
 throw Error('Unexpected request '+url);
});
await page.goto('http://127.0.0.1:5181/connexion');await page.getByRole('heading',{name:'Connexion',exact:true}).waitFor();
await page.screenshot({path:'.local/login-desktop.png'});
await page.getByLabel('Adresse e-mail').fill('test@example.invalid');await page.locator('#auth-password').fill('invalid-pass');
await page.getByRole('button',{name:'Afficher le mot de passe',exact:true}).click();assert.equal(await page.locator('#auth-password').getAttribute('type'),'text');
await page.getByRole('button',{name:'Masquer le mot de passe',exact:true}).click();assert.equal(await page.locator('#auth-password').getAttribute('type'),'password');console.log('PASS Password visibility and accessible names');
await page.getByRole('button',{name:'Se connecter',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Veuillez patienter…'}).isDisabled(),true);await page.getByRole('alert').waitFor();assert.equal(attempts,1);assert.equal(await page.locator('#auth-email').inputValue(),'test@example.invalid');assert.equal(await page.getByRole('alert').evaluate(el=>el===document.activeElement),true);console.log('PASS Failed sign-in feedback focused; form retained; submit locked');
await page.getByRole('button',{name:'Mot de passe oublié ?'}).click();await page.getByRole('button',{name:'Recevoir le lien'}).click();await page.getByRole('status').waitFor();assert.equal(resets,1);assert.match(await page.getByRole('status').innerText(),/Si un compte/);console.log('PASS Reset request gives neutral confirmation (mock email service)');
await page.getByRole('button',{name:'Revenir à la connexion'}).click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.local/login-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.yolo-auth-card').evaluate(el=>getComputedStyle(el).animationName),'none');console.log('PASS Mobile layout and reduced motion');
assert.equal(errors.length,0);await browser.close();
