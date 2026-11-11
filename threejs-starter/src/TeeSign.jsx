import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {getCourse,height} from './course';
function plaqueTexture(hole){const c=getCourse(hole),canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;const g=canvas.getContext('2d');
 g.fillStyle='#183f35';g.fillRect(0,0,1536,1024);g.fillStyle='#dec895';g.beginPath();g.roundRect(35,35,1466,954,52);g.fill();g.fillStyle='#f6f0dc';g.beginPath();g.roundRect(48,48,1440,928,44);g.fill();g.strokeStyle='#b5bc92';g.lineWidth=3;g.beginPath();g.roundRect(74,74,1388,876,32);g.stroke();
 // Hand-drawn island crest: layered land, water, flag and two cypresses.
 g.fillStyle='#b8d3bc';g.beginPath();g.ellipse(768,276,196,34,0,0,Math.PI*2);g.fill();g.fillStyle='#305e44';g.beginPath();g.ellipse(768,246,173,51,0,0,Math.PI*2);g.fill();g.fillStyle='#8aaa66';g.beginPath();g.ellipse(768,227,173,43,0,0,Math.PI*2);g.fill();g.fillStyle='#d3df99';g.beginPath();g.ellipse(784,221,95,28,0,0,Math.PI*2);g.fill();g.strokeStyle='#f6f0dc';g.lineWidth=7;g.beginPath();g.moveTo(778,218);g.lineTo(778,122);g.stroke();g.fillStyle='#c66346';g.beginPath();g.moveTo(782,124);g.lineTo(850,142);g.lineTo(782,161);g.fill();for(const [x,y] of [[655,190],[903,202]]){g.fillStyle='#345b42';g.beginPath();g.moveTo(x,y-92);g.lineTo(x-24,y);g.lineTo(x+24,y);g.fill();g.fillStyle='#816c45';g.fillRect(x-4,y,8,28)}
 g.textAlign='center';g.fillStyle='#57715b';g.font='600 32px sans-serif';g.fillText('FAIRWAY  &  FOLLY',768,355);g.fillStyle='#183f35';g.font='bold 92px Georgia,serif';g.fillText('The Verdant Isles',768,470);g.strokeStyle='#c4b57e';g.lineWidth=3;g.beginPath();g.moveTo(240,523);g.lineTo(1296,523);g.stroke();
 g.fillStyle='#234e3d';g.beginPath();g.arc(350,701,123,0,Math.PI*2);g.fill();g.strokeStyle='#d9c588';g.lineWidth=4;g.stroke();g.fillStyle='#e7d6a1';g.font='28px sans-serif';g.fillText('HOLE',350,659);g.fillStyle='#fff7e2';g.font='100px Georgia,serif';g.fillText(String(hole).padStart(2,'0'),350,757);
 g.textAlign='left';g.fillStyle='#234e3d';g.font='58px Georgia,serif';g.fillText(hole===1?'Opening Par Four':c.title,535,680);g.fillStyle='#66765c';g.font='34px sans-serif';g.fillText(`PAR ${c.par}   ·   ${c.yards} YARDS`,535,749);g.textAlign='center';g.fillStyle='#8e895e';g.font='italic 30px Georgia,serif';g.fillText('A little golf. A little mischief.',768,880);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
export function TeeSign({hole}){
 const texture=useMemo(()=>plaqueTexture(hole),[hole]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 const {tee}=getCourse(hole),x=-4.4,z=.5,rotation=.2;
 const teeY=height(tee.x,tee.z,hole);
 const groundAt=post=>height(tee.x+x+post*Math.cos(rotation),tee.z+z-post*Math.sin(rotation),hole);
 const postSites=[-.95,.95];
 const plaqueY=Math.max(...postSites.map(groundAt))+1.2;
 return <group position={[x,plaqueY-teeY,z]} rotation={[0,rotation,0]}>
 {postSites.map(post=>{
   const bottom=groundAt(post)-plaqueY-.16,top=-.16;
   return <mesh key={post} position={[post,(top+bottom)/2,0]} castShadow>
     <boxGeometry args={[.1,top-bottom,.14]}/><meshStandardMaterial color="#7d6341" roughness={.9}/>
   </mesh>;
 })}
 <mesh castShadow><boxGeometry args={[2.8,1.87,.18]}/><meshStandardMaterial color="#214b3b" roughness={.8}/></mesh>
 {[1,-1].map(sign=><mesh key={sign} position={[0,0,sign*.096]} rotation={[0,sign<0?Math.PI:0,0]}><planeGeometry args={[2.76,1.84]}/><meshStandardMaterial map={texture} roughness={.8} emissive="#fff8e4" emissiveIntensity={.025}/></mesh>)}
 </group>}
