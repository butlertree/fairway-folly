import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,getCourse,height,lie,putt,step,swing,yardsToPin} from './game.js';
import {miniHeight} from './mini-surfaces.js';
import {gardenObstacles} from './green-features.js';

const hole=16,course=getCourse(hole);
function play(game,club,angle,power,accuracy=0){
 game.club=club;
 game.angle=angle;
 swing(game,power,accuracy);
 settle(game);
}
function settle(game){
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++)step(game);
}
test('Hemlock Elbow gives a 230-yard valley layup and an uphill iron',()=>{
 const game=createGame(hole),tee={...game.ball};
 play(game,'Hybrid',Math.atan2(12,210),.94);
 assert.equal(game.lie,'Fairway');
 assert.ok(Math.abs(Math.hypot(game.ball.x-tee.x,game.ball.z-tee.z)/.9144-230)<5);
 assert.ok(Math.abs(yardsToPin(game.ball,hole)-150)<5);
 assert.ok(tee.y-game.ball.y>15);
 assert.ok(height(course.pin.x,course.pin.z,hole)-game.ball.y>15);
 play(game,'7 iron',Math.atan2(course.pin.x-game.ball.x,game.ball.z-course.pin.z),.98);
 assert.equal(game.mini,true);
 assert.equal(gardenObstacles[hole].length,4);
 assert.ok(miniHeight(hole,.8,4)<miniHeight(hole,5,4)-.45);
 putt(game,Math.sin(-1.491934812),Math.cos(-1.491934812),52);
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,3);
});
test('the tall grove stops a direct drive, a strong hook can reach the apron, and the pot catches a left approach',()=>{
 const direct=createGame(hole);
 play(direct,'Driver',Math.atan2(course.pin.x,course.tee.z-course.pin.z),1);
 assert.ok(direct.treeHits>0);
 const hook=createGame(hole);
 play(hook,'Driver',.1,1,-1);
 assert.equal(hook.treeHits??0,0);
 assert.ok(yardsToPin(hook.ball,hole)<25);
 const miss=createGame(hole);
 play(miss,'Hybrid',Math.atan2(12,210),.94);
 play(miss,'Hybrid',Math.atan2(-155-miss.ball.x,miss.ball.z+89),.98);
 assert.equal(lie(miss.ball.x,miss.ball.z,hole),'Sand');
});
