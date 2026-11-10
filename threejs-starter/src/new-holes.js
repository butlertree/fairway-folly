// Original championship-inspired routings. All full-size coordinates are metres.
import {creekbankCenter,creekbankFraction} from './creekbank.js';
import {edgeShape} from './landscape.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const valleyRoute=[{x:0,z:260,w:14,y:72},{x:0,z:180,w:30,y:65},{x:0,z:80,w:33,y:65},...Array.from({length:24},(_,i)=>{const t=(i+1)/24,a=t*Math.PI/2;return {x:235-235*Math.cos(a),z:80-235*Math.sin(a),w:33-6*t,y:65+11*t}})];
const make=(id,par,title,yards,teeZ,pinX,rx,rz,extra)=>({id,par,title,yards,sx:1,sz:1,ballRadius:.085,tee:{x:0,z:teeZ},pin:{x:pinX,z:teeZ-Math.sqrt((yards*.9144)**2-pinX**2)},green:{rx:20,rz:16},bounds:{rx:rx*.94,rz:rz*.94},landRadius:{rx,rz},...extra});
export const creekbankWaste={x:-12,z:-3,rx:21,rz:77};
export const newHoles={
 4:make(4,4,'Amberlight Bluff',445,210,70,150,290,{theme:'coast',waterLevel:59,teeHeight:78,greenHeight:70,greenName:'The Tideglass Garden',hint:'A 445-yard dogleg right. Drive to the left landing shelf, then turn right toward the raised green. Bunkers pinch the landing zone and guard the approach.',miniHint:'Thread the turning tide gate or bank around the shell garden.',lakes:[{x:46,z:-29,rx:25,rz:76}],route:[{x:0,z:210,w:14},{x:-29,z:50,w:27},{x:-36,z:-32,w:27},{x:-18,z:-92,w:24},{x:70,z:-190.8,w:23}],landingSites:[{x:-35,z:-22,label:'Dogleg landing'},{x:13,z:-128,label:'Turn toward green'}]}),
 5:make(5,5,'Willowspire Reach',535,242,24,122,294,{theme:'orchard',waterLevel:58,teeHeight:78,greenHeight:72,greenName:'The Clockwork Orchard',hint:'Use the broad left landing shelf, lay up before the creek, then play an iron on. A long drive on the main fairway can set up a demanding second shot over the creek.',miniHint:'Time the orchard sweepers, or use the generous outside bank routes.',lakes:[{x:57,z:7,rx:24,rz:62}],route:[{x:0,z:242,w:15},{x:-39,z:45,w:32},{x:-35,z:-94,w:27},{x:24,z:-247,w:25}],landingSites:[{x:-39,z:42,label:'Safe drive'},{x:-31,z:-130,label:'Creek layup'}]}),
 6:make(6,3,'Starfall Sanctuary',142,67,12,84,116,{theme:'sanctuary',waterLevel:59,teeHeight:82,greenHeight:71,greenName:'The Starlight Labyrinth',hint:'A downhill short iron to the diagonal green. Favor the generous left shoulder; the creek catches shots short and right.',miniHint:'Find the opening between the crescent stones, or bank around the fountain garden.',green:{rx:23,rz:13},lakes:[{x:37,z:-22,rx:25,rz:28}],route:[{x:0,z:67,w:14},{x:-11,z:11,w:19},{x:12,z:-62,w:26}],landingSites:[{x:4,z:-53,label:'Generous shoulder'}]}),
 8:make(8,3,'Seabell Headland',202,94,-18,94,147,{theme:'headland',waterLevel:58,teeHeight:81,greenHeight:72,greenName:'The Seabell Court',hint:'A long hybrid across the inlet to a windswept headland. Take the broad right shoulder; short-left sand and water punish a timid strike.',miniHint:'Bank around the sea-glass fins; the open center rewards a precise putt.',green:{rx:24,rz:18},lakes:[{x:32,z:0,rx:42,rz:39}],route:[{x:0,z:94,w:15},{x:-24,z:10,w:24},{x:-18,z:-90,w:26}],landingSites:[{x:-10,z:-84,label:'Headland shoulder'}]}),
 7:make(7,4,'Copperpine Bend',460,215,-88,170,296,{theme:'sandhills',waterLevel:57,teeHeight:79,greenHeight:73,greenName:'The Pinecone Terrace',hint:'A long dogleg left. Favor the right side of the landing shelf for an open approach to the crowned green. Cut the corner only with precise distance control.',miniHint:'Carom between the pinecone planters or take the wide outside banks.',lakes:[],route:[{x:0,z:215,w:15},{x:25,z:48,w:29},{x:24,z:-20,w:28},{x:-30,z:-104,w:25},{x:-88,z:-196,w:24}],landingSites:[{x:24,z:-5,label:'Dogleg shelf'},{x:-38,z:-113,label:'Left turn'}]}),
 9:make(9,5,'Azalea Hollow',602,260,235,250,330,{theme:'valley',pin:{x:235,z:-155},landRadius:{rx:250,rz:330,cx:80},bounds:{rx:235,rz:310.2,cx:80},waterLevel:58,teeHeight:88,greenHeight:76,greenName:'The Azalea Spiral',hint:'An elevated tee into a 260-yard valley landing. Bunkers pinch the drive. Follow the valley around the right dogleg: tall forest blocks the shortcut to the green.',miniHint:'Bank around the flowering crescents or thread the timed petal gate. Close approaches keep a clear central putt.',lakes:[],route:valleyRoute,landingSites:[{x:7,z:23,label:'Valley landing'},{x:110,z:-120,label:'Sweeping approach'}]}),
 10:make(10,4,'Creekbank Hollow',440,202,-26,112,258,{
   theme:'creekbank',waterLevel:62,teeHeight:72,greenHeight:71,greenName:'Creekbank Terrace',
   green:{rx:21,rz:16},lakes:[],waste:[creekbankWaste],
   hint:'Carry the creek and find the ribbon of fairway between the waste sand and water. The fairway turns left toward the green.',
   miniHint:'Thread the stone culvert or follow the grass around it. A close approach stays on the terrace.',
   route:[{x:15,z:126,w:16},{x:17,z:96,w:20},{x:24,z:56,w:21},{x:28,z:17,w:21},
     {x:28,z:-26,w:20},{x:20,z:-66,w:19},{x:7,z:-108,w:19},{x:-14,z:-150,w:19},{x:-26,z:-199.5,w:21}],
   landingSites:[{x:22,z:-55,label:'Creekside landing'},{x:4,z:-119,label:'Open approach'}]
 }),
 11:make(11,3,'Sandstone Crown',170,77,-15,87,112,{
   theme:'sandstone',waterLevel:56,teeHeight:77,greenHeight:72,greenName:'Boulder Split',
   green:{rx:24,rz:12},lakes:[],waste:[{x:2,z:8,rx:47,rz:48},{x:38,z:-22,rx:23,rz:39},{x:-14,z:-46,rx:24,rz:27}],
   hint:'Carry the sand valley to a shallow green. A bunker guards the left and long grass catches shots over the back.',
   miniHint:'Take the open line to the cup or use the angled sandstone shoulder to bank the ball back toward it.',
   route:[{x:-15,z:-61,w:12},{x:-15,z:-78,w:16}],
   landingSites:[{x:-4,z:-75,label:'Open right shoulder'}]
 }),
 12:make(12,5,'Timberroot Vale',525,237,-23,126,294,{
   theme:'timberroot',waterLevel:53,teeHeight:73,greenHeight:88,greenName:'The Root Bank',
   green:{rx:25,rz:15},lakes:[],
   waste:[{x:-32,z:-47,rx:58,rz:83},{x:20,z:-77,rx:65,rz:68},{x:-16,z:-145,rx:59,rz:70}],
   hint:'Drive to the first shelf, lay up on the right, then climb to the green. Deep waste sand runs to the foot of the green and takes distance off recovery shots.',
   miniHint:'Use the open lane to the cup or bank off the pine roots from the wide right side.',
   route:[{x:0,z:237,w:13},{x:-15,z:181,w:16},{x:-21,z:101,w:17},{x:-7,z:45,w:15},{x:7,z:23,w:10}],
   layupRoute:[{x:36,z:-115,w:14},{x:49,z:-146,w:21},{x:51,z:-171,w:17}],
   landingSites:[{x:0,z:33,label:'First shelf'},{x:47,z:-145,label:'Right layup shelf'}]
 })
};
export function organicFraction(x,z,p){const nx=(x-p.x)/p.rx,nz=(z-p.z)/p.rz,a=Math.atan2(nz,nx);return Math.hypot(nx,nz)/(1+.12*Math.sin(a*3+.8)+.06*Math.cos(a*5))}
const greenRotation=c=>c.id===6?-.35:.15;
const greenEdge=angle=>1+.07*Math.sin(angle*3);
export function newGreenOutline(c,segments=120){
 const a=greenRotation(c),cos=Math.cos(a),sin=Math.sin(a);
 return Array.from({length:segments+1},(_,i)=>{
   const t=i/segments*Math.PI*2,r=greenEdge(t);
   const x=c.green.rx*r*Math.cos(t),z=c.green.rz*r*Math.sin(t);
   return {x:c.pin.x+x*cos+z*sin,z:c.pin.z-x*sin+z*cos};
 });
}
export function newGreenFraction(x,z,c){const dx=x-c.pin.x,dz=z-c.pin.z,a=greenRotation(c),nx=(dx*Math.cos(a)-dz*Math.sin(a))/c.green.rx,nz=(dx*Math.sin(a)+dz*Math.cos(a))/c.green.rz;return Math.hypot(nx,nz)/greenEdge(Math.atan2(nz,nx))}
export function fairwayFraction(x,z,c){if(c.id===10&&z<104&&x>creekbankCenter(z))return 1.2;if(c.id===9){const v=valleyFrame(x,z,c);return v.distance/v.width}let best=Infinity;for(const route of [c.route,c.layupRoute??[]])for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz))),w=a.w+(b.w-a.w)*t;best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz)/w)}return best}
export function creekCenter(x,hole){return hole===5?-223+7*Math.sin(x/33):hole===6?-27-.26*x:hole===8?14+.15*x:0}
export function creekWidth(hole){return hole===5?4:hole===6?3:hole===8?3:0}
export function wasteFraction(x,z,c){
 let fraction=Infinity;
 for(const area of c.waste??[]){
   const next=organicFraction(x,z,area);
   const overlap=Math.max(0,.28-Math.abs(fraction-next));
   fraction=Math.min(fraction,next)-overlap*overlap/1.12;
 }
 return c.id===12?Math.max(fraction,2-fairwayFraction(x,z,c)):fraction;
}
export function waterFraction(x,z,c){if(c.id===10)return creekbankFraction(x,z);let f=Math.min(...c.lakes.map(p=>organicFraction(x,z,p)));if(c.id===4&&x>48)f=Math.min(f,Math.abs(z+29)/2.5);if(creekWidth(c.id)>0)f=Math.min(f,Math.abs(z-creekCenter(x,c.id))/creekWidth(c.id));return f}
export const timberWasteRocks=[
 {x:-48,z:-27,rx:3.7,ry:2.0,rz:2.6},{x:-55,z:-35,rx:2.1,ry:1.35,rz:2.5},
 {x:32,z:-60,rx:4.2,ry:2.7,rz:3.0},{x:36,z:-65,rx:2.4,ry:1.3,rz:1.9},
 {x:-39,z:-117,rx:4.4,ry:2.1,rz:3.2},{x:-43,z:-121,rx:2.5,ry:1.25,rz:2.1},
 {x:-8,z:-174,rx:3.8,ry:2.4,rz:3.2},{x:-13,z:-178,rx:2.1,ry:1.1,rz:2.6}
];
export const timberGrass=[
 {x:-52,z:-26,rx:9,rz:5},{x:-33,z:-70,rx:8,rz:5},{x:34,z:-62,rx:11,rz:6},
 {x:18,z:-100,rx:8,rz:5},{x:-41,z:-120,rx:11,rz:6},{x:-51,z:-151,rx:7,rz:5},
 {x:-12,z:-176,rx:10,rz:6},{x:17,z:-183,rx:9,rz:4}
];
export function timberGrassFraction(x,z){
 let best=Infinity;
 for(const patch of timberGrass)best=Math.min(best,organicFraction(x,z,patch));
 return best;
}
export function inTimberApproach(x,z){
 const {pin}=newHoles[12];
 if(z< pin.z-3||z> -130)return false;
 const t=Math.min(1,Math.max(0,(-145-z)/(-145-pin.z)));
 return Math.abs(x-(48+(pin.x-48)*t))<19;
}
function timberrootHeight(x,z,c,fair,green){
 const hill=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 let y=66+2.4*Math.sin(x/27+z/49)+1.8*Math.cos(z/37-x/42);
 y+=16*hill(-91,74,33,105)+19*hill(86,8,35,130)+14*hill(-70,-172,40,65);
 y+=(60+.8*Math.cos(z/33)-y)*(1-smooth((wasteFraction(x,z,c)-.62)/.72));
 const shelf=z>0?69+4*smooth((65-z)/58):70+2*smooth((-125-z)/42);
 y+=(shelf-y)*(1-smooth((fair-.68)/.64));
 y+=(c.teeHeight-y)*(1-smooth((Math.hypot(x/31,(z-c.tee.z)/45)-.24)/.9));
 // The putting surface is a shelf cut into a broad horseshoe hillside.
 const uphill=1-smooth((z+261)/33);
 y+=40*hill(-28,-269,72,40)*uphill;
 y+=27*hill(-72,-246,30,35)+26*hill(24,-263,38,32);
 const bunkerBench=Math.hypot((x+49)/8,(z+218)/12);
 y+=(78-y)*(1-smooth((bunkerBench-.55)/.75));
 return y+(c.greenHeight-y)*(1-smooth((green-.92)/.72));
}
export function heightNew(x,z,hole){const c=newHoles[hole],gr=newGreenFraction(x,z,c),fair=fairwayFraction(x,z,c);if(hole===12)return timberrootHeight(x,z,c,fair,gr);let y=66+1.7*Math.cos(z/54)+1.4*Math.sin(x/24)+16*Math.exp(-((x+70)**2/400+(z+80)**2/2300))+11*Math.exp(-((x-77)**2/450+(z-96)**2/2600));if(hole===9){const v=valleyFrame(x,z,c);y=v.y+2.2*Math.sin(z/47+x/61)*Math.cos(x/75)+32*smooth((v.distance-v.width*.95)/95)+(27*Math.exp(-((x+85)**2/7000+(z-85)**2/17000))+29*Math.exp(-((x-115)**2/9000+(z-110)**2/11000))+25*Math.exp(-((x-180)**2/16000+(z+215)**2/3600))+5*Math.sin(x/65)*Math.cos(z/83))*smooth((v.distance-v.width*.85)/58);}else {y+=(67-y)*(1-smooth((fair-.7)/.7));y+=(9*Math.sin(x/31+z/73)+8*Math.cos(z/42-x/54)+12)*smooth((fair-1)/1.1)*smooth((Math.hypot(x,z-c.tee.z)-15)/35);}const water=waterFraction(x,z,c);
 if(hole===10){
   const waste=wasteFraction(x,z,c);
   const floor=63.1+.5*Math.cos(z/35);
   y+=(Math.min(y,floor)-y)*(1-smooth((waste-.36)/.91));
   const bank=1-smooth((water-1.15)/2.55);
   y+=(Math.min(y,c.waterLevel+4.5)-y)*bank;
 }
 if(hole===11){
   y+=14*Math.exp(-(((x+14)/39)**2+((z+104)/18)**2));
   const valley=1-smooth((wasteFraction(x,z,c)-.48)/.73);
   y+=(Math.min(y,59+.45*Math.cos(z/25))-y)*valley;
 }
 y+=(c.waterLevel-.9-y)*(1-smooth((water-(hole===10?1.02:1.05))/(hole===10?1.15:.9)));y+=(c.greenHeight-y)*(1-smooth((gr-.88)/.55));y+=smooth((gr-1)/.35)*3.3*smooth((waterFraction(x,z,c)-1)/.5)*Math.exp(-(((gr-1.65)/.55)**2))*(.2+.8*(1-Math.sin(Math.atan2(z-c.pin.z,x-c.pin.x)))/2)*(1+.35*Math.cos(Math.atan2(z-c.pin.z,x-c.pin.x)*3));if(c.id===7&&gr<1.45)y+=1.2*(1-smooth(gr/1.45));const tee=Math.max(Math.abs(x)/7,Math.abs(z-c.tee.z)/9);y+=(c.teeHeight-y)*(hole===10?(1-smooth((Math.hypot(x/19,(z-c.tee.z)/23)-.48)/.62))*smooth((water-1.08)/1.5):hole===11?1-smooth((Math.hypot(x/18,(z-c.tee.z)/22)-.47)/.87):hole===9?1-smooth((Math.hypot(x/40,(z-c.tee.z)/65)-.24)/1.05):1-smooth((tee-1)/1.5));return y}
