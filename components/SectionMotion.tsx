'use client';
import {useEffect,useRef,type ReactNode} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

export default function SectionMotion({children,reduced}:{children:ReactNode;reduced:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(reduced)return;
    gsap.registerPlugin(ScrollTrigger);
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const scope=root.current!;
      const reveal=(elements:Element[],vars:gsap.TweenVars={})=>elements.forEach(el=>{
        gsap.from(el,{autoAlpha:0,y:28,duration:.8,ease:'power2.out',...vars,
          scrollTrigger:{refreshPriority:-1,trigger:el,start:'top 92%',toggleActions:'play none none reverse'},
          onComplete:()=>{gsap.set(el,{clearProps:'transform,opacity,visibility'});}});
      });
      scope.querySelectorAll<HTMLElement>('.content-section').forEach(section=>{
        const top=section.querySelector('.section-top');
        if(top)gsap.from(top,{clipPath:'inset(0 100% 0 0)',duration:1.1,ease:'power2.inOut',scrollTrigger:{refreshPriority:-1,trigger:top,start:'top 94%',toggleActions:'play none none reverse'}});
        section.querySelectorAll<HTMLElement>(':scope > h2, :scope > .section-heading > h2, .section-heading > p, :scope > .section-intro, .project-story > h3, .contact-info > p').forEach(block=>{
          if(block.matches('.contact-section > h2'))return;
          const words=block.querySelectorAll('.reveal-word');
          if(!words.length){reveal([block]);return;}
          gsap.from(words,{yPercent:108,autoAlpha:0,rotation:1.5,duration:.72,stagger:Math.min(.07,.85/words.length),ease:'power3.out',scrollTrigger:{refreshPriority:-1,trigger:block,start:'top 88%',toggleActions:'play none none reverse'}});
        });
      });
      reveal(Array.from(scope.querySelectorAll('.education-item')),{x:22,y:0});
      const rail=scope.querySelector('.education-timeline');
      if(rail)gsap.fromTo(rail,{'--rail-progress':0},{'--rail-progress':1,ease:'none',scrollTrigger:{refreshPriority:-1,trigger:rail,start:'top 80%',end:'bottom 60%',scrub:.4}});
      ['.skills-grid > .skill-item','.lab-grid > .lab-card'].forEach(selector=>{
        const cards=Array.from(scope.querySelectorAll(selector));
        // Each row triggers independently, so lower cards remain visible when
        // reached on a narrow screen. Never transform the fixed-modal parent.
        cards.forEach((card,i)=>reveal([card],{y:30,delay:(i%3)*.055,duration:.65}));
      });
      reveal(Array.from(scope.querySelectorAll('.architecture-node')),{x:-18,y:0});
      reveal(Array.from(scope.querySelectorAll('.architecture-connector')),{y:-12,duration:.5});
      reveal(Array.from(scope.querySelectorAll('.project-story > :not(h3), .blueprint-top, .blueprint-bottom')),{y:18});
      reveal(Array.from(scope.querySelectorAll('.certificate-row')),{x:18,y:0,duration:.6});
      reveal(Array.from(scope.querySelectorAll('.resume-callout')));
      // The closing chapter has its own choreography, rather than moving whole
      // sections (and their live forms) as a single block.
      const contact=scope.querySelector('.contact-section > h2');
      if(contact){
        gsap.fromTo(contact,{clipPath:'inset(0 50% 0 50%)'},{clipPath:'inset(-5% -1% -10% -1%)',ease:'power2.inOut',scrollTrigger:{refreshPriority:-1,trigger:contact,start:'top 95%',end:'top 48%',scrub:.5}});
        gsap.from(contact.querySelectorAll('.reveal-word'),{
          x:(i:number,_el:Element,all:Element[])=>((all.length-1)/2-i)*38,yPercent:25,rotation:0,autoAlpha:0,stagger:{each:.12,from:'center'},duration:1,ease:'power3.out',
          scrollTrigger:{refreshPriority:-1,trigger:contact,start:'top 90%',end:'top 38%',scrub:.6}
        });
        const hello=contact.querySelector('em');
        if(hello)gsap.fromTo(hello,{'--hello-line':0},{'--hello-line':1,ease:'none',scrollTrigger:{refreshPriority:-1,trigger:contact,start:'top 55%',end:'top 22%',scrub:.5}});
      }
      reveal(Array.from(scope.querySelectorAll('.contact-info > a, .contact-info > .social-links, .contact-info > .mono')),{x:-24,y:0,duration:.9});
      const heading=scope.querySelector('.feedback-heading');
      if(heading){
        gsap.from(heading.querySelectorAll('.reveal-word'),{yPercent:110,rotation:3,autoAlpha:0,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:{refreshPriority:-1,trigger:heading,start:'top 88%',toggleActions:'play none none reverse'}});
        gsap.from(heading.querySelector('p'),{autoAlpha:0,y:18,duration:.9,delay:.25,scrollTrigger:{refreshPriority:-1,trigger:heading,start:'top 88%',toggleActions:'play none none reverse'}});
      }
      // Animate asynchronously loaded approvals too. Independent triggers keep
      // mobile rows visible; live refreshes never replay existing cards.
      const seen=new WeakSet<Element>();
      const cardContext=gsap.context(()=>{},scope);
      const addCards=()=>cardContext.add(()=>{
        scope.querySelectorAll('.feedback-card, .feedback-empty').forEach((card,i)=>{
          if(seen.has(card))return;seen.add(card);
          gsap.from(card,{y:56,rotation:i%2?2:-2,autoAlpha:0,duration:1.05,delay:(i%2)*.12,ease:'power3.out',
            scrollTrigger:{refreshPriority:-1,trigger:card,start:'top 96%',once:true},
            onComplete:()=>gsap.set(card,{clearProps:'transform,opacity,visibility'})});
        });
      });
      addCards();
      const cardsObserver=new MutationObserver(addCards);
      const wall=scope.querySelector('.feedback-cards');
      if(wall)cardsObserver.observe(wall,{childList:true});
      const footer=scope.querySelector('.portfolio-footer');
      if(footer){
        gsap.fromTo(footer,{'--footer-line':0},{'--footer-line':1,duration:1.4,ease:'power3.inOut',scrollTrigger:{refreshPriority:-1,trigger:footer,start:'top 96%',toggleActions:'play none none reverse'}});
        gsap.from(footer.children,{y:30,autoAlpha:0,duration:.9,stagger:.1,ease:'power3.out',scrollTrigger:{refreshPriority:-1,trigger:footer,start:'top 97%',toggleActions:'play none none reverse'}});
      }
      return()=>{cardsObserver.disconnect();cardContext.revert();};
    },root);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    // Expanded certificates/project details and loaded feedback move later
    // triggers. Refresh after a real content-height change, outside the observer.
    let frame=0,previous=0;
    const observer=new ResizeObserver(([entry])=>{
      const height=Math.round(entry.contentRect.height);
      if(height===previous)return;previous=height;
      cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
    });
    if(root.current)observer.observe(root.current);
    return ()=>{observer.disconnect();cancelAnimationFrame(frame);media.revert();};
  },[reduced]);
  return <div ref={root} className="portfolio-sections">{children}</div>;
}
