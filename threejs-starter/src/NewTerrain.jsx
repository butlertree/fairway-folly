import {turfPalette,blendGreenTurf} from './turf-palette.js';
import {CreekbankRiver} from './CreekbankScenery';
import {ValleyForest} from './ValleyForest';
import {BunkerGroundMaterial} from './CourseBunkers';
import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {newHoles,heightNew,lieNew,newGreenFraction,fairwayFraction,waterFraction,creekCenter,creekWidth,newOutlet,wasteFraction,timberWasteRocks,timberGrass,cedarWasteRocks,cedarGrass,crownridgeWasteRocks,crownridgeGrass,wasteGrassFraction,duneGrassFraction,alderShoreZ,alderWallHeight} from './new-holes';
import {edgeShape} from './landscape';
import {WaterPond,WaterMaterial} from './Water';
import {CourseWaterfall} from './CourseWaterfall';
export function Lighthouse({scale=1}){const beam=useRef();useFrame((_,dt)=>{if(beam.current)beam.current.rotation.y+=dt*.25});return <group scale={scale}><mesh position={[0,3,0]} castShadow><cylinderGeometry args={[.9,1.4,6,32]}/><meshStandardMaterial color="#f0e5c7"/></mesh>{[1.5,4].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[1.13,1.25,.65,32]}/><meshStandardMaterial color="#b86f52"/></mesh>)}<mesh position={[0,6.3,0]}><cylinderGeometry args={[1.35,1.35,.35,32]}/><meshStandardMaterial color="#365c56"/></mesh><mesh position={[0,7,0]}><cylinderGeometry args={[.85,.85,1.2,16]}/><meshStandardMaterial color="#e7d9a0" emissive="#f5cf72" emissiveIntensity={.45}/></mesh><mesh position={[0,7.8,0]}><coneGeometry args={[1.3,.8,16]}/><meshStandardMaterial color="#426e68"/></mesh><group ref={beam} position={[0,7,0]}><mesh position={[2,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.55,4,24,1,true]}/><meshBasicMaterial color="#ffedb1" transparent opacity={.1} depthWrite={false}/></mesh></group></group>}
// Seat the landmark below the lowest ground around its wider footprint.
function CoastalLighthouse(){const x=66,z=-94,scale=3;const ground=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return heightNew(x+Math.cos(a)*1.4*scale,z+Math.sin(a)*1.4*scale,4)});const base=Math.min(...ground)-.65;return <group position={[x,base,z]}><Lighthouse scale={scale}/></group>}
export function BlossomTree({x,z,y,scale=1,color='#e7b5b5'}){return <group position={[x,y,z]} scale={scale}><mesh position={[0,2.8,0]} castShadow><cylinderGeometry args={[.18,.4,5.6,8]}/><meshStandardMaterial color="#806042"/></mesh>{[[-1.2,5.5,0],[1,6,.3],[0,6.8,-.3]].map((p,i)=><mesh key={i} position={p} scale={[1.3,.7,1]} castShadow><icosahedronGeometry args={[1.8,2]}/><meshStandardMaterial color={color} roughness={1}/></mesh>)}</group>}
function Waterways({c}){const outlet=useMemo(()=>newOutlet(c.id),[c.id]);const geometry=useMemo(()=>{const p=[],idx=[];if(!outlet)return new THREE.BufferGeometry();let start=48;const end=outlet.x;if(c.id!==4){start=0;while(true){const z=creekCenter(start,c.id),a=Math.atan2(z/c.landRadius.rz,start/c.landRadius.rx);if(Math.hypot(start/c.landRadius.rx,z/c.landRadius.rz)>=edgeShape(a))break;start-=.1;}}for(let i=0;i<=160;i++){const x=start+(end-start)*i/160,z=c.id===4?-29:creekCenter(x,c.id),w=c.id===4?2.5:creekWidth(c.id);for(const s of [-1,1])p.push(x,c.waterLevel+.04,z+s*w);if(i<160){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g},[c,outlet]);return <>{c.lakes.map((p,i)=><WaterPond key={i} pond={p} terrain level={c.waterLevel} flow={.25}/>)}{outlet&&<><mesh geometry={geometry}><WaterMaterial flow excludePonds={c.lakes} pond={{x:0,z:outlet.z,rx:c.landRadius.rx,rz:7}}/></mesh><CourseWaterfall outlet={outlet} level={c.waterLevel+.04} rotation={Math.PI/2}/></>}</>}
export function NewTerrain({hole,game}){const c=newHoles[hole];const geometry=useMemo(()=>{const p=[],colors=[],idx=[],rings=hole===14?232:180,segments=hole===14?448:320;for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=j/rings,e=edgeShape(a),x=(c.landRadius.cx??0)+c.landRadius.rx*r*e*Math.cos(a),z=c.landRadius.rz*r*e*Math.sin(a),y=heightNew(x,z,hole),surface=lieNew(x,z,hole),gr=newGreenFraction(x,z,c);p.push(x,y,z);const color=new THREE.Color(y>86?turfPalette.upland:turfPalette.rough);color.lerp(new THREE.Color(turfPalette.fairway),1-THREE.MathUtils.smoothstep(fairwayFraction(x,z,c),.9,1.15));if(c.waste)color.lerp(new THREE.Color('#d8c28c'),1-THREE.MathUtils.smoothstep(wasteFraction(x,z,c),.96,1.04));if([12,15,17].includes(hole)&&wasteFraction(x,z,c)<1)color.lerp(new THREE.Color('#869359'),1-THREE.MathUtils.smoothstep(wasteGrassFraction(x,z,hole),.59,1.08));if(hole===13&&surface==='Rough'&&z<145&&z> -174){
 const patch=duneGrassFraction(x,z)+.08*Math.sin(x*.52+z*.41);
 color.lerp(new THREE.Color('#8f9954'),.65*(1-THREE.MathUtils.smoothstep(patch,.27,1.12)));
}if(surface==='Sand')color.set('#e5d0a1');if(hole===14)color.lerp(new THREE.Color('#b7bb86'),1-THREE.MathUtils.smoothstep(y,c.waterLevel+.15,c.waterLevel+1.65));else if(waterFraction(x,z,c)<1.5&&y<c.waterLevel+1)color.set('#b7bb86');if(!['Waste sand','Water','Sand'].includes(surface))blendGreenTurf(color,gr);if(hole===14&&z>c.pin.z-2&&z< -180&&gr<1.5){
 const crest=THREE.MathUtils.smoothstep(y,c.waterLevel+.65,c.greenHeight-.7);
 const strength=(1-crest)*.64*(1-THREE.MathUtils.smoothstep(gr,.88,1.5));
 color.lerp(new THREE.Color('#749851'),strength);
}color.multiplyScalar(1+.015*Math.sin(x*.035+z*.02)*Math.cos(z*.018));colors.push(color.r,color.g,color.b);if(i<segments&&j<rings){const k=j*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();return g},[hole,c]);return <><mesh geometry={geometry} receiveShadow><BunkerGroundMaterial hole={hole} vertexColors roughness={1} side={THREE.DoubleSide}/></mesh>{hole===10?<CreekbankRiver course={c}/>:<Waterways c={c}/>}{hole===4?<CoastalLighthouse/>:hole>=7?null:Array.from({length:12},(_,i)=>{const z=(i/11-.5)*c.landRadius.rz*1.5,x=(i%2?1:-1)*(hole===5?77:52);if(lieNew(x,z,hole)!=='Rough')return null;return <BlossomTree key={i} x={x} z={z} y={heightNew(x,z,hole)} scale={1.2+(i%3)*.15} color={hole===5?'#d9cf85':i%2?'#e8b1b4':'#eacac1'}/>})}{hole===9&&<ValleyForest game={game}/>}{[12,15,17].includes(hole)&&<ValleyWaste hole={hole}/>}{hole===13&&<DuneTeeSteps tee={c.tee}/>} {hole===14&&<AlderLakeWall course={c}/>}<NewLandmarks hole={hole}/></>}

function AlderLakeWall({course}){
 const boards=useMemo(()=>{
   const result=[];
   for(let left=course.pin.x-26.65,i=0;left<course.pin.x+26.65;i++){
     const span=Math.min(.69+.31*(.5+.5*Math.sin(i*2.399)),course.pin.x+26.65-left);
     const x=left+span/2,z=alderShoreZ(x);
     const slope=(alderShoreZ(x+.25)-alderShoreZ(x-.25))/.5;
     result.push({x,z,rotation:-Math.atan(slope),width:Math.max(.02,span*Math.hypot(1,slope)-.025),
       top:alderWallHeight(x)+.05*Math.sin(i*4.2)});
     left+=span;
   }
   return result;
 },[course]);
 return <group>
   {boards.map(({x,z,rotation,width,top},i)=><group key={i} position={[x,course.waterLevel,z+.13]} rotation={[0,rotation,0]}>
     <mesh position={[0,(top-1.1)/2,0]} castShadow receiveShadow>
       <boxGeometry args={[width,1.1+top,.29]}/><meshStandardMaterial color={['#755735','#896b47','#8f714d','#82613f'][i%4]} roughness={1}/>
     </mesh>
     {i%5===2&&top>.22&&<mesh position={[0,-.26,.18]} castShadow receiveShadow>
       <boxGeometry args={[.23,1.54,.32]}/><meshStandardMaterial color="#6b5034" roughness={1}/>
     </mesh>}
   </group>)}
 </group>;
}
function DuneTeeSteps({tee}){
 return <group>
   {Array.from({length:10},(_,i)=>{
     const z=tee.z+12+i*2.15,x=-5.5-.36*i,y=heightNew(x,z,13);
     return <mesh key={i} position={[x,y-.12,z]} rotation={[0,-.17,0]} receiveShadow castShadow>
       <boxGeometry args={[3.8,.49,1.75]}/><meshStandardMaterial color={i%2?'#bdad85':'#caba91'} roughness={1}/>
     </mesh>;
   })}
 </group>;
}
function ValleyWaste({hole}){
 const grass=hole===17?crownridgeGrass:hole===15?cedarGrass:timberGrass,rocks=hole===17?crownridgeWasteRocks:hole===15?cedarWasteRocks:timberWasteRocks;
 const tufts=useMemo(()=>{
   const points=[];
   for(const patch of grass)for(let i=0;i<(hole===15?65:30);i++){
     const a=i*2.399963,r=Math.sqrt((i+.5)/(hole===15?65:30))*.88;
     const x=patch.x+Math.cos(a)*r*patch.rx,z=patch.z+Math.sin(a)*r*patch.rz,y=heightNew(x,z,hole)-.04;
     if(hole===17&&wasteFraction(x,z,newHoles[hole])>=1)continue;
     const size=(.37+(i%7)*.09)*(hole===15?1.9:1);
     for(let j=0;j<3;j++){
       const direction=a+j*2.3,dx=Math.cos(direction),dz=Math.sin(direction);
       points.push(x-dz*.13,y,z+dx*.13,x+dz*.13,y,z-dx*.13,x+dx*.36,y+size,z+dz*.36);
     }
   }
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
   geometry.computeVertexNormals();
   return geometry;
 },[grass,hole]);
 return <>
   <mesh geometry={tufts} receiveShadow><meshStandardMaterial color="#77844a" side={THREE.DoubleSide} roughness={1}/></mesh>
   {rocks.map(({x,z,rx,ry,rz},i)=><mesh key={x} position={[x,heightNew(x,z,hole)-.2,z]} scale={[rx,ry,rz]} castShadow receiveShadow>
     <icosahedronGeometry args={[1,hole===17?3:1]}/><meshStandardMaterial color={i%2?'#898778':'#9c9581'} roughness={1} flatShading={hole!==17}/>
   </mesh>)}
 </>;
}
function NewLandmarks({hole}){if(hole!==8)return null;const c=newHoles[hole];if(hole===8)return <group position={[-58,heightNew(-58,-57,hole)-.5,-57]}><mesh position={[0,5,0]} castShadow><torusGeometry args={[4.5,1.5,12,32,Math.PI]}/><meshStandardMaterial color="#c9c1a1"/></mesh><mesh position={[0,6.2,0]}><sphereGeometry args={[1.2,24,16]}/><meshStandardMaterial color="#b89a56" metalness={.55} roughness={.4}/></mesh></group>;return <>{Array.from({length:hole===8?18:24},(_,i)=>{const z=(i/(hole===8?17:23)-.5)*c.landRadius.rz*1.55,x=(i%2?1:-1)*(hole===8?96:90)+Math.sin(i*2)*10;if(lieNew(x,z,hole)!=='Rough'||Math.hypot(x/c.landRadius.rx,z/c.landRadius.rz)>.85*edgeShape(Math.atan2(z/c.landRadius.rz,x/c.landRadius.rx)))return null;return hole===8?<group key={i} position={[x,heightNew(x,z,hole)-.3,z]}><mesh position={[0,5,0]}><cylinderGeometry args={[.35,.7,10,8]}/><meshStandardMaterial color="#856345"/></mesh><mesh position={[0,11,0]} scale={[1.7,1,1]} castShadow><sphereGeometry args={[4,16,12]}/><meshStandardMaterial color="#496c46"/></mesh></group>:<BlossomTree key={i} x={x} z={z} y={heightNew(x,z,hole)-.3} scale={1.6} color={i%2?'#d995aa':'#efc1bc'}/>})}</>}
