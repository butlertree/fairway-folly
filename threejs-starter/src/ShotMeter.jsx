import React,{useEffect,useRef} from 'react';
import {swingMeter,carryYards,clubs,accuracyZone} from './game';
import {aimPoint} from './aim';
// Animate only compositor transforms. React updates on phase changes, not every sweep frame.
export const ShotMeter=React.memo(function ShotMeter({game,phase,clock,onHit,mode,club,lie,vertical=false}){
 const bar=useRef(),cursor=useRef(),fill=useRef(),number=useRef(),carry=useRef();
 useEffect(()=>{if(phase==='ready'){number.current.textContent='—';carry.current.textContent=`${Math.round(carryYards(game))} yd carry at 100%${game.lie==='Sand'&&clubs[game.club].bunker?' · lofted bunker escape':clubs[game.club].bunker?' · short shots / sand':''}`;bar.current.setAttribute('aria-valuenow','0');return}let id,extent=0,lastText=-Infinity;const measure=()=>{extent=vertical?bar.current.clientHeight:bar.current.clientWidth};measure();const resize=new ResizeObserver(measure);resize.observe(bar.current);
 function frame(now){const value=swingMeter(phase,(now-clock.current)/1000),p=phase==='accuracy'?(value+1)/2:value;if(phase==='power')game.previewPower=value;cursor.current.style.transform=vertical?`translateY(-${p*Math.max(0,extent-3)}px)`:`translateX(${p*Math.max(0,extent-3)}px)`;if(fill.current)fill.current.style.transform=vertical?`scaleY(${p})`:`scaleX(${p})`;bar.current.dataset.strikeZone=phase==='accuracy'&&Math.abs(value)<=accuracyZone(game.club)?'straight':'miss';if(now-lastText>80){bar.current.setAttribute('aria-valuenow',Math.round(value*100));number.current.textContent=`${Math.round((phase==='accuracy'?game.power:value)*100)}%`;carry.current.textContent=`≈ ${Math.round(carryYards(game,phase==='power'?value:game.power))} yd carry · roll varies with lie`;lastText=now}id=requestAnimationFrame(frame)}id=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(id);resize.disconnect()};
 },[game,phase,clock,mode,club,lie,vertical]);
 function act(e){if(game.mode!=='ready'||game.paused)return;if(e.type==='pointerdown'){if(e.button!==0)return;e.preventDefault()}else if(e.detail!==0)return;const now=performance.now(),time=Math.abs(e.timeStamp-now)<60000?e.timeStamp:now;onHit(time)}
 const action=phase==='ready'?'Start swing':phase==='power'?'Set power':'Strike';
 if(vertical){
   const accuracy=phase==='accuracy',half=accuracyZone(club)*50;
   const track=accuracy?{background:`linear-gradient(to top,#cf8868,#e2ca85 ${50-half}%,#80ad72 ${50-half}%,#80ad72 ${50+half}%,#e2ca85 ${50+half}%,#cf8868)`}:undefined;
   return <aside className={'swing-rail '+phase} aria-label="Swing controls">
     <div className="rail-face" hidden={phase==='ready'}>
       <strong>{accuracy?'Accuracy':'Power'}</strong><b ref={number}>—</b>
       <div className="rail-scale"><div className="rail-labels" aria-hidden="true"><span>{accuracy?'Slice':'100%'}</span><span>{accuracy?'Straight':'50%'}</span><span>{accuracy?'Hook':'0%'}</span></div>
         <div ref={bar} style={track} className="rail-track" role="meter" aria-label={accuracy?'Shot accuracy':'Shot power'} aria-valuemin={accuracy?-100:0} aria-valuemax={100} aria-valuenow={0}>
           {phase==='power'&&<div ref={fill} className="rail-fill"/>}<div ref={cursor} className="rail-cursor"/>
         </div>
       </div>
       <span ref={carry} className="rail-carry"/>
     </div>
     <button className="primary" disabled={game.mode!=='ready'} onPointerDown={act} onClick={act}>{action}</button>
   </aside>;
 }
 return <><div className="shot-readout"><strong>{phase==='accuracy'?'POWER LOCKED':'SHOT POWER'}</strong><b ref={number}>{phase==='accuracy'?Math.round(game.power*100)+'%':'—'}</b></div><div ref={bar} style={phase==='accuracy'?{background:`linear-gradient(90deg,#cf8868,#e2ca85 ${50-accuracyZone(club)*50}%,#80ad72 ${50-accuracyZone(club)*50}%,#80ad72 ${50+accuracyZone(club)*50}%,#e2ca85 ${50+accuracyZone(club)*50}%,#cf8868)`}:undefined} className={'meter '+phase} role="meter" aria-label={phase==='accuracy'?'Shot accuracy':'Shot power'} aria-valuemin={phase==='accuracy'?-100:0} aria-valuemax={100} aria-valuenow={0} data-strike-zone="miss"><div ref={cursor} className="meter-cursor"><i/></div>{phase==='power'&&<div ref={fill} className="power-fill"/>}</div><div className="meter-ends">{phase==='accuracy'?<><span>HOOK</span><span>STRAIGHT</span><span>SLICE</span></>:<><span>0%</span><span>50%</span><span>100%</span></>}</div>{phase==='accuracy'&&<p className="accuracy-instruction">{club}: stop in the green for a straight shot.</p>}{phase==='ready'&&aimPoint(game).out&&<p className="shot-warning">At 100% power, this club may carry beyond the boundary. Choose a shorter club or less power.</p>}<p ref={carry} className="carry-note">{Math.round(carryYards(game))} yd carry at 100%{game.lie==='Sand'&&clubs[game.club].bunker?' · lofted bunker escape':clubs[game.club].bunker?' · short shots / sand':''}</p><button className="primary" disabled={game.mode!=='ready'} onPointerDown={act} onClick={act}>{phase==='ready'?'Start swing':phase==='power'?'Set power':'Strike'}</button></>
});
