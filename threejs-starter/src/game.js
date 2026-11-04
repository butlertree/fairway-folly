import {courseWoodland} from './course-woodland.js';
import {strategicTrees,treeContact} from './hole-nine-trees.js';
import {heightNew,fairwayFraction} from './new-holes.js';
import {bunkerLaunch} from './bunker-launch.js';
import {approachStart,clearApproachStart} from './approach-start.js';
import {miniHeight,miniSlope,miniPool,onCrossing,crossingContact} from './mini-surfaces.js';
import {flagstick,flagstickContact,reflectFlagstick} from './flagstick.js';
import {HOLE_COUNT,newHoles} from './new-holes.js';
import {movingGreenGates} from './expansion-greens.js';
import {miniCup,pinFor} from './cups.js';
import {gardenObstacles,gardenBanks,segmentContact} from './green-features.js';
import {windAcceleration} from './wind.js';
import {bankBall} from './mini-boundary.js';
import {clubSound} from './audio-design.js';
import {course,height,lie,ponds,inPond,METRES_PER_YARD,getCourse} from './course.js';
export {course,height,lie,ponds,inPond,METRES_PER_YARD,pondOutline,pondRadius,waterLevel,yardsToPin,riverWidth,getCourse} from './course.js';
const forestNine=courseWoodland(9);
export const DT=1/120;
export const swingTiming={powerRise:1.05,accuracyHalfSweep:.95};
export function swingMeter(phase,seconds){return phase==='power'?1-Math.abs((seconds/swingTiming.powerRise)%2-1):-Math.cos(seconds*Math.PI/swingTiming.accuracyHalfSweep)}
export function canTapIn(g){const d=Math.hypot(g.ball.x-miniCup(g).x,g.ball.z-miniCup(g).z);return g.mini&&g.mode==='ready'&&d>.05&&d<=8&&Array.from({length:25},(_,i)=>{const t=i/24;const x=g.ball.x*(1-t),z=g.ball.z*(1-t),s=miniSlope(g.hole,x,z),cross=Math.abs(s.x*g.ball.z-s.z*g.ball.x)/d;return clearApproachStart(g.hole,x,z)&&cross<.01}).every(Boolean)}
export function tapIn(g){if(!canTapIn(g))return false;const dx=miniCup(g).x-g.ball.x,dz=miniCup(g).z-g.ball.z,d=Math.hypot(dx,dz),speed=Math.sqrt(Math.max(0,2*mini.friction*Math.max(0,d-.2)+2*32.2*(miniHeight(g.hole,miniCup(g).x,miniCup(g).z)-miniHeight(g.hole,g.ball.x,g.ball.z))))+.35;const percent=Math.max(1,puttPowerForDistance(speed*speed/(2*mini.friction)));g.puttPower=Math.max(1,Math.round(percent));putt(g,dx,dz,percent);g.message='Tap-in · watch it home';return true}

