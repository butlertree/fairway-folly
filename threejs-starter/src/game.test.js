import {miniHeight,miniPool,onCrossing,crossingX,miniSlope} from './mini-surfaces.js';
import {pullback,releasePutt,puttingCameraPose} from './putting.js';
import {aimPoint,isAimClick,puttingAim} from './aim.js';
import test from 'node:test';import assert from 'node:assert/strict';import {createGame,swing,putt,step,enterGreen,height,course,yardsToPin,lie,ponds,inPond,waterLevel,canTapIn,tapIn,swingMeter,puttInfo,puttPowerForDistance,clubs,lieFactor,mini} from './game.js';
function run(g,n=8000){for(let i=0;i<n;i++)step(g);return g}
test('zero-stroke startup and cup never win',()=>{let g=run(createGame());assert.equal(g.strokes,0);g.mini=true;g.ball={x:0,y:.3,z:-12,vx:0,vy:0,vz:0};run(g);assert.notEqual(g.mode,'holed')});
test('shot flights then settles',()=>{let g=createGame();swing(g,1,0);step(g);assert.ok(g.ball.y>height(0,course.tee.z));run(g);assert.equal(g.strokes,1);assert.equal(g.mode,'ready');assert.ok(g.ball.z<0)});
test('wild shot costs stroke and distance',()=>{let g=createGame();g.angle=Math.PI/2;swing(g,1,1);run(g);assert.equal(g.strokes,2);assert.equal(g.ball.z,course.tee.z);assert.equal(g.ball.x,0)});
test('overhit is not green entry',()=>{let g=createGame();g.ball={x:0,y:height(0,course.pin.z+91.44)+course.ballRadius,z:course.pin.z+91.44,vx:0,vy:0,vz:0};swing(g,1,0);run(g);assert.equal(g.mini,false);assert.equal(g.strokes,2);assert.equal(g.ball.z,course.pin.z+91.44)});
test('approach maps different starting spots',()=>{let a=createGame(),b=createGame();a.ball.x=-5;b.ball.x=5;enterGreen(a);enterGreen(b);assert.notEqual(a.ball.x,b.ball.x)});
test('settled green enters mini mode',()=>{let g=createGame();g.ball={x:0,y:height(0,course.pin.z)+course.ballRadius,z:course.pin.z,vx:0,vy:0,vz:0};g.mode='rolling';g.strokes=2;run(g,60);assert.equal(g.mode,'green-arrival');assert.equal(g.mini,false);run(g,120);assert.equal(g.mini,true)});
test('actual vertical windmill blade moves stationary ball',()=>{let g=createGame();enterGreen(g);g.ball.x=.3;g.ball.z=8;run(g,30);assert.ok(Math.hypot(g.ball.x-.3,g.ball.z-8)>.05)});
test('walls rebound at visible surface',()=>{let g=createGame();enterGreen(g);g.ball.x=8.69;g.ball.z=10;g.ball.vx=10;g.mode='rolling';step(g);assert.ok(g.ball.vx<0);assert.ok(g.ball.x<=8.7)});
test('the former first-green puddle is dry and costs no water penalty',()=>{let g=createGame();enterGreen(g);g.ball.x=2.8;g.ball.z=-7;putt(g,10,0);run(g,100);assert.equal(g.strokes,1);assert.doesNotMatch(g.message,/Water/)});
test('legitimate putt drops in cup',()=>{let g=createGame();enterGreen(g);g.ball.x=0;g.ball.z=1;putt(g,0,-1.3);run(g,300);assert.equal(g.mode,'holed');assert.ok(g.strokes>0);assert.ok(g.ball.y<0)});
test('simulation reproducible',()=>{let a=createGame(),b=createGame();swing(a,.8,.3);swing(b,.8,.3);run(a,1000);run(b,1000);assert.deepEqual(a.ball,b.ball)});

function settle(g){for(let i=0;i<6000&&g.mode!=='ready'&&g.mode!=='holed';i++)step(g);return g}
test('complete par four tee to mapped green to cup',()=>{const g=createGame();swing(g,1,0);settle(g);g.club='Wedge';routeShot(g,0,course.pin.z,.725);assert.ok(g.mini);finishMini(g);assert.equal(g.mode,'holed');assert.equal(g.history.length,g.strokes)});
test('fast putt over cup does not capture',()=>{const g=createGame();enterGreen(g);g.putts=1;g.strokes=3;g.ball.x=0;g.ball.z=.1;g.ball.vz=-10;step(g);assert.notEqual(g.mode,'holed')});
test('left and right accuracy misses produce opposite shot shapes',()=>{const a=createGame(),b=createGame();swing(a,.5,-.8);swing(b,.5,.8);for(let i=0;i<60;i++){step(a);step(b)}assert.ok(a.ball.x< -1);assert.ok(b.ball.x>1)});
test('clubs and power change distance',()=>{const a=createGame(),b=createGame(),c=createGame();b.club='Wedge';swing(a,.5,0);swing(b,.5,0);swing(c,1,0);settle(a);settle(b);settle(c);assert.ok(b.ball.z>a.ball.z);assert.ok(a.ball.z>c.ball.z)});

test('chosen putt power predicts free-roll distance',()=>{const g=createGame(1);enterGreen(g);g.ball.x=-7.5;g.ball.z=10;putt(g,0,-1,50);settle(g);assert.ok(Math.abs(g.ball.z+10)<.3)});

test('cancelled or zero-power putt costs no stroke',()=>{const g=createGame();enterGreen(g);putt(g,0,0,50);putt(g,1,0,0);assert.equal(g.strokes,0);assert.equal(g.putts,0);assert.equal(g.mode,'ready')});

test('tee to pin is physically 360 yards',()=>{const g=createGame();assert.ok(Math.abs(yardsToPin(g.ball)-360)<.001);assert.equal(lie(g.ball.x,g.ball.z),'Tee box');assert.equal(height(3,course.tee.z+4),height(0,course.tee.z))});
test('maximum tee driver cannot reach the green',()=>{for(const power of [.8,.9,1])for(const accuracy of [-.1,0,.1]){const g=createGame();swing(g,power,accuracy);settle(g);assert.equal(g.mini,false);assert.ok(yardsToPin(g.ball)>75)}});
test('full driver carry and total distance agree with yardage',()=>{const g=createGame();swing(g,1,0);let carry;for(let i=0;i<6000&&g.mode!=='ready';i++){const vy=g.ball.vy;step(g);if(carry===undefined&&vy<0&&g.ball.vy>0)carry=(course.tee.z-g.ball.z)/.9144}assert.ok(carry>235&&carry<255,`carry ${carry}`);const total=(course.tee.z-g.ball.z)/.9144;assert.ok(total>250&&total<285,`total ${total}`)});
test('course pond has a submerged bed below its level water surface',()=>{for(let i=0;i<32;i++){const a=i/32*Math.PI*2,x=ponds.course.x+ponds.course.rx*.8*Math.cos(a),z=ponds.course.z+ponds.course.rz*.8*Math.sin(a);assert.equal(inPond(x,z,ponds.course),true);assert.ok(height(x,z)<waterLevel-.2)}});

test('tap-in is available within eight feet and counts one real putt',()=>{const g=createGame();enterGreen(g);g.strokes=3;g.ball.x=0;g.ball.z=4.1;assert.equal(canTapIn(g),true);assert.equal(tapIn(g),true);assert.equal(g.strokes,4);assert.equal(g.putts,1);assert.equal(g.mode,'rolling');assert.ok(g.ball.vz<0);settle(g);assert.equal(g.mode,'holed');assert.equal(g.strokes,4);assert.ok(g.ball.y<-.8)});
test('tap-in rejected when distant or still moving',()=>{const g=createGame();enterGreen(g);assert.equal(tapIn(g),false);g.ball.z=-10;g.mode='rolling';assert.equal(canTapIn(g),false);assert.equal(g.strokes,0)});
test('cup drop animates before a win and restart discards it',()=>{const g=createGame();enterGreen(g);g.ball.x=0;g.ball.z=1;putt(g,0,-1.3);for(let i=0;i<300&&g.mode!=='sinking';i++)step(g);assert.equal(g.mode,'sinking');const y=g.ball.y;run(g,60);assert.equal(g.mode,'sinking');assert.ok(g.ball.y<y);const fresh=createGame();run(fresh,400);assert.equal(fresh.mode,'ready');assert.equal(fresh.strokes,0);assert.equal(fresh.finish,undefined)});
test('aim point follows current ball and clips wild aims visibly to property',()=>{const g=createGame();g.ball.x=4;g.ball.z=40;g.angle=.3;let a=aimPoint(g);assert.ok(a.x>g.ball.x);assert.ok(a.z<g.ball.z);g.angle=Math.PI/2;a=aimPoint(g);assert.equal(a.out,true);assert.ok(a.x<=course.bounds.rx);assert.ok(a.distance>100)});
test('actual flight trail records the airborne arc',()=>{const g=createGame();swing(g,1,0);run(g,360);assert.ok(g.trail.length>30);assert.ok(Math.max(...g.trail.map(p=>p[1]))>15);assert.ok(g.trail.at(-1)[2]<g.trail[0][2])});
test('dragging the camera is not interpreted as clicking to aim',()=>{assert.equal(isAimClick({x:100,y:100},{x:103,y:102}),true);assert.equal(isAimClick({x:100,y:100},{x:150,y:120}),false)});
test('swing meters have quicker distinct power and accuracy sweeps',()=>{assert.ok(swingMeter('power',1.05)>.999);assert.equal(swingMeter('accuracy',0),-1);assert.ok(Math.abs(swingMeter('accuracy',.475))<.001);assert.ok(swingMeter('accuracy',.95)>.999)});

