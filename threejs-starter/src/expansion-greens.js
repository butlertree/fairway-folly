// Low, visible collision geometry shared by rendering and the mini-golf simulation.
export const expansionPools={7:{x:6.6,z:0,rx:1.1,rz:2},8:{x:-7,z:-3,rx:.8,rz:1.5},9:{x:6.5,z:1,rx:1.2,rz:2.2},4:{x:6.4,z:5,rx:1.35,rz:2},5:{x:-6.5,z:-4,rx:1.2,rz:2.3},6:{x:6.3,z:-1.8,rx:1.5,rz:2.6}};
export const expansionBanks={
7:[{ax:-4.8,az:5,bx:-2.4,bz:2,r:.32},{ax:3.2,az:-3,bx:4.8,bz:-5,r:.32}],
8:[{ax:-5,az:3,bx:-2.2,bz:1,r:.35},{ax:2.5,az:-2,bx:5,bz:-4,r:.35}],
9:[{ax:-5.5,az:6,bx:-4.2,bz:3,r:.32}],
4:[{ax:-4.8,az:5,bx:-3.2,bz:2.4,r:.32},{ax:-3.2,az:2.4,bx:-3.4,bz:-.8,r:.32},{ax:3.8,az:-4,bx:5.4,bz:-6.2,r:.32}],
5:[{ax:-5.5,az:8,bx:-5.5,bz:4.8,r:.32},{ax:5.6,az:-1,bx:5.6,bz:-5,r:.32}],
6:[{ax:-4.5,az:4,bx:-1.8,bz:2.2,r:.35},{ax:-1.8,az:2.2,bx:-1.4,bz:-.6,r:.35},{ax:1.8,az:-1.8,bx:4.2,bz:-3.4,r:.35},{ax:4.2,az:-3.4,bx:4.5,bz:-6.2,r:.35}]
};
export const expansionObstacles={7:[{x:4.8,z:7,r:.8}],8:[{x:4.8,z:6,r:1},{x:-4.8,z:-6,r:.9}],9:[{x:-4,z:-6,r:.85}],4:[{x:-5.6,z:-5.8,r:.8}],5:[{x:4.9,z:8.8,r:.85},{x:-4.9,z:-8,r:.8}],6:[{x:-5.5,z:-6.6,r:.8}]};
export function movingGreenGates(hole,time){const configs=hole===4?[{x:0,z:-2,length:2.3,angle:Math.sin(time*.65)*.8,speed:Math.cos(time*.65)*.52}]:hole===9?[{x:0,z:-1,length:2.2,angle:Math.sin(time*.38)*.7,speed:Math.cos(time*.38)*.266}]:hole===5?[{x:-1.9,z:4,length:2,angle:time*.45,speed:.45},{x:1.9,z:-4,length:1.8,angle:-time*.38+.8,speed:-.38}]:[];return configs.map(g=>({...g,ax:g.x-Math.cos(g.angle)*g.length,az:g.z-Math.sin(g.angle)*g.length,bx:g.x+Math.cos(g.angle)*g.length,bz:g.z+Math.sin(g.angle)*g.length,r:.18}))}
