import React,{useRef,useEffect} from 'react';
import * as THREE from 'three';
import {expansionBanks} from './expansion-greens';
// Blossoms sit on the same curved banks that the ball actually rebounds from.
export function AzaleaGarden(){const ref=useRef(),count=expansionBanks[9].length*9;useEffect(()=>{const o=new THREE.Object3D(),c=new THREE.Color();expansionBanks[9].forEach((s,j)=>{for(let i=0;i<9;i++){const t=(i+.5)/9,dx=s.bx-s.ax,dz=s.bz-s.az,len=Math.hypot(dx,dz),side=((i%3)-1)*.12;o.position.set(s.ax+dx*t-dz/len*side,.7+Math.sin(i*2+j)*.025,s.az+dz*t+dx/len*side);o.scale.set(.13,.09,.13);o.updateMatrix();ref.current.setMatrixAt(j*9+i,o.matrix);c.set(i%3?'#e4a0b7':'#f3d5dc');ref.current.setColorAt(j*9+i,c)}});ref.current.instanceMatrix.needsUpdate=true;ref.current.instanceColor.needsUpdate=true},[]);return <instancedMesh ref={ref} args={[null,null,count]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial roughness={1}/></instancedMesh>}