test('putting direction preview stops at the actual shaped bank',()=>{const g=createGame();enterGreen(g);g.ball.x=0;g.ball.z=-9.6;for(let i=0;i<24;i++){g.angle=i*Math.PI/12;const a=puttingAim(g);assert.ok(insideGreen(1,a.x,a.z,.299));assert.ok(a.distance>=0)}});

test('short putts use a comfortable middle range of power',()=>{assert.ok(puttInfo(10).distance<2);const power=puttPowerForDistance(20);assert.ok(power>45&&power<55);assert.ok(puttPowerForDistance(7)>20);assert.equal(puttInfo(100).distance,60)});
test('two to twenty-foot putts match their displayed roll distance',()=>{for(const feet of [2,5,10,20]){const g=createGame(1);enterGreen(g);g.ball.x=-7.5;g.ball.z=10;putt(g,0,-1,puttPowerForDistance(feet));settle(g);assert.ok(Math.abs((10-g.ball.z)-feet)<.1,`roll ${feet}`)}});
test('green plays as thirty feet long with approaches under thirty feet',()=>{assert.equal(mini.halfZ*2,30);assert.equal(mini.feetPerUnit,1);for(const x of [-8.7,8.7])for(const z of [-14.7,14.7])assert.ok(Math.hypot(x,z-mini.cup.z)<30);const g=createGame();g.ball.x=course.green.rx*.8;g.ball.z=course.pin.z;enterGreen(g);assert.ok(Math.hypot(g.ball.x,g.ball.z+12)<30);g.ball.z=course.pin.z+course.green.rz;enterGreen(g);assert.ok(Math.hypot(g.ball.x,g.ball.z+12)<30)});
test('sand wedge is a shorter higher-loft club and resists bunker distance loss',()=>{const g=createGame();assert.ok(clubs['Sand wedge'].carry<clubs.Wedge.carry);assert.ok(clubs['Sand wedge'].loft>clubs.Wedge.loft);g.lie='Sand';g.club='Sand wedge';const sw=lieFactor(g);g.club='Wedge';assert.ok(sw>lieFactor(g))});
test('sand wedge can escape a real greenside bunker with its reduced carry',()=>{const p=bunkersByHole[1].find(p=>p.id==='green-pot'),g=createGame();g.ball={x:p.x,y:height(p.x,p.z)+course.ballRadius,z:p.z,vx:0,vy:0,vz:0};g.lie='Sand';g.club='Sand wedge';g.angle=Math.atan2(-g.ball.x,g.ball.z-course.pin.z);swing(g,.55,0);settle(g);assert.equal(g.strokes,1);assert.notEqual(g.lie,'Sand');assert.ok(g.mini)});
test('power meter does not dwell near maximum',()=>{assert.ok(swingMeter('power',1)<.97);assert.ok(swingMeter('power',1.1)<.97);assert.ok(swingMeter('power',1.05)>.999)});
test('audio events are emitted once for a putt, cup drop and celebration',()=>{const g=createGame();enterGreen(g);g.ball.x=0;g.ball.z=4.1;tapIn(g);settle(g);run(g,100);for(const type of ['putt','cup','win'])assert.equal(g.soundEvents.filter(e=>e.type===type).length,1,type)});

test('one pullback gesture chooses direction and power, then releases one putt',()=>{const g=createGame();g.ball.z=course.pin.z;enterGreen(g);g.puttCameraAnchor={x:g.ball.x,z:g.ball.z,angle:g.angle};const gesture=pullback({x:0,z:9,sx:200,sy:400},{x:-2,z:13,sx:216,sy:478},g.angle);assert.ok(gesture.x>0&&gesture.z<0);assert.ok(gesture.percent>45&&gesture.percent<55);assert.equal(releasePutt(g,gesture),true);assert.equal(g.strokes,1);assert.equal(g.putts,1);assert.ok(g.ball.vx>0&&g.ball.vz<0);assert.equal(releasePutt(g,gesture),false);assert.equal(g.strokes,1)});
test('a tap or cancelled pullback does not spend a stroke',()=>{const g=createGame();enterGreen(g);assert.equal(releasePutt(g,{x:0,z:-1,percent:0}),false);assert.equal(g.strokes,0);assert.equal(g.mode,'ready')});
test('putting camera starts behind the ball and widens for a longer rolling putt',()=>{const g=createGame();g.ball.z=course.pin.z;enterGreen(g);const pose=puttingCameraPose(g),dx=Math.sin(g.angle),dz=-Math.cos(g.angle);assert.ok((pose.position[0]-g.ball.x)*dx+(pose.position[2]-g.ball.z)*dz<0);g.puttCameraAnchor={x:g.ball.x,z:g.ball.z,angle:g.angle};releasePutt(g,{x:2,z:-4,percent:50});run(g,60);const wide=puttingCameraPose(g);assert.ok(wide.position[1]>pose.position[1]);assert.ok(wide.position.every(Number.isFinite))});

test('near-cup address camera avoids the windmill roof',()=>{const g=createGame();enterGreen(g);g.ball.x=0;g.ball.z=3;g.angle=0;const p=puttingCameraPose(g).position;assert.ok(Math.hypot(p[0],p[2]-6.5)>3)});

test('38-yard approach shows several seconds of flight and a settled landing before reveal',()=>{const g=createGame();g.ball={x:0,z:course.pin.z+38*.9144,y:height(0,course.pin.z+38*.9144)+course.ballRadius,vx:0,vy:0,vz:0};g.lie='Fairway';g.club='Sand wedge';swing(g,.64,0);let airborne=0,peak=0;for(let i=0;i<2000&&g.mode!=='green-arrival';i++){step(g);if(g.mode==='flight')airborne++;peak=Math.max(peak,g.ball.y-g.origin.y);assert.equal(g.mini,false)}assert.ok(airborne>360);assert.ok(peak>10);assert.equal(g.mode,'green-arrival');assert.ok(g.trail.length>50);run(g,60);assert.equal(g.mini,false);run(g,60);assert.equal(g.mini,true)});

// Hole two uses the same authoritative simulation as the first hole.
import {nextHole,getCourse} from './game.js';
import {bridgeHeight,bridgeGreen} from './hole-two.js';
function routeShot(g,x,z,p){g.angle=Math.atan2(x-g.ball.x,g.ball.z-z);swing(g,p,0);settle(g)}
test('par five is 520 yards and unlocks only after a completed hole',()=>{const g=createGame();assert.equal(nextHole(g),null);g.mode='holed';g.strokes=4;const n=nextHole(g);assert.equal(n.par,5);assert.equal(Math.round(yardsToPin(n.ball,2)),520);assert.deepEqual(n.scorecard,[{hole:1,par:4,strokes:4}]);assert.equal(nextHole(n),null)});
test('safe island route reaches the green in three shots',()=>{const g=createGame(2);routeShot(g,-65,105,.65);assert.equal(g.lie,'Fairway');assert.equal(g.strokes,1);routeShot(g,-70,-70,.72);assert.equal(g.lie,'Fairway');assert.equal(g.mini,false);routeShot(g,0,getCourse(2).pin.z,.73);assert.equal(g.mini,true);assert.equal(g.strokes,3)});
test('precise risky route reaches green in two and a short drive finds water',()=>{const g=createGame(2);routeShot(g,24,7,1);assert.equal(g.lie,'Fairway');routeShot(g,0,getCourse(2).pin.z,.98);assert.equal(g.mini,true);assert.equal(g.strokes,2);const miss=createGame(2);routeShot(miss,24,7,.8);assert.equal(miss.strokes,2);assert.match(miss.message,/Water/)});
test('bridge supports and slopes the ball; exposed stream costs a penalty',()=>{const g=createGame(3);enterGreen(g);g.ball.x=crossingX(8);g.ball.z=8;g.mode='rolling';step(g);assert.ok(g.ball.y>.3);assert.ok(g.ball.vz>0);assert.ok(Math.abs(g.ball.y-(miniHeight(3,g.ball.x,g.ball.z)+.3))<.01);const w=createGame(3);enterGreen(w);w.ball.x=5;w.ball.z=9;putt(w,0,-1,50);settle(w);assert.equal(w.strokes,2);assert.match(w.message,/Water/)});
test('bridge can be crossed with a real putt without a phantom windmill',()=>{const g=createGame(3);enterGreen(g);g.ball.x=0;g.ball.z=11;putt(g,0,-1,55);let crossed=false,raised=false;for(let i=0;i<1600&&g.mode==='rolling';i++){step(g);raised ||=g.ball.y>.8;crossed ||=g.ball.z<2}assert.ok(raised);assert.ok(crossed);assert.equal(g.strokes,1)});
test('second hole can be completed from tee through bridge to cup',()=>{const g=createGame(2);routeShot(g,24,7,1);routeShot(g,0,getCourse(2).pin.z,.98);finishMini(g);assert.equal(g.mode,'holed');assert.equal(g.history.length,g.strokes)});

