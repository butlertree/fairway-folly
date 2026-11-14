import {roundHoles} from './daily-challenge.js';
import {conditions,holePars} from './rounds.js';
import {validSnapshot} from './multiplayer-state.js';
export function validRoundCheckpoint(saved){
 const {round,shot,scorecard}=saved??{};
 if(!round?.id||!Number.isInteger(round.holes)||round.holes<1||round.holes>holePars.length||!conditions.includes(round.weather)||!Number.isInteger(round.layout)||round.layout<0||round.layout>3)return false;
 const holes=roundHoles(round);
 if(!Array.isArray(holes)||holes.length!==round.holes||new Set(holes).size!==holes.length||holes.some(h=>!Number.isInteger(h)||h<1||h>holePars.length))return false;
 const index=holes.indexOf(shot?.hole);
 return index>=0&&validSnapshot(shot,shot.hole)&&Array.isArray(scorecard)&&scorecard.length===index&&scorecard.every((h,i)=>h.hole===holes[i]&&h.par===holePars[h.hole-1]&&Number.isInteger(h.strokes)&&h.strokes>0);
}
