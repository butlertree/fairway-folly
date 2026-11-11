import test from 'node:test';
import assert from 'node:assert/strict';
import {alignForPlay,canTapIn,createGame,getCourse,height,lie,putt,step,swing,WATER_ENTRY_SECONDS,yardsToPin} from './game.js';
import {miniHeight,miniSlope} from './mini-surfaces.js';
import {courseWoodland} from './course-woodland.js';
import {bunkersByHole} from './bunkers.js';

const hole=14,course=getCourse(hole);
function settle(game){
 let first;
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++){
   const vy=game.ball.vy;
   step(game);
   if(!first&&vy<0&&game.ball.vy>=0){
     const {x,z}=game.ball;
     first={x,z,lie:lie(x,z,hole)};
   }
 }
 return first;
}
function shot(game,club,x,z,power){
 game.club=club;
 game.angle=Math.atan2(x-game.ball.x,game.ball.z-z);
 swing(game,power,0);
 return settle(game);
}
function layup(){
 const game=createGame(hole);
 alignForPlay(game);
 assert.deepEqual(game.target,{x:-3,z:-68});
 shot(game,'Hybrid',-3,-68,.84);
 assert.equal(game.strokes,1);
 assert.equal(game.lie,'Fairway');
 return game;
}

test('a lake meets the false front and a long bunker runs behind the green',()=>{
 const {pin,tee,green,waterLevel}=course;
 assert.ok(height(0,tee.z,hole)>height(0,tee.z-35,hole)+5);
 assert.equal(Math.round(yardsToPin(createGame(hole).ball,hole)),340);
 let shore=tee.z;
 while(lie(0,shore,hole)!=='Water')shore-=.25;
 assert.ok(Math.abs((tee.z-shore)/.9144-210)<3);
 assert.equal(lie(pin.x,-195,hole),'Water');
 assert.equal(lie(pin.x,-198,hole),'Green');
 assert.ok(height(pin.x,-198,hole)<height(pin.x,pin.z,hole)-5);
 assert.ok(height(pin.x,-195,hole)<waterLevel);
 const bunker=bunkersByHole[hole][0];
 assert.ok(bunker.rx/green.rx>.6&&bunker.rx/green.rx<.7);
 const game=layup();
 shot(game,'Hybrid',pin.x,pin.z,.83);
 assert.equal(game.lie,'Sand');
 const backdrop=courseWoodland(hole).filter(t=>t.z<bunker.z-4);
 assert.ok(backdrop.filter(t=>t.x<pin.x).length>=5);
 assert.ok(backdrop.filter(t=>t.x>pin.x).length>=4);
});

test('a short shot can land on the false front and roll back into the lake',()=>{
 const game=layup();
 game.angle=Math.atan2(course.pin.x-game.ball.x,game.ball.z-course.pin.z);
 swing(game,.77,0);
 let landing;
 for(let i=0;i<2400&&game.mode!=='water-entry';i++){
   const vy=game.ball.vy;
   step(game);
   if(!landing&&vy<0&&game.ball.vy>=0){
     const {x,z}=game.ball;
     landing={z,lie:lie(x,z,hole)};
   }
 }
 assert.equal(game.mode,'water-entry');
 const {drop,kind,x,z}=game.waterEntry;
 const crossing=game.waterCrossing;
 assert.equal(kind,'ripple');
 assert.equal(lie(x,z,hole),'Water');
 assert.ok(crossing.z< -190);
 assert.ok(drop.z>crossing.z);
 assert.ok(Math.abs((drop.x-course.pin.x)*(crossing.z-course.pin.z)-
   (drop.z-course.pin.z)*(crossing.x-course.pin.x))<1e-8);
 for(let i=0;i<120*(WATER_ENTRY_SECONDS-.1);i++)step(game);
 assert.equal(game.mode,'water-entry');
 assert.equal(game.ball.x,x);
 assert.equal(game.ball.z,z);
 settle(game);
 assert.equal(landing.lie,'Green');
 assert.ok(Math.abs((landing.z-course.pin.z)/.3048-10)<1.5);
 assert.equal(game.mini,false);
 assert.equal(game.strokes,3);
 assert.match(game.message,/Water/);
 assert.deepEqual(game.ball,{...drop,vx:0,vy:0,vz:0});
 assert.ok(!['Water','OB'].includes(game.lie));
 const shorelineSounds=g=>g.soundEvents.filter(e=>['retaining-wall','splash'].includes(e.type)).map(e=>e.type);
 assert.deepEqual(shorelineSounds(game),['retaining-wall','splash']);
 const direct=layup();
 direct.angle=Math.atan2(course.pin.x-direct.ball.x,direct.ball.z-course.pin.z);
 swing(direct,.5,0);
 for(let i=0;i<2400&&direct.mode!=='water-entry';i++)step(direct);
 assert.equal(direct.waterEntry?.kind,'splash');
 settle(direct);
 assert.deepEqual(shorelineSounds(direct),['splash']);
});

test('the front shelf returns an underhit putt and supports two one-putt routes',()=>{
 assert.ok(miniHeight(hole,0,1)-miniHeight(hole,0,8)>1.3);
 assert.ok(Math.abs(miniSlope(hole,6,5).z)<Math.abs(miniSlope(hole,0,5).z)*.6);
 for(const x of [-6,6])assert.ok(miniHeight(hole,x,-6)>miniHeight(hole,0,-6)+.65);
 for(const [aim,power,angle,puttPower,wide] of [
   [5,.649,3.00581319,62,false],
   [8,.645,-2.90487147,65,true]
 ]){
   const game=layup();
   shot(game,'Hybrid',aim,course.pin.z,power);
   assert.equal(game.mini,true);
   assert.equal(game.ball.x>4,wide);
   assert.ok(game.ball.z>7);
   if(!wide){
     const short=structuredClone(game);
     putt(short,Math.sin(angle),Math.cos(angle),40);
     let furthest=short.ball.z;
     for(let i=0;i<4800&&short.mode==='rolling';i++){
       step(short);
       furthest=Math.min(furthest,short.ball.z);
     }
     assert.equal(short.mode,'ready');
     assert.ok(furthest<5&&short.ball.z>7);
     assert.equal(short.strokes,3);
     assert.doesNotMatch(short.message,/Water/);
   }
   putt(game,Math.sin(angle),Math.cos(angle),puttPower);
   settle(game);
   assert.equal(game.mode,'holed');
   assert.equal(game.strokes,3);
 }
 const close=layup();
 shot(close,'Hybrid',course.pin.x,course.pin.z,.67);
 assert.equal(close.mini,true);
 assert.ok(close.ball.z<1&&canTapIn(close));
});
