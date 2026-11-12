import React,{useEffect,useRef,useState} from 'react';
import {CourseCrest} from './RoundPanels';
import {matchTotals,invitationUrl,myTurn,matchOutcome,matchPlayers} from './multiplayer-state';
import {scoreText,holePars,roundPar} from './rounds';
export function MatchPanel({match,user,invite,error,busy,onStart,onCreate,onJoin,onPlay,onLeave,onRefresh,onNew,pending,react,comment}){const [name,setName]=useState(()=>localStorage.getItem('fairway-player')??''),[holes,setHoles]=useState(3),[weather,setWeather]=useState('calm'),[layout,setLayout]=useState(0),[copied,setCopied]=useState(false);const url=match&&invite?invitationUrl(match,invite):'';async function copy(){try{await navigator.clipboard.writeText(url);setCopied(true)}catch{setCopied(false)}}return <div className="round-overlay"><section className="round-card match-card"><CourseCrest/><p className="round-kicker">FAIRWAY & FOLLY · PRIVATE MATCH</p><h1>{match?.status==='complete'?'Match complete':match?'Your match':pending?'You’re invited':'Play with friends'}</h1>{error&&<p className="match-error" role="alert">{error}</p>}{error&&!match&&!pending&&<button disabled={busy} onClick={onRefresh}>Refresh match</button>}{!match?<><p>{!pending||pending.leaderboard?'2–10 players. Play at your own pace and see everyone’s scores as they finish each hole.':pending.group?'You’re joining an existing shot-by-shot match.':'This match takes turns after each hole.'}</p><label>Your name<input aria-label="Multiplayer name" value={name} maxLength={24} onChange={e=>setName(e.target.value)}/></label>{!pending&&<><label>Holes<select aria-label="Match holes" value={holes} onChange={e=>setHoles(Number(e.target.value))}>{[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} {n===1?'hole':'holes'}</option>)}</select></label><div className="board-filters"><label>Conditions<select aria-label="Match conditions" value={weather} onChange={e=>setWeather(e.target.value)}>{['calm','windy','stormy'].map(w=><option key={w}>{w}</option>)}</select></label><label>Pin placement<select aria-label="Match pin placement" value={layout} onChange={e=>setLayout(Number(e.target.value))}>{[0,1,2,3].map(n=><option key={n} value={n}>Pin set {String.fromCharCode(65+n)}</option>)}</select></label></div></>}<button className="primary" disabled={busy||!name.trim()} onClick={()=>pending?onJoin(name.trim()):onCreate(name.trim(),holes,weather,layout)}>{busy?'Connecting…':pending?'Join private match':'Create invitation'}</button></>:<><p className="match-turn" role="status">{match.status==='waiting'?match.shot_play?`${match.players.length}/${match.leaderboard?10:4} players joined`:'Waiting for your friend to join':match.status==='complete'?matchOutcome(match):match.leaderboard?(match.round_finished?'Round posted · Waiting for other players':`Play at your own pace · Hole ${match.hole}/${match.holes}`):`${myTurn(match,user)?'Your':matchPlayers(match).find(p=>p.id===match.player)?.name+'’s'} turn · Hole ${match.hole}/${match.holes}`}</p><p className="round-note">{match.weather} · Pin set {String.fromCharCode(65+match.layout)} · Same conditions for everyone</p><MatchScorecard key={match.id} match={match} user={user} busy={busy} react={react} comment={comment}/>{match.status==='waiting'&&url&&<><p>{match.leaderboard?'Share this invitation with up to nine friends. Start the round once everyone has joined.':match.shot_play?'Share this invitation with up to three friends. The host starts when everyone is in.':'Share this invitation with your friend.'}</p><input aria-label="Private invitation link" readOnly value={url} onFocus={e=>e.target.select()}/><button onClick={copy}>{copied?'Copied!':'Copy invitation'}</button></>}{match.shot_play&&match.status==='waiting'&&match.host===user&&<button className="primary" disabled={busy||match.players.length<2} onClick={onStart}>{match.leaderboard?'Start round':'Start match'}</button>}{(myTurn(match,user)||match.shot_play&&!match.leaderboard&&match.status==='playing')&&<button className="primary" disabled={busy} onClick={onPlay}>{match.leaderboard?'Play round':match.shot_play?'Enter match':`Play hole ${match.hole}`}</button>}<button disabled={busy} onClick={onRefresh}>Refresh match</button><button onClick={onNew}>{match.status==='complete'?'Start another match':'Create a different match'}</button></>}<p className="round-note">Return in this same browser to keep your player identity. Clearing browser data or changing devices loses guest access. {match?.shot_play&&!match.leaderboard?"Watch the latest shot replay after the ball settles.":""}</p><button onClick={onLeave}>Back to solo game</button></section></div>}

const reactionLabels={'well-played':'Well played','great-birdie':'Great birdie','tough-hole':'Tough hole'};

