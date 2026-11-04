import {cascadePool} from './mini-surfaces.js';
import {projectInside} from './mini-boundary.js';
import {expansionBanks,expansionObstacles,movingGreenGates} from './expansion-greens.js';
// Every low obstacle drawn in the signature gardens uses these same collision shapes.
export const gardenObstacles={
  1:[{x:-4,z:-5,r:1},{x:4,z:5,r:1},{x:-1.6,z:6.5,r:.55},{x:1.6,z:6.5,r:.55}],
  2:[{x:-4.8,z:8.2,r:1.15},{x:5.4,z:-6.5,r:1.05}],
  ...expansionObstacles,3:[{x:-5,z:-4,r:1.05},{x:5,z:-4,r:.85},{x:-5,z:-9,r:.8}]
};
export const gardenBanks={
  1:[{ax:-4.8,az:7,bx:-6, bz:4,r:.38},{ax:-6,az:4,bx:-6.2,bz:1,r:.38},{ax:-6.2,az:1,bx:-5.5,bz:-2,r:.38}],
  2:[{ax:6.5,az:8.3,bx:7.4,bz:5.6,r:.35},{ax:-6.8,az:-10.2,bx:-4.6,bz:-11.4,r:.35}],
  ...expansionBanks,3:[]
};
export const grottoPool=cascadePool;
export const grotto={z:-1.5,halfGap:1.8,roof:3.6,depth:5.6};
export function segmentContact(x,z,s,radius=.3){const dx=s.bx-s.ax,dz=s.bz-s.az,t=Math.max(0,Math.min(1,((x-s.ax)*dx+(z-s.az)*dz)/(dx*dx+dz*dz||1))),px=s.ax+t*dx,pz=s.az+t*dz,rx=x-px,rz=z-pz,d=Math.hypot(rx,rz),limit=s.r+radius;if(d>=limit)return null;const nx=d>1e-8?rx/d:1,nz=d>1e-8?rz/d:0;return {x:px+nx*(limit+.001),z:pz+nz*(limit+.001),nx,nz}}
export function greenSafeStart(hole,x,z){for(let i=0;i<12;i++){({x,z}=projectInside(hole,x,z,.45));for(const o of [...(gardenObstacles[hole]??[]),...movingGreenGates(hole,0).map(g=>({x:g.x,z:g.z,r:g.length+.1}))]){const dx=x-o.x,dz=z-o.z,d=Math.hypot(dx,dz),limit=o.r+.45;if(d<limit){const a=d>.001?Math.atan2(dz,dx):0;x=o.x+Math.cos(a)*limit;z=o.z+Math.sin(a)*limit}}for(const s of gardenBanks[hole]??[]){const hit=segmentContact(x,z,s,.45);if(hit){x=hit.x;z=hit.z}}}return {x,z}}
