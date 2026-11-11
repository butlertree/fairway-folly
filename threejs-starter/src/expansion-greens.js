const crescent=(start)=>Array.from({length:14},(_,i)=>{const a=start+i/14*Math.PI*.65,b=start+(i+1)/14*Math.PI*.65;return {ax:(4.8+i/14*2.3)*Math.cos(a),az:(4.8+i/14*2.3)*Math.sin(a),bx:(4.8+(i+1)/14*2.3)*Math.cos(b),bz:(4.8+(i+1)/14*2.3)*Math.sin(b),r:.29}});
// Low, visible collision geometry shared by rendering and the mini-golf simulation.
export const expansionBanks={
7:[{ax:-4.8,az:5,bx:-3.8,bz:4,r:.32},{ax:4,az:-4,bx:4.8,bz:-5,r:.32}],
8:[{ax:-5,az:3,bx:-4,bz:3,r:.35},{ax:4,az:-3,bx:5,bz:-4,r:.35}],
9:[...crescent(.12),...crescent(Math.PI+.12)],
4:[{ax:-4.8,az:5,bx:-4.5,bz:3.2,r:.32},{ax:-4.5,az:3.2,bx:-4.8,bz:-.8,r:.32},{ax:3.8,az:-4,bx:5.4,bz:-6.2,r:.32}],
5:[{ax:-6.2,az:6.5,bx:-6.2,bz:3.3,r:.32},{ax:6.4,az:-2,bx:6.4,bz:-6,r:.32}]
};
export const expansionObstacles={6:[{x:-7.4,z:4.8,r:.92},{x:-5.8,z:1.4,r:1.12}],16:[{x:-7.1,z:6.4,r:1.18},{x:7.7,z:2.4,r:1.05},{x:-5.3,z:-7.9,r:.92},{x:6.8,z:-8.8,r:1.15}],7:[{x:4.8,z:7,r:.8}],8:[{x:4.8,z:6,r:1},{x:-4.8,z:-6,r:.9}],9:[],4:[{x:-5.6,z:-5.8,r:.8}],5:[{x:6.5,z:10.5,r:.85},{x:-5.7,z:-10.5,r:.8}]};
[expansionBanks[7],expansionBanks[8]]=[expansionBanks[8],expansionBanks[7]];
[expansionObstacles[7],expansionObstacles[8]]=[expansionObstacles[8],expansionObstacles[7]];
export function movingGreenGates(hole,time){const configs=hole===4?[{x:0,z:-7,length:2.3,angle:Math.sin(time*.65)*.8,speed:Math.cos(time*.65)*.52}]:hole===9?[{x:0,z:-10,length:1.8,angle:Math.sin(time*.38)*.7,speed:Math.cos(time*.38)*.266}]:hole===5?[{x:-2.8,z:10,length:1.5,angle:time*.45,speed:.45},{x:2.8,z:-10,length:1.5,angle:-time*.38+.8,speed:-.38}]:[];return configs.map(g=>({...g,ax:g.x-Math.cos(g.angle)*g.length,az:g.z-Math.sin(g.angle)*g.length,bx:g.x+Math.cos(g.angle)*g.length,bz:g.z+Math.sin(g.angle)*g.length,r:.18}))}
