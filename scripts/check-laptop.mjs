import assert from 'node:assert/strict';
import {laptopBox,keyboardSurface as surface} from '../lib/laptopGeometry.ts';
import {keyboardKeys} from '../lib/laptopTextures.ts';

const bounds=(w,h,d,r,y=0)=>{
  const g=laptopBox(w,h,d,r);g.computeBoundingBox();
  const b=g.boundingBox.clone();g.dispose();
  assert.ok(Math.abs(b.max.x-b.min.x-w)<1e-5,'Chassis width must match its declared dimensions');
  assert.ok(Math.abs(b.max.y-b.min.y-h)<1e-5,'Thin deck bevel must not inflate its height');
  assert.ok(Math.abs(b.max.z-b.min.z-d)<1e-5,'Chassis depth must match its declared dimensions');
  b.min.y+=y;b.max.y+=y;return b;
};
const deck=bounds(3.5,.04,2.47,.065,.1);
const well=bounds(3.3,.022,1.25,.035,surface.wellY);
const padBorder=bounds(1.08,.012,.62,.035,.129);
const pad=bounds(1.065,.014,.607,.032,.137);
const keyGeometry=bounds(1,1,1,.08);
const keyBottom=surface.keyY+keyGeometry.min.y*surface.keyHeight;
const keyTop=surface.keyY+keyGeometry.max.y*surface.keyHeight;
assert.ok(well.max.y>deck.max.y,'Keyboard well must be above deck');
assert.ok(keyBottom>well.max.y,'Keycaps must sit above the keyboard well');
assert.ok(surface.legendY>keyTop,'Legends must clear keycaps');
assert.ok(pad.min.y>deck.max.y&&pad.max.y>padBorder.max.y,'Trackpad must be exposed');
const keys=keyboardKeys();assert.ok(keys.length>=90,'Full keyboard must contain individual keys');
for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
  const a=keys[i],b=keys[j];
  assert.ok(Math.abs(a.x-b.x)>=(a.w+b.w)/2-1e-6||Math.abs(a.z-b.z)>=(a.h+b.h)/2-1e-6,`Keycaps overlap: ${a.label}, ${b.label}`);
}
console.log(JSON.stringify({result:'PASS',keys:keys.length,deckTop:deck.max.y,wellTop:well.max.y,keyBottom,keyTop,legendHeight:surface.legendY,trackpadTop:pad.max.y}));
