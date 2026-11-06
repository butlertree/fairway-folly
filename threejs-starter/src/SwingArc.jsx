import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {swingMeter} from './game';

const segments=64;
const sides=6;
export function SwingArc({game,phase,clock}){
  const group=useRef(), glow=useRef(), core=useRef();
  const reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
  const path=useMemo(()=>{
    const points=Array.from({length:segments+1},(_,i)=>{
      const t=-1.58+i/segments*3.38;
      // The low point passes through the ball. The tilted plane rises behind and ahead.
      const lift=1-Math.cos(t);
      return new THREE.Vector3(-lift*1.42,lift*1.72,-Math.sin(t)*2.05);
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
    const cue=game.swingCue,age=game.time-(cue?.time??-10);
    const timing=!!clock&&game.mode==='ready'&&(phase==='power'||phase==='accuracy');
    const striking=!!cue&&age>=0&&age<.48;
    group.current.visible=!reduced&&(timing||striking);
    if(!group.current.visible)return;
    const ball=timing?game.ball:cue.ball;
    group.current.position.set(ball.x,ball.y,ball.z);
    group.current.rotation.y=-(timing?game.angle:cue.angle);
    let start,end,fade;
    if(timing){
      const value=swingMeter(phase,Math.max(0,performance.now()-clock.current)/1000);
      const head=phase==='power'?impact*(1-value):impact*(1-game.power*(1-(value+1)/2));
      start=Math.max(0,Math.round(head)-5);
      end=Math.min(impact,Math.round(head)+12);
      fade=.68;
    }else{
      const progress=Math.min(1,age/.32);
      const head=Math.round(impact+progress*(segments-impact));
      start=Math.max(impact-20,head-30);
      end=head;
      fade=1-Math.max(0,(age-.22)/.26);
    }
    for(const [mesh,opacity] of [[glow.current,.38],[core.current,.95]]){
      const guide=timing&&mesh===glow.current;
      mesh.geometry.setDrawRange((guide?0:start)*sides*6,(guide?impact:end-start)*sides*6);
      mesh.material.opacity=guide?.21:fade*opacity;
    }
  });
  return <group ref={group} visible={false}>
    <mesh ref={glow}><tubeGeometry args={[path,segments,.15,sides,false]}/><meshBasicMaterial color="#ffc957" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></mesh>
    <mesh ref={core}><tubeGeometry args={[path,segments,.043,sides,false]}/><meshBasicMaterial color="#fff1a6" transparent depthWrite={false} toneMapped={false}/></mesh>
  </group>;
}
