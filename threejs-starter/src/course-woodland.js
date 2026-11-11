import {bunkersByHole} from './bunkers.js';
import {edgeShape} from './landscape.js';
import {strategicTrees} from './hole-nine-trees.js';
import {newHoles,heightNew,fairwayFraction,inTimberApproach,wasteFraction} from './new-holes.js';
import {getCourse,height,lie} from './course.js';
const cache=new Map();
// Irregular woodland follows the rough beside usable fairways, never sand, water or greens.
export function courseWoodland(hole){if(cache.has(hole))return cache.get(hole);const c=getCourse(hole);if(hole===9){const trees=strategicTrees(newHoles[9],heightNew,fairwayFraction,inTimberApproach,wasteFraction);addGreenWoodland(trees,c,hole);addTeeWoodland(trees,c,hole);cache.set(hole,trees);return trees}const trees=[],rx=c.bounds.rx,rz=c.bounds.rz;let seed=(hole===7?8:hole===8?7:hole)*7319;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<4200;i++){const x=(random()*2-1)*rx,z=(random()*2-1)*rz;if(hole===13&&(z< -172&&x> -40&&x<46&&z> -217||fairwayFraction(x,z,c)<1.95))continue;if(hole===12&&(inTimberApproach(x,z)||wasteFraction(x,z,c)<1.09))continue;if(hole===10&&z>115&&x>-29&&x<37)continue;if(lie(x,z,hole)!=='Rough'||(x/rx)**2+(z/rz)**2>.88||Math.hypot(x-c.pin.x,z-c.pin.z)<38||Math.hypot(x-c.tee.x,z-c.tee.z)<30)continue;let near=false,clear=true;for(let j=0;j<12;j++){const a=j*Math.PI/6;for(const r of [hole===1?4:8,18,30,50,75]){const s=lie(x+Math.cos(a)*r,z+Math.sin(a)*r,hole);if(r===(hole===1?4:8)&&s!=='Rough')clear=false;if(r>8&&s==='Fairway')near=true}}if(!clear||!near||trees.some(t=>Math.hypot(t.x-x,t.z-z)<(hole===1?7:10)+random()*4))continue;trees.push({x,z,y:height(x,z,hole)-.15,tall:(hole===1?.17:.25)+random()*.1,wide:(hole===1?.22:.3)+random()*.13,flip:random()>.5?1:-1,id:trees.length,kind:hole>=12?['cypress','oak','birch'][trees.length%3]:undefined})}if(hole===11)addSandstoneWoodland(trees,c);addGreenWoodland(trees,c,hole);if(hole===12)addTimberWoodland(trees,c);if(hole===14)addAlderBackdrop(trees,c);if(hole===15)addCedarWoodland(trees,c);else addTeeWoodland(trees,c,hole);if(hole===16)addHemlockWoodland(trees,c);if(hole===17){addCrownridgeWoodland(trees,c);for(let i=trees.length-1;i>=0;i--){const t=trees[i],ahead=c.tee.z-t.z;if(ahead>0&&ahead<57&&Math.abs(t.x-c.tee.x)<33)trees.splice(i,1);}}if(hole===18)addCedarGate(trees,c);cache.set(hole,trees);return trees}

function addTeeWoodland(trees,c,hole){
 const {tee}=c,rx=c.landRadius?.rx??(hole===1?40*c.sx:130);
 const rz=c.landRadius?.rz??(hole===1?51*c.sz:335),cx=c.landRadius?.cx??0;
 const sites=[
   [-17,11,'oak',.49,.44],[19,7,'birch',.38,.32],
   [-27,-5,'cypress',.38,.34],[29,-8,'oak',.36,.39],
   [-24,25,'birch',.43,.36],[14,26,'cypress',.45,.37],
   [34,17,'oak',.36,.38],[-36,14,'cypress',.34,.31],
   [-13,31,'oak',.37,.41],[23,30,'birch',.33,.29]
 ];
 const kinds=new Set();
 let added=0;
 for(const [i,[dx,dz,kind,tall,wide]] of sites.entries()){
   const variation=Math.sin(hole*1.71+i*2.39);
   const x=tee.x+dx+variation*2.2,z=tee.z+dz+variation*2.8;
   const nx=(x-cx)/rx,nz=z/rz;
   const ground=height(x,z,hole);
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.045||
      !['Rough','OB'].includes(lie(x,z,hole))||
      (c.waterLevel!==undefined&&ground<c.waterLevel+1.5)||
      trees.some(t=>Math.hypot(t.x-x,t.z-z)<8.5))continue;
   const species=added<3&&kinds.has(kind)?['oak','birch','cypress'].find(name=>!kinds.has(name)):kind;
   kinds.add(species);
   trees.push({x,z,y:ground-.18,tall:tall+variation*.035,wide,kind:species,flip:i%2?1:-1,id:trees.length});
   if(++added===5)break;
 }
}

