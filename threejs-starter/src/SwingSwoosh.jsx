import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

export const swingImpactDelay=220;
const segments=72;
const sides=6;
const impact=36;

class ClubPath extends THREE.Curve{
  getPoint(t,target=new THREE.Vector3()){
    const angle=(t-.5)*4.6;
    const lift=1-Math.cos(angle);
    return target.set(-.86*lift+.32*Math.sin(angle),1.3*lift,-1.3*Math.sin(angle));
  }
  getUtoTmapping(u){return u}
}

export function SwingSwoosh({game}){
  const group=useRef(),glow=useRef(),core=useRef();
  const path=useMemo(()=>new ClubPath(),[]);
  useFrame(()=>{
    const cue=game.swingCue;
    const age=cue?performance.now()-cue.started:Infinity;
    group.current.visible=!!cue&&!cue.reduced&&age<570;
    if(!group.current.visible)return;
    group.current.position.set(cue.ball.x,cue.ball.y,cue.ball.z);
    group.current.rotation.y=-cue.angle;
    const head=age<swingImpactDelay
      ?Math.round(impact*Math.max(0,age/swingImpactDelay))
      :Math.round(impact+(segments-impact)*Math.min(1,(age-swingImpactDelay)/280));
    const start=Math.max(0,head-18),end=Math.min(segments,head+2);
    const fade=1-THREE.MathUtils.smoothstep(age,330,570);
    for(const [mesh,opacity] of [[glow.current,.30],[core.current,.94]]){
      mesh.geometry.setDrawRange(start*sides*6,(end-start)*sides*6);
      mesh.material.opacity=fade*opacity;
    }
  });
  return <group ref={group} visible={false}>
    <mesh ref={glow}><tubeGeometry args={[path,segments,.10,sides,false]}/><meshBasicMaterial color="#f8c65e" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/></mesh>
    <mesh ref={core}><tubeGeometry args={[path,segments,.034,sides,false]}/><meshBasicMaterial color="#fff1af" transparent depthWrite={false} toneMapped={false}/></mesh>
  </group>;
}
