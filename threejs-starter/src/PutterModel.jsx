import React,{useMemo} from 'react';
import * as THREE from 'three';
function Shaft({from,to,radius=.024,color='#b8c3c3',rubber=false}){const pose=useMemo(()=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);return {mid:a.add(b).multiplyScalar(.5),length:d.length(),q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())}},[from.join(','),to.join(',')]);return <mesh position={pose.mid} quaternion={pose.q} castShadow><cylinderGeometry args={[radius*1.06,radius,pose.length,16]}/><meshStandardMaterial color={color} metalness={rubber?.05:.85} roughness={rubber?.85:.24}/></mesh>}
export function PutterModel(){const head=useMemo(()=>{const s=new THREE.Shape(),w=.66,h=.115,r=.06;s.moveTo(-w+r,-h);s.lineTo(w-r,-h);s.quadraticCurveTo(w,-h,w,-h+r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(-w+r,h);s.quadraticCurveTo(-w,h,-w,h-r);s.lineTo(-w,-h+r);s.quadraticCurveTo(-w,-h,-w+r,-h);return new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelSize:.022,bevelThickness:.018,bevelSegments:3,steps:1})},[]),hosel=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.47,.1,.005),new THREE.Vector3(-.47,.27,.005),new THREE.Vector3(-.55,.38,.045)]),12,.042,10,false),[]);return <group>
 <mesh geometry={head} position={[0,0,-.16]} castShadow><meshStandardMaterial color="#aebcba" metalness={.72} roughness={.29}/></mesh>
 <mesh position={[0,0,-.182]}><boxGeometry args={[1.06,.145,.012]}/><meshStandardMaterial color="#334740" metalness={.4} roughness={.48}/></mesh>
 {[-.045,0,.045].map(y=><mesh key={y} position={[0,y,-.19]}><boxGeometry args={[.97,.004,.003]}/><meshStandardMaterial color="#8eaaa0"/></mesh>)}
 <mesh position={[0,.145,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.025,.15]}/><meshBasicMaterial color="#f6f1da"/></mesh>
 <mesh position={[0,-.09,.13]}><boxGeometry args={[.92,.045,.25]}/><meshStandardMaterial color="#84968d" metalness={.65} roughness={.32}/></mesh>
 <mesh position={[0,-.064,.13]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.025,.24]}/><meshBasicMaterial color="#f6f1da"/></mesh>
 {[-.53,.53].map(x=><mesh key={x} position={[x,0,.09]} rotation={[Math.PI/2,0,0]} castShadow><capsuleGeometry args={[.12,.17,5,16]}/><meshStandardMaterial color="#435a50" metalness={.6} roughness={.34}/></mesh>)}
 <mesh geometry={hosel} castShadow><meshStandardMaterial color="#c7cfcc" metalness={.85} roughness={.2}/></mesh>
 <Shaft from={[-.55,.38,.045]} to={[-.95,2.12,.12]}/>
 <Shaft from={[-.95,2.10,.12]} to={[-1.09,2.72,.147]} radius={.065} color="#253f35" rubber/>
 <Shaft from={[-1.085,2.70,.146]} to={[-1.095,2.75,.148]} radius={.072} color="#d6bd7a" rubber/>
 </group>}
