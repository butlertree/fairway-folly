import {newGreenFraction,newGreenOutline} from './new-holes.js';
import {firstPuttContact} from './putting-contact.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {alignForPlay,createGame,enterGreen,getCourse,height,lie,putt,step,swing,tapIn,yardsToPin} from './game.js';
import {miniHeight,miniSlope} from './mini-surfaces.js';
import {boundaryEdges} from './mini-boundary.js';
import {approachStart,clearApproachStart} from './approach-start.js';

function settle(game){
 for(let i=0;i<4800&&!['ready','holed'].includes(game.mode);i++)step(game);
 assert.ok(['ready','holed'].includes(game.mode));
}

test('Sandstone Crown is a 170-yard par three with a playable carry over waste sand',()=>{
 const game=createGame(11);
 assert.equal(game.par,3);
 assert.ok(Math.abs(yardsToPin(game.ball,11)-170)<.001);
 assert.equal(lie(0,8,11),'Waste sand');
 assert.ok(height(0,8,11)<height(0,77,11)-10);
 const short=structuredClone(game);
 alignForPlay(short);
 swing(short,.68,0);
 settle(short);
 assert.equal(short.lie,'Waste sand');
 alignForPlay(game);
 swing(game,1,0);
 settle(game);
 assert.equal(game.mini,true);
 assert.equal(game.strokes,1);
});

test('a close Hole 11 approach still leaves an open putt',()=>{
 const close=approachStart(11,0,.9144);
 assert.ok(Math.abs(close.distanceFeet-3)<.01);
 assert.ok(clearApproachStart(11,close.x,close.z));
 const game=createGame(11);
 enterGreen(game);
 Object.assign(game.ball,{x:close.x,z:close.z,y:miniHeight(11,close.x,close.z)+.3});
 assert.ok(tapIn(game));
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,1);
 assert.ok(!game.soundEvents.some(event=>event.type==='stone-bank'));
});

test('Hole 11 has no outward downhill grade beside the playable rim',()=>{
 for(const {x,z,nx,nz} of boundaryEdges(11)){
   const slope=miniSlope(11,x+.4*nx,z+.4*nz);
   assert.ok(slope.x*nx+slope.z*nz<=.001);
 }
});

test('Hole 11 has a one-putt line from eight representative wide approach lies',()=>{
 const shots=[[Math.atan(.42),45],[.05,38],[0,32],[-.025,34],[.05,40],[0,35],[-.025,37],[-.025,37]];
 for(const [i,[adjustment,power]] of shots.entries()){
   const a=i*Math.PI/4,{x,z}=approachStart(11,12*Math.sin(a),12*Math.cos(a));
   const game=createGame(11),aim=Math.atan2(-x,z)+adjustment;
   enterGreen(game);
   Object.assign(game.ball,{x,z,y:miniHeight(11,x,z)+.3});
   putt(game,Math.sin(aim),-Math.cos(aim),power);
   settle(game);
   assert.equal(game.mode,'holed',`approach direction ${i}`);
   assert.equal(game.strokes,1);
 }
});

test('the far sandstone elbow also banks a putt into the cup',()=>{
 const game=createGame(11),x=-1.8,z=-11.5;
 enterGreen(game);
 Object.assign(game.ball,{x,z,y:miniHeight(11,x,z)+.3});
 putt(game,-.33,1,46);
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,1);
 assert.ok(game.soundEvents.some(event=>event.type==='stone-bank'));
});

test('a real short hybrid approach leaves the cup screened and a makeable bank',()=>{
 const game=createGame(11);
 alignForPlay(game);
 game.club='Hybrid';
 swing(game,.83,0);
 settle(game);
 assert.equal(game.mini,true);
 assert.equal(game.strokes,1);
 const {x,z}=game.ball,d=Math.hypot(x,z);
 assert.equal(firstPuttContact(game,{x:-x/d,z:-z/d},d).type,'bank');
 putt(game,.40,-1,44);
 settle(game);
 assert.equal(game.mode,'holed');
 assert.equal(game.strokes,2);
 assert.ok(game.soundEvents.some(event=>event.type==='stone-bank'));
});

test('Hole 11 shows the same green edge that decides whether a shot stays on the full course',()=>{
 const c=getCourse(11);
 for(const {x,z} of newGreenOutline(c))assert.ok(Math.abs(newGreenFraction(x,z,c)-1)<1e-10);
 for(const [power,onGreen] of [[.83,true],[.86,false],[.9,false]]){
   const game=createGame(11);
   alignForPlay(game);
   game.club='Hybrid';
   swing(game,power,0);
   settle(game);
   assert.equal(game.mini,onGreen);
   const resting=onGreen?game.approachLanding:game.ball;
   assert.equal(lie(resting.x,resting.z,11)==='Green',onGreen);
 }
});
