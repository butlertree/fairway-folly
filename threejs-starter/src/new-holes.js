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
 6:make(6,3,'Starfall Sanctuary',142,67,12,84,116,{theme:'sanctuary',waterLevel:59,teeHeight:82,greenHeight:71,greenName:'The Starlight Saddle',hint:'A downhill short iron to the diagonal green. Favor the generous left shoulder; the creek catches shots short and right.',miniHint:'Crest the low saddle or use the right shoulder to feed the putt toward the cup.',green:{rx:23,rz:13},lakes:[{x:37,z:-22,rx:25,rz:28}],route:[{x:0,z:67,w:14},{x:-11,z:11,w:19},{x:12,z:-62,w:26}],landingSites:[{x:4,z:-53,label:'Generous shoulder'}]}),
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
 }),
 13:make(13,4,'Dunewatch Rise',430,190,17,116,250,{
   theme:'dunewatch',waterLevel:53,teeHeight:82,greenHeight:71,greenName:'The Split Terrace',
   green:{rx:26,rz:13},lakes:[],
   hint:'Drive left of the bunker. Use the left bank to feed onto the green, or carry the low front and right.',
   miniHint:'Ease it downhill from the high shelf. From below, give it more pace or carom off a flower pot toward the cup.',
   route:[{x:-5,z:152,w:16},{x:-2,z:103,w:18},{x:4,z:45,w:19},{x:-4,z:-40,w:19},
     {x:-15,z:-101,w:22},{x:-17,z:-145,w:16}],
   landingSites:[{x:-9,z:-45,label:'Left of the drive bunker'},{x:-8,z:-201,label:'Green feed slope'}]
 }),
 14:make(14,4,'Alderwater Pass',340,103.55,5,119,255,{
   theme:'alderwater',waterLevel:59,teeHeight:75,greenHeight:68,greenName:'The Grassy Pass',
   green:{rx:27,rz:15},lakes:[{x:3,z:-138,rx:63,rz:53}],
   hint:'Lay up on the narrowing fairway, then carry the lake and false front. A long bunker catches overshots.',
   miniHint:'Crest the saddle between the grassy shoulders, or use the outside break to feed toward the cup.',
   route:[{x:-7,z:78,w:17},{x:-15,z:44,w:24},{x:-11,z:5,w:23},{x:-5,z:-37,w:21},{x:2,z:-69,w:14}],
   landingSites:[{x:-3,z:-68,label:'Lake layup'}]
 }),
 15:make(15,3,'Cedarfall Hollow',185,79,11,105,153,{
   theme:'cedarfall',waterLevel:48,teeHeight:87,greenHeight:69,greenName:'The Fallen Cedar',
   green:{rx:22,rz:13},lakes:[],
   waste:[{x:-12,z:21,rx:51,rz:39},{x:16,z:-26,rx:53,rz:48},{x:-25,z:-39,rx:28,rz:26},{x:43,z:-73,rx:22,rz:25}],
   route:[],landingSites:[],
   hint:'An elevated tee looks down into a sandy valley. Carry the waste and land on the shallow green shelf beneath the wooded hills.',
   miniHint:'Skim a cedar bank toward the cup, or read the open slope on the right.'
 }),
 16:make(16,4,'Hemlock Elbow',380,127,-124,177,176,{
   pin:{x:-124,z:-92},landRadius:{rx:177,rz:176,cx:-45},bounds:{rx:161,rz:162,cx:-45},
   theme:'hemlock',waterLevel:45,teeHeight:83,greenHeight:78,greenName:'The Half-Pipe Hollow',
   green:{rx:20,rz:15},lakes:[],
   route:[{x:0,z:119,w:13},{x:9,z:55,w:20},{x:14,z:-16,w:23},{x:10,z:-63,w:28},
     {x:3,z:-83,w:25},{x:-42,z:-89,w:17},{x:-82,z:-91,w:15},{x:-124,z:-92,w:17}],
   landingSites:[{x:12,z:-83,label:'Valley layup'}],
   hint:'Play down to the valley, then turn left and climb to the green. A strong driver hook can round the tall trees, with trouble on both sides.',
   miniHint:'Let the diagonal hollow turn the putt, and use enough pace to climb onto the cup shelf.'
 }),
 17:make(17,5,'Crownridge Pass',555,245,205,220,325,{
   pin:{x:205,z:-163},landRadius:{rx:220,rz:325,cx:82},bounds:{rx:209,rz:304,cx:82},
   theme:'crownridge',waterLevel:47,teeHeight:98,greenHeight:87,greenName:'The Crownridge Saddle',
   green:{rx:24,rz:17},lakes:[],
   waste:[{x:1,z:5,rx:53,rz:31},{x:-29,z:36,rx:25,rz:40},{x:30,z:34,rx:24,rz:44}],
   route:[{x:-2,z:173,w:14},{x:-5,z:112,w:18},{x:-3,z:63,w:23},{x:0,z:33,w:20}],
   layupRoute:[{x:42,z:-29,w:17},{x:73,z:-74,w:19},{x:104,z:-119,w:23},{x:112,z:-133,w:22}],
   landingSites:[{x:0,z:30,label:'Valley landing'},{x:110,z:-128,label:'Uphill landing'}],
   hint:'Play down to the waste-ringed fairway, then turn right uphill. Favor the middle of the second landing to keep the cottonwood out of your blind approach.',
   miniHint:'Crest the grassy saddle with enough pace or let the wider shoulder turn the ball toward the cup.'
 }),
 18:make(18,4,'Cedar Gate',415,195,-81,148,250,{
   landRadius:{cx:-24,rx:172,rz:276},bounds:{cx:-24,rx:147,rz:245},
   theme:'woodland',waterLevel:47,teeHeight:78,greenHeight:74,greenName:'The Cedar Glade',
   green:{rx:22,rz:16},lakes:[],
   route:[{x:0,z:195,w:9},{x:4,z:148,w:10},{x:0,z:106,w:12},{x:-27,z:63,w:15},
     {x:-66,z:11,w:20},{x:-79,z:-10,w:21},{x:-74,z:-53,w:23},{x:-75,z:-112,w:21},{x:-81,z:-176,w:22}],
   landingSites:[{x:-76,z:-10,label:'Draw landing'}],
   hint:'Start through the cedar chute and bend the drive left into the fairway.',
   miniHint:'Use the open glade or bank around the low garden edges.'
 })
};
export function organicFraction(x,z,p){const nx=(x-p.x)/p.rx,nz=(z-p.z)/p.rz,a=Math.atan2(nz,nx);return Math.hypot(nx,nz)/(1+.12*Math.sin(a*3+.8)+.06*Math.cos(a*5))}
const greenRotation=c=>c.id===16?-.24:c.id===15?.08:c.id===14?-.06:c.id===6?-.35:.15;
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
 return [12,17].includes(c.id)?Math.max(fraction,2-fairwayFraction(x,z,c)):fraction;
}
export function waterFraction(x,z,c){if(c.id===10)return creekbankFraction(x,z);let f=Math.min(...c.lakes.map(p=>organicFraction(x,z,p)));if(c.id===4&&x>48)f=Math.min(f,Math.abs(z+29)/2.5);if(creekWidth(c.id)>0)f=Math.min(f,Math.abs(z-creekCenter(x,c.id))/creekWidth(c.id));return f}
export const cedarWasteRocks=[
 {x:-32,z:31,rx:4,ry:2.2,rz:3},{x:-37,z:27,rx:2.4,ry:1.3,rz:2.2},
 {x:30,z:14,rx:3.5,ry:2.1,rz:3},{x:35,z:9,rx:2,ry:1.3,rz:2.2},
 {x:-28,z:-36,rx:4.7,ry:2.9,rz:3.5},{x:-34,z:-39,rx:2.5,ry:1.5,rz:2.3},
 {x:44,z:-48,rx:4,ry:2.5,rz:3.4},{x:50,z:-52,rx:2.4,ry:1.4,rz:2}
];
export const cedarGrass=[
 {x:-31,z:29,rx:10,rz:6},{x:-36,z:15,rx:7,rz:9},{x:32,z:11,rx:10,rz:8},
 {x:42,z:-1,rx:7,rz:5},{x:-29,z:-38,rx:12,rz:8},{x:-34,z:-53,rx:9,rz:5},
 {x:45,z:-48,rx:12,rz:7},{x:31,z:-61,rx:6,rz:4}
];
export const crownridgeWasteRocks=[
 {x:-38,z:41,rx:3.6,ry:1.9,rz:2.8},{x:-42,z:45,rx:1.8,ry:1,rz:1.6},
 {x:42,z:29,rx:3.1,ry:1.7,rz:2.5},{x:46,z:32,rx:1.7,ry:1,rz:1.5},
 {x:-26,z:-7,rx:2.8,ry:1.5,rz:2.4},{x:32,z:4,rx:2.7,ry:1.4,rz:2}
];
export const crownridgeGrass=[
 {x:-38,z:42,rx:7,rz:8},{x:-37,z:23,rx:6,rz:6},{x:-25,z:-8,rx:6,rz:5},
 {x:42,z:30,rx:7,rz:8},{x:35,z:54,rx:5,rz:7},{x:32,z:4,rx:6,rz:5}
];
export function wasteGrassFraction(x,z,hole){
 return Math.min(...(hole===17?crownridgeGrass:hole===15?cedarGrass:timberGrass).map(p=>organicFraction(x,z,p)));
}
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
export function inTimberApproach(x,z){
 const {pin}=newHoles[12];
 if(z< pin.z-3||z> -130)return false;
 const t=Math.min(1,Math.max(0,(-145-z)/(-145-pin.z)));
 return Math.abs(x-(48+(pin.x-48)*t))<19;
}
// Give the broad ridge tees a low apron while keeping the level shot address.
function teeApron(x,z,c){
 const r=Math.hypot(x/12,(z-c.tee.z)/15);
 return .72*smooth((r-.5)/.45)*(1-smooth((r-1.05)/.85));
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
 return y+(c.greenHeight-y)*(1-smooth((green-.92)/.72))-teeApron(x,z,c);
}
// The larger drifts wind into the woods, with smaller outliers at the sand lip.
export const duneGrassDrifts=[
 {x:-30,z:119,rx:11,rz:23,bend:-7,lean:-6,count:57},
 {x:-48,z:86,rx:16,rz:24,bend:7,lean:8,count:64},
 {x:-34,z:49,rx:10,rz:19,bend:-6,lean:-10,count:48},
 {x:-45,z:9,rx:16,rz:23,bend:9,lean:7,count:70},
 {x:-30,z:-33,rx:9,rz:17,bend:4,lean:-7,count:44},
 {x:-51,z:-68,rx:17,rz:27,bend:9,lean:9,count:76},
 {x:-38,z:-118,rx:11,rz:22,bend:-8,lean:-5,count:58},
 {x:32,z:104,rx:11,rz:25,bend:5,lean:-12,count:64},
 {x:47,z:63,rx:17,rz:24,bend:-9,lean:8,count:70},
 {x:29,z:20,rx:9,rz:22,bend:5,lean:-7,count:56},
 {x:37,z:-30,rx:11,rz:20,bend:-5,lean:5,count:56},
 {x:28,z:-86,rx:16,rz:23,bend:6,lean:-7,count:65},
 {x:48,z:-122,rx:18,rz:25,bend:-11,lean:6,count:68},
 {x:17,z:-133,rx:8,rz:11,bend:3,lean:4,count:23}
];
export function duneDriftCenter(d,t){return d.x+d.lean*t+d.bend*(1-t*t)}
export function duneGrassFraction(x,z){
 let nearest=Infinity;
 for(const d of duneGrassDrifts){
   const t=(z-d.z)/d.rz;
   if(Math.abs(t)>1.2)continue;
   nearest=Math.min(nearest,Math.hypot((x-duneDriftCenter(d,t))/d.rx,t));
 }
 return nearest;
}
function dunewatchHeight(x,z,c,fair,green){
 const mound=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 let y=69+1.2*Math.cos(z/49)+.8*Math.sin(x/19);
 for(const side of [-1,1]){
   const ridge=side*(43+8*Math.sin(z/43+side));
   y+=(11+5*Math.cos(z/33+side)**2)*mound(ridge,0,20,163);
 }
 const lane=69+1.4*Math.sin(z/54);
 y+=(lane-y)*(1-smooth((fair-.65)/.66));
 const tee=Math.hypot(x/27,(z-c.tee.z)/36);
 y+=(c.teeHeight-y)*(1-smooth((tee-.27)/.85));

 // The left hillside runs downhill through the green; the front-right slopes fall away.
 y+=19*mound(-31,-204,30,25)+19*mound(11,-231,57,22);
 y-=14*mound(25,-173,27,19)+12*mound(51,-197,23,23);
 const apron=1-smooth((green-.82)/.57);
 return y+(c.greenHeight-y)*apron;
}
export const alderWallHalfWidth=26.8;
export function alderWallHeight(x){
 const dx=x-newHoles[14].pin.x;
 const ends=smooth((alderWallHalfWidth-Math.abs(dx))/5);
 return ends*(.58+.11*Math.sin(dx*.27)+.065*Math.sin(dx*.53));
}
export function alderShoreZ(x){
 const c=newHoles[14];
 let dry=-230,wet=c.lakes[0].z;
 for(let i=0;i<18;i++){
   const z=(dry+wet)/2;
   if(waterFraction(x,z,c)<1)wet=z;else dry=z;
 }
 return (dry+wet)/2;
}
function alderwaterHeight(x,z,c,fair,green){
 const hill=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 let y=65+1.3*Math.sin(z/46+x/24)+18*hill(-74,-58,33,146)+15*hill(65,38,32,140);
 y+=(66-y)*(1-smooth((fair-.64)/.64));
 y+=(c.teeHeight-y)*(1-smooth((Math.hypot(x/26,(z-c.tee.z)/38)-.24)/.85));
 y+=17*hill(-25,-246,43,21)+16*hill(43,-242,29,20);
 y+=(c.greenHeight-y)*(1-smooth((green-.95)/.65));
 const water=waterFraction(x,z,c);
 const front=smooth((-z-159)/23);
 const sill=c.waterLevel+(water>=1?alderWallHeight(x)*front:0);
 const depth=water-1;
 const apron=smooth(depth/.055)*(1-smooth((depth-.14)/.14))*front;
 const offset=x-c.pin.x;
 const shoulders=1.25*Math.exp(-(((offset+16)/8)**2))+.93*Math.exp(-(((offset-17)/7.5)**2));
 const folds=shoulders+.48*Math.sin(offset*.22)*Math.sin((z+202)*.23);
 const bank=sill+Math.max(-2.8,depth*(41+2*front))+apron*folds;
 // Round the crest into the green while leaving the lower apron continuously downhill.
 const gap=y-bank,blend=.85;
 return Math.min(y,bank)-Math.max(0,blend-Math.abs(gap))**2/(4*blend);
}
function cedarfallHeight(x,z,c,green){
 const hill=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 const floor=54+1.7*Math.sin(z/30+x/32)+1.1*Math.cos(x/18-z/28);
 let y=floor+24*hill(-55,-57,42,80)+26*hill(-30,-129,65,38)+12*hill(57,-96,37,44);
 y+=(floor-y)*.88*(1-smooth((wasteFraction(x,z,c)-.63)/.65));
 const front=smooth((z-c.pin.z+1)/19),right=smooth((x-c.pin.x+2)/22);
 const exposed=Math.max(front,right*.87)*smooth((z-c.pin.z+30)/19);
 const shelfShoulder=.77-.22*exposed+.06*Math.sin((x+z)*.095);
 y+=(c.greenHeight-y)*(1-smooth((green-.83)/shelfShoulder));
 const ridge=hill(-10,c.tee.z+16,56,39);
 y+=(c.teeHeight-y)*ridge;
 const tee=Math.hypot(x/9,(z-c.tee.z)/11);
 return y+(c.teeHeight-y)*(1-smooth((tee-.84)/1.48));
}
function hemlockHeight(x,z,c,fair,green){
 const hill=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 let y=60+1.5*Math.sin(z/31+x/25)+19*hill(-77,41,61,91)
   +24*hill(-146,-127,49,49)+20*hill(-165,-72,38,54)+17*hill(59,-67,44,92);
 const approach=16*smooth((-x-30)/104);
 y+=(60+approach-y)*(1-smooth((fair-.62)/.82));
 y+=(c.greenHeight-y)*(1-smooth((green-.82)/.66));
 const ridge=hill(-6,c.tee.z+18,56,54);
 y+=(c.teeHeight-y)*ridge;
 const tee=Math.hypot(x/9,(z-c.tee.z)/12);
 return y+(c.teeHeight-y)*(1-smooth((tee-.75)/1.23));
}
function crownridgeHeight(x,z,c,fair,green){
 const hill=(cx,cz,rx,rz)=>Math.exp(-(((x-cx)/rx)**2+((z-cz)/rz)**2));
 let y=61+2*Math.sin(x/31+z/44)+1.3*Math.cos(z/31)
   +17*hill(-65,44,43,132)+15*hill(81,53,32,85)+18*hill(161,-102,39,88)
   +29*hill(239,-181,51,58)+18*hill(205,-204,46,30);
 y+=20*hill(177,52,49,102)*smooth((x-110)/38)*smooth((z+99)/48);
 y+=13*hill(-52,-116,45,71)*smooth((-x-5)/35);
 const shelf=61+13*smooth((10-z)/135);
 y+=(shelf-y)*(1-smooth((fair-.58)/.9));
 y+=(59-y)*.72*(1-smooth((wasteFraction(x,z,c)-.64)/.56));
 const along=(x-110)*.94-(z+128)*.342;
 const across=(x-110)*.342+(z+128)*.94;
 y+=16*Math.exp(-(((along-55)/27)**2+(across/53)**2));
 y+=(c.greenHeight-y)*(1-smooth((green-.84)/.72));
 const teeR=Math.hypot(x/62,(z-c.tee.z)/79);
 return y+(c.teeHeight-y)*(1-smooth((teeR-.10)/1.20));
}
export function heightNew(x,z,hole){const c=newHoles[hole],gr=newGreenFraction(x,z,c),fair=fairwayFraction(x,z,c);if(hole===12)return timberrootHeight(x,z,c,fair,gr);if(hole===13)return dunewatchHeight(x,z,c,fair,gr);if(hole===14)return alderwaterHeight(x,z,c,fair,gr);if(hole===15)return cedarfallHeight(x,z,c,gr);if(hole===16)return hemlockHeight(x,z,c,fair,gr);if(hole===17)return crownridgeHeight(x,z,c,fair,gr);let y=66+1.7*Math.cos(z/54)+1.4*Math.sin(x/24)+16*Math.exp(-((x+70)**2/400+(z+80)**2/2300))+11*Math.exp(-((x-77)**2/450+(z-96)**2/2600));if(hole===9){const v=valleyFrame(x,z,c);y=v.y+2.2*Math.sin(z/47+x/61)*Math.cos(x/75)+32*smooth((v.distance-v.width*.95)/95)+(27*Math.exp(-((x+85)**2/7000+(z-85)**2/17000))+29*Math.exp(-((x-115)**2/9000+(z-110)**2/11000))+25*Math.exp(-((x-180)**2/16000+(z+215)**2/3600))+5*Math.sin(x/65)*Math.cos(z/83))*smooth((v.distance-v.width*.85)/58);}else {y+=(67-y)*(1-smooth((fair-.7)/.7));y+=(9*Math.sin(x/31+z/73)+8*Math.cos(z/42-x/54)+12)*smooth((fair-1)/1.1)*smooth((Math.hypot(x,z-c.tee.z)-15)/35);}if(hole===18)y+=20*Math.exp(-(((x+78)/52)**2+((z+214)/24)**2));const water=waterFraction(x,z,c);
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
 y+=(c.waterLevel-.9-y)*(1-smooth((water-(hole===10?1.02:1.05))/(hole===10?1.15:.9)));y+=(c.greenHeight-y)*(1-smooth((gr-.88)/.55));y+=smooth((gr-1)/.35)*3.3*smooth((waterFraction(x,z,c)-1)/.5)*Math.exp(-(((gr-1.65)/.55)**2))*(.2+.8*(1-Math.sin(Math.atan2(z-c.pin.z,x-c.pin.x)))/2)*(1+.35*Math.cos(Math.atan2(z-c.pin.z,x-c.pin.x)*3));if(c.id===7&&gr<1.45)y+=1.2*(1-smooth(gr/1.45));const tee=Math.max(Math.abs(x)/7,Math.abs(z-c.tee.z)/9);y+=(c.teeHeight-y)*(hole===10?(1-smooth((Math.hypot(x/19,(z-c.tee.z)/23)-.48)/.62))*smooth((water-1.08)/1.5):hole===11?1-smooth((Math.hypot(x/18,(z-c.tee.z)/22)-.47)/.87):hole===9?1-smooth((Math.hypot(x/40,(z-c.tee.z)/65)-.24)/1.05):1-smooth((tee-1)/1.5));return hole===9?y-teeApron(x,z,c):y}
