import * as THREE from 'three';

export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };

// Camera translates through world space. No model scaling is used in this sequence.
export const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(3.8, 2.65, 5.6),
  new THREE.Vector3(3.15, 1.25, 2.8),
  new THREE.Vector3(1.7, 0.73, 1.1),
  new THREE.Vector3(-0.36, 1.15, 0.05),
  new THREE.Vector3(-0.13, 1.27, -0.9),
  new THREE.Vector3(0.08, 1.29, -1.8),
  new THREE.Vector3(0.28, 1.32, -4.6),
  new THREE.Vector3(-0.3, 1.4, -8.4),
  new THREE.Vector3(0, 1.4, -14),
], false, 'catmullrom', 0.35);

export const cameraTargetPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.6, 0),
  new THREE.Vector3(0, 0.23, -0.28),
  new THREE.Vector3(0, 0.7, -0.8),
  new THREE.Vector3(0.14, 1.3, -1.5),
  new THREE.Vector3(0.15, 1.3, -2.8),
  new THREE.Vector3(0.18, 1.3, -5.5),
  new THREE.Vector3(-0.1, 1.45, -8.8),
  new THREE.Vector3(0, 1.4, -13),
  new THREE.Vector3(0, 1.4, -20),
], false, 'catmullrom', 0.35);

export type JourneyState = {
  progress: number;
  pointer: { x: number; y: number };
  reducedMotion: boolean;
  active: boolean;
};

// Scroll-sampled orientations pair with the same camera positions in either
// direction. Interpolation has no time lag during fast wheel/touch scrubbing.
const orientationMatrix=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0);
const cameraOrientations=Array.from({length:257},(_,i)=>new THREE.Quaternion().setFromRotationMatrix(orientationMatrix.lookAt(cameraPath.getPoint(i/256),cameraTargetPath.getPoint(i/256),up)));
export function cameraQuaternionAt(t:number,out:THREE.Quaternion){const sample=clamp(t)*256,index=Math.min(255,Math.floor(sample));return out.slerpQuaternions(cameraOrientations[index],cameraOrientations[index+1],sample-index);}
