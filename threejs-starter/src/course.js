import {bunkerAt,bunkerHeight} from './bunkers.js';
import {newHoles,heightNew,lieNew} from './new-holes.js';
import {holeThree,heightThree,lieThree} from './hole-three.js';
import {edgeShape} from './landscape.js';
import {holeTwo,heightTwo,lieTwo} from './hole-two.js';
// The full-size hole uses metres throughout; the Folly Green uses its own feet-based miniature scene.
export const METRES_PER_YARD=.9144;
export const course={id:1,par:4,title:'The Verdant Isles',yards:360,sx:1.3,sz:360*METRES_PER_YARD/76,ballRadius:.085,tee:{x:0,z:39*360*METRES_PER_YARD/76},pin:{x:0,z:-37*360*METRES_PER_YARD/76},green:{rx:14.95,rz:13},bounds:{rx:46.8,rz:47*360*METRES_PER_YARD/76}};
export const ponds={course:{x:4*course.sx,z:-5*course.sz,rx:10*course.sx,rz:5*course.sz},green:{x:6,z:-7.3,rx:2.25,rz:3}};
export function pondRadius(a){return 1+.12*Math.sin(a*3+.8)+.06*Math.cos(a*5)}
export function pondOutline(p,n=96){return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,r=pondRadius(a);return [p.x+p.rx*r*Math.cos(a),p.z+p.rz*r*Math.sin(a)]})}
export function pondFraction(x,z,p){const nx=(x-p.x)/p.rx,nz=(z-p.z)/p.rz;return Math.hypot(nx,nz)/pondRadius(Math.atan2(nz,nx))}
export function inPond(x,z,p){return !!p&&pondFraction(x,z,p)<1}
function baseHeight(x,z){x/=course.sx;z/=course.sz;return 60+4*Math.exp(-(x*x/280+(z-12)**2/140))+18*Math.exp(-((x+30)**2/95+(z+22)**2/220))+14*Math.exp(-((x-29)**2/75+(z-13)**2/160))+1.8*(1.45+1.8*Math.exp(-((x+23)**2/430+(z+12)**2/530))+1.7*Math.exp(-((x-22)**2/520+(z-17)**2/700))+.65*Math.exp(-((x+5)**2/900+(z+35)**2/350))+.16*Math.sin(x/6)*Math.cos(z/8))}
export const waterLevel=baseHeight(ponds.course.x,ponds.course.z)-.1;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function getCourse(hole=1){return newHoles[hole]??(hole===3?holeThree:hole===2?holeTwo:course)}
export const verdantMesh={rings:144,segments:320};
export function terrainHeight(x,z,hole=1){if(hole>=4)return heightNew(x,z,hole);if(hole===3)return heightThree(x,z);if(hole===2)return heightTwo(x,z);let y=baseHeight(x,z);const greenR=Math.hypot(x/course.green.rx,(z-course.pin.z)/course.green.rz),teeR=Math.max(Math.abs(x)/4.8,Math.abs(z-course.tee.z)/6);y+=(baseHeight(0,course.pin.z)+8-y)*(1-smooth((greenR-1)/1.3));y+=(baseHeight(0,course.tee.z)+6-y)*(1-smooth((teeR-1)/2));const r=pondFraction(x,z,ponds.course);if(r<1.15)y=waterLevel-.8+(y-waterLevel+.8)*smooth((r-.94)/.21);const nz=z/course.sz,nx=x/course.sx,w=riverWidth(nz);if(w>0){const offset=Math.abs(nx-riverCenter(nz)),edge=offset-w,water=riverLevel(nz);const bed=water-1.5+1.65*smooth((edge+.7)/1.04);y=bed+(y-bed)*smooth((edge-.34)/2.4);}return y}
export function riverCenter(z){
 const upstream=-23+3.6*Math.sin((z+10)/12)+.8*Math.sin((z-3)/5.3);
 return upstream+(-8-upstream)*smooth((z-27)/29);
}
export function riverLevel(z){return 61+12*(1-smooth((z+31)/53))+.012*(41-z)}
function riverHalfWidth(z){return (1.95+.38*Math.sin(z/5.8)+.19*Math.sin(z/2.9))*smooth((z+32)/4)}
export function riverWidth(z){return z< -32||z>riverOutlet.nz+.3?0:riverHalfWidth(z)}
export function terrainLie(x,z,hole=1){if(hole>=4)return lieNew(x,z,hole);if(hole===3)return lieThree(x,z);if(hole===2)return lieTwo(x,z);if((x/course.bounds.rx)**2+(z/course.bounds.rz)**2>1)return 'OB';if(inPond(x,z,ponds.course))return 'Water';const nx=x/course.sx,nz=z/course.sz;if(Math.abs(nx-riverCenter(nz))<riverWidth(nz))return 'Water';if((x/course.green.rx)**2+((z-course.pin.z)/course.green.rz)**2<1)return 'Green';if(Math.abs(x)<4&&Math.abs(z-course.tee.z)<5)return 'Tee box';return nz<32&&Math.abs(nx-3*Math.sin(nz/12))<9.3+2.1*Math.sin(nz/10)?'Fairway':'Rough'}
export function yardsToPin(ball,hole=1,pin){const c=getCourse(hole);pin??=c.pin;return Math.hypot(ball.x-pin.x,ball.z-pin.z)/METRES_PER_YARD}

export const riverOutlet=(()=>{let lo=32,hi=60;for(let i=0;i<40;i++){const nz=(lo+hi)/2,x=riverCenter(nz)*course.sx,z=nz*course.sz,a=Math.atan2(z/(51*course.sz),x/(40*course.sx)),r=Math.hypot(x/(40*course.sx),z/(51*course.sz));if(r<edgeShape(a))lo=nz;else hi=nz}const nz=(lo+hi)/2,x=riverCenter(nz)*course.sx,z=nz*course.sz;return {x,z,nz,width:riverHalfWidth(nz)*course.sx*2,angle:Math.atan2(x/(40*course.sx)**2,z/(51*course.sz)**2)}})();
export const sceneryRocks=[{x:24*course.sx,z:30*course.sz,r:1.5},{x:25*course.sx,z:25*course.sz,r:2.2},{x:-20*course.sx,z:24*course.sz,r:1.5},{x:-24*course.sx,z:-27*course.sz,r:2.2}];
export function rockBaseY(rock){let y=Infinity;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;y=Math.min(y,height(rock.x+Math.cos(a)*rock.r,rock.z+Math.sin(a)*rock.r))}return y+rock.r*.34}

const bunkerBases=Array.from({length:10},(_,hole)=>(x,z)=>terrainHeight(x,z,hole));
export function height(x,z,hole=1){return bunkerHeight(x,z,hole,bunkerBases[hole]??bunkerBases[1])}
export function lie(x,z,hole=1){const surface=terrainLie(x,z,hole);return !['OB','Water','Green','Tee box'].includes(surface)&&bunkerAt(x,z,hole)?'Sand':surface}
