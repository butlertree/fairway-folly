import {expansionPools} from './expansion-greens.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export const cascadePool={x:1,z:7,rx:6.2,rz:1.65};
export const crossing={z:7,halfLength:3,halfWidth:1.9,crest:.65};
export const crossingX=z=>.65*Math.sin((z-crossing.z)/crossing.halfLength*Math.PI);
export const onCrossing=(x,z)=>Math.abs(z-crossing.z)<crossing.halfLength&&Math.abs(x-crossingX(z))<=crossing.halfWidth;
export function miniPool(hole){return expansionPools[hole]??(hole===3?cascadePool:hole===2?{x:-6.4,z:-7,rx:1.3,rz:2}:{x:6,z:-7.3,rx:2.25,rz:3})}
export function miniHeight(hole,x,z){if(hole===2){const r=Math.hypot(x,z);return .85*(1-smooth((r-4)/3.8))}if(hole===3&&onCrossing(x,z))return crossing.crest*Math.cos((z-crossing.z)/crossing.halfLength*Math.PI/2);return 0}
export function miniSlope(hole,x,z){const e=.015;if(hole===3)return onCrossing(x,z)?{x:0,z:-crossing.crest*Math.PI/(2*crossing.halfLength)*Math.sin((z-crossing.z)/crossing.halfLength*Math.PI/2)}:{x:0,z:0};return {x:(miniHeight(hole,x+e,z)-miniHeight(hole,x-e,z))/(2*e),z:(miniHeight(hole,x,z+e)-miniHeight(hole,x,z-e))/(2*e)}}
// Low visible bridge curbs rebound from either side, without snapping an outside ball onto the deck.
export function crossingContact(b,prior,r=.3){if(Math.abs(b.z-crossing.z)>=crossing.halfLength-.35)return 0;const x=crossingX(b.z),q=b.x-x;if(Math.abs(q)<crossing.halfWidth-r||Math.abs(q)>crossing.halfWidth+r)return 0;const side=Math.sign(q)||1,outside=Math.abs(prior.x-crossingX(prior.z))>=crossing.halfWidth;const derivative=.65*Math.PI/crossing.halfLength*Math.cos((b.z-crossing.z)/crossing.halfLength*Math.PI);let nx=side*(outside?1:-1),nz=-derivative*nx,n=Math.hypot(nx,nz);nx/=n;nz/=n;b.x=x+side*(crossing.halfWidth+(outside?r+.001:-r-.001));const vn=b.vx*nx+b.vz*nz;if(vn<0){b.vx-=1.7*vn*nx;b.vz-=1.7*vn*nz;return -vn}return 0}