export function lieNew(x,z,hole){const c=newHoles[hole];if(((x-(c.bounds.cx??0))/c.bounds.rx)**2+(z/c.bounds.rz)**2>1)return 'OB';if(Math.abs(x)<6&&Math.abs(z-c.tee.z)<8)return 'Tee box';if(newGreenFraction(x,z,c)<1)return 'Green';if(waterFraction(x,z,c)<1&&newGreenFraction(x,z,c)>1.25)return 'Water';if(wasteFraction(x,z,c)<1)return hole===12&&timberGrassFraction(x,z)<.84?'Rough':'Waste sand';return fairwayFraction(x,z,c)<1?'Fairway':'Rough'}
// Each creek reaches the actual sculpted edge, so the fall begins at the lip.
export function newOutlet(hole){const c=newHoles[hole];if(hole===7||hole===9||hole===10||hole===11||hole===12)return null;if(hole===4){const z=-29;let x=50;while(Math.hypot(x/c.landRadius.rx,z/c.landRadius.rz)<edgeShape(Math.atan2(z/c.landRadius.rz,x/c.landRadius.rx)))x+=.1;return {x,z,width:5}}let x=0;while(true){const z=creekCenter(x,hole),a=Math.atan2(z/c.landRadius.rz,x/c.landRadius.rx);if(Math.hypot(x/c.landRadius.rx,z/c.landRadius.rz)>=edgeShape(a))return {x,z,width:creekWidth(hole)*2};x+=.1}}
export const HOLE_COUNT=12;
export const greenNames=['','Waterwheel Run','The Two-Tier Garden','Cascade Crossing',...Object.values(newHoles).map(c=>c.greenName)];

export function valleyFrame(x,z,c=newHoles[9]){let best={distance:Infinity,width:0,y:66};for(let i=1;i<c.route.length;i++){const a=c.route[i-1],b=c.route[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz))),d=Math.hypot(x-a.x-t*dx,z-a.z-t*dz);if(d<best.distance)best={distance:d,width:a.w+(b.w-a.w)*t,y:a.y+(b.y-a.y)*t}}return best}
