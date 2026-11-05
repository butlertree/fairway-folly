import {Vector3} from 'three';
import {greenOutline} from './mini-boundary.js';
import {puttingAim} from './aim.js';
import {miniCup} from './cups.js';
import {miniHeight} from './mini-surfaces.js';
import {putt,mini,puttInfo} from './game.js';

export function pullback(start,end,angle){
  const pixels=Math.hypot(end.sx-start.sx,end.sy-start.sy);
  let x=start.x-end.x,z=start.z-end.z;
  if(Math.hypot(x,z)<.001){x=Math.sin(angle);z=-Math.cos(angle)}
  return {x,z,percent:Math.min(100,pixels/1.6)};
}
export function releasePutt(game,pull){
  game.pull=null;
  if(game.mode!=='ready'||!game.mini||!pull||pull.percent<2){if(game.mode==='ready')game.puttCameraAnchor=null;return false}
  game.angle=Math.atan2(pull.x,-pull.z);
  game.puttPower=Math.round(pull.percent*2)/2;
  const before=game.strokes;
  // The address camera stays where the gesture began, even for an angled putt.
  game.pull=pull;
  putt(game,pull.x,pull.z,pull.percent);
  game.pull=null;
  return game.strokes===before+1;
}
export function puttingCameraPose(game,aspect=16/9){
  if(game.pull&&game.puttCameraAnchor?.view){
    return framePullback(game,game.puttCameraAnchor.view,aspect);
  }
  const b=((game.pull||game.mode==='rolling')?game.puttCameraAnchor:null)??{x:game.ball.x,z:game.ball.z,angle:game.angle};
  if(game.mode==='rolling'&&puttInfo(game.history?.at(-1)?.percent??game.puttPower).distance>6){const angle=b.angle,target=[0,.5,0],position=[-Math.sin(angle)*18,23,Math.cos(angle)*18],points=greenOutline(game.hole).map(p=>[p.x,miniHeight(game.hole,p.x,p.z)+.6,p.z]);points.push([game.ball.x,game.ball.y,game.ball.z]);return {position:fitPuttingPoints(position,target,points,aspect),target}}
  const distance=Math.hypot(b.x-miniCup(game).x,b.z-miniCup(game).z),back=Math.max(5,Math.min(12,distance*.55)),ahead=Math.min(3,distance*.4),dx=Math.sin(b.angle),dz=-Math.cos(b.angle);
  let position=[b.x-dx*back,4.5+back*.15,b.z-dz*back];
  const y=miniHeight(game.hole,b.x,b.z);position[1]+=y;
  if(game.hole!==1)return frameAddress(game,{position,target:[b.x+dx*ahead,y+.3,b.z+dz*ahead]},aspect);
  const tower={x:0,z:6.5},nearTower=Math.hypot(b.x,b.z-tower.z)<2.2;
  if(nearTower)position[1]=1.8; // Look through the arch instead of down through its roof.
  else {
    const blocked=p=>{const vx=b.x-p[0],vz=b.z-p[2],t=Math.max(0,Math.min(1,((tower.x-p[0])*vx+(tower.z-p[2])*vz)/(vx*vx+vz*vz)));return Math.hypot(p[0]+t*vx-tower.x,p[2]+t*vz-tower.z)<2.15};
    const side=b.x>=0?1:-1;
    for(let i=1;i<=3&&blocked(position);i++)position=[b.x-dx*back-dz*4*i*side,position[1],b.z-dz*back+dx*4*i*side];
  }
  return frameAddress(game,{position,target:[b.x+dx*ahead,y+.3,b.z+dz*ahead]},aspect);
}

// Model's grooved striking face is local -Z; it must face the ball at every aim angle.
export function putterPose(game){const b=game.ball;let dx=game.pull?.x??Math.sin(game.angle),dz=game.pull?.z??-Math.cos(game.angle),n=Math.hypot(dx,dz);if(n<.001){dx=Math.sin(game.angle);dz=-Math.cos(game.angle);n=1}dx/=n;dz/=n;const back=.48+(game.pull?.percent??0)/100*1.4;return {position:[b.x-dx*back,miniHeight(game.hole,b.x,b.z)+.16,b.z-dz*back],rotation:-Math.atan2(dx,-dz)}}

// Fit around the chosen shot heading; the camera never rotates to chase a rebound.
export function fitPuttingPoints(position,target,points,aspect=16/9,fov=45,margin=.76){const center=new Vector3(...target),offset=new Vector3(...position).sub(center),distance=offset.length(),direction=offset.normalize(),right=new Vector3(direction.z,0,-direction.x).normalize(),up=new Vector3().crossVectors(direction,right),tan=Math.tan(fov*Math.PI/360);let needed=distance;for(const point of points){const p=new Vector3(...point).sub(center),depth=p.dot(direction);needed=Math.max(needed,depth+Math.abs(p.dot(right))/(tan*Math.max(.2,aspect)*margin),depth+Math.abs(p.dot(up))/(tan*margin))}return center.addScaledVector(direction,needed).toArray()}
function frameAddress(g,pose,aspect){const cup=miniCup(g),points=[[g.ball.x,g.ball.y+.3,g.ball.z]],d=Math.hypot(g.ball.x-cup.x,g.ball.z-cup.z),a=puttingAim(g),toward=Math.atan2(cup.x-g.ball.x,g.ball.z-cup.z),turn=Math.atan2(Math.sin(g.angle-toward),Math.cos(g.angle-toward));if(Math.abs(turn)<.4)points.push([cup.x,miniHeight(g.hole,cup.x,cup.z)+.3,cup.z]);if(g.pull||d>8||Math.abs(turn)>.25)points.push([a.x,a.y,a.z]);const target=[(Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2,.3,(Math.min(...points.map(p=>p[2]))+Math.max(...points.map(p=>p[2])))/2],offset=new Vector3(...pose.position).sub(new Vector3(...pose.target)),position=new Vector3(...target).add(offset).toArray();const framed=fitPuttingPoints(position,target,points,aspect);return {target,position:fitPuttingPoints(framed,target,[[g.ball.x,g.ball.y,g.ball.z]],aspect,45,aspect<1?.46:.65)}}
export function framePullback(game,pose,aspect){
  const aim=puttingAim(game), ball=game.ball;
  if(aim.distance<=.35)return pose;
  const points=[[ball.x,ball.y,ball.z],[aim.x,aim.y+.25,aim.z]];
  return {...pose,position:fitPuttingPoints(pose.position,pose.target,points,aspect)};
}
export function keepPuttingBallVisible(position,target,ball,aspect,fov=45){const points=[];for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5])points.push([ball.x+x,ball.y+y,ball.z+z]);return fitPuttingPoints(position,target,points,aspect,fov,.73)}
