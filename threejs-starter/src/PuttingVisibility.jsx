import {useFrame,useThree} from '@react-three/fiber';
import {useRef} from 'react';
import * as THREE from 'three';
// Only outside decorative foliage cuts away; playable obstacles keep their visible colliders.
export function PuttingVisibility({game}){const {scene,camera}=useThree(),ray=useRef(new THREE.Raycaster()),roots=useRef([]),counter=useRef(0);useFrame((_,dt)=>{counter.current+=dt;if(counter.current>.5||!roots.current.length){roots.current=[];scene.traverse(o=>{if(o.userData.miniFoliage)roots.current.push(o)});counter.current=0}const ball=new THREE.Vector3(game.ball.x,game.ball.y,game.ball.z),direction=ball.clone().sub(camera.position),distance=direction.length();ray.current.set(camera.position,direction.normalize());ray.current.far=Math.max(0,distance-.15);for(const root of roots.current){root.visible=true;if(camera.position.y<12&&ray.current.intersectObject(root,true).length)root.visible=false}});return null}