export function lieNew(x,z,hole){const c=newHoles[hole];if(((x-(c.bounds.cx??0))/c.bounds.rx)**2+(z/c.bounds.rz)**2>1)return 'OB';if(Math.abs(x)<6&&Math.abs(z-c.tee.z)<8)return 'Tee box';if(hole===14&&waterFraction(x,z,c)<1)return 'Water';if(newGreenFraction(x,z,c)<1)return 'Green';if(waterFraction(x,z,c)<1&&newGreenFraction(x,z,c)>1.25)return 'Water';if(wasteFraction(x,z,c)<1)return [12,15,17].includes(hole)&&wasteGrassFraction(x,z,hole)<.84?'Rough':'Waste sand';return fairwayFraction(x,z,c)<1?'Fairway':'Rough'}
// Each creek reaches the actual sculpted edge, so the fall begins at the lip.
export function newOutlet(hole){const c=newHoles[hole];if(![4,5,6,8].includes(hole))return null;if(hole===4){const z=-29;let x=50;while(Math.hypot(x/c.landRadius.rx,z/c.landRadius.rz)<edgeShape(Math.atan2(z/c.landRadius.rz,x/c.landRadius.rx)))x+=.1;return {x,z,width:5}}let x=0;while(true){const z=creekCenter(x,hole),a=Math.atan2(z/c.landRadius.rz,x/c.landRadius.rx);if(Math.hypot(x/c.landRadius.rx,z/c.landRadius.rz)>=edgeShape(a))return {x,z,width:creekWidth(hole)*2};x+=.1}}
export const HOLE_COUNT=18;
export const greenNames=['','Waterwheel Run','The Two-Tier Garden','Cascade Crossing',...Object.values(newHoles).map(c=>c.greenName)];

export function valleyFrame(x,z,c=newHoles[9]){let best={distance:Infinity,width:0,y:66};for(let i=1;i<c.route.length;i++){const a=c.route[i-1],b=c.route[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz))),d=Math.hypot(x-a.x-t*dx,z-a.z-t*dz);if(d<best.distance)best={distance:d,width:a.w+(b.w-a.w)*t,y:a.y+(b.y-a.y)*t}}return best}