test("sculpted islands have raised playable shelves above their water",()=>{assert.ok(height(0,getCourse(2).pin.z,2)-getCourse(2).waterLevel>18);assert.ok(height(-70,-70,2)-getCourse(2).waterLevel>12);assert.ok(height(24,7,2)-getCourse(2).waterLevel>8);assert.ok(height(-39,-90)>height(0,-90)+4)});

import {playbackRate} from './game.js';
test('approach quality spreads putting starts and near pin is rewarded',()=>{for(const h of [1,2]){const c=getCourse(h),near=createGame(h),far=createGame(h);near.ball.x=1;near.ball.z=c.pin.z;far.ball.x=0;far.ball.z=c.pin.z+c.green.rz*.9;enterGreen(near);enterGreen(far);assert.ok(Math.hypot(far.ball.x,far.ball.z+12)-Math.hypot(near.ball.x,near.ball.z+12)>12);assert.notEqual(near.ball.z,far.ball.z);assert.ok(near.approachLanding.distanceYards<2)}});
test('only prolonged full-course rolling is accelerated for display',()=>{const g=createGame();g.mode='flight';g.rollStarted=0;g.time=8;assert.equal(playbackRate(g),1);g.mode='rolling';assert.equal(playbackRate(g),3.5);g.mini=true;assert.equal(playbackRate(g),1);g.mini=false;g.time=.2;assert.equal(playbackRate(g),1)});

import {selectTarget,selectedTarget,courseHit,golfCameraPose} from './aim.js';
import {alignToPin} from './game.js';
test('selected landing marker keeps exact position and measured yardage',()=>{const g=createGame(2);assert.ok(selectTarget(g,{x:-65,z:105}));assert.equal(selectedTarget(g).yards,179);assert.equal(selectedTarget(g).x,-65);assert.equal(g.strokes,0);alignToPin(g);assert.equal(g.target,null);assert.equal(g.angle,0)});
test('heightfield tap hits raised landing island rather than ball-height plane',()=>{const hit=courseHit({x:-65,y:300,z:105},{x:0,y:-1,z:0},2);assert.ok(hit);assert.equal(hit.x,-65);assert.equal(hit.z,105)});
test('hybrid fills driver to seven iron distance gap',()=>{assert.equal(clubs.Hybrid.yards,200);const distances=[];for(const club of ['7 iron','Hybrid','Driver']){const g=createGame();g.club=club;swing(g,1,0);run(g,240);distances.push(course.tee.z-g.ball.z)}assert.ok(distances[0]<distances[1]&&distances[1]<distances[2])});
test('new resting shot automatically faces pin and clears previous target',()=>{const g=createGame(2);selectTarget(g,{x:-65,z:105});swing(g,.65,0);settle(g);assert.equal(g.target,null);assert.ok(Math.abs(g.angle-Math.atan2(-g.ball.x,g.ball.z-getCourse(2).pin.z))<1e-9)});
test('behind ball camera clears steep hillside',()=>{const g=createGame(2);g.ball={x:20,z:getCourse(2).pin.z+38,y:height(20,getCourse(2).pin.z+38,2)+.085};g.angle=0;for(const mobile of [false,true]){const p=golfCameraPose(g,false,mobile);assert.ok(p.position[1]>=height(p.position[0],p.position[2],2)+3);for(let i=1;i<16;i++){const t=i/16;assert.ok(p.position[1]*(1-t)+p.target[1]*t>=height(p.position[0]*(1-t)+p.target[0]*t,p.position[2]*(1-t)+p.target[2]*t,2)+.39)}}});

test('eagle and birdie sounds trigger once only after a counted cup finish',()=>{for(const under of [2,1,0]){const g=createGame(2);g.strokes=g.par-under-1;enterGreen(g);g.ball.x=0;g.ball.z=1;putt(g,0,-1.3);run(g,400);assert.equal(g.mode,'holed');const events=g.soundEvents.map(e=>e.type);assert.equal(events.filter(t=>t==='cup').length,1);assert.equal(events.filter(t=>t==='win').length,1);assert.equal(events.filter(t=>t==='eagle').length,under===2?1:0);assert.equal(events.filter(t=>t==='birdie').length,under===1?1:0);run(g,100);assert.equal(g.soundEvents.length,events.length)}});

import {landingSound,METRES_PER_YARD} from './game.js';
test('landing sounds distinguish surfaces and are emitted at physical contact',()=>{assert.equal(landingSound('Green'),'land-green');assert.equal(landingSound('Rough'),'land-rough');assert.equal(landingSound('Sand'),'land-sand');assert.equal(landingSound('Fairway'),'land-fairway');const g=createGame();swing(g,1,0);run(g,100);assert.equal(g.soundEvents.filter(e=>e.type.startsWith('land-')).length,0);for(let i=0;i<3000&&!g.soundEvents.some(e=>e.type.startsWith('land-'));i++)step(g);const landing=g.soundEvents.find(e=>e.type.startsWith('land-'));assert.ok(landing);assert.ok(landing.strength>0&&landing.strength<=1);assert.equal(g.strokes,1)});
test('selected pin target is separate from full power out of bounds risk',()=>{const g=createGame();g.ball.z=course.pin.z+90*METRES_PER_YARD;selectTarget(g,course.pin);assert.equal(selectedTarget(g).out,false);assert.equal(selectedTarget(g).yards,90);assert.equal(aimPoint(g).out,true);g.club='Sand wedge';assert.equal(aimPoint(g).out,false)});

import {clubSound,clubImpacts} from './audio-design.js';
test('clubs emit distinct dry strike events scaled by power',()=>{const types=new Set();for(const club of ['Driver','Hybrid','7 iron','Wedge']){const g=createGame();g.club=club;swing(g,.25,0);assert.equal(g.soundEvents[0].type,clubSound(club));assert.equal(g.soundEvents[0].strength,.5);types.add(g.soundEvents[0].type)}assert.equal(types.size,4);assert.ok(clubImpacts.driver.rate<clubImpacts.iron.rate);assert.ok(clubImpacts.driver.body<clubImpacts.iron.body);assert.ok(clubImpacts.putter.gain<clubImpacts.driver.gain)});

import {putterPose} from './putting.js';
test('putter striking face points at ball for forward sideways and backwards aim',()=>{for(const angle of [0,.6,Math.PI/2,Math.PI,-1.2]){const g=createGame();enterGreen(g);g.angle=angle;const p=putterPose(g),faceX=p.position[0]-.182*Math.sin(p.rotation),faceZ=p.position[2]-.182*Math.cos(p.rotation),rearX=p.position[0]+.26*Math.sin(p.rotation),rearZ=p.position[2]+.26*Math.cos(p.rotation);assert.ok(Math.abs(Math.hypot(faceX-g.ball.x,faceZ-g.ball.z)-.298)<1e-8);assert.ok(Math.hypot(rearX-g.ball.x,rearZ-g.ball.z)>.7)}});

test('97–100 percent driver shots get a stronger smash without changing other clubs',()=>{for(const power of [.9699,.97,.985,1]){const g=createGame();swing(g,power,0);assert.equal(g.soundEvents[0].type,power>=.97?'strike-driver-smash':'strike-driver');assert.equal(g.strokes,1)}for(const club of ['Hybrid','7 iron','Wedge']){const g=createGame();g.club=club;swing(g,1,0);assert.notEqual(g.soundEvents[0].type,'strike-driver-smash')}});

import {riverOutlet,riverCenter,riverWidth,riverLevel,verdantMesh,sceneryRocks,rockBaseY} from './course.js';
import {edgeShape} from './landscape.js';
import {recordedClubs} from './audio-design.js';
test('river continues past old end and reaches the shared island cliff edge',()=>{assert.ok(riverOutlet.nz>32);assert.ok(riverWidth(38)>1);assert.ok(Math.abs(riverOutlet.x-riverCenter(riverOutlet.nz)*course.sx)<1e-7);const a=Math.atan2(riverOutlet.z/(51*course.sz),riverOutlet.x/(40*course.sx));assert.ok(Math.abs(Math.hypot(riverOutlet.x/(40*course.sx),riverOutlet.z/(51*course.sz))-edgeShape(a))<1e-8)});
test('scenery rocks have supported footprints and embedded bases',()=>{for(const r of sceneryRocks){for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=r.x+Math.cos(a)*r.r,z=r.z+Math.sin(a)*r.r,angle=Math.atan2(z/(51*course.sz),x/(40*course.sx));assert.ok(Math.hypot(x/(40*course.sx),z/(51*course.sz))<edgeShape(angle));assert.ok(rockBaseY(r)-r.r*.72<height(x,z))}}});
test('both tee cameras start upright with ball and down-hole target framed',()=>{for(const hole of [1,2])for(const mobile of [false,true]){const g=createGame(hole),p=golfCameraPose(g,false,mobile),angle=Math.atan2(p.position[1]-p.target[1],Math.hypot(p.position[0]-p.target[0],p.position[2]-p.target[2]));assert.ok(angle>0&&angle<.12);assert.ok(p.target[2]<g.ball.z);assert.ok(p.position[2]>g.ball.z)}});
test('club families use separate recorded sources rather than repitched driver',()=>{assert.notEqual(recordedClubs.driver[0],recordedClubs.iron[0]);assert.notEqual(recordedClubs.wedge[0],recordedClubs.driver[0]);assert.notEqual(recordedClubs.putter[0],recordedClubs.driver[0]);assert.equal(recordedClubs.iron.length,3);assert.equal(recordedClubs.putter.length,3)});

