import {cupCut} from './putting-turf';
import React,{useMemo} from 'react';
import * as THREE from 'three';
// The turf opening remains .55, matching capture geometry. Liner sits below the cut edge.
export function GolfCup({cup={x:0,z:-12},detailed=false}){const liner=useMemo(()=>{const g=new THREE.CylinderGeometry(.537,.50,1.06,cupCut.segments,10,true),p=g.attributes.position,colors=[];for(let i=0;i<p.count;i++){const t=(p.getY(i)+.53)/1.06,c=new THREE.Color().lerpColors(new THREE.Color(detailed?'#303e35':'#67776f'),new THREE.Color('#f3f3e7'),detailed?t*t:t);colors.push(c.r,c.g,c.b)}g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g},[detailed]);return <group position={[cup.x,0,cup.z]}>
 <mesh position={[0,-.065,0]}><cylinderGeometry args={[.55,.55,.13,cupCut.segments,1,true]}/><meshStandardMaterial color={detailed?"#403420":"#554a32"} side={THREE.BackSide} roughness={1}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.0005,0]}><ringGeometry args={[cupCut.radius,.566,cupCut.segments]}/><meshStandardMaterial color="#657b3e" roughness={1}/></mesh>
 <mesh geometry={liner} position={[0,-.67,0]}><meshStandardMaterial vertexColors side={THREE.BackSide} roughness={.68} /></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.14,0]}><torusGeometry args={[.537,.009,8,cupCut.segments]}/><meshStandardMaterial color="#e7e9df" roughness={.6}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.205,0]}><circleGeometry args={[.50,64]}/><meshStandardMaterial color="#344b3d" roughness={.8}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.20,0]}><circleGeometry args={[.085,24]}/><meshBasicMaterial color="#17251f"/></mesh>
 {Array.from({length:6},(_,i)=><mesh key={i} rotation={[-Math.PI/2,0,0]} position={[Math.cos(i*Math.PI/3)*.32,-1.20,Math.sin(i*Math.PI/3)*.32]}><circleGeometry args={[.035,12]}/><meshBasicMaterial color="#26372f"/></mesh>)}
 </group>}

export function golfDimpleTexture(color=false){
 const canvas=document.createElement('canvas');
 canvas.width=512;
 canvas.height=256;
 const context=canvas.getContext('2d');
 const surface=color?'#ffffff':'#ddd';
 context.fillStyle=surface;
 context.fillRect(0,0,512,256);
 for(let row=0;row<12;row++){
   const y=(row+.5)*256/12;
   const count=Math.max(4,Math.round(23*Math.sin(y/256*Math.PI)));
   for(let column=0;column<count;column++){
     const x=(column+.5+(row%2)*.23)*512/count;
     const width=512/count*.35;
     context.save();
     context.translate(x,y);
     context.scale(width,7.5);
     const gradient=context.createRadialGradient(0,0,0,0,0,1);
     gradient.addColorStop(0,color?'#c2c6c3':'#555');
     gradient.addColorStop(.55,color?'#e5e8e5':'#999');
     gradient.addColorStop(1,surface);
     context.fillStyle=gradient;
     context.fillRect(-1,-1,2,2);
     context.restore();
   }
 }
 const texture=new THREE.CanvasTexture(canvas);
 if(color)texture.colorSpace=THREE.SRGBColorSpace;
 return texture;
}
