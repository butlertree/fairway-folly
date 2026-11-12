import {useFrame} from '@react-three/fiber';
import {scenicWindAt} from './wind';
import {courseWoodland} from './course-woodland';
import React,{useMemo,useEffect,useRef} from 'react';import * as THREE from 'three';
import {treeCrowns,treeShape} from './hole-nine-trees';
export function ValleyForest({hole=9,game}){const trees=useMemo(()=>courseWoodland(hole),[hole]),trunks=useRef(),crowns=useRef([]),sway=useMemo(()=>({value:new THREE.Vector3()}),[]),reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
useFrame(()=>{if(!game||reduced)return;const w=scenicWindAt(game.wind,game.time);sway.value.set(w.x,w.z,game.time)});
const dress=useMemo(()=>shader=>{
 shader.uniforms.woodlandWind=sway;
 shader.vertexShader='uniform vec3 woodlandWind;\nvarying vec3 vLeaf;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vLeaf=position;
 float pulse=.65+.35*sin(woodlandWind.z*1.6-instanceMatrix[3].z*.08);
 transformed.xz+=woodlandWind.xy*.006*pulse;`);
 shader.fragmentShader='varying vec3 vLeaf;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 p=vLeaf*19.0;
 float clusters=sin(p.x+sin(p.z*.7))*sin(p.y+sin(p.x*.6))*sin(p.z+sin(p.y));
 float detail=1.0-smoothstep(.55,1.8,length(fwidth(p)));
 diffuseColor.rgb*=1.0+.105*clusters*detail+.045*sin(vLeaf.x*6.0+vLeaf.z*4.0);
 `);
},[sway]);
useEffect(()=>{const o=new THREE.Object3D();for(let i=0;i<trees.length;i++){const t=trees[i];o.position.set(t.x,t.y+14*t.tall,t.z);o.scale.set(1.2*t.wide,15*t.tall,1.2*t.wide);o.updateMatrix();trunks.current.setMatrixAt(i,o.matrix);trunks.current.setColorAt(i,new THREE.Color(t.kind==='cottonwood'?'#a3987a':t.kind==='birch'?'#d9d2b4':'#856344'));treeCrowns.forEach((c,j)=>{const shape=treeShape(t,c);o.position.set(shape.x,shape.y,shape.z);o.scale.set(shape.rx,shape.ry,shape.rz);o.updateMatrix();crowns.current[j].setMatrixAt(i,o.matrix);const col=new THREE.Color(t.kind==='cottonwood'?'#93ab58':t.kind==='birch'?'#8fae64':t.kind==='cypress'?'#416e50':t.kind==='willow'?'#8aad65':'#6b9656');col.offsetHSL(.024*Math.sin(i*2.39),.035*Math.cos(i*1.7),.035*Math.sin(i*1.1));col.multiplyScalar(.78+j*.09);crowns.current[j].setColorAt(i,col)})}trunks.current.instanceMatrix.needsUpdate=true;trunks.current.instanceColor.needsUpdate=true;crowns.current.forEach(m=>{m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true})},[trees,hole]);return <><instancedMesh ref={trunks} args={[null,null,trees.length]} castShadow><sphereGeometry args={[1,12,20]}/><meshStandardMaterial color="#ffffff"/></instancedMesh>{treeCrowns.map((_,j)=><instancedMesh key={j} ref={m=>crowns.current[j]=m} args={[null,null,trees.length]} castShadow><sphereGeometry args={[1,20,20]}/><meshStandardMaterial color="#ffffff" roughness={1} onBeforeCompile={dress}/></instancedMesh>)}</>}
