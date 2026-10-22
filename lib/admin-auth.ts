import {bindings} from './server';
const encoder=new TextEncoder();
export const COOKIE='__Host-vn-admin';
export const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex=(value:string)=>Uint8Array.from(value.match(/.{2}/g)??[],b=>parseInt(b,16));
export const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(value:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))));}
export function equal(a:string,b:string){if(a.length!==b.length)return false;let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);return mismatch===0;}
async function pepper(value:string){const secret=bindings().ADMIN_AUTH_SECRET;if(!secret)throw new Error('Admin authentication not configured');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));}
export async function passwordHash(password:string,salt:string){const material=await crypto.subtle.importKey('raw',await pepper(password),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',iterations:100000,salt:unhex(salt)},material,256)));}
async function cipherKey(){return crypto.subtle.importKey('raw',await pepper('vn-totp-encryption-v1'),'AES-GCM',false,['encrypt','decrypt']);}
export async function encrypt(value:string){const iv=crypto.getRandomValues(new Uint8Array(12));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await cipherKey(),encoder.encode(value));return hex(iv)+'.'+hex(new Uint8Array(data));}
export async function decrypt(value:string){const [iv,data]=value.split('.');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(iv)},await cipherKey(),unhex(data)));}
function base32(value:string){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits=0,buffer=0;const bytes:number[]=[];for(const c of value){const n=alphabet.indexOf(c);if(n<0)throw new Error('Invalid key');buffer=(buffer<<5)|n;bits+=5;if(bits>=8){bits-=8;bytes.push((buffer>>bits)&255);}}return new Uint8Array(bytes);}
export async function totp(secret:string,step:number){const data=new Uint8Array(8);new DataView(data.buffer).setBigUint64(0,BigInt(step));const key=await crypto.subtle.importKey('raw',base32(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']);const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,data));const offset=sig[sig.length-1]&15;const code=((sig[offset]&127)<<24)|(sig[offset+1]<<16)|(sig[offset+2]<<8)|sig[offset+3];return String(code%1000000).padStart(6,'0');}
export async function verifyTotp(secret:string,code:string,last=-1){if(!/^\d{6}$/.test(code))return -1;const now=Math.floor(Date.now()/30000);for(const step of [now,now-1,now+1])if(step>last&&equal(await totp(secret,step),code))return step;return -1;}
export type Account={id:number;username:string;salt:string;password_hash:string;totp_secret:string|null;last_totp:number;recovery_hash:string;};
export async function account(){return bindings().DB.prepare('SELECT * FROM admin_account WHERE id=1').first<Account>();}
export function sessionToken(request:Request){const pairs=(request.headers.get('cookie')??'').split(';').map(v=>v.trim());const matches=pairs.filter(v=>v.startsWith(COOKIE+'='));return matches.length===1?matches[0].slice(COOKIE.length+1):'';}
export async function authenticated(request:Request){try{const token=sessionToken(request);if(!/^[a-f0-9]{64}$/.test(token))return false;return !!await bindings().DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires>?').bind(await digest(token),Date.now()).first();}catch{return false;}}
export async function newSession(){const token=random();await bindings().DB.prepare('DELETE FROM admin_sessions WHERE expires<=?').bind(Date.now()).run();await bindings().DB.prepare('INSERT INTO admin_sessions(token_hash,expires) VALUES (?,?)').bind(await digest(token),Date.now()+8*60*60*1000).run();return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;}
export const clearCookie=`${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
