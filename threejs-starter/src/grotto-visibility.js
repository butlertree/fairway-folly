// Clip the actual camera-to-ball segment against the overhead canopy volume.
// The controls target can be several feet ahead of the ball and is not an occlusion test.
export function grottoCanopyBlocks(camera,ball,padding=0){
 const min={x:-4.6-padding,y:2.3-padding,z:-3.8-padding},max={x:4.6+padding,y:4.9+padding,z:1+padding};
 let lo=0,hi=1;
 for(const axis of ['x','y','z']){const d=ball[axis]-camera[axis];if(Math.abs(d)<1e-9){if(camera[axis]<min[axis]||camera[axis]>max[axis])return false;continue}let a=(min[axis]-camera[axis])/d,b=(max[axis]-camera[axis])/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return false}
 return hi>0&&lo<.995;
}
export function grottoAddressHeight(x,z){return Math.abs(x)<5.2&&z> -8&&z<4?5.8:null}

import {gardenBanks} from './green-features.js';
function pointDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)}
function segmentDistance(a,b,c,d){const ux=b.x-a.x,uz=b.z-a.z,vx=d.x-c.x,vz=d.z-c.z,den=ux*vz-uz*vx;if(Math.abs(den)>1e-9){const wx=c.x-a.x,wz=c.z-a.z,t=(wx*vz-wz*vx)/den,u=(wx*uz-wz*ux)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0}return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b))}
// Low support rocks can block a side-on camera even when the overhead arch is clear.
export function grottoStructureBlocks(camera,ball,padding=0){if(grottoCanopyBlocks(camera,ball,padding))return true;const dy=ball.y-camera.y;let lo=0,hi=1;if(Math.abs(dy)<1e-9){if(camera.y<.35||camera.y>3.4+padding)return false}else{const a=(.35-camera.y)/dy,b=(3.4+padding-camera.y)/dy;lo=Math.max(0,Math.min(a,b));hi=Math.min(1,Math.max(a,b));if(lo>hi)return false}const at=t=>({x:camera.x+(ball.x-camera.x)*t,z:camera.z+(ball.z-camera.z)*t}),a=at(lo),b=at(hi);return gardenBanks[3].some(s=>segmentDistance(a,b,{x:s.ax,z:s.az},{x:s.bx,z:s.bz})<s.r+.16+padding)}
