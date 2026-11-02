import {edgeShape} from './landscape.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export const holeThree={id:3,par:3,title:'Kingfisher Cove',yards:165,sx:1.8,sz:2,ballRadius:.085,tee:{x:0,z:80},pin:{x:0,z:80-165*.9144},green:{rx:18,rz:16},bounds:{rx:78,rz:115},landRadius:{rx:84,rz:123},waterLevel:64,lake:{x:9,z:-22,rx:58,rz:62}};
export function coveFraction(x,z){const p=holeThree.lake,a=Math.atan2((z-p.z)/p.rz,(x-p.x)/p.rx);return Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz)/(1+.12*Math.sin(a*3+.8)+.06*Math.cos(a*5))}
export function greenFraction(x,z,rx=18,rz=16){const nx=x/rx,nz=(z-holeThree.pin.z)/rz,a=Math.atan2(nz,nx);return Math.hypot(nx,nz)/(1+.1*Math.sin(a*3+.4)+.08*Math.cos(a*2))}
export function greenIslandFraction(x,z){return greenFraction(x,z,27,25)}
export function heightThree(x,z){const c=holeThree;let y=69+2*Math.cos(z/50)+19*Math.exp(-((x+58)**2/240+(z+68)**2/600))+13*Math.exp(-((x-61)**2/250+(z-20)**2/700));const lake=coveFraction(x,z);y+=(63.1-y)*(1-smooth((lake-.95)/.2));const r=greenIslandFraction(x,z);y+=(75-y)*(1-smooth((r-.72)/.38));if(x>55){const channel=1-smooth((Math.abs(z+18)-3.2)/1.5);y+=(63.1-y)*channel*smooth((x-55)/5)}const tee=Math.max(Math.abs(x)/7,Math.abs(z-c.tee.z)/9);y+=(73-y)*(1-smooth((tee-1)/1.2));return y}
export function lieThree(x,z){const c=holeThree;if((x/c.bounds.rx)**2+(z/c.bounds.rz)**2>1)return 'OB';if(Math.abs(x)<6&&Math.abs(z-c.tee.z)<8)return 'Tee box';if(greenFraction(x,z)<1)return 'Green';if(greenIslandFraction(x,z)<.92)return ((x+18)/5)**2+((z-c.pin.z-5)/8)**2<1?'Sand':'Fairway';if(coveFraction(x,z)<1||(x>55&&Math.abs(z+18)<3.2))return 'Water';return Math.abs(x)<20&&z>40?'Fairway':'Rough'}

export const coveOutlet=(()=>{const z=-18;let lo=60,hi=110;for(let i=0;i<40;i++){const x=(lo+hi)/2,a=Math.atan2(z/123,x/84);if(Math.hypot(x/84,z/123)<edgeShape(a))lo=x;else hi=x}return {x:(lo+hi)/2,z,width:6.4}})();