// Scenic groves may sit beyond the play boundary, but always on the actual island soil.
function addGreenWoodland(trees,c,hole){if(hole===6)return;const rx=c.landRadius?.rx??(hole===1?40*c.sx:130),rz=c.landRadius?.rz??(hole===1?51*c.sz:335),cx=c.landRadius?.cx??0;let seed=hole*48157;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const previous=c.layupRoute?.at(-1)??c.route?.at(-2)??c.tee,dx=c.pin.x-previous.x,dz=c.pin.z-previous.z,heading=Math.atan2(dz,dx);let added=0;for(let i=0;i<900&&added<22;i++){// Rear crescent with loose side lobes, leaving the incoming approach open.
 const angle=heading+(random()-.5)*Math.PI*1.35,d=29+random()*24,x=c.pin.x+Math.cos(angle)*d,z=c.pin.z+Math.sin(angle)*d;if(hole===12&&inTimberApproach(x,z)||hole===13&&z> -217&&x> -40&&x<46)continue;const nx=(x-cx)/rx,nz=z/rz,a=Math.atan2(nz,nx),surface=lie(x,z,hole);if((hole===15&&wasteFraction(x,z,c)<1.08)||(bunkersByHole[hole]??[]).some(p=>Math.hypot(x-p.x,z-p.z)<Math.max(p.rx,p.rz)+16)||Math.hypot(nx,nz)>edgeShape(a)-.045||['Water','Sand','Green','Fairway','Tee box'].includes(surface)||height(x,z,hole)<(c.waterLevel??-100)+1||Math.hypot((x-c.pin.x)/c.green.rx,(z-c.pin.z)/c.green.rz)<1.45||trees.some(t=>Math.hypot(t.x-x,t.z-z)<8+random()*3))continue;const kind=['oak','birch','cypress','willow'][added%4],signature=added===0&&[1,3,4,7,9,12].includes(hole);trees.push({x,z,y:height(x,z,hole)-.2,tall:signature?.48:.23+random()*.15,wide:signature?.64:.3+random()*.16,flip:random()>.5?1:-1,id:trees.length,kind:signature?(hole===3?'willow':hole===12?'cypress':'oak'):kind,signature:signature?({1:'The Verdant Oak',3:'Kingfisher Willow',4:'Bluff Oak',7:'Copperpine Sentinel',9:'Hollow Oak',12:'Timberroot Pine'})[hole]:undefined,greenGrove:true});added++}}

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

function addAlderBackdrop(trees,c){
 const grove=[[-40,-234],[-31,-235],[-24,-237],[-17,-237],[-10,-236],[-3,-236],
   [3,-237],[9,-240],[15,-247],[21,-238],[27,-247],[32,-237],[39,-241],[45,-232]];
 for(const [i,[x,z]] of grove.entries()){
   const nx=x/c.landRadius.rx,nz=z/c.landRadius.rz;
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.017||
     !['Rough','OB'].includes(lie(x,z,14))||trees.some(t=>Math.hypot(t.x-x,t.z-z)<5.7))continue;
   trees.push({x,z,y:height(x,z,14)-.23,tall:.31+(i%5)*.038,wide:.29+(i%4)*.027,
     kind:['oak','cypress','birch','oak'][i%4],flip:i%2?1:-1,id:trees.length,greenGrove:true});
 }
}

function addCedarWoodland(trees,c){
 for(const [x,dz,tall,wide,kind] of [
   [-19,17,.68,.65,'oak'],[-34,12,.58,.62,'oak'],[4,20,.62,.55,'oak'],
   [23,9,.57,.50,'birch'],[-29,29,.62,.46,'cypress']
 ]){
   const z=c.tee.z+dz;
   trees.push({x,z,y:height(x,z,15)-.22,tall,wide,kind,id:trees.length,flip:1});
 }
 const groves=[[-64,54,26,43],[58,66,23,39],[-74,-30,24,50],[73,-27,21,48],[-40,-108,43,33],[53,-108,28,24]];
 for(const [cx,cz,rx,rz] of groves)for(let i=0;i<93;i++){
   const a=i*2.399963,r=Math.sqrt((i+.5)/93);
   const x=cx+Math.cos(a)*r*rx,z=cz+Math.sin(a)*r*rz;
   const nx=x/c.landRadius.rx,nz=z/c.landRadius.rz;
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.05||
      wasteFraction(x,z,c)<1.08||Math.hypot((x-c.pin.x)/c.green.rx,(z-c.pin.z)/c.green.rz)<1.55||
      Math.abs(x)<25&&z>45||trees.some(t=>Math.hypot(t.x-x,t.z-z)<8.3))continue;
   const n=trees.length;
   trees.push({x,z,y:height(x,z,15)-.19,tall:.25+(i%9)*.019,wide:.29+(i%7)*.026,
     flip:i%2?1:-1,id:n,kind:['cypress','oak','birch'][n%3]});
 }
}

