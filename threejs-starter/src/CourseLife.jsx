import React,{useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {getCourse,height,lie,pondOutline,riverCenter,riverWidth} from './course';
import {courseWoodland} from './course-woodland';
import {creekCenter,creekWidth,duneGrassDrifts,duneDriftCenter} from './new-holes';
import {scenicWindAt} from './wind';

const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const bladesPerClump=7;
export function CourseGrass({game}){
 const mesh=useRef(),calmMotion=useMemo(reducedMotion,[]),blade=useMemo(()=>new THREE.Object3D(),[]);
 const hole=game.hole,course=getCourse(hole);
 const clumps=useMemo(()=>{
   const points=[];
   const plant=(x,z,scale=1)=>{if((hole!==13||z<145)&&lie(x,z,hole)==='Rough')points.push({x,z,scale})};
   if(hole===1){
     for(let i=0;i<54;i++){
       const nz=-29+i*1.25,side=i%2?1:-1;
       const x=(riverCenter(nz)+side*(riverWidth(nz)+.65+(i%5)*.14))*course.sx;
       plant(x,nz*course.sz);
     }
   }else{
     const trees=courseWoodland(hole);
     const stride=Math.max(1,Math.ceil(trees.length/42));
     for(let i=0;i<trees.length;i+=stride){
       const {x,z}=trees[i],a=i*2.399;
       plant(x+Math.cos(a)*4,z+Math.sin(a)*4);
     }
     for(const lake of course.lakes??(course.lake?[course.lake]:[])){
       for(const [x,z] of pondOutline(lake,12)){
         const dx=x-lake.x,dz=z-lake.z,d=Math.hypot(dx,dz);
         plant(x+dx/d*2,z+dz/d*2);
       }
     }
     const width=creekWidth(hole);
     if(width){
       for(let i=0;i<12;i++){
         const x=(i/11-.5)*course.bounds.rx*1.6,z=creekCenter(x,hole);
         plant(x,z+(width+1.2)*(i%2?1:-1));
       }
     }
   }
   if(hole===13){
     let seed=13133;
     const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
     for(const d of duneGrassDrifts)for(let i=0;i<Math.ceil(d.count*1.55);i++){
       const angle=random()*Math.PI*2, radius=Math.sqrt(random());
       const t=Math.sin(angle)*radius;
       const x=duneDriftCenter(d,t)+Math.cos(angle)*radius*d.rx;
       const z=d.z+t*d.rz;
       plant(x,z,(.56+.52*random())*(1-.24*radius));
     }
   }
   if(hole===11){
     for(let i=0;i<45;i++){
       const x=course.pin.x+(i%15-7)*3.3+Math.sin(i*3)*1.5;
       const z=course.pin.z-14-Math.floor(i/15)*3+Math.cos(i*2)*1.5;
       plant(x,z);
     }
   }
   for(const [anchor,radius] of [[course.tee,13],[course.pin,Math.max(course.green.rx,course.green.rz)+4]]){
     for(let i=0;i<16;i++){
       const a=i*Math.PI/8,r=radius+(i%3)*2;
       plant(anchor.x+Math.cos(a)*r,anchor.z+Math.sin(a)*r);
     }
   }
   return points;
 },[course,hole]);
 const geometry=useMemo(()=>{
   const g=new THREE.BufferGeometry();
   if(hole===13){
     const positions=[],colors=[];
     const shades=['#435923','#647738','#89974b','#aab269','#d0bd7d'];
     for(let i=0;i<5;i++){
       const t=i/4,width=.093*(1-t)**.82,back=.72*t*t;
       positions.push(-width,t*.93,back,width,t*.93,back);
       const color=new THREE.Color(shades[i]);
       colors.push(...color.toArray(),...color.toArray());
     }
     g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
     g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
     g.setIndex(Array.from({length:4},(_,i)=>[2*i,2*i+1,2*i+2,2*i+1,2*i+3,2*i+2]).flat());
     g.computeVertexNormals();
     return g;
   }
   g.setAttribute('position',new THREE.Float32BufferAttribute([-.07,0,0,.07,0,0,-.055,.52,.07,.055,.52,.07,0,1,.22],3));
   g.setIndex([0,1,2,1,3,2,2,3,4]);g.computeVertexNormals();return g;
 },[hole]);
 const transforms=useMemo(()=>clumps.flatMap(({x,z,scale},i)=>Array.from({length:bladesPerClump},(_,j)=>{
   const a=j*2.399+i*.7, r=(hole===13?.68:.42)*j/bladesPerClump, px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   return {x:px,z:pz,y:height(px,pz,hole)-.08,angle:hole===13?.8+Math.sin(a)*.75:a,size:(.55+.75*((i*13+j*19)%23)/23)*scale*(hole===13?2.45:hole===11&&pz<course.pin.z-11?2.2:1)};
 })),[clumps,hole,course]);
 function draw(wind,time){
   const direction=Math.atan2(wind.x??0,-(wind.z??-1));
   const bend=hole===13?.035+Math.min(.43,wind.mph*.023):.017+Math.min(.28,wind.mph*.009);
   for(let i=0;i<transforms.length;i++){
     const p=transforms[i];
     const phase=hole===13?time*2.1-.19*(p.x*Math.sin(direction)-p.z*Math.cos(direction)):time*2.5-p.z*.11+i*.045;
     const wave=.67+.33*Math.sin(phase);
     blade.position.set(p.x,p.y,p.z);
     blade.rotation.set(Math.cos(direction)*-bend*wave,p.angle,-Math.sin(direction)*bend*wave,'YXZ');
     blade.scale.setScalar(p.size);blade.updateMatrix();mesh.current.setMatrixAt(i,blade.matrix);
   }
   mesh.current.instanceMatrix.needsUpdate=true;
 }
 useEffect(()=>{draw({mph:0},0)},[transforms]);
 useFrame(()=>{if(!calmMotion)draw(scenicWindAt(game.wind,game.time),game.time)});
 return <instancedMesh ref={mesh} args={[geometry,null,transforms.length]} frustumCulled={false}>
   <meshStandardMaterial vertexColors={hole===13} emissive={hole===13?"#66743a":"#000000"} emissiveIntensity={.27} color={hole===13?"#ffffff":"#718a49"} side={THREE.DoubleSide} roughness={1}/>
 </instancedMesh>;
}

const dustColors={'land-sand':'#d9bc86','land-rough':'#819858','land-fairway':'#9fb66d','land-green':'#a9c77a'};
export function CourseLanding({game}){
 const group=useRef(),latest=useRef(0),burst=useRef(null),reduced=useMemo(reducedMotion,[]);
 const refs=useRef([]);
 useFrame(()=>{
   if(reduced)return;
   for(const event of game.soundEvents??[]){
     if(event.id<=latest.current)continue;
     if(event.position&&dustColors[event.type])burst.current={...event,time:game.time};
   }
   latest.current=game.soundSeq;
   const event=burst.current,age=game.time-(event?.time??0);
   group.current.visible=!!event&&age<.45;
   if(!group.current.visible)return;
   group.current.position.set(event.position.x,event.position.y,event.position.z);
   for(let i=0;i<refs.current.length;i++){
     const particle=refs.current[i],a=i*2.399,speed=.6+i*.16;
     particle.position.set(Math.cos(a)*age*speed,.12+age*2.1-4*age*age,Math.sin(a)*age*speed);
     particle.scale.setScalar(.085*(1-age/.45)*(1+event.strength));
     particle.material.color.set(dustColors[event.type]);
     particle.material.opacity=1-age/.45;
   }
 });
 return <group ref={group} visible={false}>{Array.from({length:9},(_,i)=><mesh key={i} ref={p=>{refs.current[i]=p}}>
   <icosahedronGeometry args={[1,0]}/><meshBasicMaterial transparent depthWrite={false}/>
 </mesh>)}</group>;
}

export function WaterEntryEffect({game}){
 const group=useRef(),rings=useRef([]),drops=useRef([]),reduced=useMemo(reducedMotion,[]);
 useFrame(()=>{
   const event=game.waterEntry;
   group.current.visible=!!event;
   if(!event)return;
   const age=game.time-event.started,scale=game.mini?.82:2.1;
   group.current.position.set(event.x,event.y+.07,event.z);
   group.current.scale.setScalar(scale);
   for(let i=0;i<rings.current.length;i++){
     const ring=rings.current[i],t=(age-i*.16)/.91;
     ring.visible=reduced?i===0:t>=0&&t<1;
     ring.scale.setScalar(reduced?.65:.13+Math.max(0,t)*(event.kind==='splash'?1.6:1.1));
     ring.material.opacity=reduced?.65:Math.max(0,1-t)*.87;
   }
   for(let i=0;i<drops.current.length;i++){
     const drop=drops.current[i],angle=i*2.399,speed=.6+(i%4)*.25;
     drop.visible=!reduced&&event.kind==='splash'&&age<.52;
     drop.position.set(Math.cos(angle)*age*speed,Math.max(0,age*(3.1+(i%3)*.5)-7.8*age*age),Math.sin(angle)*age*speed);
     drop.scale.setScalar(.044+(i%3)*.011);
     drop.material.opacity=Math.max(0,1-age/.55);
   }
 });
 return <group ref={group} visible={false}>
   {[0,1,2].map(i=><mesh key={i} ref={node=>{rings.current[i]=node}} rotation={[-Math.PI/2,0,0]} position={[0,i*.003,0]}>
     <ringGeometry args={[.92,1,56]}/><meshBasicMaterial color="#e5ffff" transparent depthWrite={false}/>
   </mesh>)}
   {Array.from({length:12},(_,i)=><mesh key={i} ref={node=>{drops.current[i]=node}}>
     <icosahedronGeometry args={[1,0]}/><meshBasicMaterial color="#ddffff" transparent depthWrite={false}/>
   </mesh>)}
 </group>;
}