function MatchScorecard({match,user,busy,react,comment}){
 const [selected,setSelected]=useState(null);
 const details=useRef(null);
 useEffect(()=>{if(selected)details.current?.scrollIntoView({block:'nearest'});},[selected]);
 const players=matchPlayers(match);
 const holes=Array.from({length:match.holes},(_,i)=>i+1);
 const reactions=match.reactions??[];
 const comments=match.comments??[];
 const score=match.scores.find(s=>s.player===selected?.player&&s.hole===selected?.hole);
 const replies=score?reactions.filter(r=>r.player===score.player&&r.hole===score.hole):[];
 const messages=score?comments.filter(c=>c.player===score.player&&c.hole===score.hole):[];
 const myComment=messages.find(c=>c.author===user)?.text;
 const mine=replies.find(r=>r.author===user)?.reaction;
 const nameFor=id=>players.find(p=>p.id===id)?.name??'Player';
 return <>
   {match.leaderboard&&match.scores.length>0&&<p className="round-note">Tap a completed score to react or leave a comment.</p>}
   <div className="board-table"><table><thead><tr><th>Player</th>{holes.map(hole=><th key={hole}>{hole}</th>)}<th>Total</th></tr><tr className="scorecard-par"><th scope="row">Par</th>{holes.map(hole=><td key={hole}>{holePars[hole-1]}</td>)}<td>{roundPar(match.holes)}</td></tr></thead>
     <tbody>{players.map(({id,name})=>{
       const t=matchTotals(match,id);
       return <tr key={id??'guest'}><th>{name}{id===user?' (you)':''}<small>{t.holes?`${t.over===0?'Even par':scoreText(t.over)} · ${t.holes}/${match.holes} finished`:'Not started'}</small></th>
         {holes.map(hole=>{
           const strokes=match.scores.find(s=>s.player===id&&s.hole===hole)?.strokes;
           const count=[...reactions,...comments].filter(r=>r.player===id&&r.hole===hole).length;
           return <td key={hole}>{match.leaderboard&&strokes!=null
             ?<button className="reaction-score" aria-expanded={score?.player===id&&score?.hole===hole} aria-controls="hole-reactions"
               aria-label={`${name}, hole ${hole}, ${strokes} ${strokes===1?'stroke':'strokes'}${count?`, ${count} ${count===1?'reply':'replies'}`:''}`}
               onClick={()=>setSelected(score?.player===id&&score?.hole===hole?null:{player:id,hole})}>
               {strokes}{count>0&&<small aria-hidden="true"> ◇{count}</small>}
             </button>:strokes??'—'}</td>;
         })}
         <td>{t.holes?t.strokes:'—'}</td>
       </tr>;
     })}</tbody></table></div>
   {score&&<section ref={details} id="hole-reactions" className="hole-reactions" aria-label="Hole reactions and comments">
     <b>{nameFor(score.player)} · Hole {score.hole} · {score.strokes} {score.strokes===1?'stroke':'strokes'}</b>
     {score.player!==user&&<div className="reaction-options">{Object.entries(reactionLabels)
       .filter(([key])=>key!=='great-birdie'||score.strokes===holePars[score.hole-1]-1)
       .map(([key,label])=><button key={key} disabled={busy} aria-pressed={mine===key}
         onClick={()=>react(score.player,score.hole,mine===key?null:key)}>{label}</button>)}</div>}
     {replies.length>0&&<ul>{replies.map(r=><li key={r.author}>{r.author===user?'You':nameFor(r.author)} · {reactionLabels[r.reaction]}</li>)}</ul>}
     {messages.length>0&&<ul className="score-comments">{messages.map(c=><li key={c.author}><b>{c.author===user?'You':nameFor(c.author)}</b><span>{c.text}</span></li>)}</ul>}
     {score.player!==user&&<ScoreComment key={`${score.player}:${score.hole}`} busy={busy} posted={myComment}
       save={text=>comment(score.player,score.hole,text)}/>}
     {!messages.length&&!replies.length&&score.player===user&&<small>No replies yet</small>}
   </section>}
 </>;
}

function ScoreComment({busy,posted,save}){
 const [draft,setDraft]=useState(null);
 const text=draft??posted??'';
 async function submit(event){
   event.preventDefault();
   if(await save(text.trim()))setDraft(null);
 }
 async function remove(){
   if(await save(null))setDraft(null);
 }
 return <form className="score-comment-form" onSubmit={submit}>
   <label>Write a comment<textarea rows={2} maxLength={160} disabled={busy} value={text}
     onChange={event=>setDraft(event.target.value)}/></label>
   <small>{text.length}/160</small>
   <div className="reaction-options">
     <button type="submit" disabled={busy||!text.trim()||text.trim()===posted}>{posted?'Save edit':'Post comment'}</button>
     {posted&&<button type="button" disabled={busy} onClick={remove}>Remove comment</button>}
   </div>
 </form>;
}
