import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,enterGreen,putt,step,swing} from './game.js';
import {groupAway,groupReplay,invitationUrl,matchLink} from './multiplayer-state.js';

test('group invitations keep the mode and secret in the fragment',()=>{
 const match={id:'a',shot_play:true};
 const url=invitationUrl(match,'private','https://example.com/?hole=1');
 assert.deepEqual(matchLink(url),{id:'a',invite:'private',group:true});
 assert.equal(new URL(url).search,'');
});

test('spectators reproduce both drives and putts from the recorded shot',()=>{
 for(const miniature of [false,true]){
   const original=createGame(1);
   original.groupTurn=12;
   if(miniature){
     enterGreen(original);
     Object.assign(original.ball,{x:0,y:.3,z:2});
     putt(original,0,-1,17);
   }else swing(original,.8,-.2);
   const match={hole:1,scores:[],weather:'calm',layout:0,last_shot:{...original.groupReplay,hole:1,player:'friend'}};
   const replay=groupReplay(match,'viewer');
   assert.equal(replay?.watchingShot,'friend');
   for(let i=0;i<180;i++){step(original);step(replay)}
   assert.deepEqual(replay.ball,original.ball);
   assert.equal(replay.strokes,original.strokes);
   assert.ok(groupAway(replay)>=0);
 }
});
