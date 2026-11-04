import {boundaryEdges} from './mini-boundary.js';
import {pinFor} from './cups.js';
import {course,clubs,height,lie,carryYards,puttInfo,getCourse} from './game.js';
export function aimPoint(game){
 const c=getCourse(game.hole),p=game.inputLocked?(game.previewPower??.5):1,distance=carryYards(game,p)*.9144,dx=Math.sin(game.angle),dz=-Math.cos(game.angle),b=game.ball;
 const intended={x:b.x+dx*distance,z:b.z+dz*distance};
 // Keep the visible marker on the property edge when the selected shot aims out of play.
 const rx=c.bounds.rx,rz=c.bounds.rz,bx=b.x-(c.bounds.cx??0),A=(dx/rx)**2+(dz/rz)**2,B=2*(bx*dx/rx**2+b.z*dz/rz**2),C=(bx/rx)**2+(b.z/rz)**2-1;
 const boundary=(-B+Math.sqrt(Math.max(0,B*B-4*A*C)))/(2*A),shown=Math.max(0,Math.min(distance,boundary*.985)),x=b.x+dx*shown,z=b.z+dz*shown;
 return {x,y:height(x,z,game.hole)+.15,z,distance,yards:Math.round(distance/.9144),out:lie(intended.x,intended.z,game.hole)==='OB'};
}
export function isAimClick(start,end){return Math.hypot(end.x-start.x,end.y-start.y)<=6}

export function puttingAim(g){const b=g.ball;let dx=g.pull?.x??Math.sin(g.angle),dz=g.pull?.z??-Math.cos(g.angle);const n=Math.hypot(dx,dz)||1;dx/=n;dz/=n;let wall=Infinity;for(const e of boundaryEdges(g.hole)){const v=dx*e.nx+dz*e.nz;if(v< -1e-7)wall=Math.min(wall,(.3-((b.x-e.x)*e.nx+(b.z-e.z)*e.nz))/v)}const roll=puttInfo(g.pull?.percent??g.puttPower).distance,len=Math.max(0,Math.min(roll,wall));return {x:b.x+dx*len,y:.35,z:b.z+dz*len,distance:len,bank:roll>len+.05}}

export function selectTarget(g,p){if(g.mini||g.mode!=='ready')return false;g.target={x:p.x,z:p.z};g.angle=Math.atan2(p.x-g.ball.x,g.ball.z-p.z);return true}
export function selectedTarget(g){if(!g.target)return null;const {x,z}=g.target,distance=Math.hypot(x-g.ball.x,z-g.ball.z);return {x,z,y:height(x,z,g.hole)+.2,distance,yards:Math.round(distance/.9144),out:lie(x,z,g.hole)==='OB'}}
// Ray/heightfield intersection keeps taps on elevated islands at their actual world position.
export function courseHit(origin,direction,hole=1){const c=getCourse(hole);let previous=null;for(let t=0;t<2400;t+=2){const x=origin.x+direction.x*t,z=origin.z+direction.z*t;if(((x-(c.bounds.cx??0))/c.bounds.rx)**2+(z/c.bounds.rz)**2>1.25){previous=null;continue}const gap=origin.y+direction.y*t-height(x,z,hole);if(gap<=0&&previous!==null){let lo=previous,hi=t;for(let i=0;i<16;i++){const m=(lo+hi)/2,mx=origin.x+direction.x*m,mz=origin.z+direction.z*m;if(origin.y+direction.y*m>height(mx,mz,hole))lo=m;else hi=m}return {x:origin.x+direction.x*hi,z:origin.z+direction.z*hi}}previous=t}return null}
export function golfCameraPose(g,moving=false,mobile=false,renderBall=g.ball){if(!moving&&lie(g.ball.x,g.ball.z,g.hole)==='Tee box'){const b=g.ball,dx=Math.sin(g.angle),dz=-Math.cos(g.angle),back=mobile?15:12;return {position:[b.x-dx*back,b.y+2.2,b.z-dz*back],target:[b.x+dx*10,b.y,b.z+dz*10]}}const b=renderBall,c=getCourse(g.hole),pin=pinFor(g,c),dx=Math.sin(g.angle),dz=-Math.cos(g.angle),pinY=height(pin.x,pin.z,g.hole),distance=Math.hypot(b.x-pin.x,b.z-pin.z),uphill=!moving&&distance<80&&pinY-b.y>6,back=uphill?Math.max(25,distance):moving?14:mobile?20:18,x=b.x-dx*back,z=b.z-dz*back;let eye=Math.max(b.y+(moving?7:mobile?4:4.5),height(x,z,g.hole)+3,uphill?pinY+10:-Infinity);const ahead=uphill?distance*.4:moving?3:24,target={x:b.x+dx*ahead,y:uphill?b.y+(pinY-b.y)*.4:moving?b.y+.6:Math.max(b.y+1,height(b.x+dx*ahead,b.z+dz*ahead,g.hole)+1),z:b.z+dz*ahead};for(let i=1;i<16;i++){const t=i/16,h=height(x+(target.x-x)*t,z+(target.z-z)*t,g.hole)+.4;if(eye*(1-t)+target.y*t<h)eye=Math.max(eye,(h-target.y*t)/(1-t))}return {position:[x,eye,z],target:[target.x,target.y,target.z]}}
