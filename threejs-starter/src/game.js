import {miniCup,pinFor} from './cups.js';
import {gardenObstacles,gardenBanks,grottoPool,segmentContact,greenSafeStart} from './green-features.js';
import {windAcceleration} from './wind.js';
import {cornerContact} from './mini-layout.js';
import {clubSound} from './audio-design.js';
import {bridgeGreen,onBridge,bridgeHeight,bridgeSlopeZ} from './hole-two.js';
import {course,height,lie,ponds,inPond,METRES_PER_YARD,getCourse} from './course.js';
export {course,height,lie,ponds,inPond,METRES_PER_YARD,pondOutline,pondRadius,waterLevel,yardsToPin,riverWidth,getCourse} from './course.js';
export const DT=1/120;
export const swingTiming={powerRise:1.05,accuracyHalfSweep:.95};
export function swingMeter(phase,seconds){return phase==='power'?1-Math.abs((seconds/swingTiming.powerRise)%2-1):-Math.cos(seconds*Math.PI/swingTiming.accuracyHalfSweep)}
export function canTapIn(g){const d=Math.hypot(g.ball.x-miniCup(g).x,g.ball.z-miniCup(g).z);return g.mini&&g.mode==='ready'&&d>.05&&d<=8}
export function tapIn(g){if(!canTapIn(g))return false;const dx=miniCup(g).x-g.ball.x,dz=miniCup(g).z-g.ball.z,d=Math.hypot(dx,dz),speed=Math.sqrt(2*mini.friction*Math.max(0,d-.2))+.35;const percent=Math.max(1,puttPowerForDistance(speed*speed/(2*mini.friction)));g.puttPower=Math.max(1,Math.round(percent));putt(g,dx,dz,percent);g.message='Tap-in · watch it home';return true}

