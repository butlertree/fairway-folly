export const holePars=[4,5,3,4,5,3,4,3,5,4,3,5];
export const holeYards=[360,520,165,445,535,142,460,202,602,440,170,525];
export const roundPar=count=>holePars.slice(0,count).reduce((a,b)=>a+b,0);
export const roundYards=count=>holeYards.slice(0,count).reduce((a,b)=>a+b,0);
export const ROUND_PAR=roundPar(holePars.length);
export const conditions=['calm','windy','stormy'];
export function scoreText(over){return over===0?'E':over>0?`+${over}`:`${over}`}
export function validScorecard(value){if(!value||![1,2].includes(value.v)||typeof value.id!=='string'||value.id.length>80||typeof value.name!=='string'||!value.name.trim()||value.name.length>24||!conditions.includes(value.weather)||!Number.isInteger(value.layout)||value.layout<0||value.layout>3||!Array.isArray(value.holes)||(value.v===1?value.holes.length!==3:value.holes.length<1||value.holes.length>holePars.length)||value.holes.some(n=>!Number.isInteger(n)||n<1||n>99))return null;return {v:value.v,id:value.id,name:value.name.trim(),weather:value.weather,layout:value.layout,holes:[...value.holes],date:typeof value.date==='string'?value.date.slice(0,24):'',total:value.holes.reduce((a,b)=>a+b,0)}}
export function encodeScorecard(card){const valid=validScorecard(card);if(!valid)throw Error('Complete your selected round before sharing.');return btoa(unescape(encodeURIComponent(JSON.stringify(valid)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
export function decodeScorecard(code){try{if(code.length>2000)return null;return validScorecard(JSON.parse(decodeURIComponent(escape(atob(code.replace(/-/g,'+').replace(/_/g,'/'))))))}catch{return null}}
export function addScorecard(entries,card){const valid=validScorecard(card);if(!valid)return entries;return [...entries.filter(e=>e.id!==valid.id),valid].slice(-100)}
export function rankedScores(entries,weather,layout,holes=3){return entries.filter(e=>validScorecard(e)&&e.weather===weather&&e.layout===layout&&e.holes.length===holes).sort((a,b)=>a.total-b.total||a.date.localeCompare(b.date)).map((e,i,all)=>({...e,rank:all.findIndex(x=>x.total===e.total)+1}))}
export function scoreName(strokes,par){if(strokes===1)return 'HOLE IN ONE';const over=strokes-par;return ({0:'PAR','-1':'BIRDIE','-2':'EAGLE','-3':'ALBATROSS',1:'BOGEY',2:'DOUBLE BOGEY',3:'TRIPLE BOGEY',4:'QUADRUPLE BOGEY'})[over]??(over<0?`${-over} UNDER PAR`:`${over} OVER PAR`)}
export function roundProgress(game){const prior=game.scorecard??[],finished=game.mode==='holed';return {total:prior.reduce((n,h)=>n+h.strokes,game.strokes),over:prior.reduce((n,h)=>n+h.strokes-h.par,finished?game.strokes-game.par:0),complete:prior.length+(finished?1:0)}}
