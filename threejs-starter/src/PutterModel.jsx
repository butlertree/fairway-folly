import React,{useMemo} from 'react';
import * as THREE from 'three';
function Shaft({from,to,radius=.024,color='#b8c3c3',rubber=false}){const pose=useMemo(()=>{const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),d=b.clone().sub(a);return {mid:a.add(b).multiplyScalar(.5),length:d.length(),q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())}},[from.join(','),to.join(',')]);return <mesh position={pose.mid} quaternion={pose.q} castShadow><cylinderGeometry args={[radius*1.06,radius,pose.length,16]}/><meshStandardMaterial color={color} metalness={rubber?.05:.85} roughness={rubber?.85:.24}/></mesh>}
function bladeGeometry(){
 // The face, top rail, recessed shelf and curved sole share one rounded cross-section.
 const profile=new THREE.SplineCurve([
   [-.16,-.083],[-.184,-.045],[-.183,.078],[-.16,.128],[-.115,.139],
   [-.066,.118],[-.035,.056],[.023,.002],[.113,-.025],[.203,-.027],
   [.264,-.041],[.256,-.078],[.18,-.103],[.045,-.113],[-.12,-.102],[-.16,-.083]
 ].map(([z,y])=>new THREE.Vector2(z,y)));
 const positions=[],indices=[],slices=48,segments=72;
 for(let i=0;i<=slices;i++){
   const angle=Math.PI*i/slices,x=-.68*Math.cos(angle);
   const end=Math.min(1,Math.sin(angle)*2.4);
   const rear=1-.37*(Math.abs(x)/.68)**2;
   for(let j=0;j<segments;j++){
     const {x:z,y}=profile.getPoint(j/segments);
     positions.push(x,y*end,(z+.07)*(z>0?rear:1)*end-.07);
     if(i<slices){
       const a=i*segments+j,b=i*segments+(j+1)%segments;
       indices.push(a,b,a+segments,b,b+segments,a+segments);
     }
   }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setIndex(indices);
 geometry.computeVertexNormals();
 return geometry;
}

export function PutterModel(){
 const head=useMemo(bladeGeometry,[]);
 const neck=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
   new THREE.Vector3(-.49,.082,-.10),new THREE.Vector3(-.54,.145,-.093),
   new THREE.Vector3(-.58,.26,-.062),new THREE.Vector3(-.61,.43,-.025),
   new THREE.Vector3(-.65,.59,0)
 ]),28,.047,16,false),[]);
 return <group>
   <mesh geometry={head} castShadow receiveShadow>
     <meshStandardMaterial color="#d2dbe0" metalness={.32} roughness={.26}/>
   </mesh>
   <mesh geometry={neck} castShadow>
     <meshStandardMaterial color="#cbd5dc" metalness={.36} roughness={.23}/>
   </mesh>
   <mesh position={[0,.143,-.116]} rotation={[-Math.PI/2,0,0]}>
     <planeGeometry args={[.021,.049]}/>
     <meshBasicMaterial color="#1c507e"/>
   </mesh>
   <Shaft from={[-.65,.575,-.003]} to={[-1.03,2.14,.075]} radius={.035} color="#dde4e7"/>
   <Shaft from={[-1.03,2.12,.074]} to={[-1.17,2.73,.103]} radius={.061} color="#25302e" rubber/>
 </group>;
}
