export const previewEnvironments=Object.freeze({
 moonlit:{name:'Moonlit Garden',sky:'#142d42',water:'#263f58',skyLight:'#b9d5ff',groundLight:'#244340',sun:'#c5daff',intensity:1.7,hemisphere:1.5,foliage:['#527b72','#7da487','#477b65','#78966c']},
 autumn:{name:'Autumn Forest',sky:'#e4c6a2',water:'#a0b7ab',skyLight:'#ffebc6',groundLight:'#70523a',sun:'#ffe3b1',intensity:2.7,hemisphere:1.6,foliage:['#ab573c','#d18b3d','#b6a04c','#cf683e']},
 snow:{name:'Snowy Village',sky:'#cbdfe9',water:'#9fbecf',skyLight:'#edf8ff',groundLight:'#617b79',sun:'#fff0da',intensity:2.4,hemisphere:1.7,foliage:['#d6e8e7','#f0f4e6','#b8d6d2','#e3ece4']}
});
export const crestStyles=['island','monogram','night'];
export const accentColors=['#315c49','#b86445','#536b9a','#a78743'];
export const profileThemes=['ivory','midnight','woodland'];
export function previewProfile(raw={}){return {name:typeof raw.name==='string'?raw.name.trim().slice(0,24)||'Player':'Player',crest:crestStyles.includes(raw.crest)?raw.crest:'island',accent:accentColors.includes(raw.accent??raw.shirt)?(raw.accent??raw.shirt):accentColors[0],theme:profileThemes.includes(raw.theme)?raw.theme:'ivory',badge:['islander','explorer','night-owl'].includes(raw.badge)?raw.badge:'islander'}}
