import {miniHeight} from './mini-surfaces';
import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {height} from './course';
import {creekbankCenter,creekbankWidth,timberCrossingZ,culverts} from './creekbank';
import {offsetOutline} from './mini-boundary';
import {edgeShape} from './landscape';
import {RiverMaterial} from './Water';
import {CourseWaterfall} from './CourseWaterfall';

const noStones=Array.from({length:6},()=>({u:-100,nz:-1000}));

function riverRibbon(start,end,section){
 const positions=[],uv=[],indices=[];
 for(let i=0;i<=240;i++){
   const t=i/240,z=start+(end-start)*t;
   for(const side of [-1,1]){
     positions.push(...section(z,side,t));
     uv.push((side+1)/2,z);
   }
   if(i<240){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
 }
 const mesh=new THREE.BufferGeometry();
 mesh.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 mesh.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 mesh.setIndex(indices);
 return mesh;
}

function channelEdge(course,direction,side=0){
 const {rx,rz}=course.landRadius;
 let inside=0,outside=rz*1.2;
 for(let i=0;i<25;i++){
   const d=(inside+outside)/2,z=d*direction,x=creekbankCenter(z)+side*creekbankWidth(z);
   const nx=x/rx,nz=z/rz;
   if(Math.hypot(nx,nz)<edgeShape(Math.atan2(nz,nx)))inside=d;
   else outside=d;
 }
 return inside*direction;
}

export function CreekbankRiver({course}){
 const {geometry,outlet}=useMemo(()=>{
   const edges=[-1,1].map(side=>[channelEdge(course,-1,side),channelEdge(course,1,side)]);
   const start=channelEdge(course,-1),end=channelEdge(course,1);
   const geometry=riverRibbon(start,end,(_,side,t)=>{
     const [a,b]=edges[(side+1)/2],z=a+(b-a)*t;
     return [creekbankCenter(z)+side*creekbankWidth(z),course.waterLevel+.045,z];
   });
   return {geometry,outlet:{x:creekbankCenter(end),z:end,width:creekbankWidth(end)*2}};
 },[course]);
 return <>
   <mesh geometry={geometry}><RiverMaterial stones={noStones} metresPerUnit={1}/></mesh>
   <CourseWaterfall outlet={outlet} level={course.waterLevel+.045}
     rotation={Math.atan2(outlet.x/course.landRadius.rx**2,outlet.z/course.landRadius.rz**2)}/>
   <TimberBridge/>
 </>;
}

function TimberBridge(){
 const z=timberCrossingZ,x=creekbankCenter(z),slope=(creekbankCenter(z+.2)-creekbankCenter(z-.2))/.4;
 const angle=Math.atan2(1,-slope);
 const half=11,width=3.8;
 const ground=d=>height(x+Math.sin(angle)*d,z+Math.cos(angle)*d,10);
 const a=ground(-half)+.05,b=ground(half)+.05;
 const deck=d=>a+(b-a)*(d+half)/(half*2)+2.3*(1-(d/half)**2);
 return <group position={[x,0,z]} rotation={[0,angle,0]}>
   {Array.from({length:34},(_,i)=>{
     const d=-half+(i+.5)*2*half/34,tilt=-Math.atan((deck(d+.1)-deck(d-.1))/.2);
     return <mesh key={i} position={[0,deck(d),d]} rotation={[tilt,0,0]} castShadow receiveShadow>
       <boxGeometry args={[width,.22,.59]}/><meshStandardMaterial color={['#a47a4d','#b68b58','#9d754b','#bc9665'][i%4]} roughness={.9}/>
     </mesh>;
   })}
   {[-1,1].map(side=><group key={side} position={[side*(width/2-.17),0,0]}>
     {[-9,-6,-3,0,3,6,9].map((d,i)=><React.Fragment key={d}>
       <mesh position={[0,deck(d)+.53,d]} castShadow><boxGeometry args={[.19,1.22,.2]}/><meshStandardMaterial color="#755337"/></mesh>
       {i<6&&<mesh position={[0,(deck(d)+deck(d+3))/2+1,d+1.5]} rotation={[-Math.atan((deck(d+3)-deck(d))/3),0,0]} castShadow>
         <boxGeometry args={[.15,.18,3.16]}/><meshStandardMaterial color="#805a38"/>
       </mesh>}
     </React.Fragment>)}
   </group>)}
   {[-8.5,8.5].map(d=><mesh key={d} position={[0,(deck(d)+61)/2-.15,d]} castShadow>
     <boxGeometry args={[3.2,Math.max(.4,deck(d)-61),1.3]}/><meshStandardMaterial color="#8e9078" roughness={1}/>
   </mesh>)}
 </group>;
}

const terraceCreekX=z=>10.95+.58*Math.sin(z*.27)+.23*Math.cos(z*.48);

// Dress the existing collision boundary with low, rounded river stones.
const creeksideOutline=offsetOutline(10,.32);
const creeksideStones=[];
let nextStone=0;
for(let i=0;i<creeksideOutline.length;i++){
 const a=creeksideOutline[i],b=creeksideOutline[(i+1)%creeksideOutline.length];
 const length=Math.hypot(b.x-a.x,b.z-a.z);
 if(length<.0001)continue;
 for(;nextStone<length;nextStone+=.88){
   const t=nextStone/length,x=a.x+(b.x-a.x)*t;
   if(x>5.5)creeksideStones.push({x,z:a.z+(b.z-a.z)*t});
 }
 nextStone-=length;
}

function StoneCulvert({game,gate}){
 const roof=useRef();
 const {x,z,dx,dz,feet}=gate,base=miniHeight(10,x,z),spring=.72;
 useFrame(()=>{
   const ball=game.ball;
   const bx=ball.x-x,bz=ball.z-z;
   if(roof.current)roof.current.visible=Math.abs(bx*dx+bz*dz)>.9||Math.abs(bx*dz-bz*dx)>1;
 });
 const stones=useMemo(()=>Array.from({length:9},(_,i)=>{
   const shape=new THREE.Shape(),a=i*Math.PI/9+.012,b=(i+1)*Math.PI/9-.012;
   const point=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
   shape.moveTo(...point(1.23,a));
   for(const r of [1.23,1.94])for(const t of r<1.5?[b]:[b,a])shape.lineTo(...point(r,t));
   shape.closePath();
   return shape;
 }),[]);
 return <>
   {feet.map(({x,z,r},i)=><group key={i} position={[x,miniHeight(10,x,z),z]}>
     {[0,1,2].map(row=><mesh key={row} position={[0,.15+row*.28,0]} scale={[r*(1-row*.07),.25,r*(1-row*.06)]}
       rotation={[0,row*.65,0]} castShadow receiveShadow>
       <icosahedronGeometry args={[1,2]}/><meshStandardMaterial color={['#909880','#a5a58b','#7f8a73'][(row+i)%3]} roughness={1}/>
     </mesh>)}
   </group>)}
   <group position={[x,base,z]} rotation={[0,Math.atan2(dx,dz),0]}><group ref={roof} position={[0,spring,-.63]}>
     {stones.map((shape,i)=><mesh key={i} castShadow receiveShadow>
       <extrudeGeometry args={[shape,{depth:1.26,bevelEnabled:true,bevelSize:.042,bevelThickness:.046,bevelSegments:2,steps:1}]}/>
       <meshStandardMaterial color={['#a4a58d','#b0ad93','#858f7a','#939c80'][i%4]} roughness={1}/>
     </mesh>)}
   </group>
   {[[-.24,1.74],[.29,1.44],[-.34,-1.75]].map(([along,across],i)=><mesh key={i} position={[across,1.62-Math.abs(across)*.19,along]}
     scale={[.33,.1,.27]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#819054" roughness={1}/></mesh>)}
   </group>
 </>;
}

export function TerraceCreek({game}){
 const start=-13.8,end=15.9;
 const {geometry,gravel}=useMemo(()=>{
   const width=(z,t)=>(.58+.13*Math.cos(z*.39)+.07*Math.sin(z*1.7))*Math.min(1,.16+t*9);
   const geometry=riverRibbon(start,end,(z,side,t)=>[terraceCreekX(z)+side*width(z,t),-.32,z]);
   const gravel=riverRibbon(start,end,(z,side,t)=>[terraceCreekX(z)+side*(width(z,t)+.18+.08*Math.sin(z*1.2)), -.36,z]);
   gravel.computeVertexNormals();
   return {geometry,gravel};
 },[]);
 return <>
   {culverts.map(gate=><StoneCulvert key={`${gate.x}:${gate.z}`} game={game} gate={gate}/>)}
   <mesh geometry={gravel} receiveShadow><meshStandardMaterial color="#a8a88a" roughness={1} side={THREE.DoubleSide}/></mesh>
   <mesh geometry={geometry}><RiverMaterial stones={noStones} metresPerUnit={1}/></mesh>
   {creeksideStones.map(({x,z},i)=><mesh key={i} position={[x,.57,z]} rotation={[0,i*.7,0]}
     scale={[.23+(i%3)*.025,.22+(i%4)*.025,.5]} castShadow receiveShadow>
     <icosahedronGeometry args={[1,2]}/><meshStandardMaterial color={['#939d80','#a7aa8a','#859476'][i%3]} roughness={1}/>
   </mesh>)}
   {[-14.1,-13.7,-11,-8,-3,1,6,10,14].map((z,i)=><mesh key={z}
     position={[terraceCreekX(z)+(i===0?0:i%2?.88:.74),-.35,z]} scale={[.35+(i%3)*.12,.29,.5]} castShadow>
     <icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%2?'#8c9c7e':'#acb198'} roughness={1}/>
   </mesh>)}
   {[-10,-5,0,5,10].map((z,i)=><group key={z} position={[terraceCreekX(z)+1,-.61,z]}>
     {[-1,0,1].map(blade=><mesh key={blade} position={[blade*.09,.23,0]} rotation={[0,i,blade*.28]}>
       <coneGeometry args={[.055,.46+Math.abs(blade)*.09,5]}/><meshStandardMaterial color={i%2?'#829b51':'#a9aa59'}/>
     </mesh>)}
   </group>)}
   <CourseWaterfall outlet={{x:terraceCreekX(end),z:end,width:1.45}} level={-.32} rotation={.02} bottom={-4.15}/>
 </>;
}
