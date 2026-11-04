// Creates a clearly labelled QA match; no real player's records are changed.
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {multiplayerConfig as cfg} from '../src/multiplayer-config.js';
import {turnSnapshot} from '../src/multiplayer-state.js';
import {createGame,getCourse} from '../src/game.js';
const fresh=()=>createClient(cfg.url,cfg.key,{auth:{persistSession:false,autoRefreshToken:false}});
const a=fresh(),b=fresh(),outsider=fresh(),unauth=fresh();
for(const c of [a,b,outsider]){const r=await c.auth.signInAnonymously();if(r.error)throw r.error}
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
async function rpc(c,name,args){const r=await c.rpc(name,args);if(r.error)throw Error(r.error.message);return r.data}
async function denied(c,name,args){const r=await c.rpc(name,args);ok(!!r.error,`Should deny ${name}`)}
const uid=(await a.auth.getUser()).data.user.id,bid=(await b.auth.getUser()).data.user.id;
const secret=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const holes=Number(process.env.FF_QA_HOLES??2);
let m=await rpc(a,'ff_create_match',{p_name:'QA Host',p_holes:holes,p_weather:'windy',p_layout:2,p_invite:secret});const id=m.id;ok(m.status==='waiting','waiting');
await denied(unauth,'ff_get_match',{p_id:id});await denied(outsider,'ff_get_match',{p_id:id});await denied(b,'ff_join_match',{p_id:id,p_invite:'0'.repeat(64),p_name:'QA Guest'});
m=await rpc(b,'ff_join_match',{p_id:id,p_invite:secret,p_name:'QA Guest'});ok(m.status==='playing'&&m.player===uid,'host starts');
await denied(outsider,'ff_join_match',{p_id:id,p_invite:secret,p_name:'Third'});await denied(b,'ff_finish_hole',{p_id:id,p_hole:1,p_strokes:4,p_submission:crypto.randomUUID()});
const ready=turnSnapshot(createGame(1));
m=await rpc(a,'ff_save_turn',{p_id:id,p_hole:1,p_revision:m.revision,p_snapshot:ready});ok(m.snapshot.strokes===0,'initial snapshot');
await denied(a,'ff_save_turn',{p_id:id,p_hole:1,p_revision:m.revision-1,p_snapshot:ready});
await denied(a,'ff_save_turn',{p_id:id,p_hole:1,p_revision:null,p_snapshot:ready});
await denied(b,'ff_save_turn',{p_id:id,p_hole:1,p_revision:m.revision,p_snapshot:ready});
await denied(a,'ff_finish_hole',{p_id:id,p_hole:1,p_strokes:4,p_submission:crypto.randomUUID()});
const one={...ready,strokes:1};m=await rpc(a,'ff_save_turn',{p_id:id,p_hole:1,p_revision:m.revision,p_snapshot:one});
await denied(a,'ff_save_turn',{p_id:id,p_hole:1,p_revision:m.revision,p_snapshot:ready});

for(const [hole,c,player,strokes] of Array.from({length:holes},(_,i)=>{const h=i+1;return h%2?[[h,a,uid,getCourse(h).par],[h,b,bid,getCourse(h).par+1]]:[[h,b,bid,getCourse(h).par+1],[h,a,uid,getCourse(h).par]]}).flat()){m=await rpc(c,'ff_get_match',{p_id:id});ok(m.player===player&&m.hole===hole,'alternating first player');const g=createGame(hole);g.strokes=strokes;g.mode='holed';g.mini=true;const snap=turnSnapshot(g);m=await rpc(c,'ff_save_turn',{p_id:id,p_hole:hole,p_revision:m.revision,p_snapshot:snap});const reloaded=await rpc(c,'ff_get_match',{p_id:id});ok(reloaded.snapshot.strokes===strokes,'resume same score');const submission=crypto.randomUUID();m=await rpc(c,'ff_finish_hole',{p_id:id,p_hole:hole,p_strokes:strokes,p_submission:submission});const duplicate=await rpc(c,'ff_finish_hole',{p_id:id,p_hole:hole,p_strokes:strokes,p_submission:submission});ok(duplicate.scores.length===m.scores.length,'idempotent duplicate');await denied(c,'ff_finish_hole',{p_id:id,p_hole:hole,p_strokes:strokes-1,p_submission:crypto.randomUUID()})}
ok(m.status==='complete'&&m.scores.length===holes*2,'both players complete selected holes');
const direct=await a.from('matches').select('*');ok(!!direct.error,'private tables not exposed');
console.log(`${checks} live Supabase protocol checks passed. QA match ${id} completed. No player tokens logged.`);
for(const c of [a,b,outsider])await c.auth.signOut();
