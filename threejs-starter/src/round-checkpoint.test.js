import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,enterGreen} from './game.js';
import {turnSnapshot} from './multiplayer-state.js';
import {validRoundCheckpoint} from './round-checkpoint.js';
import {holePars} from './rounds.js';
test('all eighteen settled holes and putting lies can resume with the correct score',()=>{
 for(let hole=1;hole<=18;hole++)for(const mini of [false,true]){
 const g=createGame(hole);if(mini)enterGreen(g);g.strokes=3;
 const save={round:{id:'round',holes:18,weather:'calm',layout:0},shot:turnSnapshot(g),scorecard:Array.from({length:hole-1},(_,i)=>({hole:i+1,par:holePars[i],strokes:4}))};
 assert.ok(validRoundCheckpoint(JSON.parse(JSON.stringify(save))),`hole ${hole}, mini ${mini}`);
 assert.equal(validRoundCheckpoint({...save,scorecard:[...save.scorecard,{hole,par:g.par,strokes:3}]}),false);
 }
});
test('a daily round resumes hole fourteen as its second hole',()=>{
 const save={round:{id:'daily',holes:3,weather:'calm',layout:2,courseHoles:[13,14,15]},shot:turnSnapshot(createGame(14)),scorecard:[{hole:13,par:4,strokes:5}]};assert.ok(validRoundCheckpoint(save));assert.equal(validRoundCheckpoint({...save,round:{...save.round,courseHoles:[13,13,15]}}),false);
});
