import {holePars} from './rounds.js';
export function dailyChallenge(date=new Date()){
 const day=Math.floor(date.getTime()/86400000),start=((day%6)+6)%6*3+1;
 return {id:`daily-${date.toISOString().slice(0,10)}`,date:date.toISOString().slice(0,10),courseHoles:[start,start+1,start+2],weather:day%3===0?'windy':'calm',layout:((day%4)+4)%4};
}
export const roundHoles=round=>round?.courseHoles??Array.from({length:round?.holes??holePars.length},(_,i)=>i+1);
export const cardHoles=card=>card.courseHoles??Array.from({length:card.holes.length},(_,i)=>i+1);
export const cardPar=card=>cardHoles(card).reduce((sum,h)=>sum+holePars[h-1],0);
export function challengeBest(entries,id){return entries.filter(e=>e.challenge===id).reduce((best,e)=>!best||e.total<best.total?e:best,null)}

// Choose once at round creation; checkpoints and scorecards retain this sequence.
export function randomThree(random=Math.random){
 const selected=[3,4,5].map(par=>{
   const candidates=holePars.flatMap((p,i)=>p===par?[i+1]:[]);
   return candidates[Math.floor(random()*candidates.length)];
 });
 for(let i=selected.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[selected[i],selected[j]]=[selected[j],selected[i]];}
 return selected;
}
