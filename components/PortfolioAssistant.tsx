'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {AnswerLink} from '@/lib/profile';
type Message={role:'guide'|'you';text:string;links?:AnswerLink[];source?:string};
const suggestions=['What does Nithin do?','Tell me about CampusFlow.','Where is his resume?'];
export default function PortfolioAssistant(){
  const [open,setOpen]=useState(false),[question,setQuestion]=useState(''),[busy,setBusy]=useState(false);
  const [messages,setMessages]=useState<Message[]>([{role:'guide',text:'Hi, I’m VN. AI. Get to know Nithin — his skills, his work, and the ideas behind it.'}]);
  const input=useRef<HTMLInputElement>(null),list=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
  useEffect(()=>{if(open)input.current?.focus();},[open]);
  useEffect(()=>{const el=list.current;if(el)el.scrollTop=el.scrollHeight;},[messages,busy]);
  const close=()=>{setOpen(false);trigger.current?.focus();};
  async function ask(text:string){
    if(!text.trim()||busy)return;
    const previousQuestions=messages.filter(m=>m.role==='you').slice(-3).map(m=>m.text);
    setMessages(m=>[...m,{role:'you',text:text.trim()}]);setQuestion('');setBusy(true);
    try{
      const res=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text,previousQuestions}),signal:AbortSignal.timeout(15000)});
      const data=await res.json() as {answer?:string;error?:string;links?:AnswerLink[];source?:string};
      setMessages(m=>[...m,{role:'guide',text:data.answer??data.error??'Please try again.',links:data.links,source:data.source}]);
    }catch{setMessages(m=>[...m,{role:'guide',text:'I couldn’t connect just now. Please try again, or contact Nithin by email.',links:[{label:'Email Nithin',href:'mailto:pinnamanenivenkatanithin@gmail.com'}]}]);}
    finally{setBusy(false);input.current?.focus();}
  }
  return <div className="assistant-root" data-lenis-prevent>
    {open&&<section ref={panel} className="assistant-panel" role="dialog" aria-modal="false" aria-label="VN. AI. portfolio assistant" onKeyDown={e=>{
      if(e.key==='Escape')close();
      if(e.key==='Tab'){
        const controls=panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input,a[href]');if(!controls?.length)return;
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    }}>
      <header><div className="assistant-brand"><span className="assistant-mark" aria-hidden="true">✳</span><div><strong>VN. AI.</strong><span>A little curiosity. A real conversation.</span></div></div><button onClick={close} aria-label="Close VN. AI.">×</button></header>
      <div ref={list} className="assistant-messages" role="log" aria-live="polite" aria-relevant="additions" aria-busy={busy}>
        {messages.map((m,i)=><div className={'chat-message '+m.role} key={i}><span className="chat-speaker">{m.role==='guide'?'VN. AI.':'YOU'}</span><p>{m.text}</p>{!!m.links?.length&&<div className="chat-links">{m.links.filter(link=>/^(\/|https:\/\/|mailto:)/.test(link.href)&&!link.href.startsWith('//')).map(link=><a key={link.href} href={link.href} target={link.href.startsWith('https:')?'_blank':undefined} rel="noreferrer">{link.label} ↗</a>)}</div>}{m.source&&<small className="chat-source">{m.source}</small>}</div>)}
        {busy&&<p className="assistant-thinking" role="status"><span/><span/><span/><span className="sr-only">Finding the right information…</span></p>}
      </div>
      <div className="suggested-questions">{suggestions.map(q=><button disabled={busy} key={q} onClick={()=>ask(q)}>{q}</button>)}</div>
      <form onSubmit={(e:FormEvent)=>{e.preventDefault();ask(question);}}><input ref={input} value={question} onChange={e=>setQuestion(e.target.value)} maxLength={500} placeholder="What would you like to know?" aria-label="Question about Nithin" required/><button disabled={busy||!question.trim()} aria-label="Send question">↑</button></form>
      <small>PORTFOLIO KNOWLEDGE · APPROVED INFORMATION</small>
    </section>}
    <button ref={trigger} className="assistant-trigger" aria-expanded={open} aria-label={open?'Close VN. AI.':'Open VN. AI.'} onClick={()=>setOpen(v=>!v)}><span aria-hidden="true">✳</span><span>VN. AI.</span><span className="assistant-status" aria-hidden="true"/></button>
  </div>;
}
