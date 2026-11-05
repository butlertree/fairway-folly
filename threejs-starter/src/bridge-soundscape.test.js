import test from 'node:test';
import assert from 'node:assert/strict';
import {bridgeMix} from './bridge-soundscape.js';
import {courseWind} from './wind.js';

test('bridge ambience follows bridge movement and the current gust',()=>{
  const game={hole:3,mini:true,mode:'rolling',ball:{x:0,z:7,vx:0,vz:7},wind:courseWind(3,'windy'),time:0};
  const crossing=bridgeMix(game);
  assert.ok(crossing.deck>0);
  assert.deepEqual(Object.keys(crossing),['air','deck']);
  const distant=bridgeMix({...game,ball:{...game.ball,z:-9}});
  assert.equal(distant.deck,0);
  assert.equal(bridgeMix({...game,mode:'ready'}).deck,0);
  assert.equal(bridgeMix({...game,mini:false}).deck,0);
  assert.equal(bridgeMix({...game,hole:4}).deck,0);
  assert.ok(bridgeMix({...game,time:Math.PI/1.4}).air>crossing.air);
});