export const clubs=Object.fromEntries(Object.entries({Driver:{yards:245,loft:.55,zone:.025,sand:.55},Hybrid:{yards:200,loft:.67,zone:.032,sand:.62},'7 iron':{yards:155,loft:.8,zone:.04,sand:.7},Wedge:{yards:95,loft:1.02,zone:.048,sand:.8},'Sand wedge':{yards:55,loft:1.15,bunker:true,zone:.055,sand:.88}}).map(([name,c])=>[name,{...c,carry:c.yards*METRES_PER_YARD}]));
export const accuracyZone=club=>clubs[club].zone;
export function strikeAccuracy(club,value){const zone=accuracyZone(club),m=Math.abs(value);return m<=zone?0:Math.sign(value)*(m-zone)/(1-zone)}
export const mini={feetPerUnit:1,friction:2.2,maxRollFeet:60,halfX:9,halfZ:15,radius:.3,cup:{x:0,z:0},rotor:{x:0,y:3.3,z:7.9,radius:3.75,width:.34,depth:.23,speed:.65}};
export function puttInfo(percent){const distance=mini.maxRollFeet*(Math.max(0,Math.min(100,percent))/100)**1.6;return {distance,speed:Math.sqrt(2*mini.friction*distance)}}
export function puttPowerForDistance(feet){return 100*(Math.max(0,Math.min(mini.maxRollFeet,feet))/mini.maxRollFeet)**(1/1.6)}
export function lieFactor(g){return g.lie==='Sand'?clubs[g.club].sand:g.lie==='Rough'?(clubs[g.club].bunker?.94:.88):1}
export function carryYards(g,power=1){if(g.lie==='Sand'&&g.club==='Sand wedge'){const c=clubs[g.club],v=Math.sqrt(c.carry*9.81/Math.sin(2*c.loft))*Math.sqrt(Math.max(0,Math.min(1,power)))*lieFactor(g),plan=bunkerLaunch(g,v*Math.cos(c.loft),v*Math.sin(c.loft),g.angle??0,power);return 2*plan.horizontal*plan.vertical/9.81/METRES_PER_YARD}return clubs[g.club].yards*Math.max(0,Math.min(1,power))*lieFactor(g)**2}
export function emitSound(g,type,strength=1){g.soundEvents??=[];g.soundSeq=(g.soundSeq??0)+1;g.soundEvents.push({id:g.soundSeq,type,strength});if(g.soundEvents.length>24)g.soundEvents.shift()}
function contactSound(g,strength){if(strength>.3&&g.time-(g.lastContactSound??-1)>.15){emitSound(g,'bank',Math.min(1,strength/10));g.lastContactSound=g.time}}
export function bladeTransforms(time){return [0,Math.PI/2].map(offset=>({...mini.rotor,angle:time*mini.rotor.speed+offset}))}
export function createGame(hole=1,scorecard=[]){const c=getCourse(hole);return {hole,par:c.par,scorecard,greenRevision:2,mode:'ready',mini:false,ball:{x:0,y:height(0,c.tee.z,hole)+.18+c.ballRadius,z:c.tee.z,vx:0,vy:0,vz:0},strokes:0,putts:0,angle:0,time:0,club:c.par===3?(c.yards>=185?'Hybrid':'7 iron'):'Driver',puttPower:50,power:0,accuracy:0,message:newHoles[hole]?.hint??(hole===3?'Kingfisher Cove · a 165-yard carry to the island. Take enough club; water guards the front and sides.':hole===2?'Lay up left for three safe shots, or carry the lake to the narrow island for a risky two-shot route.':'Carry the pond or lay up left. Choose a club, aim, then start your swing.'),history:[],lie:'Tee box',settle:0,drop:0,trail:[],soundEvents:[],soundSeq:0}}
export function swing(g,power,accuracy){if(g.mode!=='ready'||g.mini)return;power=Math.max(0,Math.min(1,power));accuracy=Math.max(-1,Math.min(1,accuracy));const rawAccuracy=accuracy;accuracy=strikeAccuracy(g.club,accuracy);g.freeCamera=false;g.cameraGesture=false;g.origin={...g.ball};g.strokes++;g.history.push({type:'shot',origin:{...g.ball},power,accuracy:rawAccuracy,club:g.club});const c=clubs[g.club],loft=c.loft,speed=Math.sqrt(c.carry*9.81/Math.sin(2*loft))*Math.sqrt(Math.max(0,power))*lieFactor(g),a=g.angle+accuracy*.06,launch=bunkerLaunch(g,speed*Math.cos(loft),speed*Math.sin(loft),a,power);Object.assign(g.ball,{vx:Math.sin(a)*launch.horizontal,vy:launch.vertical,vz:-Math.cos(a)*launch.horizontal});g.spin=accuracy*Math.abs(accuracy)*2;g.trail=[[g.ball.x,g.ball.y,g.ball.z]];g.trailTime=g.time;emitSound(g,clubSound(g.club,power),Math.max(.25,Math.sqrt(power)));g.mode='flight';g.rollStarted=null;g.settle=0;g.message='Ball in flight'}
export function putt(g,dx,dz,percent){if(!g.mini||g.mode!=='ready'||Math.hypot(dx,dz)<.001||(percent!==undefined&&percent<1))return;if(!g.pull||!g.puttCameraAnchor)g.puttCameraAnchor={x:g.ball.x,z:g.ball.z,angle:g.angle};g.origin={...g.ball};g.strokes++;g.putts++;g.history.push({type:'putt',origin:{...g.ball},dx,dz,percent});const l=Math.hypot(dx,dz),s=percent===undefined?Math.min(20,l*1.5):puttInfo(percent).speed;if(l){g.ball.vx=dx/l*s;g.ball.vz=dz/l*s}g.trail=[[g.ball.x,g.ball.y,g.ball.z]];g.trailTime=g.time;emitSound(g,'putt',Math.max(.15,Math.sqrt((percent??50)/100)));g.mode='rolling';g.message='Putting';}
function penalty(g,reason){emitSound(g,reason==='Water'?'splash':'penalty');g.ball={...g.origin,vx:0,vy:0,vz:0};g.strokes++;g.mode='ready';g.message=reason+' · +1 penalty, replay from previous lie';g.settle=0;if(!g.mini)alignForPlay(g);if(g.mini){g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-g.ball.x,g.ball.z-miniCup(g).z)}}
export function nextHole(g){if(g.mode!=='holed'||g.hole>=HOLE_COUNT)return null;return createGame(g.hole+1,[...g.scorecard,{hole:g.hole,par:g.par,strokes:g.strokes}])}
export function enterGreen(g){const b=g.ball,c=getCourse(g.hole),pin=pinFor(g,c),dx=b.x-pin.x,dz=b.z-pin.z;g.approachLanding={x:b.x,z:b.z,distanceYards:Math.hypot(dx,dz)/METRES_PER_YARD};const start=approachStart(g.hole,dx,dz);g.mini=true;Object.assign(b,{x:start.x,z:start.z,y:miniHeight(g.hole,start.x,start.z)+.3,vx:0,vy:0,vz:0});g.approachLanding.puttFeet=start.distanceFeet;g.trail=[];g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-b.x,b.z-miniCup(g).z);g.mode='ready';g.lie='Mini green';g.message=newHoles[g.hole]?.miniHint??(g.hole===3?'Cross the curved bridge or bank around the stream. Close approaches leave a short putt to the central cup.':g.hole===2?'Judge the pace up the terrace. The central cup rewards a close approach.':'Drag back from the ball to putt. Time the mill gate, or bank through the flower garden.');}
export function step(g,dt=DT){if(g.paused)return;g.time+=dt;const b=g.ball;if(g.mode==='holed')return;if(g.mode==='green-arrival'){if(g.time>=g.greenRevealAt)enterGreen(g);return}if(g.mode==='sinking'){const elapsed=g.time-g.finish.started;if(elapsed>.58&&!g.finish.cupSound){emitSound(g,'cup');g.finish.cupSound=true}const t=Math.min(1,elapsed/.5),smooth=t*t*(3-2*t);b.x=g.finish.x+(miniCup(g).x-g.finish.x)*smooth;b.z=g.finish.z+(miniCup(g).z-g.finish.z)*smooth;const drop=Math.max(0,Math.min(1,(elapsed-.35)/.95));b.y=miniHeight(g.hole,miniCup(g).x,miniCup(g).z)+.3-1.25*drop*drop;if(elapsed>=1.5){g.mode='holed';emitSound(g,g.strokes-g.par>=2?'sad-finish':g.strokes>g.par?'bogey-finish':'win');if(g.strokes===g.par-2)emitSound(g,'eagle');else if(g.strokes===g.par-1)emitSound(g,'birdie');g.message='Hole complete!';g.celebrationStarted=g.time}return}if(['flight','rolling'].includes(g.mode)&&g.time-(g.trailTime??0)>.035){g.trail??=[];g.trail.push([b.x,b.y+.03,b.z]);if(g.trail.length>240)g.trail.shift();g.trailTime=g.time}if(g.mini){stepMini(g,dt);return}if(!['flight','rolling'].includes(g.mode))return;
 const previous={x:b.x,y:b.y,z:b.z};b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;if(lie(b.x,b.z,g.hole)==='OB'){penalty(g,'Out of bounds');return}b.vy-=9.81*dt;if(g.mode==='flight'){const wind=windAcceleration(g.wind,g.time);b.vx+=wind.x*dt;b.vz+=wind.z*dt;const turn=g.spin*.095*dt,vx=b.vx,vz=b.vz;b.vx=vx*Math.cos(turn)-vz*Math.sin(turn);b.vz=vx*Math.sin(turn)+vz*Math.cos(turn);g.spin*=Math.exp(-dt*.045)}
 resolveCourseFlagstick(g,previous,dt);
 if(g.hole>=1){const hit=treeContact(previous,b,g.hole===9?forestNine:courseWoodland(g.hole),course.ballRadius);if(hit){Object.assign(b,{x:hit.point.x+hit.n.x*.02,y:hit.point.y+hit.n.y*.02,z:hit.point.z+hit.n.z*.02});const vn=b.vx*hit.n.x+b.vy*hit.n.y+b.vz*hit.n.z;if(vn<0){b.vx=(b.vx-1.2*vn*hit.n.x)*.6;b.vy=(b.vy-1.2*vn*hit.n.y)*.6;b.vz=(b.vz-1.2*vn*hit.n.z)*.6;g.treeHits=(g.treeHits??0)+1;if(g.time-(g.lastTreeSound??-1)>.2){emitSound(g,'land-rough',.6);g.lastTreeSound=g.time}}}}
 const ground=height(b.x,b.z,g.hole)+course.ballRadius;if(b.y<=ground){b.y=ground;if(tryFullShotCup(g,previous))return;const surface=lie(b.x,b.z,g.hole);if(surface==='Water'){penalty(g,'Water');return}if(b.vy< -1){emitSound(g,landingSound(surface),Math.min(1,-b.vy/12));b.vy=-b.vy*(surface==='Sand'?.05:.16);b.vx*=.38;b.vz*=.38}else{b.vy=0;if(g.mode!=='rolling')g.rollStarted=g.time;g.mode='rolling';g.message='Ball rolling';const friction=surface==='Sand'?9:surface==='Rough'?7:surface==='Green'?1.8:4.5;const v=Math.hypot(b.vx,b.vz),f=Math.max(0,1-friction*dt/Math.max(v,.01));b.vx*=f;b.vz*=f;if(v>.1){b.vx-=(height(b.x+.1,b.z,g.hole)-height(b.x-.1,b.z,g.hole))/.2*9.81*dt;b.vz-=(height(b.x,b.z+.1,g.hole)-height(b.x,b.z-.1,g.hole))/.2*9.81*dt}if(v<.18){g.settle+=dt;if(g.settle>.35){b.vx=b.vz=0;g.lie=surface;g.mode='ready';if(surface==='Sand')g.club='Sand wedge';alignForPlay(g);g.message=surface+' · ready for your next shot';if(surface==='Green'){g.mode='green-arrival';g.greenRevealAt=g.time+.9;g.message='Ball settled on the green · revealing the putting hole…'}}}else g.settle=0}}
}
export function stepMini(g,dt){const b=g.ball,r=mini.radius;if(g.mode==='holed')return;const wasReady=g.mode==='ready',address={x:b.x,z:b.z,angle:g.angle};b.x+=b.vx*dt;b.z+=b.vz*dt;
 const bankImpact=bankBall(g.hole,b,r);if(bankImpact>.3)contactSound(g,bankImpact);
 for(const o of (gardenObstacles[g.hole]??[])){const dx=b.x-o.x,dz=b.z-o.z,d=Math.hypot(dx,dz),rr=o.r+r;if(d<rr){const nx=d>1e-8?dx/d:Math.cos(Math.atan2(-b.vz,-b.vx)),nz=d>1e-8?dz/d:Math.sin(Math.atan2(-b.vz,-b.vx));b.x=o.x+nx*rr;b.z=o.z+nz*rr;const vn=b.vx*nx+b.vz*nz;if(vn<0){contactSound(g,-vn);b.vx-=1.8*vn*nx;b.vz-=1.8*vn*nz}}}
 for(const s of gardenBanks[g.hole]??[]){const hit=segmentContact(b.x,b.z,s,r);if(hit){b.x=hit.x;b.z=hit.z;const vn=b.vx*hit.nx+b.vz*hit.nz;if(vn<0){contactSound(g,-vn);b.vx-=1.8*vn*hit.nx;b.vz-=1.8*vn*hit.nz}}}
 // Low turning gates use the same endpoints and angular velocity as their rendered models.
 for(const gate of movingGreenGates(g.hole,g.time)){const hit=segmentContact(b.x,b.z,gate,r);if(hit){b.x=hit.x;b.z=hit.z;const ux=-gate.speed*(b.z-gate.z),uz=gate.speed*(b.x-gate.x),vn=(b.vx-ux)*hit.nx+(b.vz-uz)*hit.nz;if(vn<0){contactSound(g,-vn);b.vx-=1.65*vn*hit.nx;b.vz-=1.65*vn*hit.nz}}}
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
 if(g.hole===3){const impact=crossingContact(b,address,r);if(impact>.3)contactSound(g,impact)}
 const slope=miniSlope(g.hole,b.x,b.z),gravity=Math.hypot(slope.x,slope.z)*32.2;
 if(Math.hypot(b.vx,b.vz)>.08||!wasReady){b.vx-=slope.x*32.2*dt;b.vz-=slope.z*32.2*dt}
 b.y=miniHeight(g.hole,b.x,b.z)+r;
 const finalBankImpact=bankBall(g.hole,b,r);if(finalBankImpact>.3)contactSound(g,finalBankImpact);
 // A side pool is a real hazard, with the same boundary used by its visible mesh.
 if(inPond(b.x,b.z,miniPool(g.hole))&&!(g.hole===3&&onCrossing(b.x,b.z))&&g.origin){penalty(g,'Water');return}
 const speed=Math.hypot(b.vx,b.vz),f=Math.max(0,1-mini.friction*dt/Math.max(speed,.001));b.vx*=f;b.vz*=f;
 if(g.putts>0&&g.strokes>0&&Math.hypot(b.x-miniCup(g).x,b.z-miniCup(g).z)<.55&&speed<3){g.mode='sinking';g.finish={x:b.x,z:b.z,started:g.time};g.message='In the cup…';b.vx=b.vz=0;return}
 if(speed<.08&&(wasReady||gravity<=mini.friction)){b.vx=b.vz=0;if(g.mode==='rolling'){g.puttCameraAnchor=null;g.angle=Math.atan2(miniCup(g).x-b.x,b.z-miniCup(g).z);g.message='Pull back from the ball, then release to putt.'}g.mode='ready'}else{if(wasReady&&!g.puttCameraAnchor)g.puttCameraAnchor=address;g.mode='rolling'};
}

