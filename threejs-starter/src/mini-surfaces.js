import {miniCup} from './cups.js';
import {boundaryClearance} from './mini-boundary.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export const cascadePool={x:4.6,z:7,rx:9.1,rz:1.9};
export const cascadeOutletX=13.42;
export const cascadeWaterLevel=-.23;
export const crossing={z:7,halfLength:3,halfWidth:1.9,crest:.65};
export const crossingX=z=>.65*Math.sin((z-crossing.z)/crossing.halfLength*Math.PI);
export const onCrossing=(x,z)=>Math.abs(z-crossing.z)<crossing.halfLength&&Math.abs(x-crossingX(z))<=crossing.halfWidth;
export function miniPool(hole){return hole===3?cascadePool:null}
// Gentle playable landforms, with a flat three-foot reward area and level outer banks.
export const greenContours={
 1:[[-3.5,-8,3,5,.7],[4,1,3.2,4,.65]],
 2:[[-4,9,3,4,.35],[5,-9,3,4,.3]],
 3:[[-4,-7,3.2,5,.65],[4,-7,3.2,5,.65]],
 4:[[-3,3,3.5,7,.95],[5,-8,3.5,4,.55]],
 5:[[-4.5,4,3.4,5,.85],[4.5,-5,3.4,5,.95]],
 6:[[-4,-7,4,4,1],[4,7,4,5,.8]],
 7:[[-4,5,3.3,6,.9],[4,-6,3.3,5,.8]],
 8:[[-3,-6,3.7,6,.95],[4,6,3.5,5,.7]],
 9:[[-5,-7,3,5,.65],[5,7,3,5,.65]],
 10:[[7,0,3.1,9,.53],[-3,-8,5,2.8,.68],[-4,8,3.8,4,-.25]],
 12:[[-7.8,3.6,3.2,6.3,.54],[2,10.5,8,3.1,.39],[5.4,-5.8,4.8,4.2,.47],[-3.5,-9.5,6.2,2.8,-.14]],
 11:[[-4.7,5,4,7,-.28],[3.4,6,3.4,7,-.21],[2,-6,4.2,6,-.15]]
};
function contours(hole,x,z){const cup=miniCup({hole}),r=Math.hypot(x-cup.x,z-cup.z),edge=boundaryClearance(hole,x,z);let h=0;for(const [cx,cz,rx,rz,amplitude] of greenContours[hole]??[]){
 const d2=((x-cx)/rx)**2+((z-cz)/rz)**2;
 h+=amplitude*(hole===12?1-smooth((Math.sqrt(d2)-.15)/1.08):Math.exp(-d2));
}const approach=hole===12?1:smooth((r-3.1)/2);let envelope=approach*smooth(edge/(hole>=10?3.6:2));if(hole===1)envelope*=smooth((x+7)/1.5)*smooth((Math.hypot(x,z-7)-3)/2);if(hole===3)envelope*=smooth((Math.abs(z-crossing.z)-crossing.halfLength)/1.2);return h*envelope}
export function miniHeight(hole,x,z){let h=contours(hole,x,z);if(hole===2){const r=Math.hypot(x,z);h+=.85*(1-smooth((r-4)/3.8))}if(hole===10)h+=.58*(1-smooth((Math.hypot(x,z)-3.25)/4.7));if(hole===3&&onCrossing(x,z))return crossing.crest*Math.cos((z-crossing.z)/crossing.halfLength*Math.PI/2);return h}
export function miniSlope(hole,x,z){const e=.015;if(hole===3&&onCrossing(x,z))return {x:0,z:-crossing.crest*Math.PI/(2*crossing.halfLength)*Math.sin((z-crossing.z)/crossing.halfLength*Math.PI/2)};return {x:(miniHeight(hole,x+e,z)-miniHeight(hole,x-e,z))/(2*e),z:(miniHeight(hole,x,z+e)-miniHeight(hole,x,z-e))/(2*e)}}
// Low visible bridge curbs rebound from either side, without snapping an outside ball onto the deck.
export function crossingContact(b,prior,r=.3){if(Math.abs(b.z-crossing.z)>=crossing.halfLength-.35)return 0;const x=crossingX(b.z),q=b.x-x;if(Math.abs(q)<crossing.halfWidth-r||Math.abs(q)>crossing.halfWidth+r)return 0;const side=Math.sign(q)||1,outside=Math.abs(prior.x-crossingX(prior.z))>=crossing.halfWidth;const derivative=.65*Math.PI/crossing.halfLength*Math.cos((b.z-crossing.z)/crossing.halfLength*Math.PI);let nx=side*(outside?1:-1),nz=-derivative*nx,n=Math.hypot(nx,nz);nx/=n;nz/=n;b.x=x+side*(crossing.halfWidth+(outside?r+.001:-r-.001));const vn=b.vx*nx+b.vz*nz;if(vn<0){b.vx-=1.7*vn*nx;b.vz-=1.7*vn*nz;return -vn}return 0}
