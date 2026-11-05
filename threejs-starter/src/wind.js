// World direction points where air travels: north is down the hole (-Z).
export function courseWind(hole=1,condition='windy'){const weather=['calm','windy','stormy'].includes(condition)?condition:'calm';return {condition:weather,mph:weather==='calm'?0:(weather==='stormy'?[16,20,18,19,17,21,22,18,20]:[8,10,9,10,8,11,12,9,10])[hole-1]??8,angle:[.9,-.65,1.25,-.8,.65,1.4,-1.1,.7,-.5][hole-1]??.9,gust:weather==='stormy'?.4:weather==='windy'?.25:0}}
export function windAt(wind,time=0){if(!wind||!wind.mph)return {x:0,z:0,mph:0};const mph=wind.mph*(1+(wind.gust??0)*Math.sin(time*.7)+.04*(wind.gust??0)*Math.sin(time*2.1));return {x:Math.sin(wind.angle)*mph*.44704,z:-Math.cos(wind.angle)*mph*.44704,mph}}
export function windAcceleration(wind,time){const w=windAt(wind,time);return {x:w.x*.12,z:w.z*.12}}
export function windLabel(wind){if(!wind?.mph)return 'Calm';return `${wind.mph} mph · gusts ${Math.round(wind.mph*(1+(wind.gust??0)))} mph`}

// A light scenic breeze keeps Calm alive without changing the shot model.
export function scenicWindAt(wind,time=0){
  const active=windAt(wind,time);
  if(active.mph)return active;
  const angle=(wind?.angle??.9)+.24*Math.sin(time*.42);
  const mph=2.3+.65*Math.sin(time*.9)+.28*Math.sin(time*1.8);
  return {x:Math.sin(angle)*mph*.44704,z:-Math.cos(angle)*mph*.44704,mph};
}
