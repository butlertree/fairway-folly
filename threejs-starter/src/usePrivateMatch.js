import {canTapIn,step,tapIn} from './game';
import {useState,useRef,useEffect} from 'react';
import {matchRpc,playerSession,inviteSecret,multiplayerReady} from './multiplayer-api';
import {matchLink,matchUrl,myTurn,turnSnapshot,groupAway,matchGame} from './multiplayer-state';
export function usePrivateMatch(game,onPanel){const link=useRef(matchLink()),[match,setMatch]=useState(null),[user,setUser]=useState(null),[invite,setInvite]=useState(link.current.invite??''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[engaged,setEngaged]=useState(!!link.current.id),[saved,setSaved]=useState(false);const current=useRef(null),working=useRef(false),signature=useRef(''),epoch=useRef(0),panel=useRef(onPanel);panel.current=onPanel;
 function accept(m){const prior=current.current;if(prior?.id===m.id&&(prior.revision>m.revision||prior.revision===m.revision&&prior.scores.length>m.scores.length))return prior;current.current=m;setMatch(m);return m}
 async function action(fn){if(working.current)return;working.current=true;setBusy(true);setError('');try{return await fn()}catch(e){setError(e.message??'Could not reach the match. Please try again.');panel.current()}finally{working.current=false;setBusy(false)}}
 function remember(m){localStorage.setItem('fairway-last-match',m.id);const url=new URL(matchUrl(m.id));if(import.meta.env.DEV){const q=new URLSearchParams(location.search);for(const k of ['testplayer','preview'])if(q.has(k))url.searchParams.set(k,q.get(k))}history.replaceState(null,'',url);link.current={id:m.id,invite:null};setEngaged(true)}
 async function refresh(){return action(async()=>{const u=await playerSession();setUser(u.id);const id=current.current?.id??link.current.id??localStorage.getItem('fairway-last-match');if(!id)return;const m=await matchRpc('ff_get_match',{p_id:id});accept(m);remember(m);setInvite(localStorage.getItem('fairway-invite-'+id)??'');return m})}
 async function create(name,holes,weather,layout){return action(async()=>{const u=await playerSession();setUser(u.id);const secret=inviteSecret();const m=await matchRpc('ff_leaderboard_create',{p_name:name,p_holes:holes,p_weather:weather,p_layout:layout,p_invite:secret});localStorage.setItem('fairway-invite-'+m.id,secret);localStorage.setItem('fairway-player',name);setInvite(secret);accept(m);remember(m);signature.current='';setSaved(false)})}
 async function join(name){return action(async()=>{const u=await playerSession();setUser(u.id);const m=await matchRpc(link.current.group?'ff_group_join':'ff_join_match',{p_id:link.current.id,p_invite:link.current.invite,p_name:name});localStorage.setItem('fairway-player',name);setInvite('');accept(m);remember(m);signature.current='';setSaved(false)})}
 function load(){epoch.current++;setEngaged(true);setSaved(false);signature.current=match.snapshot?JSON.stringify({...match.snapshot,time:0}):'';return match}
 function newMatch(){epoch.current++;current.current=null;setMatch(null);setInvite('');setError('');signature.current='';link.current={id:null,invite:null};localStorage.removeItem('fairway-last-match');history.replaceState(null,'',location.pathname+location.search);panel.current()}
 function leave(){epoch.current++;setEngaged(false);setError('');history.replaceState(null,'',location.pathname+location.search);}
 useEffect(()=>{if(link.current.id&&!link.current.invite&&multiplayerReady())refresh()},[]);
 useEffect(()=>{if(!match||!engaged)return;let stopped=false;async function poll(){if(working.current||document.hidden)return;try{const m=await matchRpc('ff_get_match',{p_id:current.current.id});if(stopped||working.current)return;const old=current.current;if(m.revision<old.revision)return;if(!m.shot_play&&old.revision!==m.revision&&myTurn(old,user)&&myTurn(m,user)){setError('This match was updated in another window. Reopen your turn to continue.');panel.current()}accept(m)}catch(e){if(!stopped){setError('Connection lost. Your last saved shot is safe. Refresh the match to reconnect.');panel.current()}}}const timer=setInterval(poll,match.shot_play?1400:8000);return()=>{stopped=true;clearInterval(timer)}},[match?.id,engaged,user]);
 // Save only stable rests, never an in-flight interpolation or a half-finished swing.
 useEffect(()=>{if(match?.shot_play||busy||!engaged||!myTurn(match,user)||game.paused||!['ready','holed'].includes(game.mode)||game.hole!==match.hole||game.inputLocked)return;const snap=turnSnapshot(game);if(!snap)return;const sig=JSON.stringify({...snap,time:0});if(sig===signature.current)return;const version=epoch.current;setSaved(false);const timer=setTimeout(()=>action(async()=>{if(version!==epoch.current)return;const m=await matchRpc('ff_save_turn',{p_id:match.id,p_hole:game.hole,p_revision:current.current.revision,p_snapshot:snap});if(version!==epoch.current)return;signature.current=sig;accept(m);setSaved(true)}),180);return()=>clearTimeout(timer)},[busy,engaged,user,game,game.mode,game.strokes,game.mini,game.paused,match?.status,match?.hole]);
 useEffect(()=>{
   if(!match?.shot_play||busy||error||!engaged||!myTurn(match,user)||
      (match.leaderboard?game.leaderboardId!==match.id||game.hole!==match.hole:game.paused||game.groupTurn!==match.revision)||
      !game.groupReplay||!['ready','holed'].includes(game.mode))return;
   const snapshot=turnSnapshot(game);
   if(!snapshot)return;
   action(async()=>{
     const m=match.leaderboard
       ?await matchRpc('ff_leaderboard_shot',{p_id:match.id,p_previous:game.groupReplay.start.strokes,p_snapshot:snapshot})
       :await matchRpc('ff_group_shot',{p_id:match.id,p_revision:match.revision,p_snapshot:snapshot,p_away:groupAway(game),p_replay:game.groupReplay});
     game.groupReplay=null;
     accept(m);
   });
 },[busy,error,engaged,user,match?.revision,game,game.mode,game.paused]);
 async function tapInEarly(){
   return action(async()=>{
     const m=current.current;
     if(!m?.shot_play||m.status!=='playing'||myTurn(m,user))return;
     const attempt=matchGame(m,user);
     if(!canTapIn(attempt)||!tapIn(attempt))return;
     for(let i=0;i<2400&&!['ready','holed'].includes(attempt.mode);i++)step(attempt);
     if(attempt.mode!=='holed')throw Error('This putt needs to be played on your turn.');
     accept(await matchRpc('ff_group_tap_in',{p_id:m.id,p_hole:m.hole,p_snapshot:turnSnapshot(attempt)}));
   });
 }
 async function react(player,hole,reaction){
   return action(async()=>accept(await matchRpc('ff_leaderboard_react',{p_id:match.id,p_player:player,p_hole:hole,p_reaction:reaction})));
 }
 async function comment(player,hole,text){
   return action(async()=>accept(await matchRpc('ff_leaderboard_comment',{p_id:match.id,p_player:player,p_hole:hole,p_comment:text})));
 }
 async function start(){return action(async()=>accept(await matchRpc('ff_group_start',{p_id:match.id})))}
 async function finish(){return action(async()=>{if(!myTurn(current.current,user)||game.mode!=='holed')throw Error('Finish the hole first.');const latest=await matchRpc('ff_get_match',{p_id:match.id});accept(latest);if(latest.scores.some(s=>s.player===user&&s.hole===game.hole)){panel.current();return}const snap=turnSnapshot(game);const m=await matchRpc('ff_save_turn',{p_id:match.id,p_hole:game.hole,p_revision:current.current.revision,p_snapshot:snap});accept(m);const key=`fairway-submit-${match.id}-${user}-${game.hole}`;let submission=localStorage.getItem(key);if(!submission){submission=crypto.randomUUID();localStorage.setItem(key,submission)}const result=await matchRpc('ff_finish_hole',{p_id:match.id,p_hole:game.hole,p_strokes:game.strokes,p_submission:submission});accept(result);signature.current='';setSaved(true);panel.current()})}
 return {match,user,invite,error,busy,engaged,saved,pending:link.current.invite?link.current:null,create,join,start,react,comment,tapInEarly,refresh,load,leave,finish,newMatch,open:()=>{setEngaged(true);panel.current();if(!match&&!link.current.invite&&localStorage.getItem('fairway-last-match'))refresh()}};
}
