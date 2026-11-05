import React,{useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {pondOutline,height,waterLevel} from './game';

const NO_EXCLUSIONS=[];
// An animated, depth-coloured surface. The shoreline is shared with hazard tests.
export function WaterMaterial({pond={x:0,z:0,rx:200,rz:200},excludePonds=NO_EXCLUSIONS,flow=false}){
 const ref=useRef();
 const uniforms=useMemo(()=>({uExclude:{value:Array.from({length:3},(_,i)=>{const p=excludePonds[i];return new THREE.Vector4(p?.x??0,p?.z??0,p?.rx??1,p?.rz??1)})},uExcludeCount:{value:excludePonds.length},uTime:{value:0},uFlow:{value:Number(flow)},uPond:{value:new THREE.Vector4(pond.x,pond.z,pond.rx,pond.rz)}}),[pond.x,pond.z,pond.rx,pond.rz,excludePonds,flow]);
 useFrame((_,dt)=>{if(ref.current)ref.current.uniforms.uTime.value+=dt});
 return <shaderMaterial ref={ref} uniforms={uniforms} side={THREE.DoubleSide}
 vertexShader={`varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`}
 fragmentShader={`uniform float uTime;uniform float uFlow;uniform vec4 uPond;uniform vec4 uExclude[3];uniform int uExcludeCount;varying vec3 vWorld;
 void main(){vec2 p=vWorld.xz;for(int i=0;i<3;i++){if(i>=uExcludeCount)break;vec2 q=(p-uExclude[i].xy)/uExclude[i].zw;float a=atan(q.y,q.x);if(length(q)<1.+.12*sin(a*3.+.8)+.06*cos(a*5.))discard;}float edge=length((p-uPond.xy)/uPond.zw);float shallow=smoothstep(.15,1.08,edge);
 vec3 colour=mix(vec3(.055,.34,.43),vec3(.36,.76,.76),shallow);
 float ripples=sin(p.x*3.+sin(p.y*1.8+uTime)*.6+uTime*1.4)*sin(p.y*3.7-uTime*.8);
 float glint=smoothstep(.84,.99,ripples);colour+=glint*.19;colour+=sin(p.x*.5+p.y*.8+uTime*.5)*.018;
 float foam=smoothstep(.9,1.07,edge)*(.45+.3*sin(p.x*8.+p.y*5.+uTime));colour=mix(colour,vec3(.79,.92,.84),foam*.5);
 vec2 channel=vec2(p.x-uTime*1.1,p.y);
 float current=sin(channel.x*2.4+sin(channel.y*5.5)*1.6)*cos(channel.y*8.+channel.x*.65);
 colour+=uFlow*smoothstep(.78,.98,current)*.13*(1.-smoothstep(.72,1.1,edge));
 gl_FragColor=vec4(colour,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}/>
}
export function WaterPond({pond,terrain=false,level=waterLevel,flow=false}){
 const geometries=useMemo(()=>[1.07,1].map((scale,index)=>{
  const outline=pondOutline(pond),points=[[pond.x,pond.z],...outline,outline[0]],positions=[],indices=[];
  for(const [px,pz] of points){const x=pond.x+(px-pond.x)*scale,z=pond.z+(pz-pond.z)*scale;positions.push(x,terrain?level-.16+index*.20:.012+index*.018,z)}
  for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
 }),[pond,terrain,level]);
 return <><mesh geometry={geometries[0]} receiveShadow><meshStandardMaterial color="#c8c894" roughness={1} side={THREE.DoubleSide}/></mesh><mesh geometry={geometries[1]}><WaterMaterial pond={pond} flow={flow}/></mesh></>
}
