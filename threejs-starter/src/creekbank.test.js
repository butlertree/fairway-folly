import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,getCourse,height,lie,swing,step,yardsToPin,enterGreen,putt} from './game.js';
import {creekbankCenter,timberCrossingZ,culverts} from './creekbank.js';
import {approachStart,clearApproachStart} from './approach-start.js';
import {miniHeight,miniSlope} from './mini-surfaces.js';

test('Creekbank Hollow has a raised tee, a genuine carry over water, and left waste sand',()=>{
 const course=getCourse(10),game=createGame(10),z=timberCrossingZ,x=creekbankCenter(z);
 assert.equal(course.par,4);
 assert.ok(Math.abs(yardsToPin(game.ball,10)-440)<.001);
 assert.equal(lie(0,course.tee.z,10),'Tee box');
 assert.equal(lie(x,z,10),'Water');
 assert.ok(height(x,z,10)<course.waterLevel);
 assert.equal(lie(-12,-3,10),'Waste sand');
 assert.equal(lie(22,-55,10),'Fairway');
 const tee={...game.ball};
 game.angle=Math.atan2(x,course.tee.z-z);
 swing(game,.06,0);
 for(let i=0;i<3000&&game.mode!=='ready';i++)step(game);
 assert.equal(game.strokes,2);
 assert.deepEqual(game.ball,tee);
 assert.match(game.message,/^Water/);
});

test('Creekbank Terrace leaves clean close putts and playable starts from every direction',()=>{
 const short=approachStart(10,0,.9144);
 assert.ok(Math.abs(short.distanceFeet-3)<.01);
 assert.equal(miniHeight(10,0,0),miniHeight(10,0,3));
 assert.ok(miniSlope(10,0,5).z<0);
 for(let i=0;i<32;i++){
   const a=i*Math.PI/16;
   const far=approachStart(10,Math.sin(a)*13,Math.cos(a)*13);
   assert.ok(far.distanceFeet>8);
   assert.ok(clearApproachStart(10,far.x,far.z));
 }
});


test('Creekbank waste sand lies below both banks along the landing zone',()=>{
 for(const z of [-48,-3,40]){
   const floor=height(-12,z,10);
   assert.ok(floor<height(-41,z,10));
   assert.ok(floor<height(28,z,10));
 }
});

test('a putt rebounds off the creekside stone wall and comes to a playable rest',()=>{
 const game=createGame(10);
 enterGreen(game);
 Object.assign(game.ball,{x:3.5,y:miniHeight(10,3.5,5.1)+.3,z:5.1});
 putt(game,1,0,50);
 for(let i=0;i<1600&&game.mode!=='ready';i++)step(game);
 assert.ok(game.soundEvents.some(event=>event.type==='bank'));
 assert.equal(game.strokes,1);
 assert.equal(game.mode,'ready');
 assert.ok(clearApproachStart(10,game.ball.x,game.ball.z));
});


test('a well aimed drive finds the landing strip while a miss right finds the creek',()=>{
 for(const [targetX,strokes,expectedLie] of [[22,1,'Fairway'],[38,2,'Tee box']]){
   const game=createGame(10);
   game.angle=Math.atan2(targetX,game.ball.z+55);
   swing(game,1,0);
   for(let i=0;i<4800&&game.mode!=='ready';i++)step(game);
   assert.equal(game.mode,'ready');
   assert.equal(game.strokes,strokes);
   assert.equal(game.lie,expectedLie);
   if(strokes===2)assert.match(game.message,/^Water/);
 }
});


test('the culvert threads a centered putt and rebounds a miss into a stone foot',()=>{
 for(const z of [0,1.62]){
   const game=createGame(10);
   enterGreen(game);
   Object.assign(game.ball,{x:8.6,z,y:miniHeight(10,8.6,z)+.3});
   putt(game,-1,0,45);
   for(let i=0;i<2400&&!['ready','holed'].includes(game.mode);i++)step(game);
   assert.equal(game.strokes,1);
   assert.equal(game.mode,z===0?'holed':'ready');
   assert.equal(game.soundEvents.some(event=>event.type==='stone-bank'),z!==0);
 }
});

test('each of the four gates offers a direct putt to the cup with the right break and pace',()=>{
 const shots=[[0,45],[.025,49],[0,48],[.125,40]];
 for(const [i,{dx,dz}] of culverts.entries()){
   const game=createGame(10),x=8.6*dx,z=8.6*dz;
   enterGreen(game);
   Object.assign(game.ball,{x,z,y:miniHeight(10,x,z)+.3});
   const [breakOffset,power]=shots[i];
   putt(game,-dx+breakOffset*dz,-dz-breakOffset*dx,power);
   for(let tick=0;tick<2000&&!['ready','holed'].includes(game.mode);tick++)step(game);
   assert.equal(game.mode,'holed');
   assert.equal(game.strokes,1);
   assert.ok(!game.soundEvents.some(event=>event.type==='stone-bank'));
 }
});