import {holeThree,coveFraction} from './hole-three.js';
test('signature par three is 165 yards, starts with an iron and has a submerged shared lake',()=>{const g=createGame(3);assert.equal(g.par,3);assert.equal(g.club,'7 iron');assert.equal(Math.round(yardsToPin(g.ball,3)),165);assert.equal(lie(0,holeThree.pin.z,3),'Green');assert.ok(height(0,holeThree.pin.z,3)>holeThree.waterLevel+8);assert.equal(lie(0,0,3),'Water');assert.ok(height(0,0,3)<holeThree.waterLevel);for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=1+.12*Math.sin(a*3+.8)+.06*Math.cos(a*5);assert.ok(Math.abs(coveFraction(holeThree.lake.x+holeThree.lake.rx*r*Math.cos(a),holeThree.lake.z+holeThree.lake.rz*r*Math.sin(a))-1)<1e-8)}});
test('par three rewards a full iron, penalizes an underhit and rejects wild misses',()=>{const g=createGame(3);swing(g,.98,0);settle(g);assert.ok(g.mini);assert.equal(g.strokes,1);assert.ok(g.approachLanding.distanceYards<2);const short=createGame(3);swing(short,.8,0);settle(short);assert.equal(short.strokes,2);assert.match(short.message,/Water/);assert.equal(short.ball.z,holeThree.tee.z);const wild=createGame(3);wild.angle=Math.PI/2;swing(wild,1,1);settle(wild);assert.equal(wild.strokes,2);assert.match(wild.message,/bounds/)});
test('third putting green has no invisible windmill or old side pond',()=>{const g=createGame(3);enterGreen(g);g.ball.x=0;g.ball.z=1;run(g,100);assert.equal(g.mode,'ready');assert.equal(g.ball.x,0);g.ball.x=6;g.ball.z=-7;putt(g,0,-1,10);settle(g);assert.equal(g.strokes,1);assert.equal(g.mode,'ready')});
test('complete nine-hole round preserves actual strokes through every tee and cup',()=>{let g=createGame(),total=0;for(let h=1;h<=9;h++){assert.equal(g.hole,h);const c=getCourse(h);if(h===1){swing(g,1,0);settle(g);g.club='Wedge';routeShot(g,0,c.pin.z,.725)}if(h===2){routeShot(g,24,7,1);routeShot(g,0,c.pin.z,.98)}if(h===3)swing(g,.98,0),settle(g);if(h===4){routeShot(g,-35,-22,.86);g.club='Hybrid';routeShot(g,c.pin.x,c.pin.z,.99)}if(h===5){routeShot(g,-39,42,.76);g.club='Hybrid';routeShot(g,-31,-130,.87);g.club='7 iron';routeShot(g,c.pin.x,c.pin.z,.79)}if(h===6)routeShot(g,c.pin.x,c.pin.z,.74);if(h===8){g.club='Hybrid';routeShot(g,c.pin.x,c.pin.z,.9)}if(h===7){routeShot(g,24,-5,.83);routeShot(g,c.pin.x,c.pin.z,.89)}if(h===9){routeShot(g,7,23,.84);g.club='Hybrid';routeShot(g,110,-120,.93);g.club='7 iron';routeShot(g,c.pin.x,c.pin.z,.76)}assert.ok(g.mini);finishMini(g);assert.equal(g.mode,'holed');assert.equal(g.history.length,g.strokes);total+=g.strokes;if(h<9)g=nextHole(g)}assert.equal(g.scorecard.length,8);assert.equal(g.scorecard.reduce((n,h)=>n+h.strokes,g.strokes),total);assert.ok(total>=26&&total<=45,`actual round ${total}`);assert.equal(nextHole(g),null)});

import {tryFullShotCup} from './game.js';
test('a slow full shot can hole out without requiring a putt or spending another stroke',()=>{for(const hole of [1,2,3]){const g=createGame(hole),c=getCourse(hole);g.club='Sand wedge';swing(g,.1,0);g.ball={x:c.pin.x,y:height(c.pin.x,c.pin.z,hole)+c.ballRadius,z:c.pin.z+.003,vx:0,vy:0,vz:-.2};g.mode='rolling';step(g);assert.equal(g.mode,'sinking');assert.equal(g.putts,0);assert.equal(g.strokes,1);assert.ok(g.holeOut);run(g,200);assert.equal(g.mode,'holed');assert.equal(g.strokes,1);assert.equal(g.soundEvents.filter(e=>e.type==='cup').length,1)}});
test('cup rejects flyovers, fast rolls, near misses and unplayed balls',()=>{for(const kind of ['fast','high','wide','unplayed']){const g=createGame(3),c=getCourse(3);if(kind!=='unplayed')swing(g,.1,0);g.ball={x:kind==='wide'?.12:0,y:height(0,c.pin.z,3)+c.ballRadius+(kind==='high'?2:0),z:c.pin.z,vx:kind==='fast'?5:0,vy:0,vz:0};assert.equal(tryFullShotCup(g),false);assert.equal(g.mini,false)}});

test('all three tees have elevated level shelves above their surrounding ground',()=>{for(const hole of [1,2,3]){const c=getCourse(hole),y=height(0,c.tee.z,hole);assert.ok(y-height(20,c.tee.z,hole)>1.5);assert.ok(Math.abs(y-height(2,c.tee.z+2,hole))<.03)}});

test('all shaped banks rebound at their visible shared outline',()=>{for(let hole=1;hole<=9;hole++){const p=greenOutline(hole)[0],e=boundaryEdges(hole)[0],g=createGame(hole);enterGreen(g);g.ball={x:p.x+e.nx*.29,y:.3,z:p.z+e.nz*.29,vx:-e.nx*3,vy:0,vz:-e.nz*3};g.mode='rolling';step(g);assert.ok(insideGreen(hole,g.ball.x,g.ball.z,.299));assert.ok(g.ball.vx*e.nx+g.ball.vz*e.nz>0)}});

import {courseWind,windAt,windAcceleration} from './wind.js';
import {coveOutlet} from './hole-three.js';
test('wind changes airborne drift and carry but does not push a putting ball',()=>{const shot=(angle)=>{const g=createGame(3);g.wind={mph:8,angle,gust:0};swing(g,.98,0);run(g,300);return g};const right=shot(Math.PI/2),left=shot(-Math.PI/2);assert.ok(right.ball.x>1&&left.ball.x< -1);assert.ok(Math.abs(right.ball.x+left.ball.x)<.001);const head=shot(0),tail=shot(Math.PI);assert.ok(head.ball.z<tail.ball.z);const g=createGame(3);enterGreen(g);g.wind={mph:20,angle:1,gust:.5};g.ball.x=0;g.ball.z=-3;run(g,200);assert.equal(g.ball.x,0);assert.equal(g.ball.z,-3)});
test('gusts are deterministic and UI course wind leaves the par three playable',()=>{const w=courseWind(3);assert.deepEqual(windAt(w,12),windAt(w,12));assert.deepEqual(windAcceleration(null,20),{x:0,z:0});for(let t=0;t<100;t++)assert.ok(Math.abs(windAt(w,t).mph-w.mph)<=w.mph*w.gust*1.04);let reached=false;for(const power of [.94,.96,.98,1]){const g=createGame(3);g.wind=w;swing(g,power,0);settle(g);reached ||=g.mini}assert.ok(reached)});
test('Kingfisher spillway reaches its cliff and has a submerged channel',()=>{const o=coveOutlet,a=Math.atan2(o.z/123,o.x/84);assert.ok(Math.abs(Math.hypot(o.x/84,o.z/123)-edgeShape(a))<1e-8);for(let x=60;x<o.x;x+=2)assert.ok(height(x,-18,3)<getCourse(3).waterLevel);assert.equal(lie(65,-18,3),'Water')});

