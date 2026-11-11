// Use the same opening radius as the putting turf and cup liner.
export const puttingCupRadius=.55;
const centerLane=.36;

export function puttingCupContact(previous,ball,cup,speed){
  const dx=ball.x-previous.x,dz=ball.z-previous.z,length=Math.hypot(dx,dz);
  if(length<1e-8)return null;
  const ux=dx/length,uz=dz/length,x=previous.x-cup.x,z=previous.z-cup.z;
  const along=x*ux+z*uz,offset=Math.abs(x*uz-z*ux);
  if(along>=0||offset>=puttingCupRadius)return null;

  const entry=-along-Math.sqrt(puttingCupRadius**2-offset**2);
  if(entry>length)return null;
  const glancing=offset>centerLane;
  if(!glancing){
    if(speed<3)return {type:'drop'};
    if(entry<0)return null;
    return {type:'hop',x:previous.x+entry*ux,z:previous.z+entry*uz};
  }
  if(entry<0)return null; // The lip is evaluated once, as the ball crosses inward.

  const edgeFraction=(offset-centerLane)/(puttingCupRadius-centerLane);
  const contactX=previous.x+entry*ux,contactZ=previous.z+entry*uz;
  const nx=(contactX-cup.x)/puttingCupRadius,nz=(contactZ-cup.z)/puttingCupRadius;
  const tangent=ux*(-nz)+uz*nx;
  if(speed<3-.55*edgeFraction){
    const turn=Math.sign(tangent);
    return {type:'lip-in',ux:-nz*turn,uz:nx*turn};
  }
  return {
    type:'lip-out',
    angle:Math.atan2(nz,nx),
    turn:Math.sign(tangent),
    sweep:.55+.6*(1-edgeFraction),
    speed:speed*(.55+.2*Math.abs(tangent))
  };
}

export function rollCupLip(ball,cup,lip,dt){
  lip.angle+=lip.turn*Math.min(lip.sweep,lip.speed*dt/puttingCupRadius);
  lip.sweep-=lip.speed*dt/puttingCupRadius;
  const nx=Math.cos(lip.angle),nz=Math.sin(lip.angle);
  ball.x=cup.x+nx*(puttingCupRadius+.004);
  ball.z=cup.z+nz*(puttingCupRadius+.004);
  ball.vx=-nz*lip.turn*lip.speed;
  ball.vz=nx*lip.turn*lip.speed;
  return lip.sweep<=0;
}
