import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,getCourse,height,lie,lieFactor,putt,step,swing,yardsToPin} from './game.js';
import {cedarBanks,segmentContact} from './green-features.js';
import {cedarWasteRocks} from './new-holes.js';
import {courseWoodland} from './course-woodland.js';
import {roundPar,roundYards} from './rounds.js';

const hole=15,course=getCourse(hole);
const settle=game=>{for(let i=0;i<4200&&!['ready','holed'].includes(game.mode);i++)step(game)};
function teeShot(x,power){
 const game=createGame(hole);
 game.angle=Math.atan2(x,game.ball.z-course.pin.z);
 swing(game,power,0);
 settle(game);
 return game;
}

test('Cedarfall Hollow plays 185 yards from the elevated tee over deep waste sand',()=>{
 const {tee,pin}=course;
 assert.equal(course.par,3);
 assert.equal(Math.round(yardsToPin(createGame(hole).ball,hole)),185);
 assert.equal(roundPar(15),59);
 assert.equal(roundYards(15)-roundYards(14),185);
 const valley=height(0,0,hole),green=height(pin.x,pin.z,hole);
 assert.ok(height(tee.x,tee.z,hole)-green>16);
 assert.ok(green-valley>12&&green-valley<16);
 assert.ok(height(-48,-88,hole)>green+14);
 assert.ok(height(11,-124,hole)>green+5);
 for(const [near,far] of [[[11,-76],[11,-70]],[[35,-90],[43,-90]]]){
   assert.ok(green-height(...near,hole)>4);
   assert.ok(height(...near,hole)-height(...far,hole)>6);
   assert.equal(lie(...far,hole),'Waste sand');
 }
 assert.ok(courseWoodland(hole).filter(t=>t.z>tee.z&&Math.abs(t.x)<35&&t.tall>.55).length>=5);
 assert.ok(courseWoodland(hole).length>80);
 assert.ok(cedarWasteRocks.every(r=>['Waste sand','Rough'].includes(lie(r.x,r.z,hole))));
 const short=teeShot(pin.x,.51);
 assert.equal(short.lie,'Waste sand');
 assert.ok(lieFactor(short)<.6);
});

test('rolling misses on both exposed shoulders run into waste sand',()=>{
 for(const [x,z,vx,vz] of [[11,-78,0,1],[31,-90,1,0]]){
   const game=createGame(hole);
   game.mode='rolling';
   game.strokes=1;
   game.ball={x,z,y:height(x,z,hole)+course.ballRadius,vx,vy:0,vz};
   assert.equal(lie(x,z,hole),'Green');
   for(let i=0;i<1200&&lie(game.ball.x,game.ball.z,hole)!=='Waste sand';i++)step(game);
   assert.equal(lie(game.ball.x,game.ball.z,hole),'Waste sand');
 }
});

test('three actual approach lies offer a cedar bank, an open-slope line and a rear bank',()=>{
 for(const [x,power,angle,pace,expectedBank] of [
   [11,.81,3.85652109,79,0],
   [14,.72,-2.36293525,27,-1],
   [7,.72,.01642221,75,1]
 ]){
   const game=teeShot(x,power);
   assert.equal(game.mini,true);
   assert.equal(game.treeHits??0,0);
   putt(game,Math.sin(angle),Math.cos(angle),pace);
   const banks=new Set();
   for(let i=0;i<4200&&!['ready','holed'].includes(game.mode);i++){
     const sound=game.soundSeq;
     step(game);
     if(game.soundSeq>sound&&game.soundEvents.at(-1)?.type==='bank'){
       cedarBanks.forEach((s,j)=>{if(segmentContact(game.ball.x,game.ball.z,s,.34))banks.add(j)});
     }
   }
   assert.equal(game.mode,'holed');
   assert.equal(game.strokes,2);
   if(expectedBank<0)assert.equal(banks.size,0);
   else assert.ok(banks.has(expectedBank));
 }
});
