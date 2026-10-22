import * as THREE from 'three';

export type Key = { label: string; x: number; z: number; w: number; h: number };
export function keyboardKeys(): Key[] {
  const keys: Key[] = [];
  const unit = .167;
  const row = (labels: (string | [string, number])[], z: number, h = .142) => {
    let x = -1.58;
    const total=labels.reduce<number>((n,k)=>n+(Array.isArray(k)?k[1]:1),0);
    const step=2.42/total;
    labels.forEach(item => {
      const [label, length] = Array.isArray(item) ? item : [item, 1];
      const w = length * step - .023;
      keys.push({label, x: x + w / 2, z, w, h});
      x += length * step;
    });
  };
  row(['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',['del',1.7]], -.86, .09);
  row(['~','1','2','3','4','5','6','7','8','9','0','−','+',['⌫',1.7]], -.665);
  row([['tab',1.4],'Q','W','E','R','T','Y','U','I','O','P','[',']',['\\',1.3]], -.465);
  row([['caps',1.7],'A','S','D','F','G','H','J','K','L',';',"'",['enter',2]], -.265);
  row([['shift',2],'Z','X','C','V','B','N','M',',','.','/',['shift',2.7]], -.065);
  row([['ctrl',1.2],['fn',1],['◇',1],['alt',1],['',5.3],['alt',1],['ctrl',1.2],'←','↑','→'], .135);
  const num = [['num','/','*','−'],['7','8','9','+'],['4','5','6',''],['1','2','3','↵'],['0','','.','']];
  num.forEach((labels,r)=>labels.forEach((label,c)=>{if(!label)return;const tall=(c===3&&(r===1||r===3));keys.push({label,x:1.015+c*.175+(r===4&&c===0?.0875:0),z:-.665+r*.2+(tall?.1:0),w:r===4&&c===0?.325:.15,h:tall?.342:.142});}));
  return keys;
}

function texture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4; return t;
}

export function makeKeyboardTexture(keys: Key[]) {
  const canvas = document.createElement('canvas'); canvas.width = 1536; canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d9e4e8';
  keys.forEach(k => {
    ctx.font = `${k.label.length > 2 ? 9 : 13}px Arial`;
    ctx.fillText(k.label, (k.x+1.78)/3.56*1536, (k.z+1.265)/2.53*1024);
  });
  ctx.textAlign='left';ctx.fillStyle='#747a80';ctx.font='10px Arial';
  ctx.fillText('A L I E N W A R E', 1160, 838);
  return texture(canvas);
}

export function makeLabel(text: string, color = '#b3b9c2', size = 32) {
  const canvas = document.createElement('canvas'); canvas.width = 1024;canvas.height=128;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle=color;ctx.font=`500 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);
  return texture(canvas);
}

export function makeScreenTexture() {
  const canvas = document.createElement('canvas');canvas.width=1600;canvas.height=1000;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#c4d0df';ctx.font='500 23px Arial';ctx.fillText('VN.',72,76);
  ctx.textAlign='right';ctx.fillStyle='#8997ae';ctx.font='16px monospace';ctx.fillText('A CURIOUS MIND / AN OPEN WORLD',1528,76);
  ctx.textAlign='center';ctx.fillStyle='#f2f2f1';ctx.font='500 94px Arial';ctx.fillText('Hello, possibility.',800,503);
  ctx.fillStyle='#b1bdcf';ctx.font='25px Arial';ctx.fillText('A little curiosity can take you somewhere extraordinary.',800,567);
  ctx.strokeStyle='#70829d66';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(72,895);ctx.lineTo(1528,895);ctx.stroke();
  ctx.textAlign='left';ctx.fillStyle='#9caec4';ctx.font='18px monospace';ctx.fillText('EXPLORING TECHNOLOGY',72,944);
  ctx.textAlign='right';ctx.fillText('SCROLL TO STEP INSIDE  ↗',1528,944);
  return texture(canvas);
}

export function makePanelTexture(title: string, subtitle: string, index: number) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='rgba(9,14,24,.82)';ctx.fillRect(0,0,1024,640);
  ctx.strokeStyle='#596c864f';ctx.lineWidth=2;ctx.strokeRect(1,1,1022,638);
  ctx.fillStyle='#7c95b0';ctx.font='22px monospace';ctx.fillText(`0${index} / NITHIN'S WORLD`,50,63);
  ctx.fillStyle='#f0f1f4';ctx.font='500 81px Arial';ctx.fillText(title,50,198);
  ctx.fillStyle='#97a6bb';ctx.font='26px Arial';ctx.fillText(subtitle,50,255);
  for(let i=0;i<7;i++) {
    ctx.fillStyle=i===2?'#6888a3':'#283748';ctx.fillRect(52,330+i*30,180+((i*73+index*13)%500),5);
  }
  ctx.strokeStyle='#566b8366';ctx.beginPath();ctx.moveTo(50,590);ctx.lineTo(974,590);ctx.stroke();
  return texture(canvas);
}

export function makeAlienLogo() {
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#d6e4f3';ctx.beginPath();ctx.moveTo(64,16);ctx.bezierCurveTo(112,16,114,64,81,98);ctx.quadraticCurveTo(64,121,47,98);ctx.bezierCurveTo(14,64,16,16,64,16);ctx.fill();
  ctx.fillStyle='#0c1019';ctx.beginPath();ctx.ellipse(45,65,9,20,-.58,0,Math.PI*2);ctx.ellipse(83,65,9,20,.58,0,Math.PI*2);ctx.fill();return texture(canvas);
}
