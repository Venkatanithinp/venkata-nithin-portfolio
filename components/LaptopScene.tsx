'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { laptopBox, keyboardSurface } from '@/lib/laptopGeometry';
import * as THREE from 'three';
import { cameraPath, cameraTargetPath, cameraQuaternionAt, range, smooth, type JourneyState } from '@/lib/choreography';
import { keyboardKeys, makeKeyboardTexture, makeLabel, makeScreenTexture, makePanelTexture, makeAlienLogo } from '@/lib/laptopTextures';

type Props = { state: React.RefObject<JourneyState>; reduced: boolean; active: boolean; onReady: () => void; onFailure: () => void };

class SceneBoundary extends Component<{children: ReactNode; onFailure: () => void}, {failed: boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed ? <div className="scene-unavailable">The 3D scene needs WebGL.<br/>You can still meet Nithin below.</div> : this.props.children;}
}

const screenVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const screenFragment = `
  uniform float uTime; uniform float uOpacity; uniform sampler2D uTexture; varying vec2 vUv;
  void main(){
    vec2 uv=vUv; vec3 col=vec3(.014,.022,.042);
    float wave=sin(uv.x*3.8+uTime*.12)*.13+.38;
    float band=exp(-pow((uv.y-wave)*6.,2.));
    float ribbon=exp(-pow((uv.y-(wave+.12*sin(uv.x*8.+uTime*.1)))*22.,2.));
    col+=mix(vec3(.05,.05,.14),vec3(.07,.18,.23),uv.x)*band;
    col+=vec3(.13,.11,.26)*ribbon*.7;
    float grid=step(.987,fract(uv.x*36.))*step(uv.y,.32)+step(.983,fract(uv.y*23.))*step(uv.y,.32);
    col+=grid*.018; vec4 ink=texture2D(uTexture,uv); col=mix(col,ink.rgb,ink.a);
    gl_FragColor=vec4(col,uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

function RoundedBox({args,radius=.05,smoothness=3,children,...props}: Omit<ThreeElements['mesh'],'args'> & {args:[number,number,number];radius?:number;smoothness?:number}) {
  const [width,height,depth]=args;
  const geometry=useMemo(()=>laptopBox(width,height,depth,radius,smoothness),[width,height,depth,radius,smoothness]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh {...props} geometry={geometry}>{children}</mesh>;
}

function Keyboard() {
  const keys=useMemo(keyboardKeys,[]);
  const mesh=useRef<THREE.InstancedMesh>(null);
  const geometry=useMemo(()=>laptopBox(1,1,1,.08,2),[]);
  const legends=useMemo(()=>makeKeyboardTexture(keys),[keys]);
  useLayoutEffect(()=>{
    const dummy=new THREE.Object3D();
    keys.forEach((key,i)=>{dummy.position.set(key.x,keyboardSurface.keyY,key.z);dummy.scale.set(key.w,keyboardSurface.keyHeight,key.h);dummy.updateMatrix();mesh.current?.setMatrixAt(i,dummy.matrix);});
    if(mesh.current)mesh.current.instanceMatrix.needsUpdate=true;
  },[keys]);
  useEffect(()=>()=>{geometry.dispose();legends.dispose();},[geometry,legends]);
  return <>
    <RoundedBox args={[3.3,.022,1.25]} radius={.035} smoothness={2} position={[0,keyboardSurface.wellY,-.35]}><meshStandardMaterial color="#080a0d" roughness={.8}/></RoundedBox>
    <instancedMesh ref={mesh} args={[geometry,undefined,keys.length]} castShadow receiveShadow><meshStandardMaterial color="#3c454e" metalness={.15} roughness={.5}/></instancedMesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,keyboardSurface.legendY,0]}><planeGeometry args={[3.56,2.53]}/><meshBasicMaterial transparent map={legends} toneMapped={false} opacity={.85} depthWrite={false}/></mesh>
  </>;
}

function Laptop({state}:{state: React.RefObject<JourneyState>}) {
  const group=useRef<THREE.Group>(null),lid=useRef<THREE.Group>(null),back=useRef<THREE.MeshPhysicalMaterial>(null),screen=useRef<THREE.ShaderMaterial>(null);
  const textures=useMemo(()=>({label:makeLabel('A L I E N W A R E','#8b939e',25),screen:makeScreenTexture(),logo:makeAlienLogo()}),[]);
  const uniforms=useMemo(()=>({uTime:{value:0},uOpacity:{value:1},uTexture:{value:textures.screen}}),[textures]);
  useEffect(()=>()=>Object.values(textures).forEach(t=>t.dispose()),[textures]);
  useFrame(({clock},dt)=>{
    const p=state.current.progress;const motion=!state.current.reducedMotion;
    if(group.current){
      const influence=1-smooth(range(p,.2,.4));
      group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,(-.18+state.current.pointer.x*.085)*influence,4,dt);
      group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,(motion?Math.sin(clock.elapsedTime*.43)*.015:0)*influence,4,dt);
      group.current.position.y=(motion?Math.sin(clock.elapsedTime*.65)*.035:0)*influence;
    }
    if(lid.current)lid.current.rotation.x=.18-smooth(range(p,0,.4))*.35;
    if(back.current)back.current.opacity=1-smooth(range(p,.59,.645));
    if(screen.current){screen.current.uniforms.uTime.value=motion?clock.elapsedTime:0;screen.current.uniforms.uOpacity.value=1-smooth(range(p,.625,.675));}
  });
  return <group ref={group}>
    <RoundedBox args={[3.56,.17,2.53]} radius={.07} smoothness={4} position={[0,.005,0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#3a3e43" metalness={.78} roughness={.32} clearcoat={.22} clearcoatRoughness={.32}/>
    </RoundedBox>
    <RoundedBox args={[3.5,.04,2.47]} radius={.065} smoothness={3} position={[0,.1,0]} receiveShadow>
      <meshPhysicalMaterial color="#262b31" metalness={.65} roughness={.37}/>
    </RoundedBox>
    <RoundedBox args={[3.31,.023,2.26]} radius={.06} smoothness={2} position={[0,-.09,0]}><meshStandardMaterial color="#11151b" metalness={.45} roughness={.7}/></RoundedBox>
    <Keyboard/>
    <RoundedBox args={[1.08,.012,.62]} radius={.035} smoothness={3} position={[-.38,.129,.75]}><meshStandardMaterial color="#646c75" roughness={.3} metalness={.85}/></RoundedBox>
    <RoundedBox args={[1.065,.014,.607]} radius={.032} smoothness={3} position={[-.38,.137,.75]}><meshPhysicalMaterial color="#282e35" metalness={.4} roughness={.43} clearcoat={.25}/></RoundedBox>
    <mesh position={[1.5,.13,-1.06]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.027,16]}/><meshStandardMaterial color="#a5d4ed" emissive="#7ab5cf" emissiveIntensity={.7}/></mesh>
    {[-1.22,1.22].map(x=><mesh key={x} position={[x,.135,-1.14]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.08,.08,.55,20]}/><meshStandardMaterial color="#242932" metalness={.9} roughness={.27}/></mesh>)}
    {Array.from({length:24},(_,i)=><mesh key={`vent${i}`} position={[-1.23+i*.107,.008,-1.269]}><boxGeometry args={[.064,.075,.008]}/><meshStandardMaterial color="#030609" roughness={.8}/></mesh>)}
    {[-1,1].map(side=><group key={side}>
      {Array.from({length:12},(_,i)=><mesh key={i} position={[side*1.774,.018,-.94+i*.048]}><boxGeometry args={[.012,.065,.027]}/><meshStandardMaterial color="#020406"/></mesh>)}
      {[-.16,.24,.57].map((z,i)=><mesh key={z} position={[side*1.78,.005,z]}><boxGeometry args={[.013,i===2?.04:.065,i===2?.1:.17]}/><meshStandardMaterial color="#080a0d" metalness={.5} roughness={.8}/></mesh>)}
    </group>)}
    <group ref={lid} position={[0,.13,-1.13]}>
      <RoundedBox args={[3.47,2.13,.085]} radius={.05} smoothness={4} position={[0,1.065,0]} castShadow>
        <meshPhysicalMaterial ref={back} color="#272d35" metalness={.78} roughness={.3} clearcoat={.22} transparent depthWrite={false}/>
      </RoundedBox>
      {/* Four solid frame pieces leave a real opening when the screen becomes a portal. */}
      {[-1.707,1.707].map(x=><RoundedBox key={x} args={[.056,2.1,.075]} radius={.02} smoothness={2} position={[x,1.067,.013]}><meshStandardMaterial color="#10141b" metalness={.4} roughness={.45}/></RoundedBox>)}
      {[.05,2.085].map(y=><RoundedBox key={y} args={[3.41,.085,.075]} radius={.02} smoothness={2} position={[0,y,.013]}><meshStandardMaterial color="#10141b" metalness={.4} roughness={.45}/></RoundedBox>)}
      <mesh position={[0,1.095,.047]}><planeGeometry args={[3.265,1.87]}/><shaderMaterial ref={screen} vertexShader={screenVertex} fragmentShader={screenFragment} uniforms={uniforms} transparent depthWrite={false}/></mesh>
      <mesh position={[0,.092,.055]}><planeGeometry args={[1.16,.14]}/><meshBasicMaterial map={textures.label} transparent depthWrite={false} toneMapped={false}/></mesh>
      <mesh position={[0,2.065,.057]}><circleGeometry args={[.017,20]}/><meshPhysicalMaterial color="#06090f" metalness={.6} roughness={.08} clearcoat={1}/></mesh>
      <mesh position={[.055,2.065,.056]}><circleGeometry args={[.006,8]}/><meshBasicMaterial color="#5b6373"/></mesh>
      <mesh position={[0,1.22,-.046]} rotation={[0,Math.PI,0]}><planeGeometry args={[.2,.24]}/><meshStandardMaterial map={textures.logo} transparent metalness={.7} roughness={.3}/></mesh>
    </group>
  </group>;
}

function DigitalWorld({state,mobile}:{state:React.RefObject<JourneyState>;mobile:boolean}) {
  const tunnelEdges=useMemo(()=>{const box=new THREE.BoxGeometry(5.7,3.9,.04);const edges=new THREE.EdgesGeometry(box);box.dispose();return edges;},[]);
  useEffect(()=>()=>tunnelEdges.dispose(),[tunnelEdges]);
  const group=useRef<THREE.Group>(null);
  const textures=useMemo(()=>[makePanelTexture('Think.','Start with a better question.',1),makePanelTexture('Build.','Turn an idea into something real.',2),makePanelTexture('Explore.','There is always more to discover.',3)],[]);
  const positions=useMemo(()=>{
    let seed=91;const rand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
    const n=mobile?160:460;const arr=new Float32Array(n*3);
    for(let i=0;i<n;i++){arr[i*3]=(rand()-.5)*9;arr[i*3+1]=rand()*5-1;arr[i*3+2]=-2-rand()*22;}
    return arr;
  },[mobile]);
  useEffect(()=>()=>textures.forEach(t=>t.dispose()),[textures]);
  useFrame(()=>{if(group.current)group.current.visible=state.current.progress>.59;});
  return <group ref={group} name="digital-world" visible={false}>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial size={.017} color="#a2bdd7" transparent opacity={.58} sizeAttenuation depthWrite={false}/></points>
    {textures.map((t,i)=><group key={i} position={[i%2===0?-1.85:1.85,1.4,-3.7-i*4.5]} rotation={[0,i%2===0?.26:-.26,0]}>
      <mesh><planeGeometry args={[2.6,1.625]}/><meshBasicMaterial map={t} transparent side={THREE.DoubleSide} toneMapped={false}/></mesh>
    </group>)}
    {Array.from({length:9},(_,i)=><group key={i} position={[0,1.35,-3-i*2.8]}>
      <lineSegments geometry={tunnelEdges}><lineBasicMaterial color="#4b6684" transparent opacity={.16}/></lineSegments>
    </group>)}
    {Array.from({length:15},(_,i)=><mesh key={i} position={[-3.5+i*.5,-.58,-12]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.006,24]}/><meshBasicMaterial color="#324e6c" transparent opacity={.22}/></mesh>)}
    {Array.from({length:16},(_,i)=><mesh key={`cross${i}`} position={[0,-.58,-1-i*1.5]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,.006]}/><meshBasicMaterial color="#324e6c" transparent opacity={.22}/></mesh>)}
  </group>;
}

// Keep projection in sync with the portal while deferring expensive framebuffer
// reallocations until the scroll-driven resize settles (Canvas resize debounce).
function PortalProjection(){
  const {gl,camera}=useThree();
  const aspect=useRef(0);
  useLayoutEffect(()=>{
    const el=gl.domElement.closest('.cinematic-portal');if(!el)return;
    const measure=()=>{const b=el.getBoundingClientRect();if(b.height>0)aspect.current=b.width/b.height;};
    const observer=new ResizeObserver(measure);observer.observe(el);measure();return()=>observer.disconnect();
  },[gl]);
  useFrame(()=>{const lens=camera as THREE.PerspectiveCamera;if(aspect.current&&Math.abs(lens.aspect-aspect.current)>.001){lens.aspect=aspect.current;lens.updateProjectionMatrix();}},-1);
  return null;
}

function SceneWarmup({onReady}:{onReady:()=>void}) {
  const {gl,scene,camera}=useThree();
  useEffect(()=>{
    let cancelled=false;
    const digital=scene.getObjectByName('digital-world'),visible=digital?.visible;
    if(digital)digital.visible=true;
    // Prepare the digital-world shaders before the camera crosses the screen.
    const ready=gl.compileAsync(scene,camera);
    if(digital)digital.visible=visible??false;
    ready.catch(()=>{}).finally(()=>{if(!cancelled)onReady();});
    return()=>{cancelled=true;};
  },[gl,scene,camera,onReady]);
  return null;
}

function CameraRig({state}:{state:React.RefObject<JourneyState>}) {
  const {camera}=useThree();
  const target=useMemo(()=>new THREE.Vector3(),[]),position=useMemo(()=>new THREE.Vector3(),[]),matrix=useMemo(()=>new THREE.Matrix4(),[]),quaternion=useMemo(()=>new THREE.Quaternion(),[]);
  const initial=useMemo(()=>new THREE.Vector3(4.15,2.9,6.5),[]);

  useFrame((_,dt)=>{
    const p=state.current.reducedMotion?0:state.current.progress;
    if(p<=.4){
      position.copy(initial).lerp(cameraPath.points[0],smooth(range(p,.12,.4)));
      target.set(0,.72,0).lerp(cameraTargetPath.points[0],smooth(range(p,.12,.4)));
    } else {
      const t=range(p,.4,.85);
      cameraPath.getPoint(t,position);cameraTargetPath.getPoint(t,target);
    }
    const aspect=(camera as THREE.PerspectiveCamera).aspect;
    if(aspect<1.2)position.multiplyScalar(1+(1.2-aspect)*.3*(1-smooth(range(p,.4,.54))));
    camera.position.copy(position);
    matrix.lookAt(position,target,camera.up);quaternion.setFromRotationMatrix(matrix);
    if(p>.4&&(aspect>=1.2||p>=.54))cameraQuaternionAt(range(p,.4,.85),quaternion);
    // Orientation uses the same scroll sample as translation. Time-delayed
    // damping here made the view miss the laptop when scrubbing backward fast.
    camera.quaternion.copy(quaternion);

  });
  return null;
}

function Studio({state,mobile}:{state:React.RefObject<JourneyState>;mobile:boolean}) {
  const floor=useRef<THREE.Mesh>(null),lastShadow=useRef(-1);
  const {gl}=useThree();
  useEffect(()=>{gl.shadowMap.autoUpdate=false;gl.shadowMap.needsUpdate=true;return()=>{gl.shadowMap.autoUpdate=true;};},[gl]);
  useFrame(({clock})=>{if(floor.current)floor.current.visible=state.current.progress<.64;if(!mobile&&state.current.progress<.64&&clock.elapsedTime-lastShadow.current>.12){gl.shadowMap.needsUpdate=true;lastShadow.current=clock.elapsedTime;}});
  return <>
    <ambientLight intensity={.48}/>
    <directionalLight position={[1,6,5]} intensity={3.4} color="#edf0f5" castShadow={!mobile} shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-.0004}/>
    <spotLight position={[-4,3,-1]} intensity={20} angle={.6} penumbra={1} color="#adb9e0"/>
    <pointLight position={[0,1,-.65]} intensity={.9} distance={3} color="#9bb5e2"/>
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={3} position={[0,5,-2]} scale={[6,2,1]} rotation={[Math.PI/2,0,0]}/>
      <Lightformer intensity={3.5} position={[-5,2,2]} scale={[4,3,1]} rotation={[0,Math.PI/2,0]}/>
      <Lightformer intensity={2} position={[4,1,-3]} scale={[3,1,1]} rotation={[0,-Math.PI/2,0]} color="#bac8ed"/>
    </Environment>
    <mesh ref={floor} rotation={[-Math.PI/2,0,0]} position={[0,-.4,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color="#15171b" metalness={.25} roughness={.55}/></mesh>
  </>;
}

export default function LaptopScene({state,reduced,active,onReady,onFailure}:Props){
  const [mobile]=useState(()=>typeof window!=='undefined'&&window.innerWidth<768);
  const [dpr,setDpr]=useState(mobile?1:1.25);
  const [available,setAvailable]=useState(false);
  useEffect(()=>{const probe=document.createElement('canvas');let context:WebGL2RenderingContext|null=null;try{context=probe.getContext('webgl2');}catch{}if(!context){onFailure();return;}context.getExtension('WEBGL_lose_context')?.loseContext();setAvailable(true);},[onFailure]);
  if(!available)return <div className="scene-loading"><span/>Opening a new perspective</div>;
  return <SceneBoundary onFailure={onFailure}>
    <Canvas className="r3f-host" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} resize={{scroll:false,debounce:{resize:140,scroll:140}}} aria-label="Interactive 3D laptop. Scroll to travel over its keyboard and through its display." dpr={dpr} frameloop={reduced||!active?'demand':'always'} shadows={!mobile} camera={{position:[4.15,2.9,6.5],fov:38,near:.015,far:60}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.setClearColor('#111318');gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.15;gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true});}} fallback={<div className="scene-unavailable">3D is unavailable on this device. Use “Skip to About”.</div>}>
      <Suspense fallback={null}>
        <PerformanceMonitor onDecline={()=>setDpr(1)} flipflops={2} onFallback={()=>setDpr(1)}/>
        <fog attach="fog" args={['#090b10',9,30]}/>
        <Studio state={state} mobile={mobile}/>
        <Laptop state={state}/>
        <DigitalWorld state={state} mobile={mobile}/>
        <PortalProjection/><CameraRig state={state}/><SceneWarmup onReady={onReady}/>
      </Suspense>
    </Canvas>
  </SceneBoundary>;
}
