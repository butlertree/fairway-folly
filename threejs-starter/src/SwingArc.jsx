import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

const segments=64;
const sides=6;
export function SwingArc({game}){
  const group=useRef(), glow=useRef(), core=useRef();
  const reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
  const path=useMemo(()=>{
    const points=Array.from({length:segments+1},(_,i)=>{
      const t=-1.58+i/segments*3.38;
      // The low point passes through the ball. The tilted plane rises behind and ahead.
      const lift=1-Math.cos(t);
      return new THREE.Vector3(-lift*.87,lift*1.53,-Math.sin(t)*2.05);
    });
    return new THREE.CatmullRomCurve3(points);
  },[]);
  const impact=useMemo(()=>{
    let nearest=0,distance=Infinity;
    for(let i=0;i<=segments;i++){
      const d=path.getPointAt(i/segments).lengthSq();
      if(d<distance){nearest=i;distance=d;}
    }
    return nearest;
  },[path]);
  useFrame(()=>{
    const cue=game.swingCue, age=game.time-(cue?.time??-10);
    group.current.visible=!reduced&&!!cue&&age>=0&&age<.48;
    if(!group.current.visible)return;
    group.current.position.set(cue.ball.x,cue.ball.y,cue.ball.z);
    group.current.rotation.y=-cue.angle;
    const progress=Math.min(1,age/.32);
    const head=cue.strike?Math.round(impact+progress*(segments-impact)):Math.round(impact*(1-progress));
    const start=cue.strike?Math.max(impact-20,head-30):head;
    const end=cue.strike?head:Math.min(impact,head+20);
    const fade=(1-Math.max(0,(age-.22)/.26))*(cue.strike?1:.52);
    for(const [mesh,opacity] of [[glow.current,.38],[core.current,.95]]){
      mesh.geometry.setDrawRange(start*sides*6,(end-start)*sides*6);
      mesh.material.opacity=fade*opacity;
    }
  });
  return <group ref={group} visible={false}>
    <mesh ref={glow}><tubeGeometry args={[path,segments,.15,sides,false]}/><meshBasicMaterial color="#ffc957" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></mesh>
    <mesh ref={core}><tubeGeometry args={[path,segments,.043,sides,false]}/><meshBasicMaterial color="#fff1a6" transparent depthWrite={false} toneMapped={false}/></mesh>
  </group>;
}
