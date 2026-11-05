import {cupCut} from './putting-turf';
import React,{useMemo} from 'react';
import * as THREE from 'three';
// The turf opening remains .55, matching capture geometry. Liner sits below the cut edge.
export function GolfCup({cup={x:0,z:-12}}){const liner=useMemo(()=>{const g=new THREE.CylinderGeometry(.537,.50,1.06,cupCut.segments,10,true),p=g.attributes.position,colors=[];for(let i=0;i<p.count;i++){const t=(p.getY(i)+.53)/1.06,c=new THREE.Color().lerpColors(new THREE.Color('#67776f'),new THREE.Color('#f3f3e7'),t);colors.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g},[]);return <group position={[cup.x,0,cup.z]}>
 <mesh position={[0,-.065,0]}><cylinderGeometry args={[.55,.55,.13,cupCut.segments,1,true]}/><meshStandardMaterial color="#554a32" side={THREE.BackSide} roughness={1}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.0005,0]}><ringGeometry args={[cupCut.radius,.566,cupCut.segments]}/><meshStandardMaterial color="#657b3e" roughness={1}/></mesh>
 <mesh geometry={liner} position={[0,-.67,0]}><meshStandardMaterial vertexColors side={THREE.BackSide} roughness={.68} /></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.14,0]}><torusGeometry args={[.537,.009,8,cupCut.segments]}/><meshStandardMaterial color="#e7e9df" roughness={.6}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.205,0]}><circleGeometry args={[.50,64]}/><meshStandardMaterial color="#344b3d" roughness={.8}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.20,0]}><circleGeometry args={[.085,24]}/><meshBasicMaterial color="#17251f"/></mesh>
 {Array.from({length:6},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,0]} position={[Math.cos(i*Math.PI/3)*.32,-1.20,Math.sin(i*Math.PI/3)*.32]}><circleGeometry args={[.035,12]}/><meshBasicMaterial color="#26372f"/></mesh>)}
 </group>}
