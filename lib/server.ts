import {authenticated} from './admin-auth';
import { env } from 'cloudflare:workers';
export function bindings(){return env as unknown as {DB:D1Database;BUCKET:R2Bucket;ADMIN_EMAIL?:string;OPENAI_API_KEY?:string;ADMIN_AUTH_SECRET?:string;ADMIN_SETUP_HASH?:string;ADMIN_SETUP_EXPIRES?:string};}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export const admin=authenticated;
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
export async function rate(request:Request,scope:string,max=5){
 const {DB}=bindings();if(!DB)throw new Error('Storage unavailable');
 const id=request.headers.get('cf-connecting-ip')??'anonymous';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const now=Date.now(),key=scope+':'+hash+':'+Math.floor(now/60000);
 await DB.prepare('DELETE FROM limits WHERE expires < ?').bind(now).run();
 const row=await DB.prepare('INSERT INTO limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+120000).first<{count:number}>();
 return !!row&&row.count<=max;
}
export function clean(v:unknown,max:number){return typeof v==='string'?v.trim().slice(0,max):'';}
