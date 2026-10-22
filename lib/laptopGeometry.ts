import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Extruded rounded shapes can exceed thin dimensions when their bevel is too
// large. This geometry clamps the bevel and preserves all three outer bounds.
export function laptopBox(width:number,height:number,depth:number,radius:number,segments=3) {
  return new RoundedBoxGeometry(width,height,depth,segments,Math.min(radius,width/2,height/2,depth/2));
}
export const keyboardSurface = {wellY:.126,keyY:.156,keyHeight:.028,legendY:.171};
