import React,{useMemo} from 'react';
import * as THREE from 'three';
import {pondOutline} from './course';
import {cascadeOutletX,cascadePool,cascadeWaterLevel,crossing,crossingX,miniHeight} from './mini-surfaces';
import {WaterMaterial} from './Water';
import {CourseWaterfall} from './CourseWaterfall';

export function CascadeChannel(){
  const {shape,outlet}=useMemo(()=>{
    const outline=pondOutline(cascadePool,192),points=[],mouth=[];
    for(let i=0;i<outline.length;i++){
      const [x,z]=outline[i], [nx,nz]=outline[(i+1)%outline.length];
      if(x<=cascadeOutletX)points.push([x,z]);
      if((x<=cascadeOutletX)!==(nx<=cascadeOutletX)){
        const edgeZ=z+(nz-z)*(cascadeOutletX-x)/(nx-x);
        points.push([cascadeOutletX,edgeZ]);
        mouth.push(edgeZ);
      }
    }
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const [near,far]=mouth.sort((a,b)=>a-b);
    return {shape,outlet:{x:cascadeOutletX,z:(near+far)/2,width:far-near}};
  },[]);
  return <>
    <mesh position={[0,cascadeWaterLevel,0]} rotation={[-Math.PI/2,0,0]}>
      <shapeGeometry args={[shape]}/><WaterMaterial pond={cascadePool} flow/>
    </mesh>
    <CourseWaterfall outlet={outlet} level={cascadeWaterLevel} rotation={Math.PI/2} bottom={-5.4}/>
  </>;
}

const start=crossing.z-crossing.halfLength;
const length=crossing.halfLength*2;
const deckY=z=>miniHeight(3,crossingX(z),z);
const railLevels=[{y:-.18,r:.13,color:'#60432b'},{y:.12,r:.085,color:'#97704a'},{y:.68,r:.068,color:'#705034'}];
const plankColors=['#a7794f','#b98a58','#ad8054','#c09666','#a77d53'];

export function CascadeCrossing(){
  const rails=useMemo(()=>[-1,1].flatMap(side=>railLevels.map(level=>({
    ...level,
    curve:new THREE.CatmullRomCurve3(Array.from({length:41},(_,i)=>{
      const z=start+.01+i/40*(length-.02);
      return new THREE.Vector3(crossingX(z)+side*crossing.halfWidth,deckY(z)+level.y,z);
    }))
  }))),[]);
  return <>
    {Array.from({length:31},(_,i)=>{
      const spacing=length/31,z=start+(i+.5)*spacing,x=crossingX(z),y=deckY(z);
      const pitch=-Math.atan2(deckY(z+.01)-deckY(z-.01),.02);
      return <mesh key={i} position={[x,y-.073,z]} rotation={[pitch,0,0]} receiveShadow>
        <boxGeometry args={[crossing.halfWidth*2,.146,spacing+.003]}/>
        <meshStandardMaterial color={plankColors[(i*7+Math.floor(i/3))%plankColors.length]} roughness={.92}/>
      </mesh>;
    })}
    {rails.map(({curve,r,color},i)=><mesh key={i} castShadow>
      <tubeGeometry args={[curve,64,r,6,false]}/><meshStandardMaterial color={color} roughness={.9}/>
    </mesh>)}
    {[-1,1].flatMap(side=>[.16,1.55,3,4.45,5.84].map((offset,i)=>{
      const z=start+offset,end=i===0||i===4;
      return <mesh key={side+':'+i} position={[crossingX(z)+side*crossing.halfWidth,deckY(z)+.31,z]} castShadow>
        <boxGeometry args={[end?.19:.13,.88,end?.2:.14]}/><meshStandardMaterial color={end?'#795337':'#896244'} roughness={.93}/>
      </mesh>;
    }))}
    {[start+.32,start+length-.32].map(z=><mesh key={z} position={[crossingX(z),-.22,z]} receiveShadow>
      <boxGeometry args={[4.05,.44,.52]}/><meshStandardMaterial color="#787969" roughness={1}/>
    </mesh>)}
  </>;
}
