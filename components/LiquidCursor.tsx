'use client';

import { useEffect, useRef } from 'react';
import type { JourneyState } from '@/lib/choreography';

export default function LiquidCursor({ state }: { state: React.RefObject<JourneyState> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const points = Array.from({length: 24}, () => ({x: -200, y: -200}));
    const pointer = { x: -200, y: -200 };
    let frame = 0, lastMove = 0, visible = false, speed = 0, dirty = false;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      c.width = window.innerWidth * dpr; c.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (e: PointerEvent) => {
      if (state.current.reducedMotion) return;
      if (!visible) points.forEach(p => {p.x = e.clientX; p.y = e.clientY;});
      speed = Math.min(1, Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) / 70);
      pointer.x = e.clientX; pointer.y = e.clientY;
      lastMove = performance.now(); visible = true;
      state.current.pointer.x = e.clientX / window.innerWidth * 2 - 1;
      state.current.pointer.y = -(e.clientY / window.innerHeight * 2 - 1);
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        dot.current.style.opacity = e.pointerType === 'mouse' && state.current.progress < .3 ? '1' : '0';
      }
    };
    const leave = () => {visible = false; if (dot.current) dot.current.style.opacity = '0';};
    const draw = () => {
      const fade = Math.max(0, 1 - (performance.now() - lastMove - 100) / 600);
      const drawing=visible && !state.current.reducedMotion && state.current.progress < .3 && fade > 0;
      if(dirty)ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      dirty=drawing;
      if (drawing) {
        points[0].x += (pointer.x - points[0].x) * .62;
        points[0].y += (pointer.y - points[0].y) * .62;
        for(let i = 1; i < points.length; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * .38;
          points[i].y += (points[i - 1].y - points[i].y) * .38;
        }
        ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for(let i = points.length - 2; i >= 0; i--) {
          const t = 1 - i / points.length;
          ctx.lineWidth = (.5 + Math.sin(t * Math.PI) * (4 + speed * 12)) * fade;
          ctx.beginPath(); ctx.moveTo(points[i + 1].x, points[i + 1].y);
          ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + (points[i - 1] ?? pointer).x) / 2, (points[i].y + (points[i - 1] ?? pointer).y) / 2);
          ctx.stroke();
        }
      }
      frame = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, {passive:true});
    window.addEventListener('pointerdown', move, {passive:true});
    document.addEventListener('pointerleave', leave);
    return () => {cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', move); document.removeEventListener('pointerleave', leave);};
  }, [state]);
  return <><canvas className="liquid-cursor" ref={canvas} aria-hidden="true"/><span className="cursor-dot" ref={dot} aria-hidden="true"/></>;
}
