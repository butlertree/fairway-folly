import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyChallenge,randomThree,roundHoles,cardPar,challengeBest} from './daily-challenge.js';
import {holePars,validScorecard,rankedScores,encodeScorecard,decodeScorecard} from './rounds.js';
test('daily rounds are identical throughout UTC day and rotate through all eighteen holes',()=>{
 const seen=new Set();for(let d=1;d<=6;d++){const a=dailyChallenge(new Date(`2026-11-0${d}T00:00:00Z`)),b=dailyChallenge(new Date(`2026-11-0${d}T23:59:59Z`));assert.deepEqual(a,b);a.courseHoles.forEach(h=>seen.add(h));}assert.equal(seen.size,18);
});
test('daily scorecards preserve actual holes, par, sharing and isolated rankings',()=>{
 const c=dailyChallenge(new Date('2026-11-13T12:00:00Z'));const card=validScorecard({v:2,id:'a',name:'Chris',weather:c.weather,layout:c.layout,courseHoles:c.courseHoles,challenge:c.id,holes:[4,4,4]});assert.deepEqual(decodeScorecard(encodeScorecard(card)),card);assert.equal(roundHoles({holes:3,courseHoles:c.courseHoles})[0],c.courseHoles[0]);assert.ok(cardPar(card)>=9);const other={...card,id:'b',challenge:'daily-2026-11-12'};assert.equal(rankedScores([card,other],c.weather,c.layout,3,c.courseHoles,c.id).length,1);assert.equal(challengeBest([other,card],c.id).id,'a');assert.equal(validScorecard({...card,courseHoles:[1,1,2]}),null);
});

test('quick three always contains one of each par and its saved sequence survives sharing',()=>{
 const seen=new Set();let seed=17;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<200;i++){
 const holes=randomThree(random);assert.equal(new Set(holes).size,3);assert.deepEqual(holes.map(h=>holePars[h-1]).sort(),[3,4,5]);holes.forEach(h=>seen.add(h));
 const card=validScorecard({v:2,id:String(i),name:'Test',weather:'calm',layout:0,courseHoles:holes,holes:[3,4,5]});assert.deepEqual(decodeScorecard(encodeScorecard(card)).courseHoles,holes);assert.equal(cardPar(card),12);
 }assert.equal(seen.size,18);
});