export function playbackRate(g){if(g.mini||g.mode!=='rolling')return 1;const t=g.time-(g.rollStarted??g.time),u=Math.max(0,Math.min(1,(t-1.5)/4.5));return 1+1.5*u*u*(3-2*u)}

export function alignForPlay(g){alignToPin(g);if(g.hole!==9||g.mini)return;const c=getCourse(9),b=g.ball,d=Math.hypot(c.pin.x-b.x,c.pin.z-b.z);if(d<150)return;const p=c.landingSites.find(p=>Math.hypot(p.x-b.x,p.z-b.z)>45&&Math.hypot(c.pin.x-p.x,c.pin.z-p.z)<d-60);if(p){g.angle=Math.atan2(p.x-b.x,b.z-p.z);g.target={x:p.x,z:p.z}}}
export function alignToPin(g){g.freeCamera=false;g.cameraGesture=false;const c=getCourse(g.hole),pin=pinFor(g,c);g.angle=Math.atan2(pin.x-g.ball.x,g.ball.z-pin.z);g.target=null}

export function landingSound(surface){return surface==='Sand'?'land-sand':surface==='Rough'?'land-rough':surface==='Green'?'land-green':'land-fairway'}

// A regulation-size cup captures only a slow grounded shot crossing its centre.
// The generous miniature cup and approach mapping never decide a full-shot hole-out.
export function tryFullShotCup(g,previous=g.ball){const b=g.ball,c=getCourse(g.hole),pin=pinFor(g,c);if(g.mini||g.strokes<1||!g.history.some(h=>h.type==='shot')||lie(b.x,b.z,g.hole)!=='Green'||Math.hypot(b.vx,b.vz)>1.8||Math.abs(b.vy)>1.8||b.y>height(b.x,b.z,g.hole)+c.ballRadius+.02)return false;const dx=b.x-previous.x,dz=b.z-previous.z,t=Math.max(0,Math.min(1,((pin.x-previous.x)*dx+(pin.z-previous.z)*dz)/(dx*dx+dz*dz||1))),distance=Math.hypot(previous.x+dx*t-pin.x,previous.z+dz*t-pin.z);if(distance>.054)return false;g.holeOut={x:pin.x,z:pin.z,club:g.club};g.mini=true;g.trail=[];b.x=miniCup(g).x;b.z=miniCup(g).z;b.y=miniHeight(g.hole,b.x,b.z)+mini.radius;b.vx=b.vy=b.vz=0;g.mode='sinking';g.finish={x:b.x,z:b.z,started:g.time};g.message='Holed from the course!';return true}

export function resolveCourseFlagstick(g,previous,dt=DT){if(g.mini||g.strokes<1||!['flight','rolling'].includes(g.mode))return false;const c=getCourse(g.hole),pin=pinFor(g,c),base=height(pin.x,pin.z,g.hole)+flagstick.baseOffset,b=g.ball;
 // Slow grounded balls can drop through the cup with the pin in; the existing honest cup test decides capture.
 if(Math.hypot(b.vx,b.vz)<=1.8&&Math.abs(b.vy)<=1.8&&b.y<=base+c.ballRadius+.05)return false;
 const contact=flagstickContact(previous,b,pin,base,c.ballRadius);if(!contact)return false;const impact=reflectFlagstick(b,contact,dt);if(!impact)return false;g.spin=(g.spin??0)*.3;g.pinHitAt=g.time;if(g.time-(g.lastPinSound??-10)>.1){emitSound(g,'flagstick',Math.min(1,impact/15));g.lastPinSound=g.time}return true}