export const clubs=Object.fromEntries(Object.entries({Driver:{yards:245,loft:.55},Hybrid:{yards:200,loft:.67},'7 iron':{yards:155,loft:.8},Wedge:{yards:95,loft:1.02},'Sand wedge':{yards:55,loft:1.15,bunker:true}}).map(([name,c])=>[name,{...c,carry:c.yards*METRES_PER_YARD}]));
export const mini={feetPerUnit:1,friction:2.2,maxRollFeet:60,halfX:9,halfZ:15,radius:.3,cup:{x:0,z:-12},rotor:{x:0,y:3.3,z:.9,radius:3.2,width:.18,depth:.18,speed:.65}};
export function puttInfo(percent){const distance=mini.maxRollFeet*(Math.max(0,Math.min(100,percent))/100)**1.6;return {distance,speed:Math.sqrt(2*mini.friction*distance)}}
export function puttPowerForDistance(feet){return 100*(Math.max(0,Math.min(mini.maxRollFeet,feet))/mini.maxRollFeet)**(1/1.6)}
export function lieFactor(g){return g.lie==='Sand'?(clubs[g.club].bunker?.92:.7):g.lie==='Rough'?(clubs[g.club].bunker?.94:.88):1}
export function carryYards(g,power=1){return clubs[g.club].yards*Math.max(0,Math.min(1,power))*lieFactor(g)**2}
export function emitSound(g,type,strength=1){g.soundEvents??=[];g.soundSeq=(g.soundSeq??0)+1;g.soundEvents.push({id:g.soundSeq,type,strength});if(g.soundEvents.length>24)g.soundEvents.shift()}
function contactSound(g,strength){if(strength>.3&&g.time-(g.lastContactSound??-1)>.15){emitSound(g,'bank',Math.min(1,strength/10));g.lastContactSound=g.time}}
export function bladeTransforms(time){return [0,Math.PI/2].map(offset=>({...mini.rotor,angle:time*mini.rotor.speed+offset}))}
export function createGame(hole=1,scorecard=[]){const c=getCourse(hole);return {hole,par:c.par,scorecard,mode:'ready',mini:false,ball:{x:0,y:height(0,c.tee.z,hole)+.18+c.ballRadius,z:c.tee.z,vx:0,vy:0,vz:0},strokes:0,putts:0,angle:0,time:0,club:hole===3?'7 iron':'Driver',puttPower:50,power:0,accuracy:0,message:hole===3?'Kingfisher Cove · a 165-yard carry to the island. Take enough club; water guards the front and sides.':hole===2?'Lay up left for three safe shots, or carry the lake to the narrow island for a risky two-shot route.':'Carry the pond or lay up left. Choose a club, aim, then start your swing.',history:[],lie:'Tee box',settle:0,drop:0,trail:[],soundEvents:[],soundSeq:0}}
export function swing(g,power,accuracy){if(g.mode!=='ready'||g.mini)return;power=Math.max(0,Math.min(1,power));accuracy=Math.max(-1,Math.min(1,accuracy));g.freeCamera=false;g.cameraGesture=false;g.origin={...g.ball};g.strokes++;g.history.push({type:'shot',origin:{...g.ball},power,accuracy,club:g.club});const c=clubs[g.club],loft=c.loft,speed=Math.sqrt(c.carry*9.81/Math.sin(2*loft))*Math.sqrt(Math.max(0,power))*lieFactor(g),a=g.angle+accuracy*Math.abs(accuracy)*.85;Object.assign(g.ball,{vx:Math.sin(a)*speed*Math.cos(loft),vy:speed*Math.sin(loft),vz:-Math.cos(a)*speed*Math.cos(loft)});g.spin=accuracy*1.5;g.trail=[[g.ball.x,g.ball.y,g.ball.z]];g.trailTime=g.time;emitSound(g,clubSound(g.club,power),Math.max(.25,Math.sqrt(power)));g.mode='flight';g.rollStarted=null;g.settle=0;g.message='Ball in flight'}
export function putt(g,dx,dz,percent){if(!g.mini||g.mode!=='ready'||Math.hypot(dx,dz)<.001||(percent!==undefined&&percent<1))return;if(!g.pull||!g.puttCameraAnchor)g.puttCameraAnchor={x:g.ball.x,z:g.ball.z,angle:g.angle};g.origin={...g.ball};g.strokes++;g.putts++;g.history.push({type:'putt',origin:{...g.ball},dx,dz,percent});const l=Math.hypot(dx,dz),s=percent===undefined?Math.min(20,l*1.5):puttInfo(percent).speed;if(l){g.ball.vx=dx/l*s;g.ball.vz=dz/l*s}g.trail=[[g.ball.x,g.ball.y,g.ball.z]];g.trailTime=g.time;emitSound(g,'putt',Math.max(.15,Math.sqrt((percent??50)/100)));g.mode='rolling';g.message='Putting';}
function penalty(g,reason){emitSound(g,reason==='Water'?'splash':'penalty');g.ball={...g.origin,vx:0,vy:0,vz:0};g.strokes++;g.mode='ready';g.message=reason+' · +1 penalty, replay from previous lie';g.settle=0;if(!g.mini)alignToPin(g);if(g.mini){g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-g.ball.x,g.ball.z-miniCup(g).z)}}
export function nextHole(g){if(g.mode!=='holed'||g.hole>=3)return null;return createGame(g.hole+1,[...g.scorecard,{hole:g.hole,par:g.par,strokes:g.strokes}])}
export function enterGreen(g){const b=g.ball,c=getCourse(g.hole),pin=pinFor(g,c),cup=miniCup(g);const nx=(b.x-pin.x)/c.green.rx,nz=(b.z-pin.z)/c.green.rz,d=Math.min(1,Math.hypot(nx,nz));g.approachLanding={x:b.x,z:b.z,distanceYards:Math.hypot(b.x-pin.x,b.z-pin.z)/METRES_PER_YARD};g.mini=true;b.x=Math.max(-7.1,Math.min(7.1,cup.x+nx*8));b.z=Math.max(-9,Math.min(12,cup.z+4+d*20+(nz<0?-2:0)));if(g.hole===2&&inPond(b.x,b.z,bridgeGreen.pond)&&!onBridge(b.x,b.z))b.x=-7.5;if(g.hole===1){if(inPond(b.x,b.z,ponds.green))b.x=-6.5;for(const o of [{x:-4,z:-5,r:1.4},{x:4,z:5,r:1.4},{x:-1.6,z:-.5,r:1},{x:1.6,z:-.5,r:1}]){if(Math.hypot(b.x-o.x,b.z-o.z)<o.r)b.z=o.z+o.r+.1}if(Math.abs(b.x)<3&&Math.abs(b.z)<2.5)b.x=b.x<0?-3.5:3.5;}if(g.hole===3&&inPond(b.x,b.z,grottoPool))b.x=4.2;Object.assign(b,greenSafeStart(g.hole,b.x,b.z));b.y=(g.hole===2?bridgeHeight(b.x,b.z):0)+.3;b.vx=b.vy=b.vz=0;g.trail=[];g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-b.x,b.z-miniCup(g).z);g.mode='ready';g.lie='Mini green';g.message=g.hole===3?'Pull back and release. Shoot through the waterfall grotto, or take the wide bank route.':g.hole===2?'Pull back and release. Cross the moon bridge or take the stream-side garden route.':'Drag back from the ball to putt. Time the mill gate, or bank through the flower garden.';}
export function step(g,dt=DT){if(g.paused)return;g.time+=dt;const b=g.ball;if(g.mode==='holed')return;if(g.mode==='green-arrival'){if(g.time>=g.greenRevealAt)enterGreen(g);return}if(g.mode==='sinking'){const elapsed=g.time-g.finish.started;if(elapsed>1.1&&!g.finish.cupSound){emitSound(g,'cup');g.finish.cupSound=true}const t=Math.min(1,elapsed/.5),smooth=t*t*(3-2*t);b.x=g.finish.x+(miniCup(g).x-g.finish.x)*smooth;b.z=g.finish.z+(miniCup(g).z-g.finish.z)*smooth;const drop=Math.max(0,Math.min(1,(elapsed-.35)/.95));b.y=.3-1.25*drop*drop;if(elapsed>=1.5){g.mode='holed';emitSound(g,g.strokes-g.par>=2?'sad-finish':g.strokes>g.par?'bogey-finish':'win');if(g.strokes===g.par-2)emitSound(g,'eagle');else if(g.strokes===g.par-1)emitSound(g,'birdie');g.message='Hole complete!';g.celebrationStarted=g.time}return}if(['flight','rolling'].includes(g.mode)&&g.time-(g.trailTime??0)>.035){g.trail??=[];g.trail.push([b.x,b.y+.03,b.z]);if(g.trail.length>240)g.trail.shift();g.trailTime=g.time}if(g.mini){stepMini(g,dt);return}if(!['flight','rolling'].includes(g.mode))return;
 const previous={x:b.x,z:b.z};b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;if(lie(b.x,b.z,g.hole)==='OB'){penalty(g,'Out of bounds');return}b.vy-=9.81*dt;if(g.mode==='flight'){const wind=windAcceleration(g.wind,g.time);b.vx+=wind.x*dt;b.vz+=wind.z*dt;b.vx+=g.spin*(-b.vz)*dt*.025;b.vz+=g.spin*b.vx*dt*.025}
 const ground=height(b.x,b.z,g.hole)+course.ballRadius;if(b.y<=ground){b.y=ground;if(tryFullShotCup(g,previous))return;const surface=lie(b.x,b.z,g.hole);if(surface==='Water'){penalty(g,'Water');return}if(b.vy< -1){emitSound(g,landingSound(surface),Math.min(1,-b.vy/12));b.vy=-b.vy*(surface==='Sand'?.05:.16);b.vx*=.38;b.vz*=.38}else{b.vy=0;if(g.mode!=='rolling')g.rollStarted=g.time;g.mode='rolling';g.message='Ball rolling';const friction=surface==='Sand'?9:surface==='Rough'?7:surface==='Green'?1.8:4.5;const v=Math.hypot(b.vx,b.vz),f=Math.max(0,1-friction*dt/Math.max(v,.01));b.vx*=f;b.vz*=f;if(v>.1){b.vx-=(height(b.x+.1,b.z,g.hole)-height(b.x-.1,b.z,g.hole))/.2*9.81*dt;b.vz-=(height(b.x,b.z+.1,g.hole)-height(b.x,b.z-.1,g.hole))/.2*9.81*dt}if(v<.18){g.settle+=dt;if(g.settle>.35){b.vx=b.vz=0;g.lie=surface;g.mode='ready';alignToPin(g);g.message=surface+' · ready for your next shot';if(surface==='Green'){g.mode='green-arrival';g.greenRevealAt=g.time+.9;g.message='Ball settled on the green · revealing the putting hole…'}}}else g.settle=0}}
}
export function stepMini(g,dt){const b=g.ball,r=mini.radius;if(g.mode==='holed')return;const wasReady=g.mode==='ready',address={x:b.x,z:b.z,angle:g.angle};b.x+=b.vx*dt;b.z+=b.vz*dt;
 for(const axis of ['x','z']){const limit=(axis==='x'?mini.halfX:mini.halfZ)-r;if(Math.abs(b[axis])>limit){b[axis]=Math.sign(b[axis])*limit;contactSound(g,Math.abs(b['v'+axis]));b['v'+axis]*=-.82}}
 if(g.hole!==2){const hit=cornerContact(b.x,b.z,r);if(hit){b.x=hit.x;b.z=hit.z;const vn=b.vx*hit.nx+b.vz*hit.nz;if(vn>0){contactSound(g,vn);b.vx-=1.82*vn*hit.nx;b.vz-=1.82*vn*hit.nz}}}
 // A side pool is a real hazard, with the same boundary used by its visible mesh.
 if(inPond(b.x,b.z,g.hole===3?grottoPool:g.hole===2?bridgeGreen.pond:ponds.green)&&!(g.hole===2&&onBridge(b.x,b.z))&&g.origin){penalty(g,'Water');return}
 for(const o of (gardenObstacles[g.hole]??[])){const dx=b.x-o.x,dz=b.z-o.z,d=Math.hypot(dx,dz),rr=o.r+r;if(d<rr){const nx=dx/(d||1),nz=dz/(d||1);b.x=o.x+nx*rr;b.z=o.z+nz*rr;const vn=b.vx*nx+b.vz*nz;if(vn<0){contactSound(g,-vn);b.vx-=1.8*vn*nx;b.vz-=1.8*vn*nz}}}
 for(const s of gardenBanks[g.hole]??[]){const hit=segmentContact(b.x,b.z,s,r);if(hit){b.x=hit.x;b.z=hit.z;const vn=b.vx*hit.nx+b.vz*hit.nz;if(vn<0){contactSound(g,-vn);b.vx-=1.8*vn*hit.nx;b.vz-=1.8*vn*hit.nz}}}
 // Sphere against the same rotating vertical blade boxes drawn by the windmill.
 for(const blade of (g.hole===1?bladeTransforms(g.time):[])){
  const co=Math.cos(blade.angle),si=Math.sin(blade.angle),rx=b.x-blade.x,ry=b.y-blade.y,rz=b.z-blade.z;
  const u=rx*co+ry*si,v=-rx*si+ry*co;
  const cu=Math.max(-blade.radius,Math.min(blade.radius,u)),cv=Math.max(-blade.width,Math.min(blade.width,v)),cw=Math.max(-blade.depth,Math.min(blade.depth,rz));
  const du=u-cu,dv=v-cv,dw=rz-cw,d=Math.hypot(du,dv,dw);
  if(d<r){
   let nx=du*co-dv*si,nz=dw;const horizontal=Math.hypot(nx,nz);
   if(horizontal>.00001){nx/=horizontal;nz/=horizontal}else{nx=0;nz=rz>=0?1:-1}
   const penetration=r-d+.01;b.x+=nx*penetration;b.z+=nz*penetration;
   const bladeVx=-(cu*si+cv*co)*blade.speed,vn=(b.vx-bladeVx)*nx+b.vz*nz;
   if(vn<0){contactSound(g,-vn);b.vx-=1.5*vn*nx;b.vz-=1.5*vn*nz}
   g.mode='rolling';
  }
 }
 if(g.hole===2){
  if(Math.abs(b.z)<4.6&&Math.abs(b.x)>bridgeGreen.halfWidth-mini.radius&&Math.abs(b.x)<bridgeGreen.halfWidth+.35){b.x=Math.sign(b.x)*(bridgeGreen.halfWidth-mini.radius);b.vx*=-.7;contactSound(g,Math.abs(b.vx))}
  b.vz-=bridgeSlopeZ(b.x,b.z)*32.2*dt;b.y=bridgeHeight(b.x,b.z)+mini.radius;
 }
 const speed=Math.hypot(b.vx,b.vz),f=Math.max(0,1-mini.friction*dt/Math.max(speed,.001));b.vx*=f;b.vz*=f;
 if(g.putts>0&&g.strokes>0&&Math.hypot(b.x-miniCup(g).x,b.z-miniCup(g).z)<.55&&speed<3){g.mode='sinking';g.finish={x:b.x,z:b.z,started:g.time};g.message='In the cup…';b.vx=b.vz=0;return}
 if(speed<.08&&!(g.hole===2&&Math.abs(bridgeSlopeZ(b.x,b.z))*32.2>mini.friction)){b.vx=b.vz=0;if(g.mode==='rolling'){g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-b.x,b.z-miniCup(g).z);g.message='Pull back from the ball, then release to putt.'}g.mode='ready'}else{if(wasReady&&!g.puttCameraAnchor)g.puttCameraAnchor=address;g.mode='rolling'};
}

