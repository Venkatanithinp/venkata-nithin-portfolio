import {admin,bindings,json,sameOrigin,rate} from '@/lib/server';
export async function POST(req:Request){if(!await admin(req))return json({error:'Owner access required.'},403);if(!sameOrigin(req))return json({error:'Invalid origin.'},403);try{
 if(!await rate(req,'upload',5))return json({error:'Please wait before uploading again.'},429);
 if(Number(req.headers.get('content-length')??0)>5300000)return json({error:'PDF must be smaller than 5 MB.'},413);
 const form=await req.formData(),file=form.get('file');if(!(file instanceof File)||file.size>5*1024*1024||file.size<5)return json({error:'Choose a PDF under 5 MB.'},400);
 const bytes=await file.arrayBuffer();if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')return json({error:'This file is not a valid PDF.'},400);
 const id=crypto.randomUUID(),key='resumes/'+id+'.pdf';const {DB,BUCKET}=bindings();await BUCKET.put(key,bytes,{httpMetadata:{contentType:'application/pdf'}});
 try{await DB.prepare('INSERT INTO resumes (id,key,filename,published,created) VALUES (?,?,?,?,?)').bind(id,key,file.name.replace(/[^\w. -]/g,'').slice(0,100),0,Date.now()).run();}catch(error){await BUCKET.delete(key);throw error;}
 return json({ok:true,id});
 }catch{return json({error:'Upload failed. Please try again.'},503);}}
export async function GET(req:Request){if(!await admin(req))return json({error:'Owner access required.'},403);const id=new URL(req.url).searchParams.get('id');const row=await bindings().DB.prepare('SELECT key FROM resumes WHERE id=?').bind(id).first<{key:string}>();if(!row)return json({error:'Not found'},404);const file=await bindings().BUCKET.get(row.key);if(!file)return json({error:'Not found'},404);return new Response(file.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="resume-preview.pdf"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
