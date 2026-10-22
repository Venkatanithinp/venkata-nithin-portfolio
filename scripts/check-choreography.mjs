import assert from 'node:assert/strict';
import * as THREE from 'three';
import { cameraPath, cameraTargetPath, cameraQuaternionAt } from '../lib/choreography.ts';

let crossing, previous, previousCamera;
let minimumClearance=Infinity, largestStep=0;
for(let i=0;i<=1000;i++) {
  const t=i/1000, progress=.4+t*.45;
  const camera=cameraPath.getPoint(t);
  const local=camera.clone().sub(new THREE.Vector3(0,.13,-1.13)).applyAxisAngle(new THREE.Vector3(1,0,0),.17);
  if(previous&&previous.z>.047&&local.z<=.047)crossing={progress,...local};
  if(Math.abs(camera.x)<1.78&&Math.abs(camera.z)<1.265)minimumClearance=Math.min(minimumClearance,camera.y-.18);
  assert.ok(camera.distanceTo(cameraTargetPath.getPoint(t))>.1,'Camera target must never coincide with the camera');
  if(previousCamera)largestStep=Math.max(largestStep,camera.distanceTo(previousCamera));
  previous=local;previousCamera=camera;
}
assert.ok(crossing,'The camera must cross the screen plane');
assert.ok(crossing.progress>.6&&crossing.progress<.85,'Screen crossing must occur in the requested 60–85% phase');
assert.ok(Math.abs(crossing.x)<1.6325&&Math.abs(crossing.y-1.095)<.935,'Camera must cross inside the screen aperture, not through the bezel');
assert.ok(minimumClearance>.1,'Camera must clear the keycaps and chassis');
let previousFine=cameraPath.getPoint(0), largestFineStep=0;
for(let i=1;i<=2000;i++){
  const next=cameraPath.getPoint(i/2000);
  largestFineStep=Math.max(largestFineStep,next.distanceTo(previousFine));previousFine=next;
}
// A discontinuity remains the same size as resolution increases; a continuous
// curve's maximum step halves when we halve the sample interval.
assert.ok(largestFineStep<=largestStep*.51,'Spline must remain continuous at finer sampling');
assert.ok(cameraPath.getPoint(1).z<-10,'The camera must continue into the digital environment');
console.log(JSON.stringify({result:'PASS',screenCrossing:crossing,minimumKeyboardClearance:minimumClearance,largestSplineStep:largestStep},null,2));

const forward=Array.from({length:101},(_,i)=>cameraQuaternionAt(i/100,new THREE.Quaternion()));
let maximumAngle=0;
for(let i=100;i>=0;i--){
  assert.ok(cameraQuaternionAt(i/100,new THREE.Quaternion()).angleTo(forward[i])<1e-7,'Reversing scroll must preserve the same camera orientation');
  if(i)maximumAngle=Math.max(maximumAngle,forward[i].angleTo(forward[i-1]));
}
assert.ok(maximumAngle<.15,'Camera orientation must stay continuous along the spline');
console.log('PASS: camera quaternion continuity and forward/reverse consistency.');
