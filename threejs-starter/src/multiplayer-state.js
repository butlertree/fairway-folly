import {createGame,alignForPlay,enterGreen,swing,putt,clubs} from './game.js';
import {approachStart} from './approach-start.js';
import {getCourse,inPond} from './course.js';
import {cascadePool,miniHeight,onCrossing} from './mini-surfaces.js';
import {cupFor,legacyMiniCup,miniCup,pinFor} from './cups.js';
import {courseWind} from './wind.js';
import {holePars} from './rounds.js';
const fields=['greenRevision','hole','mode','mini','ball','strokes','putts','angle','time','club','puttPower','power','accuracy','message','history','lie','settle','drop','origin','approachLanding','finish'];
export function turnSnapshot(game){if(!['ready','holed'].includes(game.mode))return null;const result={v:1};for(const k of fields)if(game[k]!==undefined)result[k]=structuredClone(game[k]);result.history=result.history?.slice(-150)??[];return result}
export function validSnapshot(s,hole){return s?.v===1&&s.hole===hole&&['ready','holed'].includes(s.mode)&&Number.isInteger(s.strokes)&&s.strokes>=0&&s.strokes<=99&&s.ball&&['x','y','z','vx','vy','vz'].every(k=>Number.isFinite(s.ball[k]))&&Math.abs(s.ball.x)<2000&&Math.abs(s.ball.z)<2000&&typeof s.mini==='boolean'}
export function matchGame(match,user){const prior=match.scores.filter(s=>s.player===user&&s.hole<match.hole).sort((a,b)=>a.hole-b.hole).map(s=>({hole:s.hole,par:holePars[s.hole-1],strokes:s.strokes}));const g=createGame(match.hole,prior);if(validSnapshot(match.snapshot,match.hole))for(const k of fields)if(match.snapshot[k]!==undefined)g[k]=structuredClone(match.snapshot[k]);g.weather=match.weather;g.wind=courseWind(g.hole,match.weather);g.layout=match.layout;g.cup=cupFor(g.hole,g.layout);if(g.mini&&validSnapshot(match.snapshot,match.hole)&&match.snapshot.greenRevision!==2){if(g.mode==='holed'){g.ball.x=g.ball.z=0;g.ball.y=miniHeight(g.hole,0,0)-.95}else if(!g.putts&&g.approachLanding){g.ball.x=g.approachLanding.x;g.ball.z=g.approachLanding.z;enterGreen(g)}else{const oldCup=legacyMiniCup(g.hole,g.layout),p=approachStart(g.hole,(g.ball.x-oldCup.x)*.3048,(g.ball.z-oldCup.z)*.3048);Object.assign(g.ball,{x:p.x,z:p.z,y:miniHeight(g.hole,p.x,p.z)+.3,vx:0,vy:0,vz:0});g.angle=Math.atan2(-p.x,p.z)}g.greenRevision=2;}restoreChannelLie(g);if(!validSnapshot(match.snapshot,match.hole))alignForPlay(g);g.inputLocked=false;g.pull=null;g.freeCamera=false;return g}
// Saved turns from before the channel widened can lie in the new water.
function restoreChannelLie(game){
  const {x,z}=game.ball;
  if(game.hole!==3||!game.mini||game.mode!=='ready'||!inPond(x,z,cascadePool)||onCrossing(x,z))return;
  const dry=approachStart(3,x*.3048,z*.3048);
  Object.assign(game.ball,{x:dry.x,z:dry.z,y:miniHeight(3,dry.x,dry.z)+.3,vx:0,vy:0,vz:0});
  alignForPlay(game);
}
export function myTurn(match,user){return !!user&&match?.status==='playing'&&!match.round_finished&&(match.leaderboard?matchPlayers(match).some(player=>player.id===user):match.player===user)}
export function matchTotals(match,user){const scores=match.scores.filter(s=>s.player===user);return {strokes:scores.reduce((n,s)=>n+s.strokes,0),over:scores.reduce((n,s)=>n+s.strokes-holePars[s.hole-1],0),holes:scores.length}}
export function invitationUrl(match,invite,base=location.href){const url=new URL(base);url.search='';url.hash=new URLSearchParams({match:match.id,invite,...(match.shot_play?{group:'1'}:{}),...(match.leaderboard?{leaderboard:'1'}:{})}).toString();return url.href}
export function matchUrl(id,base=location.href){const url=new URL(base);url.search='';url.hash=new URLSearchParams({match:id}).toString();return url.href}
export function matchLink(base=location.href){const url=new URL(base),params=new URLSearchParams(url.hash.slice(1));return {id:params.get('match'),invite:params.get('invite'),...(params.get('group')==='1'?{group:true}:{}),...(params.get('leaderboard')==='1'?{leaderboard:true}:{})}}
export function matchPlayers(match){
 return match.players??[{id:match.host,name:match.host_name},{id:match.guest,name:match.guest_name??'Friend joining…'}];
}
export function matchOutcome(match){
 if(match.status!=='complete')return '';
 if(!match.shot_play){
   const a=matchTotals(match,match.host).strokes,b=matchTotals(match,match.guest).strokes;
   const difference=Math.abs(a-b);
   return a===b?`All square · ${a} strokes each`:`${a<b?match.host_name:match.guest_name} wins by ${difference} ${difference===1?'stroke':'strokes'}`;
 }
 const scores=matchPlayers(match).map(p=>({...p,strokes:matchTotals(match,p.id).strokes}));
 const low=Math.min(...scores.map(p=>p.strokes));
 const winners=scores.filter(p=>p.strokes===low);
 return winners.length>1?`${winners.map(p=>p.name).join(' and ')} tie · ${low} strokes`:`${winners[0].name} wins · ${low} strokes`;
}
export function groupAway(game){
 const pin=game.mini?miniCup(game):pinFor(game,getCourse(game.hole));
 return Math.hypot(game.ball.x-pin.x,game.ball.z-pin.z)*(game.mini?.3048:1);
}
export function groupReplay(match,user){
 const replay=match.last_shot;
 if(!replay||!Number.isInteger(replay.hole)||replay.hole<1||replay.hole>9||!validSnapshot(replay.start,replay.hole)||
    !Object.hasOwn(clubs,replay.start.club)||!Number.isFinite(replay.start.angle)||!Number.isFinite(replay.start.time))return null;
 const g=matchGame({...match,hole:replay.hole,snapshot:replay.start},user);
 const input=replay.input;
 if(input?.type==='shot'&&Number.isFinite(input.power)&&Number.isFinite(input.accuracy))swing(g,input.power,input.accuracy);
 else if(input?.type==='putt'&&Number.isFinite(input.dx)&&Number.isFinite(input.dz)&&(input.percent===undefined||Number.isFinite(input.percent)))putt(g,input.dx,input.dz,input.percent);
 else return null;
 if(!['flight','rolling'].includes(g.mode))return null;
 g.watchingShot=replay.player;
 return g;
}

export function liveStandings(match){
 return matchPlayers(match).map(player=>({...player,...matchTotals(match,player.id)}))
   .sort((a,b)=>Number(!a.holes)-Number(!b.holes)||a.over-b.over||b.holes-a.holes);
}
