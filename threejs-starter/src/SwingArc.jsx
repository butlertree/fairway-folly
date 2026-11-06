import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {swingMeter} from './game';

const segments=128;
const sides=8;
const radius=1.3;

function swingPoint(angle,target=new THREE.Vector3()){
  const rise=radius*(1-Math.cos(angle)),reach=radius*Math.sin(angle);
  return target.set(-.52*rise+.35*reach,.8*rise,-.937*reach);
}

class SwingLoop extends THREE.Curve{
  getPoint(t,target){return swingPoint((t*2-1)*Math.PI,target)}
  // Use the same angular coordinate for geometry and timing.
  getUtoTmapping(u){return u}
}

function accuracyAngle(power,accuracy){
  return accuracy<0?Math.PI*power*accuracy:.32*accuracy;
}

export function SwingArc({game,phase,clock}){
  const group=useRef(),trail=useRef(),head=useRef(),guide=useRef();
  const reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
  const path=useMemo(()=>new SwingLoop(),[]);
  const top=useMemo(()=>swingPoint(-Math.PI).toArray(),[]);
  useFrame(()=>{
    const cue=game.swingCue,age=game.time-(cue?.time??-10);
    const timing=!!clock&&game.mode==='ready'&&(phase==='power'||phase==='accuracy');
    const following=!!cue&&age>=0&&age<.42;
    group.current.visible=timing||(!reduced&&following);
    if(!group.current.visible)return;

    const ball=timing?game.ball:cue.ball;
    group.current.position.set(ball.x,ball.y,ball.z);
    group.current.rotation.y=-(timing?game.angle:cue.angle);
    const value=timing?swingMeter(phase,Math.max(0,performance.now()-clock.current)/1000):0;
    const angle=timing?(phase==='power'?-Math.PI*value:accuracyAngle(game.power,value)):
      THREE.MathUtils.lerp(accuracyAngle(cue.power,cue.accuracy),2.18,1-(1-Math.min(1,age/.34))**2);
    const segment=Math.round((angle/Math.PI+1)*segments/2);
    const start=Math.max(0,segment-7),end=Math.min(segments,segment+3);
    trail.current.geometry.setDrawRange(start*sides*6,(end-start)*sides*6);
    trail.current.material.opacity=timing?.95:1-age/.42;
    trail.current.visible=!reduced;
    head.current.visible=timing&&!reduced;
    guide.current.visible=timing;
    swingPoint(angle,head.current.position);
  });
  return <group ref={group} visible={false}>
    <group ref={guide}>
      <mesh><tubeGeometry args={[path,segments,.025,sides,true]}/><meshBasicMaterial color="#fff0a3" transparent opacity={.7} depthWrite={false} toneMapped={false}/></mesh>
      <mesh position={top}><sphereGeometry args={[.095,12,8]}/><meshBasicMaterial color="#ffd460" toneMapped={false}/></mesh>
      <mesh position={[0,.11,0]}><sphereGeometry args={[.08,12,8]}/><meshBasicMaterial color="#9af0aa" toneMapped={false}/></mesh>
    </group>
    <mesh ref={trail}><tubeGeometry args={[path,segments,.064,sides,true]}/><meshBasicMaterial color="#ffe075" transparent depthWrite={false} toneMapped={false}/></mesh>
    <mesh ref={head}><sphereGeometry args={[.106,12,8]}/><meshBasicMaterial color="#fff8cd" toneMapped={false}/></mesh>
  </group>;
}
