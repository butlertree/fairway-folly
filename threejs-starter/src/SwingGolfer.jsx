import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {getCourse,height,swingMeter} from './game';

const clubs={
  Driver:{length:1.13,stance:.43,head:[.16,.085,.105],loft:.14},
  Hybrid:{length:1.04,stance:.36,head:[.123,.065,.08],loft:.32},
  '7 iron':{length:.97,stance:.31,head:[.10,.056,.04],loft:.58},
  Wedge:{length:.92,stance:.28,head:[.095,.063,.035],loft:.83},
  'Sand wedge':{length:.90,stance:.29,head:[.10,.073,.045],loft:1}
};

const up=new THREE.Vector3(0,1,0);
const addressDirection=new THREE.Vector3(.54,-.84,.04).normalize();
const topDirection=new THREE.Vector3(.22,.26,-.94).normalize();
const finishDirection=new THREE.Vector3(-.51,-.20,.84).normalize();
const topGrip=new THREE.Vector3(-.91,1.57,.52);
const finishGrip=new THREE.Vector3(-.73,1.48,-.58);
const ease=t=>t*t*(3-2*t);

function joint(mesh,a,b){
  mesh.position.copy(a).lerp(b,.5);
  const direction=new THREE.Vector3().subVectors(b,a);
  mesh.scale.y=direction.length();
  mesh.quaternion.setFromUnitVectors(up,direction.normalize());
}

export function SwingGolfer({game,phase,clock}){
  const group=useRef(),body=useRef(),limbs=useRef([]),shaft=useRef(),clubHead=useRef(),hands=useRef(),shoes=useRef([]);
  const reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
  useFrame(()=>{
    const cue=game.swingCue,age=game.time-(cue?.time??-10);
    const address=!!clock&&game.mode==='ready'&&!game.paused;
    const follow=!!cue&&age>=0&&age<.65;
    group.current.visible=address||follow;
    if(!group.current.visible)return;

    const ball=address?game.ball:cue.ball;
    const club=clubs[address?game.club:cue.club];
    group.current.position.set(ball.x,ball.y,ball.z);
    group.current.rotation.y=-(address?game.angle:cue.angle);
    const elapsed=address?Math.max(0,performance.now()-clock.current)/1000:0;
    const accuracy=phase==='accuracy'?swingMeter(phase,elapsed):0;
    let pose=phase==='power'?swingMeter(phase,elapsed):phase==='accuracy'?game.power*Math.max(0,-accuracy):0;
    // Positive pose is the backswing, negative pose is the follow-through.
    if(!address){
      const strike=cue.power*Math.max(0,-cue.accuracy);
      pose=age<.09?strike*(1-age/.09):-ease(Math.min(1,(age-.09)/.41));
    }
    if(reduced)pose=0;
    const lift=ease(Math.abs(pose)),turn=pose*.83;
    const grip=addressDirection.clone().multiplyScalar(-club.length);
    const direction=addressDirection.clone();
    grip.lerp(pose>=0?topGrip:finishGrip,lift);
    direction.lerp(pose>=0?topDirection:finishDirection,lift).normalize();
    if(address)grip.z+=(1-lift)*.10;
    const head=grip.clone().addScaledVector(direction,club.length);
    joint(shaft.current,grip,head);
    clubHead.current.position.copy(head);
    clubHead.current.rotation.set(0,-turn,club.loft);
    clubHead.current.scale.set(...club.head);
    hands.current.position.copy(grip);

    const lean=(1-club.length)*.29;
    const tee=getCourse(game.hole).tee;
    const onTee=Math.abs(ball.x-tee.x)<3&&Math.abs(ball.z-tee.z)<4;
    const heading=group.current.rotation.y;
    body.current.position.set(-.81+lean,1.22,-pose*.10);
    body.current.rotation.set(0,turn,-.20+lift*.17);
    body.current.updateMatrix();
    for(let i=0;i<2;i++){
      const side=i===0?-1:1;
      const shoulder=new THREE.Vector3(0,.18,side*.19).applyMatrix4(body.current.matrix);
      const elbow=shoulder.clone().lerp(grip,.48);
      elbow.x-=.09;
      elbow.y-=.08;
      elbow.z+=side*.075;
      joint(limbs.current[i*4],shoulder,elbow);
      joint(limbs.current[i*4+1],elbow,grip);
      const hip=new THREE.Vector3(-.87,.82,side*.115-pose*.07);
      const foot=new THREE.Vector3(-.91+side*.085,.055,side*club.stance*.65);
      const x=ball.x+foot.x*Math.cos(heading)+foot.z*Math.sin(heading);
      const z=ball.z-foot.x*Math.sin(heading)+foot.z*Math.cos(heading);
      const ground=onTee?height(tee.x,tee.z,game.hole)+.105:height(x,z,game.hole);
      foot.y+=ground-ball.y+(side===1?Math.max(0,-pose)*.10:0);
      const knee=hip.clone().lerp(foot,.49);
      knee.x+=.10+lean;
      joint(limbs.current[i*4+2],hip,knee);
      joint(limbs.current[i*4+3],knee,foot);
      shoes.current[i].position.copy(foot).add(new THREE.Vector3(.048,0,0));
      shoes.current[i].rotation.y=-side*.13;
    }
  });
  const wood=game.club==='Driver'||game.club==='Hybrid';
  return <group ref={group} visible={false}>
    <group ref={body}>
      <mesh position={[0,-.08,0]} scale={[.155,.32,.233]}><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color="#315d51"/></mesh>
      <mesh position={[0,-.30,0]} scale={[.145,.095,.19]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color="#32443b"/></mesh>
      <mesh position={[.08,.34,0]} scale={[.116,.143,.109]}><sphereGeometry args={[1,18,14]}/><meshStandardMaterial color="#c9936b"/></mesh>
      <mesh position={[.075,.42,0]} scale={[.128,.078,.119]}><sphereGeometry args={[1,18,14]}/><meshStandardMaterial color="#e8d4a3"/></mesh>
      <mesh position={[.166,.408,0]} scale={[.11,.015,.093]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#e8d4a3"/></mesh>
    </group>
    {Array.from({length:8},(_,i)=>{
      const part=i%4,r=[.063,.043,.086,.061][part];
      return <mesh key={i} ref={mesh=>{limbs.current[i]=mesh}}>
        <cylinderGeometry args={[r*.84,r,1,12]}/><meshStandardMaterial color={['#315d51','#c9936b','#d5c6a1','#d5c6a1'][part]}/>
      </mesh>;
    })}
    {[0,1].map(i=><mesh key={i} ref={mesh=>{shoes.current[i]=mesh}} scale={[.147,.052,.072]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#f0e6cc"/></mesh>)}
    <mesh ref={hands} scale={[.062,.07,.067]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color="#eee8d3"/></mesh>
    <mesh ref={shaft}><cylinderGeometry args={[.012,.009,1,8]}/><meshStandardMaterial color="#b8c7c0" metalness={.28} roughness={.3}/></mesh>
    <mesh ref={clubHead}>{wood?<sphereGeometry args={[1,14,10]}/>:<boxGeometry args={[1.6,1.2,1.35]}/>}<meshStandardMaterial color={wood?'#354744':'#a5aaa0'} metalness={.24} roughness={.34}/></mesh>
  </group>;
}