export function playbackRate(g){if(g.mini||g.mode!=='rolling')return 1;const t=g.time-(g.rollStarted??g.time),u=Math.max(0,Math.min(1,(t-1.5)/4.5));return 1+1.5*u*u*(3-2*u)}

export function alignToPin(g){g.freeCamera=false;g.cameraGesture=false;const c=getCourse(g.hole),pin=pinFor(g,c);g.angle=Math.atan2(pin.x-g.ball.x,g.ball.z-pin.z);g.target=null}

export function landingSound(surface){return surface==='Sand'?'land-sand':surface==='Rough'?'land-rough':surface==='Green'?'land-green':'land-fairway'}

// A regulation-size cup captures only a slow grounded shot crossing its centre.
// The generous miniature cup and approach mapping never decide a full-shot hole-out.
export function tryFullShotCup(g,previous=g.ball){const b=g.ball,c=getCourse(g.hole),pin=pinFor(g,c);if(g.mini||g.strokes<1||!g.history.some(h=>h.type==='shot')||lie(b.x,b.z,g.hole)!=='Green'||Math.hypot(b.vx,b.vz)>1.8||Math.abs(b.vy)>1.8||b.y>height(b.x,b.z,g.hole)+c.ballRadius+.02)return false;const dx=b.x-previous.x,dz=b.z-previous.z,t=Math.max(0,Math.min(1,((pin.x-previous.x)*dx+(pin.z-previous.z)*dz)/(dx*dx+dz*dz||1))),distance=Math.hypot(previous.x+dx*t-pin.x,previous.z+dz*t-pin.z);if(distance>.054)return false;g.holeOut={x:pin.x,z:pin.z,club:g.club};g.mini=true;g.trail=[];b.x=miniCup(g).x;b.z=miniCup(g).z;b.y=mini.radius;b.vx=b.vy=b.vz=0;g.mode='sinking';g.finish={x:b.x,z:b.z,started:g.time};g.message='Holed from the course!';return true}