import {gardenBanks,gardenObstacles,grottoPool,segmentContact,greenSafeStart} from './green-features.js';
test('cascade garden has a paced downhill center route to the cup',()=>{const g=createGame(3);enterGreen(g);g.ball={x:0,y:.3,z:-10,vx:0,vy:0,vz:0};putt(g,0,1,puttPowerForDistance(6.7));settle(g);assert.equal(g.mode,'holed');assert.equal(g.strokes,1)});
test('cascade stepping stones rebound and its pool remains a real water hazard',()=>{const g=createGame(3);enterGreen(g);g.ball={x:-5,y:.3,z:-1.5,vx:0,vy:0,vz:0};putt(g,0,-1,20);run(g,180);assert.ok(g.ball.z> -2.8);assert.equal(g.strokes,1);const pool=createGame(3);enterGreen(pool);pool.ball.x=5;pool.ball.z=9;putt(pool,0,-1,30);settle(pool);assert.equal(pool.strokes,2);assert.match(pool.message,/Water/);assert.equal(pool.ball.z,9)});
test('all garden approach starts clear solid planters and stone banks',()=>{for(const hole of [1,2,3])for(let x=-7;x<=7;x+=.7)for(let z=-9;z<=12;z+=.8){const p=greenSafeStart(hole,x,z);for(const o of gardenObstacles[hole])assert.ok(Math.hypot(p.x-o.x,p.z-o.z)>=o.r+.3);for(const s of gardenBanks[hole])assert.equal(segmentContact(p.x,p.z,s,.3),null)}});
test('moon garden has an open stream-side route as well as the bridge',()=>{const g=createGame(2);enterGreen(g);g.ball={x:-7.7,y:.3,z:10,vx:0,vy:0,vz:0};putt(g,0,-1,puttPowerForDistance(20));settle(g);assert.equal(g.strokes,1);assert.ok(g.ball.z< -9);assert.equal(g.mode,'ready')});


import {cupLayouts,cupFor,miniCup,pinFor} from './cups.js';
import {validScorecard,encodeScorecard,decodeScorecard,addScorecard,rankedScores,scoreText} from './rounds.js';
test('all twelve fixed cups are clear of hazards and garden obstacles',()=>{for(const hole of [1,2,3])for(let layout=0;layout<4;layout++){const g=createGame(hole),cup=cupFor(hole,layout);g.cup=cup;const safe=greenSafeStart(hole,cup.x,cup.z);assert.ok(Math.hypot(safe.x-cup.x,safe.z-cup.z)<.01);assert.ok(Math.abs(cup.x)<8&&Math.abs(cup.z)<14);assert.equal(inPond(cup.x,cup.z,miniPool(hole)),false);const pin=pinFor(g,getCourse(hole));assert.equal(lie(pin.x,pin.z,hole),'Green')}});
test('every cup position supports tap-in capture, animation and the correct score',()=>{for(const hole of [1,2,3])for(let layout=0;layout<4;layout++){const g=createGame(hole);g.cup=cupFor(hole,layout);g.strokes=2;enterGreen(g);g.ball.x=g.cup.x;g.ball.z=g.cup.z+1;assert.ok(tapIn(g));settle(g);assert.equal(g.mode,'holed',`hole ${hole} cup ${layout}`);assert.equal(g.strokes,3);assert.equal(g.ball.x,g.cup.x);assert.equal(g.ball.z,g.cup.z)}});
test('moving the cup changes full-course aim and hole-out location consistently',()=>{const g=createGame(3);g.cup=cupFor(3,1);alignToPin(g);assert.notEqual(g.angle,0);const pin=pinFor(g,getCourse(3));swing(g,.1,0);g.ball={x:pin.x,y:height(pin.x,pin.z,3)+.085,z:pin.z,vx:0,vy:0,vz:0};g.mode='rolling';step(g);assert.equal(g.mode,'sinking');assert.equal(g.ball.x,g.cup.x);assert.equal(g.ball.z,g.cup.z)});
test('calm windy and stormy presets have increasing gusts with exact zero in calm',()=>{for(const hole of [1,2,3]){const calm=courseWind(hole,'calm'),windy=courseWind(hole,'windy'),storm=courseWind(hole,'stormy');assert.equal(calm.mph,0);assert.ok(storm.mph>windy.mph&&windy.mph>0);assert.ok(storm.gust>windy.gust);assert.deepEqual(windAcceleration(calm,12),{x:0,z:0})}});
test('scorecards round-trip, deduplicate and rank only matching weather and cup layout',()=>{const card={v:1,id:'round-1',name:'Chris',weather:'calm',layout:2,holes:[4,5,3],date:'2026-11-02'};const decoded=decodeScorecard(encodeScorecard(card));assert.equal(decoded.total,12);assert.equal(decoded.name,'Chris');let entries=addScorecard([],card);entries=addScorecard(entries,card);assert.equal(entries.length,1);entries=addScorecard(entries,{...card,id:'round-2',name:'Guest',holes:[3,5,3]});entries=addScorecard(entries,{...card,id:'round-3',weather:'stormy',holes:[1,1,1]});const ranked=rankedScores(entries,'calm',2);assert.equal(ranked.length,2);assert.equal(ranked[0].name,'Guest');assert.equal(ranked[0].rank,1);assert.equal(scoreText(0),'E');assert.equal(scoreText(2),'+2');assert.equal(decodeScorecard('bad-data'),null);assert.equal(validScorecard({...card,holes:[0,0,0]}),null);assert.equal(validScorecard({...card,holes:[4,5]}),null)});
test('opening round menus pauses the physical simulation without moving or spending a stroke',()=>{const g=createGame();swing(g,.8,0);g.paused=true;const before=structuredClone(g.ball),time=g.time;run(g,100);assert.deepEqual(g.ball,before);assert.equal(g.time,time);assert.equal(g.strokes,1)});

import {scoreName} from './rounds.js';
test('double and triple bogey use their names and a disappointed finish only once',()=>{assert.equal(scoreName(7,5),'DOUBLE BOGEY');assert.equal(scoreName(8,5),'TRIPLE BOGEY');assert.equal(scoreName(1,3),'HOLE IN ONE');for(const over of [2,3]){const g=createGame(2);g.strokes=g.par+over-1;enterGreen(g);g.ball.x=0;g.ball.z=1;putt(g,0,-1.3);settle(g);assert.equal(g.mode,'holed');assert.equal(g.soundEvents.filter(e=>e.type==='sad-finish').length,1);assert.equal(g.soundEvents.filter(e=>e.type==='win').length,0);run(g,100);assert.equal(g.soundEvents.filter(e=>e.type==='sad-finish').length,1)}});

import {roundProgress} from './rounds.js';
test('round total includes a just-finished double bogey instead of the previous hole only',()=>{const g={scorecard:[{hole:1,par:4,strokes:3}],strokes:7,par:5,mode:'holed'};assert.deepEqual(roundProgress(g),{total:10,over:1,complete:2});g.mode='rolling';assert.equal(roundProgress(g).over,-1)});

test('rolling playback eases smoothly into fast-forward',()=>{const g=createGame();g.mode='rolling';g.rollStarted=0;let last=1;for(let time=0;time<10;time+=.02){g.time=time;const rate=playbackRate(g);assert.ok(rate>=1&&rate<=3.5);assert.ok(Math.abs(rate-last)<.04);last=rate}});

test('real cup sound is cued at the rim drop once, before the completion celebration',()=>{const g=createGame(3);g.strokes=1;enterGreen(g);g.ball.x=0;g.ball.z=1;putt(g,0,-1.3);let cue=null;for(let i=0;i<1000&&g.mode!=='holed';i++){step(g);if(cue===null&&g.soundEvents.some(e=>e.type==='cup')){cue=g.time-g.finish.started;assert.equal(g.mode,'sinking')}}assert.ok(cue>.5&&cue<.7);assert.equal(g.soundEvents.filter(e=>e.type==='cup').length,1);assert.equal(g.mode,'holed')});

import {cameraBlend,renderBallBetween} from './camera-motion.js';
test('flight camera easing is frame-rate independent and limits a stalled-frame jump',()=>{const follow=fps=>{let x=0;for(let i=0;i<fps;i++)x+=(10-x)*cameraBlend(1/fps);return x};assert.ok(Math.abs(follow(30)-follow(120))<1e-9);assert.ok(cameraBlend(.5)<.21);assert.equal(cameraBlend(-1),0)});
test('render interpolation smooths between physics ticks without changing the physical ball',()=>{const previous={x:0,y:1,z:2},current={x:2,y:3,z:4};assert.deepEqual(renderBallBetween(previous,current,.5),{x:1,y:2,z:3});assert.deepEqual(current,{x:2,y:3,z:4});assert.deepEqual(renderBallBetween(previous,current,2),current)});

