import {ambienceLayer,bridgeMix} from './bridge-soundscape.js';
import {clubImpacts,recordedClubs} from './audio-design.js';
// Local CC0 foley layers plus original synthesis. See public/audio/CREDITS.md.
class GameAudio {
  constructor(){this.enabled=true;this.context=null;this.seen=new WeakMap();this.buffers=new Map();this.variant=0;this.loading=null}
  unlock(){
    if(!this.enabled)return;
    try{if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.context=new Audio();this.master=this.context.createGain();this.master.gain.value=.32;this.limiter=this.context.createDynamicsCompressor();this.limiter.threshold.value=-8;this.limiter.knee.value=8;this.limiter.ratio.value=5;this.limiter.attack.value=.002;this.limiter.release.value=.12;this.master.connect(this.limiter);this.limiter.connect(this.context.destination);this.loadSamples();this.startAmbience();document.addEventListener('visibilitychange',()=>{if(this.context&&this.master)this.master.gain.setTargetAtTime(this.enabled&&!document.hidden?.32:0,this.context.currentTime,.04)})}if(this.context.state!=='running'&&this.context.state!=='closed')this.context.resume().catch(()=>{})}catch{}
  }
  setEnabled(enabled){this.enabled=enabled;if(this.master){const t=this.context.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(enabled?.32:0,t,.025)}if(enabled&&this.context)this.unlock()}
  loadSamples(){if(this.loading)return this.loading;const golf=new Set([...Object.values(recordedClubs).flat(),'cup-drop']),names=['impactSoft_heavy_000','impactSoft_heavy_001','impactSoft_heavy_002','footstep_grass_000','footstep_grass_001','impactGeneric_light_000','impactWood_light_000','impactMetal_light_000','impactTin_medium_000','footstep_snow_000',...golf];this.sampleCount=names.length;this.loading=Promise.allSettled(names.map(async n=>{const r=await fetch(`${import.meta.env.BASE_URL}audio/${golf.has(n)?'golf':'foley'}/${n}.wav`);if(!r.ok)throw new Error('Audio '+r.status);this.buffers.set(n,await this.context.decodeAudioData(await r.arrayBuffer()))}));return this.loading}
  sample(name,{gain=.8,rate=1,lowpass=8000,delay=0}={}){const buffer=this.buffers.get(name);if(!buffer)return false;const c=this.context,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buffer;s.playbackRate.value=rate;f.type='lowpass';f.frequency.value=lowpass;g.gain.value=gain;s.connect(f);f.connect(g);g.connect(this.master);s.start(c.currentTime+delay);return true}
  startAmbience(){
    const c=this.context,buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);
    let brown=0;
    for(let i=0;i<data.length;i++){
      const noise=Math.random()*2-1;
      brown=(brown+noise*.09)/1.09;
      const envelope=.8+.2*Math.sin(Math.PI*i/data.length)**2;
      data[i]=(brown+noise*.16)*envelope;
    }
    this.ambience={
      air:ambienceLayer(c,this.master,buffer,{frequency:520,gain:.045}),
      deck:ambienceLayer(c,this.master,buffer,{frequency:480,type:'bandpass',pulse:24})
    };
  }
  updateAmbience(game){
    if(!this.enabled||this.context?.state!=='running'||document.hidden)return;
    const now=this.context.currentTime;
    if(now<(this.nextMixAt??0))return;
    this.nextMixAt=now+.05;
    const mix=bridgeMix(game);
    for(const layer of Object.keys(mix)){
      const gain=this.ambience[layer];
      gain.setTargetAtTime(mix[layer],now,layer==='deck'?.06:.28);
    }
  }
  landing(surface,strength){const v=Math.max(.06,Math.min(1,strength)),i=this.variant++%3,r=.94+Math.random()*.1,soft=`impactSoft_heavy_00${i}`;const loaded=this.sample(soft,{gain:(surface==='green'?.75:1.15)*Math.sqrt(v),rate:r*(surface==='rough'?.83:1.05),lowpass:surface==='rough'?750:1600});if(surface==='rough'||surface==='fairway')this.sample(`footstep_grass_00${i%2}`,{gain:.22*v,rate:1.35,lowpass:2200});if(surface==='sand')this.sample('footstep_snow_000',{gain:.65*v,rate:.8,lowpass:1700});if(!loaded)this.noise(.10,.28*v,500);this.tone(surface==='green'?150:105,0,.12,.19*v,'sine',48)}
  tone(freq,delay=0,duration=.1,gain=.1,type='sine',end=freq){const c=this.context,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02)}
  noise(duration,gain,frequency=1200,delay=0,filterType='lowpass'){const c=this.context,t=c.currentTime+delay,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();source.buffer=buffer;filter.type=filterType;filter.frequency.value=frequency;g.gain.value=gain;source.connect(filter);filter.connect(g);g.connect(this.master);source.start(t);source.stop(t+duration)}
  birdCall(delay,duration,base,gain,rasp=false){const c=this.context,t=c.currentTime+delay,o=c.createOscillator(),v=c.createOscillator(),depth=c.createGain(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(base,t);o.frequency.exponentialRampToValueAtTime(base*1.5,t+duration*.16);o.frequency.exponentialRampToValueAtTime(base*.9,t+duration*.62);o.frequency.exponentialRampToValueAtTime(base*.63,t+duration);v.frequency.value=rasp?29:47;depth.gain.value=rasp?65:110;v.connect(depth);depth.connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);v.start(t);o.stop(t+duration+.02);v.stop(t+duration+.02);if(rasp)this.noise(duration,.12,1600,delay,'bandpass')}
  strike(kind,strength=1){const smash=kind==='driver-smash',key=smash?'driver':kind,p=clubImpacts[key]??clubImpacts.iron,v=Math.max(.15,Math.min(1,strength)),pool=recordedClubs[key]??recordedClubs.iron,name=pool[this.variant++%pool.length],loaded=this.sample(name,{gain:(smash?1.85:key==='driver'?1.12:p.gain)*v,rate:.99+Math.random()*.02,lowpass:key==='putter'?4500:key==='wedge'?5500:6200});if(!loaded)this.sample('impactWood_light_000',{gain:p.gain*v,rate:p.rate,lowpass:p.lowpass});if(smash)this.noise(.016,.26*v,5200);this.tone(smash?92:p.body,0,smash?.16:p.tail,(smash?.30:key==='driver'?.09:.035)*v,'sine',smash?45:p.body*.48)}
  play(type,strength=1){if(!this.enabled||!this.context||this.context.state!=='running'||document.hidden)return;const v=Math.max(.15,Math.min(1,strength));switch(type){
    case 'land-fairway':case 'land-rough':case 'land-green':case 'land-sand':this.landing(type.slice(5),v);break;
    case 'strike-driver-smash':this.strike('driver-smash',v);break;
    case 'swing':case 'strike-driver':this.strike('driver',v);break;
    case 'strike-hybrid':this.strike('hybrid',v);break;
    case 'strike-iron':this.strike('iron',v);break;
    case 'strike-wedge':this.strike('wedge',v);break;
    case 'putt':this.strike('putter',v);break;
    case 'flagstick':if(this.sample('impactWood_light_000',{gain:.35*v,rate:1.6,lowpass:3500}))break;this.noise(.035,.08*v,900);break;
    case 'bridge-rail':
      if(!this.sample('impactWood_light_000',{gain:.85*v,rate:.83+Math.random()*.1,lowpass:3100}))this.noise(.055,.12*v,1600);
      this.tone(240,0,.08,.075*v,'sine',96);
      break;
    case 'stone-bank':
      if(!this.sample('impactGeneric_light_000',{gain:.64*v,rate:1.2,lowpass:4700}))this.noise(.032,.10*v,3400);
      break;
    case 'bank':if(this.sample('impactWood_light_000',{gain:.7*v,rate:1.1+Math.random()*.12}))break;
    case 'bounce':this.tone(type==='bank'?520:220,0,.07,.1*v,'triangle',100);break;
    case 'sand':this.noise(.14,.12*v,800);break;
    case 'splash':this.noise(.35,.15,700);this.tone(180,.02,.24,.07,'sine',55);break;
    case 'penalty':this.tone(250,0,.15,.045);this.tone(190,.16,.18,.035);break;
    case 'cup':if(!this.sample('cup-drop',{gain:1.25,rate:1,lowpass:10000}))this.sample('impactWood_light_000',{gain:.5,rate:1.2});break;
    case 'eagle':this.birdCall(1.15,.85,1250,.36,true);this.birdCall(2.25,.6,1450,.28,true);break;
    case 'birdie':[1.05,1.22,1.44,1.85,2.03].forEach((d,i)=>this.birdCall(d,.13,i%2?3100:2450,.095));break;
    case 'sad-finish':[392,349.23,293.66].forEach((f,i)=>{this.tone(f,.35+i*.26,i===2?.65:.28,.105,'triangle',i===2?220:f*.97);this.tone(f/2,.35+i*.26,.32,.055,'sine',f*.45)});break;
    case 'bogey-finish':this.tone(330,.3,.32,.07,'triangle',294);this.tone(262,.6,.42,.07,'triangle',247);break;
    case 'win':[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,i*.13,.42,.065));break;
  }}
  consume(game){const last=this.seen.get(game)||0;for(const event of game.soundEvents||[])if(event.id>last)this.play(event.type,event.strength);this.seen.set(game,game.soundSeq||0)}
}
export const gameAudio=new GameAudio();
