import {bunkersByHole} from './bunkers.js';
import {edgeShape} from './landscape.js';
import {strategicTrees} from './hole-nine-trees.js';
import {newHoles,heightNew,fairwayFraction,inTimberApproach,wasteFraction} from './new-holes.js';
import {getCourse,height,lie} from './course.js';
const cache=new Map();
// Irregular woodland follows the rough beside usable fairways, never sand, water or greens.
export function courseWoodland(hole){if(cache.has(hole))return cache.get(hole);const c=getCourse(hole);if(hole===9){const trees=strategicTrees(newHoles[9],heightNew,fairwayFraction,inTimberApproach,wasteFraction);addGreenWoodland(trees,c,hole);cache.set(hole,trees);return trees}const trees=[],rx=c.bounds.rx,rz=c.bounds.rz;let seed=(hole===7?8:hole===8?7:hole)*7319;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<4200;i++){const x=(random()*2-1)*rx,z=(random()*2-1)*rz;if(hole===12&&(inTimberApproach(x,z)||wasteFraction(x,z,c)<1.09))continue;if(hole===10&&z>115&&x>-29&&x<37)continue;if(lie(x,z,hole)!=='Rough'||(x/rx)**2+(z/rz)**2>.88||Math.hypot(x-c.pin.x,z-c.pin.z)<38||Math.hypot(x-c.tee.x,z-c.tee.z)<30)continue;let near=false,clear=true;for(let j=0;j<12;j++){const a=j*Math.PI/6;for(const r of [hole===1?4:8,18,30,50,75]){const s=lie(x+Math.cos(a)*r,z+Math.sin(a)*r,hole);if(r===(hole===1?4:8)&&s!=='Rough')clear=false;if(r>8&&s==='Fairway')near=true}}if(!clear||!near||trees.some(t=>Math.hypot(t.x-x,t.z-z)<(hole===1?7:10)+random()*4))continue;trees.push({x,z,y:height(x,z,hole)-.15,tall:(hole===1?.17:.25)+random()*.1,wide:(hole===1?.22:.3)+random()*.13,flip:random()>.5?1:-1,id:trees.length,kind:hole===12?['cypress','oak','birch'][trees.length%3]:undefined})}if(hole===11)addSandstoneWoodland(trees,c);addGreenWoodland(trees,c,hole);if(hole===12)addTimberWoodland(trees,c);cache.set(hole,trees);return trees}

// Scenic groves may sit beyond the play boundary, but always on the actual island soil.
function addGreenWoodland(trees,c,hole){if(hole===6)return;const rx=c.landRadius?.rx??(hole===1?40*c.sx:130),rz=c.landRadius?.rz??(hole===1?51*c.sz:335),cx=c.landRadius?.cx??0;let seed=hole*48157;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const previous=c.layupRoute?.at(-1)??c.route?.at(-2)??c.tee,dx=c.pin.x-previous.x,dz=c.pin.z-previous.z,heading=Math.atan2(dz,dx);let added=0;for(let i=0;i<900&&added<22;i++){// Rear crescent with loose side lobes, leaving the incoming approach open.
 const angle=heading+(random()-.5)*Math.PI*1.35,d=29+random()*24,x=c.pin.x+Math.cos(angle)*d,z=c.pin.z+Math.sin(angle)*d;if(hole===12&&inTimberApproach(x,z))continue;const nx=(x-cx)/rx,nz=z/rz,a=Math.atan2(nz,nx),surface=lie(x,z,hole);if((bunkersByHole[hole]??[]).some(p=>Math.hypot(x-p.x,z-p.z)<Math.max(p.rx,p.rz)+16)||Math.hypot(nx,nz)>edgeShape(a)-.045||['Water','Sand','Green','Fairway','Tee box'].includes(surface)||height(x,z,hole)<(c.waterLevel??-100)+1||Math.hypot((x-c.pin.x)/c.green.rx,(z-c.pin.z)/c.green.rz)<1.45||trees.some(t=>Math.hypot(t.x-x,t.z-z)<8+random()*3))continue;const kind=['oak','birch','cypress','willow'][added%4],signature=added===0&&[1,3,4,7,9,12].includes(hole);trees.push({x,z,y:height(x,z,hole)-.2,tall:signature?.48:.23+random()*.15,wide:signature?.64:.3+random()*.16,flip:random()>.5?1:-1,id:trees.length,kind:signature?(hole===3?'willow':hole===12?'cypress':'oak'):kind,signature:signature?({1:'The Verdant Oak',3:'Kingfisher Willow',4:'Bluff Oak',7:'Copperpine Sentinel',9:'Hollow Oak',12:'Timberroot Pine'})[hole]:undefined,greenGrove:true});added++}}

// Broken groves hug both shoulders of the sand carry and frame the tee.
function addSandstoneWoodland(trees,c){
 const clusters=[[-37,66,17,19],[-61,29,15,27],[-61,-16,13,26],[-57,-58,11,16],
   [34,67,17,16],[56,45,14,18],[69,9,8,24],[66,-46,11,21],[24,-84,14,12]];
 let seed=21919;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(const [cx,cz,rx,rz] of clusters){
   let planted=0;
   for(let i=0;i<100&&planted<8;i++){
     const a=random()*Math.PI*2,r=Math.sqrt(random()),x=cx+rx*r*Math.cos(a),z=cz+rz*r*Math.sin(a);
     const nx=x/c.landRadius.rx,nz=z/c.landRadius.rz;
     if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.06||
       Math.hypot(x-c.tee.x,z-c.tee.z)<16||lie(x,z,11)!=='Rough'||
       [3,5].some(d=>[0,Math.PI/2,Math.PI,Math.PI*1.5].some(t=>lie(x+d*Math.cos(t),z+d*Math.sin(t),11)!=='Rough'))||
       trees.some(tree=>Math.hypot(tree.x-x,tree.z-z)<5.5))continue;
     const kind=['oak','birch','cypress'][Math.floor(random()*3)];
     trees.push({x,z,y:height(x,z,11)-.2,tall:.19+random()*.12,wide:.24+random()*.13,
       flip:random()>.5?1:-1,id:trees.length,kind});
     planted++;
   }
 }
}

function addTimberWoodland(trees,c){
 const groves=[[-89,9,23,50],[-95,-52,16,43],[-93,-109,19,45],
   [-80,-164,23,43],[-66,-218,24,25],[-38,-267,46,17],[48,-242,36,30],
   [93,49,21,53],[84,148,26,58],[-72,161,28,50]];
 let seed=120241;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(const [cx,cz,rx,rz] of groves)for(let i=0;i<140;i++){
   const a=random()*Math.PI*2,r=Math.sqrt(random()),x=cx+rx*r*Math.cos(a),z=cz+rz*r*Math.sin(a);
   const nx=x/c.landRadius.rx,nz=z/c.landRadius.rz;
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.045||
     inTimberApproach(x,z)||fairwayFraction(x,z,c)<1.35||wasteFraction(x,z,c)<1.09||
     ['Sand','Green','Tee box','Fairway'].includes(lie(x,z,12))||
     Math.hypot((x-c.pin.x)/c.green.rx,(z-c.pin.z)/c.green.rz)<1.5||
     trees.some(t=>Math.hypot(t.x-x,t.z-z)<8))continue;
   trees.push({x,z,y:height(x,z,12)-.18,tall:.24+random()*.14,wide:.25+random()*.14,
     flip:random()>.5?1:-1,id:trees.length,kind:['cypress','oak','birch'][trees.length%3]});
 }
}
