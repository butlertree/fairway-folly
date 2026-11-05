import {cascadePool,onCrossing} from './mini-surfaces.js';
import {windAt} from './wind.js';

export function bridgeMix(game){
  const wind=windAt(game.wind,game.time).mph;
  const isBridgeGreen=game.hole===3&&game.mini;
  const {x,z,vx,vz}=game.ball;
  const distance=Math.hypot(x-cascadePool.x,z-cascadePool.z);
  const speed=Math.hypot(vx,vz);
  return {
    air:.045+wind*.006,
    stream:isBridgeGreen?.04+.28/(1+(distance/5)**2):0,
    deck:isBridgeGreen&&game.mode==='rolling'&&onCrossing(x,z)?Math.min(.18,speed*.016):0
  };
}

// Shape a seamless noise loop into a soft bed, a rippling stream or a rolling texture.
export function ambienceLayer(context,master,buffer,{frequency,gain=0,type='lowpass',pulse=0}){
  const source=context.createBufferSource(), filter=context.createBiquadFilter(), volume=context.createGain();
  source.buffer=buffer;
  source.loop=true;
  filter.type=type;
  filter.frequency.value=frequency;
  volume.gain.value=gain;
  source.connect(filter).connect(volume).connect(master);
  if(pulse){
    const oscillator=context.createOscillator(), depth=context.createGain();
    oscillator.frequency.value=pulse;
    depth.gain.value=frequency*.36;
    oscillator.connect(depth).connect(filter.frequency);
    oscillator.start();
  }
  source.start();
  return volume.gain;
}
