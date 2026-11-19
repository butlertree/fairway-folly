import {Vector3} from 'three';
import {courseHit} from './aim.js';
import {height} from './course.js';
// Full-course input must intersect the heightfield, not a plane below an uphill ray.
export function terrainRaycast(hole){return function(raycaster,intersections){
 const hit=courseHit(raycaster.ray.origin,raycaster.ray.direction,hole);
 if(!hit)return;
 const point=new Vector3(hit.x,height(hit.x,hit.z,hole),hit.z),distance=point.distanceTo(raycaster.ray.origin);
 if(distance<raycaster.near||distance>raycaster.far)return;
 intersections.push({distance,point,object:this});
}}
