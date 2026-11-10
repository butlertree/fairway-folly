import test from 'node:test';import assert from 'node:assert/strict';
import {miniHeight,miniSlope} from './mini-surfaces.js';
import {greenOutline} from './mini-boundary.js';
import {clearApproachStart} from './approach-start.js';
import {createGame,enterGreen,putt,step,getCourse,mini,canTapIn} from './game.js';
import {holePars,holeYards} from './rounds.js';
import {courseWoodland} from './course-woodland.js';
test('course order alternates the last par three pair and keeps their complete designs together',()=>{assert.equal(getCourse(7).title,'Copperpine Bend');assert.equal(getCourse(8).title,'Seabell Headland');assert.deepEqual(holePars,[4,5,3,4,5,3,4,3,5,4,3,5]);assert.equal(holeYards[6],460);assert.equal(holeYards[7],202)});
test('each contoured green has relief, a flat close-approach reward and level outer banks',()=>{const signatures=new Set();for(const h of [1,3,4,5,6,7,8,9]){let max=0;const samples=[];for(let x=-8;x<=8;x++)for(let z=-12;z<=12;z++){const y=miniHeight(h,x,z);max=Math.max(max,y);samples.push(y.toFixed(3));if(Math.hypot(x,z)<=3)assert.equal(y,0)}assert.ok(max>.4,`relief on ${h}`);signatures.add(samples.join(','));for(const p of greenOutline(h))assert.ok(miniHeight(h,p.x,p.z)<1e-5)}assert.equal(signatures.size,8)});
test('every new green produces real sideways break on a clear putt',()=>{for(const h of [1,3,4,5,6,7,8,9]){let found=false;for(let x=-7;x<=7&&!found;x++)for(let z=-11;z<=11&&!found;z++){const slope=miniSlope(h,x,z);if(Math.abs(slope.x)<.04||![0,.4,.8].every(d=>clearApproachStart(h,x,z+d)))continue;const g=createGame(h);enterGreen(g);g.ball={x,z,y:miniHeight(h,x,z)+.3,vx:0,vy:0,vz:0};putt(g,0,1,10);for(let i=0;i<24;i++)step(g);if(g.strokes===1&&Math.abs(g.ball.x-x)>.005&&Math.sign(g.ball.x-x)===-Math.sign(slope.x))found=true}assert.ok(found,`physical break on ${h}`)}});
test('windmill has wider longer colliding blades and hole one has substantial woodland',()=>{assert.ok(mini.rotor.radius>=3.7);assert.ok(mini.rotor.width>=.3);assert.ok(courseWoodland(1).length>=30)});

test('tap-in stays available on the flat reward area and is withheld on breaking slopes',()=>{const g=createGame(8);enterGreen(g);g.ball={x:0,z:6,y:miniHeight(8,0,6)+.3,vx:0,vy:0,vz:0};assert.equal(canTapIn(g),false);g.ball.z=2;g.ball.y=.3;assert.equal(canTapIn(g),true)});

test('all requested greens have mixed rear groves, with hole six unchanged',()=>{let specimens=0;for(let h=1;h<=9;h++){const c=getCourse(h),trees=courseWoodland(h),grove=trees.filter(t=>t.greenGrove);if(h===6){assert.equal(grove.length,0);continue}assert.ok(grove.length>=8,`grove on ${h}`);assert.ok(new Set(grove.map(t=>t.kind)).size>=3);const previous=c.route?.at(-2)??c.tee,dx=c.pin.x-previous.x,dz=c.pin.z-previous.z;assert.ok(grove.some(t=>(t.x-c.pin.x)*dx+(t.z-c.pin.z)*dz>0),`behind ${h}`);specimens+=grove.filter(t=>t.signature).length}assert.ok(specimens>=4)});

test('first green keeps the mill passage and forgiving west bank route level',()=>{for(const x of [-1.5,0,1.5])for(const z of [5,7,9])assert.equal(miniHeight(1,x,z),0);for(let z=-10;z<=10;z++)assert.equal(miniHeight(1,-7.5,z),0);assert.ok(miniHeight(9,-5,-7)>.4)});
