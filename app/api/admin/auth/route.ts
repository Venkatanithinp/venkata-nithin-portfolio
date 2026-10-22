import {bindings,json,sameOrigin,rate} from '@/lib/server';
import {account,authenticated,clearCookie,digest,equal,encrypt,decrypt,newSession,passwordHash,random,sessionToken,verifyTotp} from '@/lib/admin-auth';
export async function GET(req:Request){try{return json({configured:!!await account(),authorized:await authenticated(req)});}catch{return json({error:'Admin storage is unavailable.'},503);}}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Invalid origin.'},403);
 if(Number(req.headers.get('content-length')??0)>4096)return json({error:'Request too large.'},413);
 try{
  if(!await rate(req,'admin-auth',6))return json({error:'Too many attempts. Wait a minute and try again.'},429);
  const raw=await req.text();if(raw.length>4096)return json({error:'Request too large.'},413);
  const b=JSON.parse(raw) as Record<string,unknown>;const text=(name:string)=>typeof b[name]==='string'?b[name] as string:'';
  const {DB}=bindings();const action=text('action');
  if(action==='logout'){const token=sessionToken(req);if(token)await DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(token)).run();const res=json({ok:true});res.headers.set('Set-Cookie',clearCookie);return res;}
  const existing=await account();
  if(action==='setup'){
   if(existing)return json({error:'An admin account already exists. Please sign in.'},409);
   const expected=bindings().ADMIN_SETUP_HASH,until=Number(bindings().ADMIN_SETUP_EXPIRES??0);
   if(!expected||Date.now()>until||!equal(await digest(text('setupCode')),expected))return json({error:'Invalid or expired setup code.'},403);
   const username=text('username').trim().toLowerCase(),password=text('password');
   if(!/^[a-z0-9_.-]{3,40}$/.test(username)||password.length<16||password.length>128)return json({error:'Use a 3–40 character username and a password of 16–128 characters.'},400);
   const secret=text('totpSecret');let step=-1;
   if(secret){if(!/^[A-Z2-7]{32}$/.test(secret)||(step=await verifyTotp(secret,text('code')))<0)return json({error:'Check your authenticator key and six-digit code.'},400);}
   const salt=random(),recovery=random();
   // Unique id makes initial creation atomic: only one owner can be inserted.
   await DB.prepare('INSERT INTO admin_account(id,username,salt,password_hash,totp_secret,last_totp,recovery_hash) VALUES (1,?,?,?,?,?,?)').bind(username,salt,await passwordHash(password,salt),secret?await encrypt(secret):null,step,await digest(recovery)).run();
   const res=json({ok:true,recoveryCode:recovery});res.headers.set('Set-Cookie',await newSession());return res;
  }
  if(action==='recover'){
   if(!existing||!equal(await digest(text('recoveryCode')),existing.recovery_hash))return json({error:'Invalid recovery code.'},401);
   const password=text('password');if(password.length<16||password.length>128)return json({error:'Use a password of 16–128 characters.'},400);
   const salt=random(),recovery=random();
   const changed=await DB.prepare('UPDATE admin_account SET salt=?,password_hash=?,totp_secret=NULL,last_totp=-1,recovery_hash=? WHERE id=1 AND recovery_hash=? RETURNING id').bind(salt,await passwordHash(password,salt),await digest(recovery),existing.recovery_hash).first();
   if(!changed)return json({error:'Recovery code already used.'},401);
   await DB.prepare('DELETE FROM admin_sessions').run();const res=json({ok:true,recoveryCode:recovery,username:existing.username});res.headers.set('Set-Cookie',await newSession());return res;
  }
  if(action!=='login')return json({error:'Invalid action.'},400);
  const password=text('password');if(password.length>128)return json({error:'Invalid login details.'},401);
  const calculated=await passwordHash(password,existing?.salt??'00'.repeat(32));
  if(!existing||!equal(calculated,existing.password_hash)||text('username').trim().toLowerCase()!==existing.username)return json({error:'Invalid login details or authenticator code.'},401);
  if(existing.totp_secret){
   const step=await verifyTotp(await decrypt(existing.totp_secret),text('code'),existing.last_totp);
   if(step<0)return json({error:'Invalid login details or authenticator code. Wait for a new code if you just used this one.'},401);
   const consumed=await DB.prepare('UPDATE admin_account SET last_totp=? WHERE id=1 AND last_totp<? RETURNING id').bind(step,step).first();if(!consumed)return json({error:'This code has already been used. Wait for the next code.'},401);
  }
  const res=json({ok:true});res.headers.set('Set-Cookie',await newSession());return res;
 }catch{return json({error:'Unable to complete sign-in. Please try again.'},503);}
}