import {newHoles,newOutlet,creekCenter,waterFraction,newGreenFraction,HOLE_COUNT} from './new-holes.js';
import {movingGreenGates} from './expansion-greens.js';
import {roundPar,roundYards} from './rounds.js';
test('three original expansion holes have exact yardages, pars and raised level tees',()=>{assert.equal(HOLE_COUNT,9);for(const [id,par,yards] of [[4,4,445],[5,5,535],[6,3,142]]){const g=createGame(id),c=getCourse(id);assert.equal(g.par,par);assert.ok(Math.abs(yardsToPin(g.ball,id)-yards)<1e-9);assert.equal(lie(c.pin.x,c.pin.z,id),'Green');assert.equal(lie(0,c.tee.z,id),'Tee box');assert.equal(g.strokes,0);assert.ok(height(0,c.tee.z,id)>height(22,c.tee.z,id)+3);assert.ok(Math.abs(height(0,c.tee.z,id)-height(2,c.tee.z+2,id))<.01);assert.equal(g.club,par===3?'7 iron':'Driver')}});
test('new safe landing shelves have usable width rather than pinpoint targets',()=>{for(const id of [4,5]){const c=newHoles[id];for(const p of c.landingSites.filter(p=>!p.label.includes('Bold')&&!p.label.includes('Corner')))for(const dx of [-7,0,7])for(const dz of [-5,0,5])assert.ok(['Fairway','Green'].includes(lie(p.x+dx,p.z+dz,id)),`${id} ${p.label} ${dx},${dz}`)}});
test('Amberlight Bluff supports a counted two-shot approach and a real mini-green finish',()=>{const g=createGame(4),c=getCourse(4);routeShot(g,-35,-22,.86);assert.equal(g.lie,'Fairway');g.club='Hybrid';routeShot(g,c.pin.x,c.pin.z,.99);assert.ok(g.mini);assert.equal(g.strokes,2);assert.ok(g.approachLanding.distanceYards<20);});
test('Willowspire safe route reaches in three while the demanding route can reach in two',()=>{const safe=createGame(5),c=getCourse(5);routeShot(safe,-39,42,.76);assert.equal(safe.lie,'Fairway');safe.club='Hybrid';routeShot(safe,-31,-130,.87);assert.equal(safe.lie,'Fairway');safe.club='7 iron';routeShot(safe,c.pin.x,c.pin.z,.79);assert.ok(safe.mini);assert.equal(safe.strokes,3);const bold=createGame(5);routeShot(bold,-30,-10,.94);assert.equal(bold.lie,'Fairway');routeShot(bold,c.pin.x,c.pin.z,.94);assert.ok(bold.mini);assert.equal(bold.strokes,2);});
test('Starfall Sanctuary rewards a controlled downhill iron and punishes a creek miss',()=>{const g=createGame(6),c=getCourse(6);routeShot(g,c.pin.x,c.pin.z,.74);assert.ok(g.mini);assert.equal(g.strokes,1);const short=createGame(6);routeShot(short,20,-32,.55);assert.ok(short.strokes>=1);assert.equal(short.mini,false);assert.equal(lie(20,-32,6),'Water')});
test('new waterways have submerged beds and waterfalls at the real sculpted cliff edge',()=>{for(const id of [4,5,6]){const c=getCourse(id),p=c.lakes[0];assert.ok(waterFraction(p.x,p.z,c)<1);assert.equal(lie(p.x,p.z,id),'Water');assert.ok(height(p.x,p.z,id)<c.waterLevel);const o=newOutlet(id),a=Math.atan2(o.z/c.landRadius.rz,o.x/c.landRadius.rx);assert.ok(Math.abs(Math.hypot(o.x/c.landRadius.rx,o.z/c.landRadius.rz)-edgeShape(a))<.003)}});
test('retired puddle locations are playable turf without hidden water penalties',()=>{for(const [id,x,z] of [[1,6,-7.3],[2,-6.4,-7],[4,6.4,5],[5,-6.5,-4],[6,6.3,-1.8],[7,-7,-3],[8,6.6,0],[9,7.5,8]]){assert.equal(miniPool(id),null);const g=createGame(id);enterGreen(g);g.ball={x,z,y:miniHeight(id,x,z)+.3,vx:0,vy:0,vz:0};putt(g,.3,1,20);run(g,1200);assert.equal(g.strokes,1);assert.doesNotMatch(g.message,/Water/)}});
test('moving mini-green gates displace a stationary ball using their rendered capsule',()=>{for(const id of [4,5]){const g=createGame(id);enterGreen(g);const gate=movingGreenGates(id,0)[0];g.ball={x:gate.x+1,y:.3,z:gate.z+.32,vx:0,vy:0,vz:0};const old={...g.ball};run(g,45);assert.ok(Math.hypot(g.ball.x-old.x,g.ball.z-old.z)>.03);assert.equal(g.strokes,0);assert.notEqual(g.mode,'holed')}});
test('all expansion cup positions can finish a counted putt and safe entries clear obstacles',()=>{for(const id of [4,5,6])for(let layout=0;layout<4;layout++){const g=createGame(id);g.cup=cupFor(id,layout);g.strokes=getCourse(id).par-1;enterGreen(g);g.ball.x=g.cup.x;g.ball.z=g.cup.z+1;assert.ok(tapIn(g));run(g,700);assert.equal(g.mode,'holed');assert.equal(g.strokes,getCourse(id).par)}for(const id of [4,5,6])for(const x of [-15,0,15]){const g=createGame(id),c=getCourse(id);g.ball.x=c.pin.x+x;g.ball.z=c.pin.z+10;enterGreen(g);for(const gate of movingGreenGates(id,0))assert.ok(Math.hypot(g.ball.x-gate.x,g.ball.z-gate.z)>gate.length+.4)}});
test('selected one-to-six-hole rounds have correct par and compatible separately ranked scorecards',()=>{assert.equal(roundPar(6),24);assert.equal(roundYards(6),2167);for(let count=1;count<=6;count++){const card={v:2,id:`six-${count}`,name:'QA',weather:'calm',layout:0,holes:Array.from({length:count},(_,i)=>[4,5,3,4,5,3][i])};const decoded=decodeScorecard(encodeScorecard(card));assert.equal(decoded.total,roundPar(count));assert.equal(rankedScores([decoded], 'calm',0,count).length,1);assert.equal(rankedScores([decoded], 'calm',0,count===6?3:6).length,0)}assert.equal(validScorecard({v:1,id:'old',name:'Legacy',weather:'calm',layout:0,holes:[4,5,3]}).total,12);assert.equal(validScorecard({v:2,id:'bad',name:'Bad',weather:'calm',layout:0,holes:Array(10).fill(4)}),null)});

import {bunkersByHole,bunkerPoint,bunkerFraction,bunkerAt} from './bunkers.js';
import {terrainHeight,terrainLie} from './course.js';
test('all thirty-five groomed bunkers have smooth shared sand boundaries clear of water and greens',()=>{assert.equal(Object.values(bunkersByHole).flat().length,35);for(const [hole,list] of Object.entries(bunkersByHole))for(const p of list){assert.equal(lie(p.x,p.z,+hole),'Sand');for(let i=0;i<96;i++){const a=i/96*Math.PI*2,inside=bunkerPoint(p,a,.99),edge=bunkerPoint(p,a,1),outside=bunkerPoint(p,a,1.02);assert.ok(Math.abs(bunkerFraction(edge.x,edge.z,p)-1)<1e-9);assert.equal(bunkerAt(inside.x,inside.z,+hole),p);assert.equal(lie(inside.x,inside.z,+hole),'Sand',`${hole} ${p.id}`);assert.notEqual(lie(outside.x,outside.z,+hole),'Sand');assert.ok(!['Water','Green','OB','Tee box'].includes(terrainLie(inside.x,inside.z,+hole)));const collar=bunkerPoint(p,a,1.16);assert.ok(!['Water','Green','OB','Tee box'].includes(terrainLie(collar.x,collar.z,+hole)),`${hole} ${p.id} collar`)}}});
test('bunker bowls are genuinely depressed with level groomed floors and continuous grass lips',()=>{for(const [hole,list] of Object.entries(bunkersByHole))for(const p of list){const floor=height(p.x,p.z,+hole);assert.ok(terrainHeight(p.x,p.z,+hole)-floor>=p.depth-1e-8);for(let i=0;i<24;i++){const a=i/24*Math.PI*2,q=bunkerPoint(p,a,.2);assert.ok(Math.abs(height(q.x,q.z,+hole)-floor)<1e-9);const inner=bunkerPoint(p,a,1.1199),outer=bunkerPoint(p,a,1.1201);assert.ok(Math.abs(height(inner.x,inner.z,+hole)-height(outer.x,outer.z,+hole))<.02);assert.ok(Math.abs(height(outer.x,outer.z,+hole)-terrainHeight(outer.x,outer.z,+hole))<1e-9)}}});
test('deep pot bunkers retain a stationary ball and allow a lofted sand-wedge escape',()=>{for(const [hole,list] of Object.entries(bunkersByHole))for(const p of list.filter(p=>p.pot)){const g=createGame(+hole);g.ball={x:p.x,y:height(p.x,p.z,+hole)+.085,z:p.z,vx:0,vy:0,vz:0};g.mode='rolling';g.lie='Sand';run(g,120);assert.equal(g.mode,'ready');assert.equal(g.lie,'Sand');assert.ok(Math.hypot(g.ball.x-p.x,g.ball.z-p.z)<.001);g.club='Sand wedge';const c=getCourse(+hole);g.angle=Math.atan2(c.pin.x-g.ball.x,g.ball.z-c.pin.z);swing(g,1,0);let escaped=false;for(let i=0;i<1500&&g.mode!=='ready';i++){step(g);if(bunkerFraction(g.ball.x,g.ball.z,p)>1.15&&g.ball.y>height(g.ball.x,g.ball.z,+hole)+.5)escaped=true}assert.ok(escaped,`${hole} ${p.id} escape`);assert.ok(g.strokes>=1)}});

