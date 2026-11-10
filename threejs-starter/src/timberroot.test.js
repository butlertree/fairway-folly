import test from 'node:test';
import assert from 'node:assert/strict';
import {alignForPlay,canTapIn,carryYards,createGame,getCourse,height,lie,putt,step,swing,tapIn} from './game.js';
import {miniCup} from './cups.js';
import {firstPuttContact} from './putting-contact.js';
import {cupCut,turfMeshData} from './putting-turf.js';
import {miniHeight} from './mini-surfaces.js';
import {fairwayFraction,inTimberApproach,timberWasteRocks} from './new-holes.js';
import {courseWoodland} from './course-woodland.js';

const hole=12;
const course=getCourse(hole);
function settle(game){
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++)step(game);
}
function shot(game,club,x,z,power){
 game.club=club;
 game.angle=Math.atan2(x-game.ball.x,game.ball.z-z);
 swing(game,power,0);
 settle(game);
}
function approach(power,x=course.pin.x,z=course.pin.z){
 const game=createGame(hole);
 alignForPlay(game);
 assert.deepEqual(game.target,{x:0,z:33});
 shot(game,'Driver',0,33,.86);
 assert.equal(game.lie,'Fairway');
 assert.deepEqual(game.target,{x:47,z:-145});
 shot(game,'Hybrid',47,-145,.95);
 assert.equal(game.lie,'Fairway');
 assert.ok(game.ball.x>30&&game.ball.z< -130);
 shot(game,'7 iron',x,z,power);
 assert.equal(game.treeHits??0,0);
 assert.equal(game.strokes,3);
 assert.equal(game.mini,true);
 return game;
}

test('Timberroot Vale has a narrow first shelf, a recessed waste valley, and a green cut into a wooded hillside',()=>{
 assert.equal(course.par,5);
 assert.equal(course.yards,525);
 assert.equal(lie(0,-55,hole),'Waste sand');
 assert.ok(height(0,-55,hole)+9<Math.min(height(0,33,hole),height(47,-145,hole)));
 const top=height(course.pin.x,course.pin.z,hole);
 assert.ok(top>height(course.pin.x,course.pin.z+26,hole)+12);
 assert.ok(height(course.pin.x-37,course.pin.z,hole)>top+5);
 assert.ok(height(course.pin.x+42,course.pin.z,hole)>top+4);
 assert.ok(height(course.pin.x,course.pin.z-30,hole)>top+12);
 assert.equal(lie(-20,-210,hole),'Waste sand');
 assert.ok(fairwayFraction(-1,101,course)>1);
 const trees=courseWoodland(hole);
 assert.ok(trees.length>200);
 for(const z of [0,-50,-100,-150])assert.ok(trees.some(t=>t.x< -65&&Math.abs(t.z-z)<18));
 assert.ok(trees.every(t=>!inTimberApproach(t.x,t.z)));
});

test('big drives aimed across the valley do not bypass the three-shot route',()=>{
 for(const x of [-26,-12,0,12,26])for(const power of [.89,.93,.97,1]){
   const game=createGame(hole);
   shot(game,'Driver',x,25,power);
   for(const secondPower of [.92,.96,1]){
     const next=structuredClone(game);
     shot(next,'Driver',course.pin.x,course.pin.z,secondPower);
     assert.equal(next.mini,false);
   }
 }
});

test('a precise three-shot approach leaves a tap-in at the actual offset cup',()=>{
 const game=approach(.88),cup=miniCup(game),mesh=turfMeshData(hole,4);
 assert.ok(Math.hypot(cup.x,cup.z)>3);
 for(let i=0;i<cupCut.segments;i++){
   const [x,,z]=mesh.positions.slice(i*3,i*3+3);
   assert.ok(Math.abs(Math.hypot(x-cup.x,z-cup.z)-cupCut.radius)<1e-9);
 }
 assert.ok(game.approachLanding.puttFeet<3.2);
 assert.ok(canTapIn(game));
 assert.ok(tapIn(game));
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,4);
});

test('a wider real approach can one-putt off the root despite a blocked direct line',()=>{
 const game=approach(1),cup=miniCup(game);
 const dx=cup.x-game.ball.x,dz=cup.z-game.ball.z,distance=Math.hypot(dx,dz);
 assert.ok(distance>10);
 assert.equal(firstPuttContact(game,{x:dx/distance,z:dz/distance},distance).type,'bank');
 assert.equal(canTapIn(game),false);
 const direction={x:Math.sin(-2.51073),z:Math.cos(-2.51073)};
 assert.equal(firstPuttContact(game,direction,20).type,'bank');
 putt(game,direction.x,direction.z,82);
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,4);
 assert.ok(game.soundEvents.some(e=>e.type==='bank'));
});

test('the cup sits on an open lane while the green rises on the sides',()=>{
 const cup=miniCup({hole});
 for(let i=0;i<16;i++){
   const angle=i*Math.PI/8;
   assert.ok(Math.abs(miniHeight(hole,cup.x+3*Math.cos(angle),cup.z+3*Math.sin(angle)))<.015);
 }
 assert.ok(miniHeight(hole,-7.8,3.6)>.4);
 assert.ok(miniHeight(hole,5.4,-5.8)>.35);
});

test('opposite wide approaches can one-putt off their respective stone banks',()=>{
 for(const [x,z,approachPower,angle,puttPower] of [
   [-20,-234,.83,3.10112,64],
   [-15,-250,.88,-.90079,60]
 ]){
   const game=approach(approachPower,x,z);
   const cup=miniCup(game),dx=cup.x-game.ball.x,dz=cup.z-game.ball.z,d=Math.hypot(dx,dz);
   assert.equal(firstPuttContact(game,{x:dx/d,z:dz/d},d).type,'bank');
   const direction={x:Math.sin(angle),z:Math.cos(angle)};
   assert.equal(firstPuttContact(game,direction,25).type,'bank');
   putt(game,direction.x,direction.z,puttPower);
   settle(game);
   assert.equal(game.mode,'holed');
   assert.equal(game.strokes,4);
   assert.ok(game.soundEvents.some(e=>e.type==='stone-bank'));
 }
});

test('waste sand takes most of the carry off a long club and gives the wedge a recovery option',()=>{
 const game=createGame(hole);
 game.lie='Fairway';
 const driver=carryYards(game);
 game.lie='Waste sand';
 assert.ok(carryYards(game)<driver*.35);
 game.club='Sand wedge';
 assert.ok(carryYards(game)>25);
 assert.equal(lie(-33,-70,hole),'Rough');
 const x=0,z=-55;
 game.ball={x,y:height(x,z,hole)+course.ballRadius,z,vx:0,vy:0,vz:0};
 shot(game,'Sand wedge',47,-145,1);
 assert.equal(game.mode,'ready');
 assert.equal(game.strokes,1);
 assert.ok(Math.hypot(game.ball.x-x,game.ball.z-z)>19);
});

test('waste boulders deflect a low ball at their visible footprint',()=>{
 const rock=timberWasteRocks[0],game=createGame(hole);
 Object.assign(game.ball,{x:rock.x,z:rock.z+rock.rz+1,y:height(rock.x,rock.z,hole)+1,vz:-20});
 game.origin={...game.ball};
 game.mode='flight';
 game.spin=0;
 game.strokes=1;
 for(let i=0;i<30&&!game.soundEvents.some(e=>e.type==='stone-bank');i++)step(game);
 assert.ok(game.soundEvents.some(e=>e.type==='stone-bank'));
 assert.ok(game.ball.vy>2);
 assert.ok(Math.abs(game.ball.vz)<10);
});