function addHemlockWoodland(trees,c){
 const tallGrove=[[-23,85,.98,.61],[-35,78,.93,.55],[-47,68,1.03,.66],[-51,89,.91,.6],
   [-29,61,.86,.57],[-65,55,.82,.64],[-63,76,.91,.61],[-43,49,.82,.55]];
 for(const [x,z,tall,wide] of tallGrove){
   trees.push({x,z,y:height(x,z,16)-.18,tall,wide,kind:'cypress',id:trees.length,flip:1});
 }
 const hills=[[-159,-111,32,21],[-166,-61,25,31],[-83,-126,43,20],[-86,32,35,48],[64,6,24,78]];
 for(const [cx,cz,rx,rz] of hills)for(let i=0;i<63;i++){
   const a=i*2.399963,r=Math.sqrt((i+.5)/63),x=cx+Math.cos(a)*r*rx,z=cz+Math.sin(a)*r*rz;
   const nx=(x-c.landRadius.cx)/c.landRadius.rx,nz=z/c.landRadius.rz;
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.055||
      fairwayFraction(x,z,c)<1.37||!['Rough','OB'].includes(lie(x,z,16))||
      trees.some(t=>Math.hypot(t.x-x,t.z-z)<9.3))continue;
   trees.push({x,z,y:height(x,z,16)-.22,tall:.34+(i%8)*.033,wide:.36+(i%6)*.041,
     kind:['cypress','oak','birch'][i%3],id:trees.length,flip:i%2?1:-1});
 }
}

function addCrownridgeWoodland(trees,c){
 const x=142,z=-114;
 trees.push({x,z,y:height(x,z,17)-.22,tall:.64,wide:.65,kind:'cottonwood',
   id:trees.length,flip:1,signature:'The Crownridge Cottonwood'});
 const groves=[[150,-182,30,22],[209,-206,36,19],[244,-161,17,36],[68,-110,24,42],[68,48,22,61],[-51,85,23,75],[158,54,38,93],[211,5,22,52],[-52,-110,25,59]];
 for(const [cx,cz,rx,rz] of groves)for(let i=0;i<72;i++){
   const a=i*2.399963,r=Math.sqrt((i+.5)/72);
   const x=cx+Math.cos(a)*r*rx,z=cz+Math.sin(a)*r*rz;
   const nx=(x-c.landRadius.cx)/c.landRadius.rx,nz=z/c.landRadius.rz;
   if(Math.hypot(nx,nz)>edgeShape(Math.atan2(nz,nx))-.045||
      !['Rough','OB'].includes(lie(x,z,17))||wasteFraction(x,z,c)<1.13||
      x>120&&x<195&&Math.abs(z+128+(x-110)*.364)<18||
      trees.some(t=>Math.hypot(t.x-x,t.z-z)<9.4))continue;
   trees.push({x,z,y:height(x,z,17)-.2,tall:.29+(i%8)*.031,wide:.32+(i%6)*.037,
     kind:['oak','cypress','birch'][i%3],id:trees.length,flip:i%2?1:-1});
 }
}

function addCedarGate(trees,c){
 const sites=[[-17,174],[20,168],[-19,151],[24,144],[-19,127],[20,121],[-22,104],[17,98],[-28,81],[14,75],[-35,65],[10,53]];
 for(const [i,[x,z]] of sites.entries()){
   for(let j=trees.length-1;j>=0;j--)if(Math.hypot(trees[j].x-x,trees[j].z-z)<8)trees.splice(j,1);
   trees.push({x,z,y:height(x,z,c.id)-.2,tall:.60+i%3*.07,wide:.39+i%4*.035,
     kind:i%3?'cypress':'birch',id:1000+i,flip:i%2?1:-1});
 }
}
