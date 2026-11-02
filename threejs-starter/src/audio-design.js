// Dry club-specific impact voicing: no metal samples or high ringing oscillators.
export const clubImpacts={
 driver:{rate:.92,lowpass:2100,gain:1.20,transient:.12,body:118,tail:.105},
 hybrid:{rate:1.18,lowpass:2600,gain:1.00,transient:.10,body:175,tail:.080},
 iron:{rate:1.55,lowpass:3300,gain:.88,transient:.16,body:230,tail:.060},
 wedge:{rate:1.80,lowpass:2700,gain:.72,transient:.11,body:260,tail:.050},
 putter:{rate:1.35,lowpass:1800,gain:.60,transient:.025,body:210,tail:.045}
};
export function clubSound(club,power=0){return club==='Driver'?(power>=.97?'strike-driver-smash':'strike-driver'):club==='Hybrid'?'strike-hybrid':club==='7 iron'?'strike-iron':'strike-wedge'}

export const recordedClubs={driver:['driver-strike'],hybrid:['wood-strike'],iron:['iron-strike-0','iron-strike-1','iron-strike-2'],wedge:['wedge-strike'],putter:['putter-strike-0','putter-strike-1','putter-strike-2']};
