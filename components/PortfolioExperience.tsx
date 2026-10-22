'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import LiquidCursor from './LiquidCursor';
import PortfolioSections from './PortfolioSections';
import PortfolioAssistant from './PortfolioAssistant';
import type { JourneyState } from '@/lib/choreography';

const LaptopScene = dynamic(()=>import('./LaptopScene'),{ssr:false,loading:()=> <div className="scene-loading"><span/>Opening a new perspective</div>});
const introduction = "I'm Venkata Nithin, a Computer Science Engineering student who enjoys exploring technology, solving problems, and turning ideas into meaningful digital experiences.";
const navigation = [
  {label:'About',phase:1}, {label:'My Journey',phase:2}, {label:'Work',phase:2}, {label:'Interactive Lab',phase:3}, {label:'Certifications',phase:2}, {label:'Resume',phase:4}, {label:'Contact',phase:1},
];

function Arrow({diagonal=false}:{diagonal?:boolean}){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal?'M6 18 18 6M6 6h12v12':'M12 4v16m-6-6 6 6 6-6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;}

export default function PortfolioExperience(){
  const root=useRef<HTMLDivElement>(null),stage=useRef<HTMLElement>(null),portal=useRef<HTMLDivElement>(null);
  const lenis=useRef<Lenis|null>(null),timeline=useRef<gsap.core.Timeline|null>(null);
  const state=useRef<JourneyState>({progress:0,pointer:{x:0,y:0},reducedMotion:false,active:true});
  const [reduced,setReduced]=useState(false),[loading,setLoading]=useState(true),[menuOpen,setMenuOpen]=useState(false),[failed,setFailed]=useState(false);
  const [sceneActive,setSceneActive]=useState(true);
  const rendering=useRef(true);
  const menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLDivElement>(null);
  const ready=useCallback(()=>{setLoading(false);},[]);
  const failure=useCallback(()=>{setFailed(true);setLoading(false);},[]);

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const change=()=>setReduced(media.matches);media.addEventListener('change',change);
    const timeout=window.setTimeout(()=>setLoading(false),1800);
    return ()=>{media.removeEventListener('change',change);window.clearTimeout(timeout);};
  },[]);

  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ignoreMobileResize:true});
    const previousProgress=state.current.progress;
    state.current.reducedMotion=reduced;
    state.current.progress=0;
    rendering.current=true;setSceneActive(true);
    if(!root.current||!stage.current||!portal.current)return;
    const portalElement=portal.current;
    if(reduced){
      gsap.set(root.current.querySelectorAll('.about-word,.about-label,.about-footer'),{opacity:1,y:0});
      const about=root.current.querySelector<HTMLElement>('#about');
      about?.setAttribute('aria-hidden','false');
      if(previousProgress>.5)about?.scrollIntoView({behavior:'instant'});
      return;
    }
    const smoothScroll=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false});
    lenis.current=smoothScroll;
    smoothScroll.on('scroll',ScrollTrigger.update);
    const tick=(time:number)=>smoothScroll.raf(time*1000);
    gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);

    const context=gsap.context(()=>{
      const width=()=>Math.min(window.innerWidth<700?window.innerWidth*.73:window.innerWidth*.285,380);
      const height=()=>width()*.66;
      gsap.set(portalElement,{width:width(),height:height(),left:'50%',xPercent:-50,bottom:'auto',top:window.innerHeight-height()-(window.innerWidth<700?115:72)});
      gsap.set('.about-word',{opacity:0,y:24});
      gsap.set('.about-label,.about-footer',{opacity:0,y:12});
      gsap.set('.about-section',{visibility:'hidden'});
      const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
        trigger:stage.current,start:'top top',end:()=>`+=${window.innerHeight*(window.innerWidth<700?5.5:6.5)}`,
        pin:true,scrub:.65,invalidateOnRefresh:true,anticipatePin:1,onLeave:()=>gsap.set('.experience-controls',{autoAlpha:0}),onEnterBack:()=>gsap.set('.experience-controls',{autoAlpha:1}),
      },onUpdate:()=>{
        const p=state.current.progress;
        const active=p<.851;
        if(rendering.current!==active){rendering.current=active;setSceneActive(active);}
        if(root.current)root.current.dataset.progress=p.toFixed(3);
        const progress=root.current?.querySelector<HTMLElement>('.progress-fill');if(progress)progress.style.transform=`scaleX(${p})`;
        const chapter=root.current?.querySelector<HTMLElement>('.chapter-label');
        if(chapter)chapter.textContent=p<.4?'01 — THE OPENING':p<.6?'02 — A NEW PERSPECTIVE':p<.85?'03 — INSIDE POSSIBILITY':'04 — A CURIOUS MIND';
        const about=root.current?.querySelector<HTMLElement>('.about-section');
        if(about){about.style.pointerEvents=p>.92?'auto':'none';about.setAttribute('aria-hidden',p<.85?'true':'false');}
      }});
      tl.to(state.current,{progress:1,duration:1},0)
        .to('.name-first',{x:()=>-window.innerWidth*.7,duration:.21,ease:'power2.inOut'},.19)
        .to('.name-last',{x:()=>window.innerWidth*.7,duration:.21,ease:'power2.inOut'},.19)
        .to('.hero-subtitle,.hero-eyebrow,.hero-note,.hero-scroll,.portal-caption,.hero-index',{opacity:0,duration:.1},.18)
        .fromTo(portalElement,{top:()=>window.innerHeight-height()-(window.innerWidth<700?115:72),left:'50%',xPercent:-50,width:width,height:height,borderRadius:14},{top:0,left:'50%',xPercent:-50,width:()=>document.documentElement.clientWidth,height:()=>window.innerHeight,borderRadius:0,duration:.2,ease:'power2.inOut',immediateRender:false},.2)
        .to('.nav-links',{opacity:0,duration:.06},.13)
        .set('.nav-links',{visibility:'hidden'},.2)
        .to('.nav-shell',{width:118,duration:.18,ease:'power2.inOut'},.15)
        .to('.nav-menu-button',{opacity:1,duration:.05},.2)
        .set('.nav-menu-button',{visibility:'visible'},.2)
        .to('.brand-label',{opacity:0,duration:.07},.3)
        .to('.nav-shell',{backgroundColor:'rgba(23,25,29,0.6)',color:'#f3f1ec',borderColor:'rgba(255,255,255,0.14)',duration:.05},.37)
        .to('.journey-hud',{opacity:1,duration:.04},.4)
        .to('.canvas-fade',{opacity:1,duration:.07},.78)
        .to('.journey-hud',{opacity:0,duration:.04},.81)
        .set('.about-section',{visibility:'visible'},.85)
        .to('.about-label',{opacity:1,y:0,duration:.025},.855)
        .to('.about-title .about-word',{opacity:1,y:0,duration:.025,stagger:.014},.86)
        .to('.about-copy .about-word',{opacity:1,y:0,duration:.018,stagger:.0025},.9)
        .to('.about-footer',{opacity:1,y:0,duration:.025},.975);
      timeline.current=tl;
    },root);
    const refresh=window.setTimeout(()=>ScrollTrigger.refresh(),300);
    return ()=>{window.clearTimeout(refresh);context.revert();timeline.current=null;gsap.ticker.remove(tick);smoothScroll.destroy();lenis.current=null;};
  },[reduced]);

  const goTo=useCallback((progress:number)=>{
    setMenuOpen(false);
    lenis.current?.start();
    if(reduced){
      if(progress===0)window.scrollTo({top:0,behavior:'instant'});
      else document.getElementById('about')?.scrollIntoView({behavior:'instant'});
    }else{
      const st=timeline.current?.scrollTrigger;
      const y=st?st.start+(st.end-st.start)*progress:0;
      if(lenis.current)lenis.current.scrollTo(y,{duration:progress===1?1.4:2});
      else window.scrollTo({top:y,behavior:'smooth'});
    }
    if(progress===1)window.setTimeout(()=>document.getElementById('about-title')?.focus({preventScroll:true}),reduced?0:1600);
  },[reduced]);

  const navigate=(label:string)=>{
    setMenuOpen(false);
    lenis.current?.start();
    if(label==='About'){goTo(1);return;}
    const ids:Record<string,string>={'My Journey':'journey',Work:'work','Interactive Lab':'lab',Certifications:'certifications',Contact:'contact'};
    const target=document.getElementById(ids[label]);
    if(target){if(lenis.current)lenis.current.scrollTo(target,{offset:-85,duration:1.3});else target.scrollIntoView({behavior:reduced?'instant':'smooth'});}
  };

  useEffect(()=>{
    if(!menuOpen)return;
    const first=menuPanel.current?.querySelector<HTMLElement>('button,a');first?.focus();
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setMenuOpen(false);menuButton.current?.focus();}
      if(event.key==='Tab'){
        const items=menuPanel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]');
        if(!items?.length)return;
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',keyboard);lenis.current?.stop();
    return ()=>{document.removeEventListener('keydown',keyboard);lenis.current?.start();};
  },[menuOpen]);

  return <MotionConfig reducedMotion="user">
    <div ref={root} className={`experience ${reduced?'reduced-motion':''}`}>
      <a className="skip-link" href="#about" onClick={e=>{e.preventDefault();goTo(1);}}>Skip to About</a>
      <AnimatePresence>{loading&&<motion.div className="loader" initial={{opacity:1}} exit={{y:reduced?0:'-100%',opacity:reduced?0:1}} transition={{duration:reduced?.1:.65,ease:[.76,0,.24,1]}} aria-label="Loading portfolio">
        <div className="loader-mark"><motion.span initial={{y:40}} animate={{y:0}} transition={{duration:.45}}>VN.</motion.span></div>
        <span className="mono">CURIOSITY, IN MOTION.</span>
      </motion.div>}</AnimatePresence>

      <header className="site-header">
        <button className="brand-label mono" onClick={()=>goTo(0)} aria-label="Back to portfolio opening">PORTFOLIO<span className="brand-dot"/></button>
        <nav className="nav-shell" aria-label="Main navigation">
          <button className="nav-logo" onClick={()=>goTo(0)} aria-label="Venkata Nithin home">VN.</button>
          <div className="nav-links">{navigation.map(item=>item.label==='Resume'?<a key={item.label} href="/resume">Resume ↗</a>:<button key={item.label} onClick={()=>navigate(item.label)}>{item.label}</button>)}</div>
          <button ref={menuButton} className="nav-menu-button" aria-label="Open navigation" aria-expanded={menuOpen} aria-controls="navigation-menu" onClick={()=>setMenuOpen(true)}><i/><i/></button>
        </nav>
      </header>

      <main>
        <section ref={stage} className="journey-stage" aria-label="An introduction to Venkata Nithin">
          <div className="hero-content">
            <div className="hero-eyebrow mono"><span className="tiny-spark">✳</span> A CURIOUS MIND. AN OPEN WORLD.</div>
            <h1 className="hero-name" aria-label="Venkata Nithin"><span className="name-first">VENKATA</span><span className="name-last">NI<b className="hero-t">T</b>HIN</span></h1>
            <p className="hero-subtitle">Exploring technology. Creating possibilities.</p>
            <div className="hero-note"><span className="mono">THE PERSON BEHIND THE PIXELS</span><p>Computer Science student.<br/>Aspiring software developer.<br/>Always a work in progress.</p></div>
            <div className="hero-index"><span className="availability"><i/> OPEN TO POSSIBILITIES</span><span className="mono">BASED IN INDIA</span></div>
            <button className="hero-scroll mono" onClick={()=>goTo(.4)} aria-label="Enter the 3D laptop journey"><span>SCROLL TO EXPLORE</span><Arrow/></button>
          </div>

          <div ref={portal} className="cinematic-portal" data-single-portal="true">
            {!failed?<LaptopScene state={state} reduced={reduced} active={sceneActive} onReady={ready} onFailure={failure}/>:<div className="scene-unavailable"><span>VN.</span><p>The 3D experience is unavailable on this device.</p><button onClick={()=>goTo(1)}>Meet Nithin <Arrow diagonal/></button></div>}
            <div className="portal-edge" aria-hidden="true"/>
            <div className="canvas-fade" aria-hidden="true"/>
          </div>
          <div className="portal-caption mono">A WINDOW INTO MY WORLD <span>↗</span></div>

          <div className="journey-hud" aria-hidden="true"><span className="chapter-label mono">01 — THE OPENING</span><div className="journey-progress"><span className="progress-fill"/></div><span className="mono">KEEP SCROLLING <span>↓</span></span></div>

          <section id="about" className="about-section" aria-labelledby="about-title" aria-hidden={!reduced}>
            <div className="about-label mono"><span className="tiny-spark">✳</span> A LITTLE ABOUT ME</div>
            <h2 id="about-title" className="about-title" tabIndex={-1}><span className="about-word">CURIOSITY</span><br/><span className="about-word">HAS</span>{' '}<span className="about-word">NO</span>{' '}<span className="about-word limits">LIMITS.</span></h2>
            <div className="about-bottom"><p className="about-copy">{introduction.split(' ').map((word,i)=><span key={i} className="about-word">{word}{' '}</span>)}</p>
              <div className="about-footer"><span className="mono">LEARNING. BUILDING. BECOMING.</span><a href="mailto:pinnamanenivenkatanithin@gmail.com" className="hello-link">Let’s make a connection <Arrow diagonal/></a></div>
            </div>
            <div className="about-base about-footer"><span className="mono">VENKATA NITHIN</span><button className="replay mono" onClick={()=>goTo(0)}>REPLAY THE JOURNEY <span>↺</span></button></div>
          </section>
        </section>
        <PortfolioSections reduced={reduced}/>
      </main>

      <div className="experience-controls"><button onClick={()=>setReduced(v=>!v)} aria-pressed={reduced} title={reduced?'Enable scroll animation':'Use a static, reduced-motion view'}><span className={`motion-icon ${reduced?'paused':''}`}><i/><i/><i/></span><span>{reduced?'Motion off':'Motion on'}</span></button><span className="control-divider"/><button onClick={()=>goTo(1)}>Skip to About <span>↗</span></button></div>
      <LiquidCursor state={state}/>
      <PortfolioAssistant/>
      <AnimatePresence>{menuOpen&&<motion.div className="menu-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>{setMenuOpen(false);menuButton.current?.focus();}}>
        <motion.div ref={menuPanel} className="menu-panel" id="navigation-menu" role="dialog" aria-modal="true" aria-label="Explore the portfolio" initial={{y:-12,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-8,opacity:0}} onClick={e=>e.stopPropagation()}>
          <div className="menu-heading"><span className="mono">EXPLORE</span><button onClick={()=>{setMenuOpen(false);menuButton.current?.focus();}} aria-label="Close navigation">×</button></div>
          {navigation.map((item,i)=>item.label==='Resume'?<a key={item.label} href="/resume"><small>0{i+1}</small>Resume<span>↗</span></a>:<button key={item.label} onClick={()=>navigate(item.label)}><small>0{i+1}</small>{item.label}<span>↗</span></button>)}
          <p className="menu-status">Exploring technology. Creating possibilities.</p>
        </motion.div>
      </motion.div>}</AnimatePresence>
    </div>
  </MotionConfig>;
}
