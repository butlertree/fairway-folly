import {terrainMeshHeight} from './terrain-mesh';
import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {height,getCourse} from './course';
import {bunkersByHole,bunkerPoint} from './bunkers';

// Discard the underlying terrain by the same smooth outline used for the hazard.
// This avoids coarse terrain triangles poking through the sculpted sand bowl.
export function BunkerGroundMaterial({hole,...props}){const list=bunkersByHole[hole]??[];const compile=useMemo(()=>shader=>{
 const {tee}=getCourse(hole);
 shader.uniforms.uTeeCenter={value:new THREE.Vector2(tee.x,tee.z)};
 shader.uniforms.uTeeTurf={value:new THREE.Color('#79a45f')};
 shader.uniforms.uBunkerShape={value:list.map(p=>new THREE.Vector4(p.x,p.z,p.rx,p.rz))};
 shader.uniforms.uBunkerStyle={value:list.map(p=>new THREE.Vector2(p.rotation,p.seed))};
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vBunkerWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBunkerWorld=(modelMatrix*vec4(transformed,1.0)).xz;');
 shader.fragmentShader=shader.fragmentShader
   .replace('#include <common>','#include <common>\nvarying vec2 vBunkerWorld;uniform vec2 uTeeCenter;uniform vec3 uTeeTurf;')
   .replace('#include <color_fragment>',`#include <color_fragment>
     vec2 teeUV=(vBunkerWorld-uTeeCenter)/vec2(4.8,6.1);
     float teeEdge=length(pow(abs(teeUV),vec2(1.35)));
     float teeTurf=1.0-smoothstep(.72,1.19,teeEdge+.028*sin(teeUV.x*13.0)*sin(teeUV.y*11.0));
     float teeGrain=sin(vBunkerWorld.x*82.0+vBunkerWorld.y*49.0)*sin(vBunkerWorld.y*106.0);
     float teeMow=.012*cos(vBunkerWorld.y*2.6)+.009*teeGrain;
     float collar=smoothstep(.86,1.05,teeEdge)*(1.0-smoothstep(1.07,1.42,teeEdge));
     diffuseColor.rgb=mix(diffuseColor.rgb,uTeeTurf+teeMow,teeTurf*.93);
     diffuseColor.rgb*=1.0-.035*collar;
   `);
 if(list.length){
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nuniform vec4 uBunkerShape[${list.length}];uniform vec2 uBunkerStyle[${list.length}];`).replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>\nfor(int i=0;i<${list.length};i++){vec4 p=uBunkerShape[i];vec2 d=vBunkerWorld-p.xy;if(max(abs(d.x),abs(d.y))>max(p.z,p.w)*1.3)continue;float c=cos(uBunkerStyle[i].x),s=sin(uBunkerStyle[i].x);vec2 q=vec2(d.x*c+d.y*s,-d.x*s+d.y*c)/p.zw;float a=atan(q.y,q.x),seed=uBunkerStyle[i].y;float profile=1.0+.055*sin(a*3.0+seed)+.035*cos(a*2.0-seed);if(length(q)/profile<1.12)discard;}`);
 }
 },[hole]);return <meshStandardMaterial {...props} onBeforeCompile={compile} customProgramCacheKey={()=>`bunker-ground-${hole}`}/>}
function groomedSandTexture(){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#f5ead0';c.fillRect(0,0,256,256);let seed=91;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<18000;i++){const v=random();c.fillStyle=v>.5?'rgba(255,255,245,.13)':'rgba(137,112,64,.07)';c.fillRect(random()*256,random()*256,1,1)}for(let y=-24;y<300;y+=10){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(85,y+18,170,y+18,256,y);c.strokeStyle='rgba(129,107,64,.10)';c.lineWidth=.8;c.stroke();c.beginPath();c.moveTo(0,y+1.5);c.bezierCurveTo(85,y+19.5,170,y+19.5,256,y+1.5);c.strokeStyle='rgba(255,255,239,.20)';c.stroke()}const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
function Bunker({p,hole,texture}){const geometry=useMemo(()=>{const positions=[],colors=[],uv=[],indices=[],rings=32,segments=192;for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const r=j/rings*1.16,a=i/segments*Math.PI*2,q=bunkerPoint(p,a,r);const join=THREE.MathUtils.smoothstep(r,.98,1.15),y=height(q.x,q.z,hole)*(1-join)+(join?terrainMeshHeight(q.x,q.z,hole):0)*join;positions.push(q.x,y+.005,q.z);uv.push((q.x-p.x)*.32,(q.z-p.z)*.32);const color=new THREE.Color(r<.86?'#ead6aa':r<1?'#d8bf8a':r<1.045?(p.pot?'#71694b':'#93905f'):r<1.10?'#557a40':'#8db464');colors.push(color.r,color.g,color.b);if(i<segments&&j<rings){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g},[p,hole]);return <mesh geometry={geometry} receiveShadow castShadow><meshStandardMaterial vertexColors map={texture} bumpMap={texture} bumpScale={.035} roughness={.98} side={THREE.DoubleSide}/></mesh>}
export function CourseBunkers({hole}){const texture=useMemo(groomedSandTexture,[]);useEffect(()=>()=>texture.dispose(),[texture]);return <>{(bunkersByHole[hole]??[]).map(p=><Bunker key={p.id} p={p} hole={hole} texture={texture}/>)}</>}
