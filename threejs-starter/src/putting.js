import {miniCup} from './cups.js';
import {miniHeight} from './mini-surfaces.js';
import {putt,mini} from './game.js';

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
export function puttingCameraPose(game){
  const b=((game.pull||game.mode==='rolling')?game.puttCameraAnchor:null)??{x:game.ball.x,z:game.ball.z,angle:game.angle};
  const distance=Math.hypot(b.x-miniCup(game).x,b.z-miniCup(game).z),back=Math.max(5,Math.min(12,distance*.55)),ahead=Math.min(3,distance*.4),dx=Math.sin(b.angle),dz=-Math.cos(b.angle);
  let position=[b.x-dx*back,4.5+back*.15,b.z-dz*back];
  const y=miniHeight(game.hole,b.x,b.z);position[1]+=y;
  if(game.hole!==1)return {position,target:[b.x+dx*ahead,y+.3,b.z+dz*ahead]};
  const tower={x:0,z:6.5},nearTower=Math.hypot(b.x,b.z-tower.z)<2.2;
  if(nearTower)position[1]=1.8; // Look through the arch instead of down through its roof.
  else {
    const blocked=p=>{const vx=b.x-p[0],vz=b.z-p[2],t=Math.max(0,Math.min(1,((tower.x-p[0])*vx+(tower.z-p[2])*vz)/(vx*vx+vz*vz)));return Math.hypot(p[0]+t*vx-tower.x,p[2]+t*vz-tower.z)<2.15};
    const side=b.x>=0?1:-1;
    for(let i=1;i<=3&&blocked(position);i++)position=[b.x-dx*back-dz*4*i*side,position[1],b.z-dz*back+dx*4*i*side];
  }
  return {position,target:[b.x+dx*ahead,0,b.z+dz*ahead]};
}

// Model's grooved striking face is local -Z; it must face the ball at every aim angle.
export function putterPose(game){const b=game.ball;let dx=game.pull?.x??Math.sin(game.angle),dz=game.pull?.z??-Math.cos(game.angle),n=Math.hypot(dx,dz);if(n<.001){dx=Math.sin(game.angle);dz=-Math.cos(game.angle);n=1}dx/=n;dz/=n;const back=.48+(game.pull?.percent??0)/100*1.4;return {position:[b.x-dx*back,miniHeight(game.hole,b.x,b.z)+.16,b.z-dz*back],rotation:-Math.atan2(dx,-dz)}}
