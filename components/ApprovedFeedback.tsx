'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
type Feedback={id:string;name:string;message:string};
const initial=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase();
const tone=(id:string)=>Array.from(id).reduce((sum,ch)=>sum+ch.charCodeAt(0),0)%5;
export default function ApprovedFeedback(){
  const [items,setItems]=useState<Feedback[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true);
  const wall=useRef<HTMLDivElement>(null),active=useRef(true),visible=useRef(false),request=useRef<AbortController|null>(null);
  const refresh=useCallback(async()=>{
    if(request.current)return;
    const controller=new AbortController();request.current=controller;
    if(active.current)setBusy(true);
    try{
      const response=await fetch('/api/feedback',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});
      const data=await response.json() as {items?:Feedback[];error?:string};
      if(!response.ok||data.error)throw new Error('Could not load feedback.');
      if(active.current){setItems(data.items??[]);setError('');}
    }catch{if(active.current&&!controller.signal.aborted)setError('The wall couldn’t refresh just now. Please try again.');}
    finally{if(request.current===controller)request.current=null;if(active.current)setBusy(false);}
  },[]);
  useEffect(()=>{
    active.current=true;void refresh();
    const observer=new IntersectionObserver(([entry])=>{visible.current=entry.isIntersecting;if(entry.isIntersecting)void refresh();});
    if(wall.current)observer.observe(wall.current);
    const update=()=>{if(document.visibilityState==='visible'&&visible.current)void refresh();};
    const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('vn-feedback'):null;
    if(channel)channel.onmessage=()=>{void refresh();};
    const timer=window.setInterval(update,30000);
    window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
    return()=>{active.current=false;channel?.close();observer.disconnect();clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);request.current?.abort();request.current=null;};
  },[refresh]);
  return <div ref={wall} className="feedback-wall" aria-label="Approved visitor feedback">
    <div className="feedback-wall-toolbar"><span className="mono">{items.length?`${String(items.length).padStart(2,'0')} APPROVED ${items.length===1?'THOUGHT':'THOUGHTS'}`:'ROOM FOR YOUR PERSPECTIVE'}</span><button type="button" onClick={()=>void refresh()} disabled={busy} aria-label="Refresh approved feedback">{busy?'Refreshing…':'Refresh ↻'}</button></div>
    {error&&<p className="feedback-refresh-error" role="status">{error}</p>}
    <div className="feedback-cards" aria-live="polite" aria-busy={busy}>
      {items.length?items.map(item=><blockquote key={item.id} className={`feedback-card feedback-tone-${tone(item.id)}`}><span className="feedback-quote" aria-hidden="true">“</span><p>{item.message}</p><footer><span className="feedback-avatar" aria-hidden="true">{initial(item.name)}</span><cite>{item.name}</cite><span className="feedback-approved" title="Approved by Nithin" aria-label="Approved by Nithin">✓</span></footer></blockquote>):<div className="feedback-empty"><span aria-hidden="true">✳</span><h4>A fresh perspective<br/>belongs here.</h4><p>{busy?'Loading approved feedback…':'Be the first to leave a thought. It will appear here once Nithin approves it.'}</p></div>}
    </div>
  </div>;
}