import {terrainMeshHeight} from './terrain-mesh.js';
test('detailed bunker collars meet the actual surrounding terrain triangles at their interpolated height',()=>{for(let hole=1;hole<=9;hole++){const c=getCourse(hole),rx=c.landRadius?.rx??(hole===1?40*c.sx:130),rz=c.landRadius?.rz??(hole===1?51*c.sz:335),rings=hole===1?verdantMesh.rings:hole===2?128:hole===3?120:180,segments=hole===1?verdantMesh.segments:hole===3?192:hole===2?256:320;for(const i of [0,17,segments-1]){const vertex=(j,k)=>{const a=k/segments*Math.PI*2,r=j/rings,e=edgeShape(a);return {x:(c.landRadius?.cx??0)+rx*r*e*Math.cos(a),z:rz*r*e*Math.sin(a)}};const j=Math.floor(rings*.6),v=[vertex(j,i),vertex(j+1,i),vertex(j,i+1)],x=v.reduce((n,p)=>n+p.x,0)/3,z=v.reduce((n,p)=>n+p.z,0)/3,y=v.reduce((n,p)=>n+terrainHeight(p.x,p.z,hole),0)/3;assert.ok(Math.abs(terrainMeshHeight(x,z,hole)-y)<1e-7)}}});

import {flagstick,flagstickContact} from './flagstick.js';
import {resolveCourseFlagstick} from './game.js';
import {overviewCamera} from './overview-camera.js';
import {puttReadoutPlacement} from './hud-layout.js';
import {PerspectiveCamera,Vector3} from 'three';
test('a fast airborne approach strikes the visible flagstick without tunneling or spending a stroke',()=>{const g=createGame(1),c=getCourse(1),pin=pinFor(g,c),base=height(pin.x,pin.z,1)+flagstick.baseOffset;g.strokes=1;g.mode='flight';g.spin=0;g.ball={x:pin.x-.5,y:base+2,z:pin.z,vx:120,vy:0,vz:0};step(g);assert.ok(g.ball.vx<0);assert.ok(g.ball.x<pin.x);assert.equal(g.strokes,1);assert.equal(g.mode,'flight');assert.equal(g.soundEvents.filter(e=>e.type==='flagstick').length,1);assert.equal(g.pinHitAt,g.time);run(g,4);assert.equal(g.soundEvents.filter(e=>e.type==='flagstick').length,1)});
test('flagstick glancing contact deflects a shot while high and wide approaches pass clear',()=>{const g=createGame(5),c=getCourse(5),pin=pinFor(g,c),base=height(pin.x,pin.z,5)+flagstick.baseOffset;g.strokes=2;g.mode='flight';g.ball={x:pin.x+.5,y:base+1,z:pin.z+.13,vx:80,vy:-1,vz:0};assert.ok(resolveCourseFlagstick(g,{x:pin.x-.5,y:base+1.01,z:pin.z+.13}));assert.ok(g.ball.vz>0);assert.ok(g.ball.vx>0);assert.ok(Math.hypot(g.ball.vx,g.ball.vz)<80);for(const [y,z] of [[base+flagstick.height+.5,pin.z],[base+2,pin.z+.3]])assert.equal(flagstickContact({x:pin.x-1,y,z},{x:pin.x+1,y,z},pin,base,c.ballRadius),null)});
test('flagstick contact follows each moved pin and is disabled for miniature greens',()=>{for(let hole=1;hole<=9;hole++){const g=createGame(hole),c=getCourse(hole);g.cup=cupFor(hole,2);const pin=pinFor(g,c),base=height(pin.x,pin.z,hole)+flagstick.baseOffset;g.strokes=1;g.mode='flight';g.ball={x:pin.x+.5,y:base+2,z:pin.z,vx:90,vy:0,vz:0};assert.ok(resolveCourseFlagstick(g,{x:pin.x-.5,y:base+2,z:pin.z}));assert.ok(g.ball.vx<0);g.mini=true;assert.equal(resolveCourseFlagstick(g,{x:pin.x-.5,y:base+2,z:pin.z}),false)}});
test('slow grounded hole-outs remain possible with the flag in the cup',()=>{const g=createGame(6),c=getCourse(6),pin=pinFor(g,c);swing(g,.1,0);g.ball={x:pin.x,y:height(pin.x,pin.z,6)+c.ballRadius,z:pin.z+.003,vx:0,vy:0,vz:-.2};g.mode='rolling';step(g);assert.equal(g.mode,'sinking');assert.equal(g.soundEvents.filter(e=>e.type==='flagstick').length,0);run(g,200);assert.equal(g.mode,'holed');assert.equal(g.strokes,1)});
test('phone overviews frame all strategic targets closely without manual zoom',()=>{for(const [width,h] of [[375,667],[390,844],[1280,800]])for(let hole=1;hole<=9;hole++){const g=createGame(hole),c=getCourse(hole),pose=overviewCamera(g,width,h),camera=new PerspectiveCamera(45,width/h,.1,3500);camera.position.set(...pose.position);camera.lookAt(new Vector3(...pose.target));camera.setViewOffset(width,h,pose.viewOffsetX,pose.viewOffsetY,width,h);camera.updateProjectionMatrix();camera.updateMatrixWorld();for(const p of [c.tee,c.pin,...(c.landingSites??[]),...(c.islands??[])]){const point=new Vector3(p.x,height(p.x,p.z,hole),p.z).project(camera),x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*h;assert.ok(x>=8&&x<=width-8,`${hole} x ${x}`);assert.ok(y>=45&&y<=h-45,`${hole} y ${y}`)}if(width===375&&hole===1)assert.ok(pose.distance<700);g.mini=true;assert.ok(overviewCamera(g,width,h).distance<100)}});
test('live putting readout chooses a side rail clear of the cup and the pulling finger',()=>{for(const [width,h] of [[375,667],[390,844],[1280,800]])for(const pin of [{x:width/2,y:140},{x:65,y:h*.38},{x:width-65,y:h*.38},{x:width/2,y:h*.6}]){const ball={x:width/2,y:h*.7},finger={x:width/2,y:h*.85},r=puttReadoutPlacement(width,h,pin,ball,finger);assert.ok(r.x>=8&&r.x+r.width<=width-8);assert.ok(r.y>=60&&r.y+r.height<h-40);const overlap=(p,m)=>p.x>=r.x-m&&p.x<=r.x+r.width+m&&p.y>=r.y-m&&p.y<=r.y+r.height+m;assert.equal(overlap(pin,42),false);assert.equal(overlap(finger,55),false)}});

test('normal fairway address looks ahead rather than down at the ball',()=>{for(const mobile of [false,true]){const g=createGame(2);g.ball={x:0,z:0,y:height(0,0,2)+.085};g.angle=0;const p=golfCameraPose(g,false,mobile);assert.ok(p.target[2]<=g.ball.z-20);const pitch=Math.atan2(p.position[1]-p.target[1],Math.hypot(p.position[0]-p.target[0],p.position[2]-p.target[2]));assert.ok(pitch<.25)}});

import {turnSnapshot,matchGame,validSnapshot,myTurn,matchTotals,invitationUrl,matchLink} from './multiplayer-state.js';
test('private match restores a settled putting lie without camera or input locks',()=>{const g=createGame(3);g.layout=2;g.cup=cupFor(3,2);g.ball.z=getCourse(3).pin.z;enterGreen(g);g.strokes=3;g.ball.x=4;g.inputLocked=true;g.freeCamera=true;g.paused=true;const snap=turnSnapshot(g),m={hole:3,weather:'stormy',layout:2,snapshot:snap,scores:[{player:'a',hole:1,strokes:5},{player:'b',hole:1,strokes:3},{player:'a',hole:2,strokes:6}]};const restored=matchGame(m,'a');assert.deepEqual(restored.ball,g.ball);assert.equal(restored.strokes,3);assert.equal(restored.weather,'stormy');assert.deepEqual(restored.cup,cupFor(3,2));assert.equal(restored.scorecard.length,2);assert.equal(restored.inputLocked,false);assert.equal(restored.freeCamera,false);assert.equal(restored.paused,undefined);assert.equal(snap.paused,undefined)});
test('private match snapshots exclude flight, UI and other player state',()=>{const g=createGame();g.mode='flight';assert.equal(turnSnapshot(g),null);g.mode='ready';const s=turnSnapshot(g);assert.ok(validSnapshot(s,1));assert.equal(validSnapshot({...s,ball:{...s.ball,x:Infinity}},1),false);assert.equal(validSnapshot(s,2),false);assert.equal(validSnapshot({...s,strokes:-1},1),false);assert.equal(myTurn({status:'playing',player:'a'},'a'),true);assert.equal(myTurn({status:'waiting',player:'a'},'a'),false)});
test('match invitations keep secrets in the fragment and scorecard totals separate',()=>{const url=invitationUrl({id:'test'},'invite','https://example.com/game/?hole=6');assert.equal(new URL(url).search,'');assert.deepEqual(matchLink(url),{id:'test',invite:'invite'});assert.deepEqual(matchTotals({scores:[{player:'a',hole:1,strokes:5},{player:'b',hole:1,strokes:2},{player:'a',hole:2,strokes:4}]},'a'),{strokes:9,over:0,holes:2})});

