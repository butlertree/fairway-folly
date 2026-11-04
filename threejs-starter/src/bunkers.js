// Full-size bunker outlines, bowls and lies share this geometry (metres).
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const bunker=(id,x,z,rx,rz,depth=.8,rotation=0,seed=0,pot=false)=>({id,x,z,rx,rz,depth,rotation,seed,pot});
export const bunkersByHole={
1:[bunker('fairway',18,-142,5.8,10,.85,-.2,.7),bunker('left-drive',-11,-62,6,13,.8,.25,1.8),bunker('green-pot',-20,-157,3.8,6,1.8,-.3,2.3,true)],
2:[bunker('green',24,-214,5.8,9,.95,.25,.4),bunker('shelf-pot',-45,94,5,10,1.9,-.2,1.1,true),bunker('approach',-55,-70,5.5,12,.8,.4,2.4),bunker('island-carry',32,15,4.2,8,.9,.2,2.7)],
3:[bunker('cove',-22,-66,2.2,3,1.1,0,.8),bunker('back-pot',13,-93,2.2,3,1.9,0,.8,true)],
4:[bunker('corner',-16,-30,8.5,16,.9,-.28,.9),bunker('bluff-pot',44,-204,5.2,7,2.1,.25,2,true),bunker('right-green',98,-181,5.3,8,.9,-.4,1.4),bunker('landing-left',-51,-10,6,13,.9,.2,2.7),bunker('green-front',58,-163,5.5,8.5,1,-.3,3.1)],
5:[bunker('drive',-17,24,10,17,.85,-.35,1.2),bunker('green',48,-233,6,10,1,.3,.4),bunker('left-pot',-4,-247,4.8,7,2.15,-.15,1.8,true),bunker('bold-shelf',-16,-137,6,11,1.1,.25,2.6),bunker('layup-pinch',-49,-94,7.5,15,.95,.25,3.2)],
6:[bunker('back',7,-83,7,4.5,.9,-.3,.8),bunker('right-pot',39,-61,4.5,7,2.1,.2,2.1,true),bunker('short-left',-7,-44,5,7,.8,.4,1.5)],
7:[bunker('front-left',-40,-67,6,10,1.2,-.25,1.1),bunker('right-shoulder',13,-86,5,11,1,.1,2),bunker('back-pot',-17,-117,6,5,1.9,0,3,true)],
8:[bunker('inside-corner',5,-16,8,17,1.2,-.3,1),bunker('drive-right',45,0,7,14,.9,.2,2),bunker('green-left',-111,-179,5,11,1.4,-.2,3),bunker('green-front',-77,-174,6,7,1,.3,4),bunker('back-pot',-86,-220,5,5,2,0,5,true)],
9:[bunker('drive-right',9,51,8,17,1,.1,1),bunker('drive-left',-41,80,6,15,1.2,-.15,2),bunker('corner',15,9,7,14,1.1,-.5,3),bunker('green-left',208,-160,5,10,1.5,-.2,4,true),bunker('green-right',264,-151,5,11,1,.2,5)]
};
[bunkersByHole[7],bunkersByHole[8]]=[bunkersByHole[8],bunkersByHole[7]];
export function bunkerProfile(angle,p){return 1+.055*Math.sin(angle*3+p.seed)+.035*Math.cos(angle*2-p.seed)}
export function bunkerLocal(x,z,p){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.rotation),s=Math.sin(p.rotation);return {x:(dx*c+dz*s)/p.rx,z:(-dx*s+dz*c)/p.rz}}
export function bunkerFraction(x,z,p){const q=bunkerLocal(x,z,p);return Math.hypot(q.x,q.z)/bunkerProfile(Math.atan2(q.z,q.x),p)}
export function bunkerPoint(p,angle,radius=1){const r=bunkerProfile(angle,p)*radius,x=Math.cos(angle)*r*p.rx,z=Math.sin(angle)*r*p.rz,c=Math.cos(p.rotation),s=Math.sin(p.rotation);return {x:p.x+x*c-z*s,z:p.z+x*s+z*c}}
export function bunkerAt(x,z,hole){return (bunkersByHole[hole]??[]).find(p=>bunkerFraction(x,z,p)<1)}
const floors=new WeakMap();
export function bunkerFloor(p,base){let map=floors.get(base);if(!map){map=new Map();floors.set(base,map)}if(!map.has(p)){let low=base(p.x,p.z);for(let i=0;i<32;i++){const q=bunkerPoint(p,i/32*Math.PI*2,1.07);low=Math.min(low,base(q.x,q.z))}map.set(p,Math.min(base(p.x,p.z)-p.depth,low-.25))}return map.get(p)}
export function bunkerSurface(x,z,p,base){const r=bunkerFraction(x,z,p);if(r>=1.12)return base(x,z);const inner=p.pot?.66:.32,blend=smooth((r-inner)/(1.12-inner));return bunkerFloor(p,base)*(1-blend)+base(x,z)*blend}
export function bunkerHeight(x,z,hole,base){for(const p of bunkersByHole[hole]??[]){if(Math.abs(x-p.x)>Math.max(p.rx,p.rz)*1.3||Math.abs(z-p.z)>Math.max(p.rx,p.rz)*1.3)continue;if(bunkerFraction(x,z,p)<1.12)return bunkerSurface(x,z,p,base)}return base(x,z)}
