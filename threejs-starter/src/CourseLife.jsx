import React,{useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {getCourse,height,lie,pondOutline,riverCenter,riverWidth} from './course';
import {courseWoodland} from './course-woodland';
import {creekCenter,creekWidth} from './new-holes';
import {windAt} from './wind';

const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const bladesPerClump=7;
export function CourseGrass({game}){
 const mesh=useRef(),calmMotion=useMemo(reducedMotion,[]),blade=useMemo(()=>new THREE.Object3D(),[]);
 const hole=game.hole,course=getCourse(hole);
 const clumps=useMemo(()=>{
   const points=[];
   const plant=(x,z)=>{if(lie(x,z,hole)==='Rough')points.push({x,z})};
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
   g.setAttribute('position',new THREE.Float32BufferAttribute([-.07,0,0,.07,0,0,-.055,.52,.07,.055,.52,.07,0,1,.22],3));
   g.setIndex([0,1,2,1,3,2,2,3,4]);g.computeVertexNormals();return g;
 },[]);
 const transforms=useMemo(()=>clumps.flatMap(({x,z},i)=>Array.from({length:bladesPerClump},(_,j)=>{
   const a=j*2.399+i*.7, r=.42*j/bladesPerClump, px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   return {x:px,z:pz,y:height(px,pz,hole)-.08,angle:a,size:.55+.75*((i*13+j*19)%23)/23};
 })),[clumps,hole]);
 function draw(wind,time){
   for(let i=0;i<transforms.length;i++){
     const p=transforms[i],bend=.017+Math.min(.28,wind.mph*.009);
     const wave=.67+.33*Math.sin(time*2.5-p.z*.11+i*.045);
     blade.position.set(p.x,p.y,p.z);
     blade.rotation.set(Math.cos(game.wind?.angle??.9)*-bend*wave,p.angle,-Math.sin(game.wind?.angle??.9)*bend*wave,'YXZ');
     blade.scale.setScalar(p.size);blade.updateMatrix();mesh.current.setMatrixAt(i,blade.matrix);
   }
   mesh.current.instanceMatrix.needsUpdate=true;
 }
 useEffect(()=>{draw({mph:0},0)},[transforms]);
 useFrame(()=>{if(!calmMotion)draw(windAt(game.wind,game.time),game.time)});
 return <instancedMesh ref={mesh} args={[geometry,null,transforms.length]} frustumCulled={false}>
   <meshStandardMaterial color="#718a49" side={THREE.DoubleSide} roughness={1}/>
 </instancedMesh>;
}

const dustColors={'land-sand':'#d9bc86','land-rough':'#819858','land-fairway':'#9fb66d','land-green':'#a9c77a',splash:'#a9dad7'};
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
     const particle=refs.current[i],a=i*2.399,speed=.6+i*.16,water=event.type==='splash';
     particle.position.set(Math.cos(a)*age*speed,.12+age*(water?3.6:2.1)-4*age*age,Math.sin(a)*age*speed);
     particle.scale.setScalar((water?.11:.085)*(1-age/.45)*(1+event.strength));
     particle.material.color.set(dustColors[event.type]);
     particle.material.opacity=1-age/.45;
   }
 });
 return <group ref={group} visible={false}>{Array.from({length:9},(_,i)=><mesh key={i} ref={p=>{refs.current[i]=p}}>
   <icosahedronGeometry args={[1,0]}/><meshBasicMaterial transparent depthWrite={false}/>
 </mesh>)}</group>;
}
