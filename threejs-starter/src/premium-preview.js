export const previewEnvironments=Object.freeze({
 moonlit:{name:'Moonlit Garden',sky:'#142d42',water:'#263f58',skyLight:'#b9d5ff',groundLight:'#244340',sun:'#c5daff',intensity:1.7,hemisphere:1.5,foliage:['#527b72','#7da487','#477b65','#78966c']},
 autumn:{name:'Autumn Forest',sky:'#e4c6a2',water:'#a0b7ab',skyLight:'#ffebc6',groundLight:'#70523a',sun:'#ffe3b1',intensity:2.7,hemisphere:1.6,foliage:['#ab573c','#d18b3d','#b6a04c','#cf683e']},
 snow:{name:'Snowy Village',sky:'#cbdfe9',water:'#9fbecf',skyLight:'#edf8ff',groundLight:'#617b79',sun:'#fff0da',intensity:2.4,hemisphere:1.7,foliage:['#d6e8e7','#f0f4e6','#b8d6d2','#e3ece4']}
});
export const avatarHats=['cap','visor','beanie'];
export const shirtColors=['#315c49','#b86445','#536b9a','#d5a34d'];
export const profileThemes=['ivory','midnight','woodland'];
export function previewProfile(raw={}){return {name:typeof raw.name==='string'?raw.name.trim().slice(0,24)||'Player':'Player',hat:avatarHats.includes(raw.hat)?raw.hat:'cap',shirt:shirtColors.includes(raw.shirt)?raw.shirt:shirtColors[0],skin:['#f0c8a3','#c88d63','#875b44'].includes(raw.skin)?raw.skin:'#c88d63',theme:profileThemes.includes(raw.theme)?raw.theme:'ivory',badge:['islander','explorer','night-owl'].includes(raw.badge)?raw.badge:'islander'}}
