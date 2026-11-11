import test from 'node:test';
import assert from 'node:assert/strict';
import {alignForPlay,canTapIn,createGame,getCourse,height,lie,putt,step,swing,tapIn,yardsToPin} from './game.js';
import {courseWoodland} from './course-woodland.js';
import {miniHeight} from './mini-surfaces.js';
import {firstPuttContact} from './putting-contact.js';
import {bunkerPoint,bunkersByHole} from './bunkers.js';

const hole=13;
const course=getCourse(hole);
function settle(game){
 let landing;
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++){
   const vy=game.ball.vy;
   step(game);
   if(!landing&&vy<0&&game.ball.vy>=0){
     const {x,z}=game.ball;
     landing={x,z,surface:lie(x,z,hole)};
   }
 }
 return landing;
}
function shot(game,club,x,z,power){
 game.club=club;
 game.angle=Math.atan2(x-game.ball.x,game.ball.z-z);
 swing(game,power,0);
 return settle(game);
}
function drive(){
 const game=createGame(hole);
 alignForPlay(game);
 assert.deepEqual(game.target,{x:-9,z:-45});
 shot(game,'Driver',-9,-45,.91);
 assert.equal(game.lie,'Fairway');
 return game;
}

test('Dunewatch Rise has a 430-yard par-four route with a raised tee and a low front-right collection area',()=>{
 const game=createGame(hole),{pin,tee}=course;
 assert.equal(game.par,4);
 assert.equal(Math.round(yardsToPin(game.ball,hole)),430);
 assert.ok(height(tee.x,tee.z,hole)>height(tee.x,tee.z+30,hole)+8);
 assert.ok(height(pin.x,pin.z,hole)>height(pin.x,pin.z+26,hole)+5);
 assert.ok(height(pin.x,pin.z,hole)>height(pin.x+35,pin.z,hole)+5);
 assert.ok(height(-30,pin.z,hole)>height(pin.x,pin.z,hole)+10);
 assert.ok(height(pin.x,pin.z-28,hole)>height(pin.x,pin.z,hole)+7);
 for(const side of [-1,1])assert.ok(courseWoodland(hole).filter(t=>t.x*side>35).length>25);
});

test('the right-side bunker catches a playable drive at the requested landing distance',()=>{
 const bunker=bunkersByHole[hole][0];
 const farLip=bunkerPoint(bunker,-Math.PI/2);
 assert.ok(farLip.z< -95);
 assert.equal(lie(4,-52,hole),'Sand');
 const game=createGame(hole);
 shot(game,'Driver',bunker.x,-43,.93);
 assert.equal(game.lie,'Sand');
 assert.equal(game.strokes,1);
});

test('a shot can first land left of the green and bounce across onto the putting surface',()=>{
 const game=drive();
 const landing=shot(game,'7 iron',-12,course.pin.z,1);
 assert.equal(landing.surface,'Rough');
 assert.ok(landing.x<-8);
 assert.ok(game.mini);
 assert.ok(game.approachLanding.x>landing.x+6);
 assert.equal(game.strokes,2);
 assert.equal(game.treeHits??0,0);
});

test('a drive and a direct iron leave a playable tap-in for birdie',()=>{
 const game=drive();
 shot(game,'7 iron',16,course.pin.z,.98);
 assert.ok(game.mini&&canTapIn(game));
 assert.ok(tapIn(game));
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,3);
});

test('the high shelf leaves a soft downhill putt and the low shelf supports a firmer uphill flower-pot bank',()=>{
 const high=drive();
 shot(high,'7 iron',-12,course.pin.z,1);
 assert.ok(miniHeight(hole,high.ball.x,high.ball.z)>.25);
 putt(high,Math.sin(1.99769139),Math.cos(1.99769139),22);
 settle(high);
 assert.equal(high.mode,'holed');
 assert.equal(high.strokes,3);

 const low=drive();
 shot(low,'7 iron',19,course.pin.z,.98);
 assert.ok(miniHeight(hole,low.ball.x,low.ball.z)< -.25);
 const angle=-1.47313308;
 const direction={x:Math.sin(angle),z:Math.cos(angle)};
 assert.equal(firstPuttContact(low,direction,27).type,'bumper');
 putt(low,direction.x,direction.z,73);
 settle(low);
 assert.equal(low.mode,'holed');
 assert.equal(low.strokes,3);
 assert.ok(low.soundEvents.some(e=>e.type==='stone-bank'));
});
