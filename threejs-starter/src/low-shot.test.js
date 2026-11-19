import test from 'node:test';
import assert from 'node:assert/strict';
import {Raycaster,Vector3,Plane,Mesh} from 'three';
import {terrainRaycast} from './terrain-pick.js';
import {height} from './course.js';
import {createGame,clubs,swing,shotLaunch,carryYards} from './game.js';
import {turnSnapshot,matchGame} from './multiplayer-state.js';
test('uphill rays on hole 17 select terrain even when they miss the old horizontal input plane',()=>{
 let hits=0;
 for(let x=80;x<=200;x+=20)for(let z=-180;z<0;z+=20){
 const origin=new Vector3(x,height(x,z,17)+2,z),target=new Vector3(x,height(x,z-20,17),z-20);
 if(target.y<=origin.y)continue;
 const ray=new Raycaster(origin,target.clone().sub(origin).normalize());
 assert.equal(ray.ray.intersectPlane(new Plane(new Vector3(0,1,0),-(origin.y-1)),new Vector3()),null);
 const results=[];terrainRaycast(17).call(new Mesh(),ray,results);assert.equal(results.length,1);assert.ok(results[0].point.y>origin.y);hits++;
 }assert.ok(hits>0);
});
test('low flight lowers every club apex and advertised carry agrees with launch physics',()=>{
 for(const club of Object.keys(clubs))for(const power of [.35,.7,1]){
 const g=createGame();g.club=club;const normal=shotLaunch(g,power);g.shotStyle='low';const low=shotLaunch(g,power);
 assert.ok(low.vertical**2<normal.vertical**2*.35,club);
 assert.ok(carryYards(g,power)<clubs[club].yards*power*.9,club);
 swing(g,power,0);assert.equal(g.strokes,1);assert.ok(Math.abs(g.ball.vy-low.vertical)<1e-9);
 assert.ok(Math.abs(carryYards(g,power)-2*Math.hypot(g.ball.vx,g.ball.vz)*g.ball.vy/9.81/.9144)<1e-8);
 }
});
test('saved low shot selection restores without resetting locked power',()=>{
 const g=createGame(17);g.shotStyle='low';g.power=.7;
 const snapshot=turnSnapshot(g),restored=matchGame({hole:17,scores:[],snapshot,weather:'calm',layout:0},'tester');
 assert.equal(restored.shotStyle,'low');assert.equal(restored.power,.7);
});