import {premiumRelease,canPreviewPremium} from './feature-gates.js';
import {previewProfile,previewEnvironments} from './premium-preview.js';
test('premium previews cannot be enabled by a public URL',()=>{assert.deepEqual(premiumRelease,{identity:false,environments:false});assert.equal(canPreviewPremium({development:false,requested:true}),false);assert.equal(canPreviewPremium({development:true,requested:false}),false);assert.equal(canPreviewPremium({development:true,requested:true}),true)});
test('profile previews accept only bounded names and supported cosmetic choices',()=>{const p=previewProfile({name:'x'.repeat(100),accent:'url(evil)',crest:'unknown',theme:'custom',badge:'champion'});assert.equal(p.name.length,24);assert.equal(p.crest,'island');assert.equal(p.theme,'ivory');assert.equal(p.badge,'islander');assert.equal(p.accent,'#315c49')});
test('premium environments are visual styles with no gameplay advantages',()=>{assert.deepEqual(Object.keys(previewEnvironments),['moonlit','autumn','snow']);for(const def of Object.values(previewEnvironments)){assert.equal(def.friction,undefined);assert.equal(def.wind,undefined);assert.equal(def.carry,undefined);assert.ok(def.sky.startsWith('#'))}});
import {insideGreen,greenOutline,boundaryEdges} from './mini-boundary.js';

test('hole four gains 55 yards and turns right with expanded landing and greenside bunkering',()=>{const c=getCourse(4);assert.equal(c.yards-390,55);assert.ok(c.pin.x>60);assert.ok(c.route.some(p=>p.x< -25));assert.ok(c.route.at(-1).x>60);assert.ok(bunkersByHole[4].length>=5);for(const id of ['landing-left','green-front']){const b=bunkersByHole[4].find(p=>p.id===id);assert.ok(b);assert.equal(lie(b.x,b.z,4),'Sand')}for(let layout=0;layout<4;layout++){const g=createGame(4);g.cup=cupFor(4,layout);const pin=pinFor(g,c);assert.equal(lie(pin.x,pin.z,4),'Green')}});
test('hole five creek sits below the green hill and the separate right landing pad is removed',()=>{const c=getCourse(5),z=creekCenter(c.pin.x,5);assert.ok(z-c.pin.z>25&&z-c.pin.z<35);assert.equal(lie(c.pin.x,z,5),'Water');assert.ok(height(c.pin.x,c.pin.z,5)>height(c.pin.x,z,5)+8);assert.equal(lie(8,-12,5),'Rough');assert.equal(c.landingSites.length,2);const bunker=bunkersByHole[5].find(p=>p.id==='layup-pinch');assert.ok(bunker);assert.equal(lie(bunker.x,bunker.z,5),'Sand')});

// Search real putts without inventing a score or moving the accepted ball. Each accepted
// trial includes the actual physics history and its counted stroke.
function finishMini(g){for(let turn=0;turn<5&&g.mode!=='holed';turn++){if(canTapIn(g)){tapIn(g);settle(g);if(g.mode==='holed')return}let best=null;const a=Math.atan2(-g.ball.x,-g.ball.z);for(let i=0;i<32;i++)for(let power=8;power<=72;power+=4){const t=structuredClone(g);putt(t,Math.sin(a+i*Math.PI/16),Math.cos(a+i*Math.PI/16),power);settle(t);if(t.mode==='holed'){Object.assign(g,t);return}const d=Math.hypot(t.ball.x,t.ball.z);if(t.strokes===g.strokes+1&&t.mode==='ready'&&(!best||d<best.d))best={t,d}}assert.ok(best,'A real putting route remains available');Object.assign(g,best.t)}assert.equal(g.mode,'holed')}

test('a paced glancing putt curls in while the same line with extra speed lips out',()=>{
  for(const [speed,expected] of [[1.8,'in'],[3.7,'out']]){
    const g=createGame(3);
    enterGreen(g);
    g.ball.x=.46;
    g.ball.z=.6;
    putt(g,0,-1,puttPowerForDistance(speed*speed/(2*mini.friction)));
    for(let i=0;i<360&&['rolling','sinking'].includes(g.mode);i++)step(g);
    assert.equal(g.soundEvents.filter(e=>e.type==='cup-lip').length,1);
    assert.equal(g.strokes,1);
    if(expected==='in'){
      assert.equal(g.mode,'holed');
      assert.equal(g.finish.lip.type,'lip-in');
      assert.equal(g.soundEvents.filter(e=>e.type==='cup').length,1);
    }else{
      assert.equal(g.mode,'ready');
      assert.ok(g.ball.x>.55,'the rim deflects the ball away from the cup');
      assert.equal(g.soundEvents.some(e=>e.type==='cup'),false);
    }
  }
});

test('an edge miss outside the cup rolls past without rim contact',()=>{
  const g=createGame(3);
  enterGreen(g);
  g.ball.x=.56;
  g.ball.z=.6;
  putt(g,0,-1,puttPowerForDistance(2));
  for(let i=0;i<360&&g.mode==='rolling';i++)step(g);
  assert.equal(g.mode,'ready');
  assert.equal(g.soundEvents.some(e=>e.type==='cup-lip'),false);
  assert.ok(Math.abs(g.ball.x-.56)<1e-6);
});

test('the Verdant stream has continuous downhill flow over its rendered channel bed',()=>{
  for(let nz=-29;nz<riverOutlet.nz-2;nz+=.5){
    const z=nz*course.sz;
    assert.ok(riverLevel(nz)>riverLevel(nz+.5));
    for(const side of [-.75,0,.75]){
      const x=(riverCenter(nz)+side*riverWidth(nz))*course.sx;
      assert.ok(terrainMeshHeight(x,z,1)<riverLevel(nz),`exposed bed at ${nz}, ${side}`);
      if((x/course.bounds.rx)**2+(z/course.bounds.rz)**2<=1)assert.equal(lie(x,z,1),'Water');
    }
  }
});

test('full-size landings expose their contact point on every hole',()=>{
  for(let hole=1;hole<=9;hole++){
    const game=createGame(hole);
    const {x,z}=game.ball;
    const ground=height(x,z,hole)+getCourse(hole).ballRadius;
    Object.assign(game.ball,{y:ground+.01,vy:-4});
    game.mode='flight';
    step(game);
    const landing=game.soundEvents.find(event=>event.type.startsWith('land-'));
    assert.deepEqual(landing?.position,{x,y:ground,z},`hole ${hole}`);
  }
});

test('power and accuracy return and repeat',()=>{
  assert.equal(swingMeter('power',2.1),0);
  assert.ok(swingMeter('power',3.15)>.999);
  assert.equal(swingMeter('accuracy',.95),1);
  assert.equal(swingMeter('accuracy',1.9),-1);
});

test('centered fast putts hop at the cup and only drop if they come down over it',()=>{
  for(const [speed,expected] of [[3.6,'holed'],[7.5,'ready']]){
    const g=createGame(4);
    enterGreen(g);
    Object.assign(g.ball,{x:0,z:.75,y:miniHeight(4,0,.75)+mini.radius});
    putt(g,0,-1,puttPowerForDistance(speed**2/(2*mini.friction)));
    let peak=0;
    for(let i=0;i<500&&['rolling','sinking'].includes(g.mode);i++){
      step(g);
      peak=Math.max(peak,g.ball.y-miniHeight(4,g.ball.x,g.ball.z)-mini.radius);
    }
    assert.ok(peak>.20,'the cup hop is visible');
    assert.equal(g.mode,expected);
    assert.equal(g.strokes,1);
    assert.equal(g.soundEvents.filter(e=>e.type==='cup-lip').length,1);
    assert.equal(g.soundEvents.filter(e=>e.type==='cup').length,expected==='holed'?1:0);
  }
});

test('Hole 9 counts three full shots and one putt as a birdie',()=>{
  const g=createGame(9),c=getCourse(9);
  routeShot(g,7,23,.84);
  g.club='Hybrid';
  routeShot(g,110,-120,.93);
  g.club='7 iron';
  routeShot(g,c.pin.x,c.pin.z,.76);
  assert.equal(g.strokes,3);
  assert.ok(g.mini);
  // Set up a short final putt while keeping the three actual approach strokes.
  Object.assign(g.ball,{x:0,z:1,y:miniHeight(9,0,1)+mini.radius});
  assert.ok(tapIn(g));
  settle(g);
  assert.equal(g.mode,'holed');
  assert.deepEqual(g.history.map(event=>event.type),['shot','shot','shot','putt']);
  assert.equal(g.strokes,4);
  assert.equal(scoreName(g.strokes,g.par),'BIRDIE');
});

test('paused multiplayer games reject normal putts and tap-in input',()=>{
  const g=createGame(4);
  enterGreen(g);
  Object.assign(g.ball,{x:0,z:1,y:.3});
  assert.ok(canTapIn(g));
  g.paused=true;
  assert.equal(tapIn(g),false);
  putt(g,0,-1,18);
  assert.equal(g.strokes,0);
  assert.equal(g.mode,'ready');
});
