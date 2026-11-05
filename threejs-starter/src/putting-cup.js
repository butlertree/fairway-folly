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
  if(!glancing)return speed<3?{type:'drop'}:null;
  if(entry<0)return null; // The lip is evaluated once, as the ball crosses inward.

  const edgeFraction=(offset-centerLane)/(puttingCupRadius-centerLane);  if(speed<3-.55*edgeFraction)return {type:'lip-in',ux,uz};

  const contactX=previous.x+entry*ux,contactZ=previous.z+entry*uz;
  const nx=(contactX-cup.x)/puttingCupRadius,nz=(contactZ-cup.z)/puttingCupRadius;
  const tangent=ux*(-nz)+uz*nx;
  const slide=speed*.7*tangent,escape=Math.max(.14,speed*.10);
  return {
    type:'lip-out',
    x:contactX+nx*.003,z:contactZ+nz*.003,
    vx:-nz*slide+nx*escape,vz:nx*slide+nz*escape
  };
}
