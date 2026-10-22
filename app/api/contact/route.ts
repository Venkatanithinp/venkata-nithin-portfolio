import {bindings,clean,json,rate,sameOrigin} from '@/lib/server';
export async function POST(req:Request){try{
 if(!sameOrigin(req))return json({error:'Invalid request origin.'},403);
 if(Number(req.headers.get('content-length')??0)>12000)return json({error:'Message is too long.'},413);
 if(!await rate(req,'contact',3))return json({error:'Please wait a minute before sending another message.'},429);
 const b=await req.json() as Record<string,unknown>;const name=clean(b.name,80),email=clean(b.email,160),message=clean(b.message,3000);
 if(b.website||!name||!/^\S+@\S+\.\S+$/.test(email)||message.length<10)return json({error:'Please enter your name, a valid email, and at least 10 message characters.'},400);
 await bindings().DB.prepare('INSERT INTO contacts (id,name,email,message,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),name,email,message,Date.now()).run();
 return json({ok:true,message:'Your message has been saved for Nithin. Thank you for reaching out.'});
 }catch{return json({error:'Unable to save your message right now. Please try again or email Nithin directly.'},503);}}
