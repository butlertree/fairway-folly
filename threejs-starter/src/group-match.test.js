import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,enterGreen,putt,step,swing} from './game.js';
import {groupAway,groupReplay,invitationUrl,matchLink,liveStandings,myTurn} from './multiplayer-state.js';

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

test('leaderboard invitations, standings, and shot checkpoints work independently of turn order',()=>{
 const match={id:'a',shot_play:true,leaderboard:true,status:'playing',player:'a',
   players:[{id:'a',name:'A'},{id:'b',name:'B'},{id:'c',name:'C'}],
   scores:[{player:'a',hole:1,strokes:5},{player:'b',hole:1,strokes:3},{player:'b',hole:2,strokes:5}]};
 const url=invitationUrl(match,'private','https://example.com/');
 assert.deepEqual(matchLink(url),{id:'a',invite:'private',group:true,leaderboard:true});
 assert.deepEqual(liveStandings(match).map(p=>[p.id,p.over,p.holes]),[['b',-1,2],['a',1,1],['c',0,0]]);
 assert.ok(myTurn(match,'a'));
 assert.equal(myTurn({...match,round_finished:true},'a'),false);
 const g=createGame();
 g.leaderboardId=match.id;
 swing(g,.6,0);
 assert.equal(g.groupReplay.start.strokes,0);
 assert.equal(g.strokes,1);
});

test('a leaderboard guest can start while the host is on a different hole',()=>{
 const match={leaderboard:true,status:'playing',player:'host',hole:1,
   players:[{id:'host'},{id:'guest'}],scores:[{player:'host',hole:1,strokes:4}]};
 assert.equal(myTurn(match,'guest'),true);
 assert.equal(myTurn(match,'stranger'),false);
 assert.equal(myTurn({...match,round_finished:true},'guest'),false);
 assert.equal(myTurn({...match,leaderboard:false},'guest'),false);
});
