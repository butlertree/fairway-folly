// Full-size bunker outlines, bowls and lies share this geometry (metres).
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const bunker=(id,x,z,rx,rz,depth=.8,rotation=0,seed=0,pot=false)=>({id,x,z,rx,rz,depth,rotation,seed,pot});
export const bunkersByHole={
1:[bunker('fairway',15.6,-108.28,5.2,9.5,.85,-.2,.7),bunker('left-drive',-12,25,4.6,8.5,.75,.35,1.8),bunker('green-pot',-19,-146,3.5,4.6,1.8,-.3,2.3,true)],
2:[bunker('green',23,-192,6.8,9,.95,.25,.4),bunker('shelf-pot',-87,105,4.2,6.2,1.9,-.2,1.1,true),bunker('approach',-86,-100,4.2,7,.8,.4,2.4)],
3:[bunker('cove',-22,-66,2.2,3,1.1,0,.8),bunker('back-pot',13,-93,2.2,3,1.9,0,.8,true)],
4:[bunker('corner',-12,-30,8.5,15,.9,-.28,.9),bunker('bluff-pot',-48,-165,4.8,7,2.1,.25,2,true),bunker('right-green',-2,-156,4,6.5,.9,-.4,1.4)],
5:[bunker('drive',-18,26,8.8,14.5,.85,-.35,1.2),bunker('green',49,-220,5.5,10,1,.3,.4),bunker('left-pot',-4,-237,4,5.2,2.15,-.15,1.8,true),bunker('bold-shelf',24,-48,3.5,5.5,1.5,.25,2.6,true)],
6:[bunker('back',-13,-76,6,4,.9,-.3,.8),bunker('right-pot',40,-64,3.8,5.2,2.1,.2,2.1,true),bunker('short-left',-19,-36,4,5.2,.8,.4,1.5)]
};
export function bunkerProfile(angle,p){return 1+.055*Math.sin(angle*3+p.seed)+.035*Math.cos(angle*2-p.seed)}
export function bunkerLocal(x,z,p){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.rotation),s=Math.sin(p.rotation);return {x:(dx*c+dz*s)/p.rx,z:(-dx*s+dz*c)/p.rz}}
export function bunkerFraction(x,z,p){const q=bunkerLocal(x,z,p);return Math.hypot(q.x,q.z)/bunkerProfile(Math.atan2(q.z,q.x),p)}
export function bunkerPoint(p,angle,radius=1){const r=bunkerProfile(angle,p)*radius,x=Math.cos(angle)*r*p.rx,z=Math.sin(angle)*r*p.rz,c=Math.cos(p.rotation),s=Math.sin(p.rotation);return {x:p.x+x*c-z*s,z:p.z+x*s+z*c}}
export function bunkerAt(x,z,hole){return (bunkersByHole[hole]??[]).find(p=>bunkerFraction(x,z,p)<1)}
const floors=new WeakMap();
export function bunkerFloor(p,base){let map=floors.get(base);if(!map){map=new Map();floors.set(base,map)}if(!map.has(p)){let low=base(p.x,p.z);for(let i=0;i<32;i++){const q=bunkerPoint(p,i/32*Math.PI*2,1.07);low=Math.min(low,base(q.x,q.z))}map.set(p,Math.min(base(p.x,p.z)-p.depth,low-.25))}return map.get(p)}
export function bunkerSurface(x,z,p,base){const r=bunkerFraction(x,z,p);if(r>=1.12)return base(x,z);const inner=p.pot?.66:.32,blend=smooth((r-inner)/(1.12-inner));return bunkerFloor(p,base)*(1-blend)+base(x,z)*blend}
export function bunkerHeight(x,z,hole,base){for(const p of bunkersByHole[hole]??[]){if(Math.abs(x-p.x)>Math.max(p.rx,p.rz)*1.3||Math.abs(z-p.z)>Math.max(p.rx,p.rz)*1.3)continue;if(bunkerFraction(x,z,p)<1.12)return bunkerSurface(x,z,p,base)}return base(x,z)}
