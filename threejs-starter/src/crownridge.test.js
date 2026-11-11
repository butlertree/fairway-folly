import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,getCourse,height,lie,putt,step,swing,yardsToPin} from './game.js';
import {gardenObstacles} from './green-features.js';

const hole=17,course=getCourse(hole);
function settle(game){
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++)step(game);
}
function shot(game,club,x,z,power){
 game.club=club;
 game.angle=Math.atan2(x-game.ball.x,game.ball.z-z);
 swing(game,power,0);
 settle(game);
}
test('Crownridge is a par five with a downhill drive and two uphill right turns',()=>{
 const game=createGame(hole);
 assert.equal(game.par,5);
 const tee={...game.ball};
 shot(game,'Driver',0,30,.6914);
 const first={...game.ball};
 assert.equal(game.lie,'Fairway');
 assert.ok(Math.abs((tee.z-first.z)/.9144-235)<6);
 assert.ok(tee.y-first.y>35);
 assert.equal(lie(0,0,hole),'Waste sand');
 for(const x of [-30,30])assert.equal(lie(x,28,hole),'Waste sand');
 shot(game,'Driver',110,-128,.9);
 const second={...game.ball},pin=course.pin;
 assert.equal(game.lie,'Fairway');
 assert.ok(second.y-first.y>10);
 assert.ok(Math.abs(yardsToPin(second,hole)-110)<6);
 const bearing=(a,b)=>Math.atan2(b.x-a.x,a.z-b.z)*180/Math.PI;
 assert.ok(Math.abs(bearing(first,second)-35)<3);
 assert.ok(Math.abs(bearing(second,pin)-bearing(first,second)-35)<4);
 assert.ok(height(pin.x,pin.z,hole)-second.y>10);
 const rise=height(162,-147,hole)-height(pin.x,pin.z,hole);
 assert.ok(rise>6&&rise<13);
 assert.equal(lie(232,-174,hole),'Sand');
 assert.equal(gardenObstacles[hole].length,4);
 for(const [power,angle,pace] of [[.72,2.5120788740254127,66],[.76,-2.536851267144408,64]]){
   const round=structuredClone(game);
   shot(round,'7 iron',205,-159,power);
   assert.ok(round.mini);
   putt(round,Math.sin(angle),Math.cos(angle),pace);
   settle(round);
   assert.equal(round.mode,'holed');
   assert.equal(round.strokes,4);
 }
});
test('the signature cottonwood can block an approach from the right edge',()=>{
 const game=createGame(hole),x=129,z=-112;
 Object.assign(game.ball,{x,z,y:height(x,z,hole)+course.ballRadius});
 game.lie=lie(x,z,hole);
 shot(game,'7 iron',course.pin.x,course.pin.z,.84);
 assert.ok(game.treeHits>0);
 assert.equal(game.mini,false);
});

test('a short second shot still leaves a playable uphill approach',()=>{
 const game=createGame(hole);
 shot(game,'Driver',0,30,.6914);
 shot(game,'Driver',110,-128,.66);
 assert.equal(game.lie,'Fairway');
 assert.ok(Math.abs(yardsToPin(game.ball,hole)-152)<5);
 shot(game,'7 iron',course.pin.x,course.pin.z,.96);
 assert.equal(game.treeHits??0,0);
 assert.equal(game.mini,true);
});
