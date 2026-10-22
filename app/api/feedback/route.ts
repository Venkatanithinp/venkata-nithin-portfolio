import {bindings,clean,json,rate,sameOrigin} from '@/lib/server';
export async function GET(){try{const rows=await bindings().DB.prepare("SELECT id,name,message,created FROM feedback WHERE status='approved' ORDER BY created DESC LIMIT 30").all();return json({items:rows.results});}catch{return json({items:[],error:'Feedback is temporarily unavailable.'},503);}}
export async function POST(req:Request){try{
 if(!sameOrigin(req))return json({error:'Invalid request origin.'},403);
 if(Number(req.headers.get('content-length')??0)>4000)return json({error:'Feedback is too long.'},413);
 if(!await rate(req,'feedback',3))return json({error:'Please wait a minute before posting again.'},429);
 const b=await req.json() as Record<string,unknown>;const name=clean(b.name,60),message=clean(b.message,500);
 if(b.website||!name||message.length<5||b.consent!==true)return json({error:'Enter your name and feedback, and confirm permission to publish it.'},400);
 await bindings().DB.prepare('INSERT INTO feedback (id,name,message,status,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),name,message,'pending',Date.now()).run();
 return json({ok:true,message:'Thank you. Your feedback is awaiting review before appearing here.'});
 }catch{return json({error:'Unable to save feedback right now. Please try again.'},503);}}
