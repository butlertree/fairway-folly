import {SwingGolfer} from './SwingGolfer';
import {CourseGrass,CourseLanding} from './CourseLife';
import {ValleyForest} from './ValleyForest';
import {PuttingVisibility} from './PuttingVisibility';
import {projectInside} from './mini-boundary';
import {usePrivateMatch} from './usePrivateMatch';
import {MatchPanel} from './MatchPanel';
import {matchGame,myTurn,matchLink} from './multiplayer-state';
import {overviewCamera} from './overview-camera';
import {puttReadoutPlacement} from './hud-layout';
import {flagstick} from './flagstick';
import {bunkersByHole} from './bunkers';
import {CourseBunkers,BunkerGroundMaterial} from './CourseBunkers';
import {terrainHeight} from './course';
import {NewTerrain} from './NewTerrain';
import {HOLE_COUNT,newHoles,greenNames} from './new-holes';
import {cameraBlend,renderBallBetween} from './camera-motion';
import {WeatherEffects} from './WeatherEffects';
import {ShotMeter} from './ShotMeter';
import {CourseSetup,Leaderboard} from './RoundPanels';
import {addScorecard,validScorecard,decodeScorecard,scoreText,scoreName,roundProgress} from './rounds';
import {cupFor,miniCup,pinFor} from './cups';
import {SignatureGreen} from './SignatureGreens';
import {courseWind,scenicWindAt,windLabel} from './wind';
import {KingfisherTerrain} from './HoleThree';
import {MiniLandscape,GreenBank,PuttingTurf,roundedGreenShape,CurvedBanks,greenShape} from './MiniLandscape';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

import {createGame as createBaseGame, step, swing, putt, height, mini, clubs, DT, enterGreen, ponds, bladeTransforms, puttInfo, course, METRES_PER_YARD, yardsToPin, lie,riverWidth,canTapIn,tapIn,swingMeter,swingTiming,carryYards,getCourse,nextHole,playbackRate,alignToPin,alignForPlay} from './game';

import {pullback,releasePutt,puttingCameraPose,keepPuttingBallVisible,putterPose} from './putting';
import {BirdCelebration} from './BirdCelebration';
import {CourseWaterfall} from './CourseWaterfall';
import {riverCenter,riverLevel,riverOutlet,sceneryRocks,rockBaseY,verdantMesh} from './course';
import {PutterModel} from './PutterModel';
import {AudioCheck} from './AudioCheck';
import {TeeSign} from './TeeSign';
import {GolfCup} from './GolfCup';
import {gameAudio} from './audio';
import {aimPoint,isAimClick,puttingAim,selectTarget,selectedTarget,courseHit,golfCameraPose} from './aim';
import {WaterPond,RiverMaterial} from './Water';

import {CascadeTerrain} from './HoleTwo';
import {IslandCliffs,Grove} from './Diorama';
import {miniHeight} from './mini-surfaces';
import {CascadeCrossing} from './CentralGreens';

function stored(key,fallback){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function createGame(...args){const g=createBaseGame(...args);g.weather=stored('fairway-weather','calm');g.layout=Number(stored('fairway-layout','0'))%4;g.wind=courseWind(g.hole,g.weather);g.cup=cupFor(g.hole,g.layout);alignForPlay(g);return g}
const TAU = Math.PI * 2;

// Course positions are metres; only the layout-generating parameters are normalized.
function islandEdge(angle) {
  return 1 + 0.06 * Math.sin(angle * 5 + 1.2) + 0.04 * Math.sin(angle * 9 - 0.7);
}
function terrainY(x,z){return height(x,z)}
const elevation=terrainY;

function islandGeometry() {
  const {rings,segments}=verdantMesh;
  const positions = [], colors = [], indices = [];
  const c = new THREE.Color(),fairwayColour=new THREE.Color('#a0d576'),greenColour=new THREE.Color('#c6e78c'),bankColour=new THREE.Color('#7a8463');
  for (let r = 0; r <= rings; r++) {
    const portion = r / rings;
    for (let s = 0; s <= segments; s++) {
      const a = s / segments * TAU;
      const edge = islandEdge(a);
      const x = 40 * course.sx * portion * edge * Math.cos(a);
      const z = 51 * course.sz * portion * edge * Math.sin(a);
      const cliff = portion > 0.86 ? ((portion - 0.86) / 0.14) ** 1.5 : 0;
      const y = terrainHeight(x, z);
      positions.push(x, y, z);
      if (cliff > 0.45) c.set('#376f4c');
      else if (y > 30) c.set('#85bb6c');
      else c.set('#65a65d');
      const nx=x/course.sx,nz=z/course.sz,w=9.3+2.1*Math.sin(nz/10);const f=(1-THREE.MathUtils.smoothstep(Math.abs(nx-3*Math.sin(nz/12)),w-.9,w+.9))*(1-THREE.MathUtils.smoothstep(nz,31,33));if(cliff<.2)c.lerp(fairwayColour,f);const gr=Math.hypot(x/course.green.rx,(z-course.pin.z)/course.green.rz),sr=Math.hypot((x-12*course.sx)/5.2,(z+25*course.sz)/9.5);c.lerp(greenColour,1-THREE.MathUtils.smoothstep(gr,.92,1.08));
      const width=riverWidth(nz),edgeDistance=Math.abs(nx-riverCenter(nz))-width;
      if(width>0)c.lerp(bankColour,.75*(1-THREE.MathUtils.smoothstep(edgeDistance,-.25,1.45)));
      colors.push(c.r,c.g,c.b);
    }
  }
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function riverGeometry(){
 const positions=[],uvs=[],indices=[],rows=384,across=8;
 for(let i=0;i<=rows;i++){
   const nz=-32+(riverOutlet.nz+32)*i/rows,z=nz*course.sz,w=riverWidth(nz);
   const outletTurn=THREE.MathUtils.smoothstep(z,riverOutlet.z-8,riverOutlet.z)*riverOutlet.angle;
   for(let j=0;j<=across;j++){
     const u=j/across,offset=(u*2-1)*(w+.11)*course.sx;
     const x=riverCenter(nz)*course.sx+offset*Math.cos(outletTurn);
     positions.push(x,riverLevel(nz),z-offset*Math.sin(outletTurn));uvs.push(u,z);
     if(i<rows&&j<across){const a=i*(across+1)+j,b=a+across+1;indices.push(a,b,a+1,a+1,b,b+1)}
   }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.setIndex(indices);
 return geometry;
}

const riverStones=[
  {nz:-28,u:.22,r:.75},{nz:-19,u:.76,r:.56},{nz:-5,u:.24,r:.48},
  {nz:9,u:.71,r:.58},{nz:22,u:.28,r:.61},{nz:33,u:.74,r:.51}
];
function RiverStones(){
 return <>{riverStones.map(({nz,u,r},i)=>{
   const x=(riverCenter(nz)+(u*2-1)*(riverWidth(nz)+.11))*course.sx;
   return <mesh key={nz} position={[x,riverLevel(nz)-.13,nz*course.sz]} scale={[r,r*.63,r*1.38]} rotation={[0,i*1.27,0]}>
     <dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%2?'#77877c':'#8c9583'} roughness={1}/>
   </mesh>;
 })}</>;
}
function Terrain() {
  const geometry = useMemo(() => islandGeometry(), []);
  const path=useMemo(riverGeometry,[]);
  return <>
    <mesh geometry={geometry} receiveShadow>
      <BunkerGroundMaterial hole={1} vertexColors roughness={0.94} side={THREE.DoubleSide}/>
    </mesh>
    <CourseWaterfall level={riverLevel(riverOutlet.nz)} rotation={riverOutlet.angle}/>
    <mesh geometry={path}>
      <RiverMaterial stones={riverStones} metresPerUnit={course.sz}/>
    </mesh>
    <RiverStones/>
  </>;
}

function Tree({x, z, size = 1, hue = 0,game}) {
  x*=course.sx;z*=course.sz;const y = terrainY(x,z);
  const crown=useRef(),reduced=useMemo(()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false,[]);
  useFrame(()=>{if(reduced)return;const w=scenicWindAt(game.wind,game.time),pulse=.68+.32*Math.sin(game.time*1.6-z*.08);crown.current.position.set(w.x*pulse*.021,0,w.z*pulse*.021)});
  const green = hue ? '#5c9c54' : '#80b869';
  return <group position={[x,y,z]} scale={size*1.5}>
    <mesh castShadow position={[0,2.4,0]}>
      <cylinderGeometry args={[.22,.3,4.8,9]}/>
      <meshStandardMaterial color="#876843" roughness={1}/>
    </mesh>
    <group ref={crown}>{[[-1,5.3,0], [1.1,5.1,.3], [0,6.3,0], [.2,5.4,-1.1]].map(([cx,cy,cz],i) => <mesh key={i} castShadow position={[cx,cy,cz]}>
      <icosahedronGeometry args={[i === 2 ? 2 : 1.75, 2]}/>
      <meshStandardMaterial color={i % 2 ? green : '#96c77a'} roughness={1} flatShading={false}/>
    </mesh>)}</group>
  </group>;
}

function Decorations({game}) {
  const positions = [[-25,-32,1.08,0],[-34,-20,.85,1],[-29,2,1.25,0],[-32,20,.8,1],[-20,34,.78,0],
    [26,-33,1.25,1],[31,-21,.8,0],[26,-8,1.1,0],[29,8,1.15,1],[25,27,.86,0],
    [16,-3,.74,1],[-19,-13,.66,0]];
  return <>{positions.map(([x,z,size,hue],i) => <Tree key={i} x={x} z={z} size={size} hue={hue} game={game}/>)}
    {sceneryRocks.map((r,i)=><mesh key={i} position={[r.x,rockBaseY(r),r.z]} scale={[1,.72,1]} castShadow><dodecahedronGeometry args={[r.r,1]}/><meshStandardMaterial color="#8b9480" roughness={1}/></mesh>)}
  </>;
}

function Green({hole=1,wind,game}){const course=getCourse(hole),pin=pinFor(game??{hole},course),flag=useRef(),stick=useRef();useFrame(({clock})=>{if(stick.current){const t=(game?.time??0)-(game?.pinHitAt??-10);stick.current.rotation.z=t>=0&&t<.45?Math.sin(t*55)*.014*(1-t/.45):0}if(flag.current){
 const breeze=scenicWindAt(game?.wind??wind,game?.time??0);
 const angle=Math.atan2(breeze.x,-breeze.z);
 flag.current.rotation.y=Math.PI/2-angle+Math.sin(clock.elapsedTime*5)*(.045+breeze.mph*.008);
 flag.current.scale.x=.86+Math.min(.2,breeze.mph*.013)+Math.sin(clock.elapsedTime*7)*.025;
 }});

return <><group position={[pin.x,height(pin.x,pin.z,hole)+flagstick.baseOffset,pin.z]} scale={1.8}><group ref={stick}>
 {Array.from({length:6},(_,i)=><mesh key={i} position={[0,.25+i*.5,0]} castShadow><cylinderGeometry args={[flagstick.radius/1.8,flagstick.radius/1.8,flagstick.height/10.8,12]}/><meshStandardMaterial color={i%2?'#244c40':'#fff9ec'}/></mesh>)}
 <group ref={flag} position={[0,2.65,0]}><group position={[.52,0,0]}><mesh><planeGeometry args={[1.04,.68]}/><meshBasicMaterial color="#fff7e8" side={THREE.DoubleSide}/></mesh>{[-1,1].map(sign=><group key={sign}><mesh position={[0,0,sign*.008]}><planeGeometry args={[.92,.56]}/><meshBasicMaterial color="#d34f43" side={THREE.DoubleSide}/></mesh><mesh position={[0,-.12,sign*.014]}><planeGeometry args={[.92,.055]}/><meshBasicMaterial color="#fff7e8" side={THREE.DoubleSide}/></mesh></group>)}</group></group>
 </group><mesh rotation={[-Math.PI/2,0,0]} position={[0,.01,0]}><circleGeometry args={[.12,32]}/><meshStandardMaterial color="#25433c"/></mesh></group></>
}
function TeeBox({hole=1}){const course=getCourse(hole),y=height(0,course.tee.z,hole);const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-3.5,-5);s.lineTo(3.5,-5);s.quadraticCurveTo(4,-5,4,-4.5);s.lineTo(4,4.5);s.quadraticCurveTo(4,5,3.5,5);s.lineTo(-3.5,5);s.quadraticCurveTo(-4,5,-4,4.5);s.lineTo(-4,-4.5);s.quadraticCurveTo(-4,-5,-3.5,-5);return s},[]);return <group position={[0,y,course.tee.z]}>
 <mesh rotation={[Math.PI/2,0,0]} position={[0,.025,0]} receiveShadow castShadow><extrudeGeometry args={[shape,{depth:.85,bevelEnabled:true,bevelSize:.1,bevelThickness:.08,bevelSegments:3}]}/><meshStandardMaterial attach="material-0" color="#bdd586"/><meshStandardMaterial attach="material-1" color="#648746"/></mesh>
 {[-2.5,2.5].map(x=><mesh key={x} position={[x,.2,-2]} castShadow><sphereGeometry args={[.22,20,20]}/><meshStandardMaterial color="#f1e5c9"/></mesh>)}
 <mesh position={[0,.09,0]}><cylinderGeometry args={[.055,.025,.18,12]}/><meshStandardMaterial color="#e7d5b4"/></mesh>
 <TeeSign hole={hole}/>
 </group>}
function Windmill({game}){
 const blades=useRef();
 useFrame(()=>{if(blades.current)blades.current.rotation.z=bladeTransforms(game.time)[0].angle});
 return <group>
 <group position={[0,0,7]}>
 {[-1.6,1.6].map(x=><mesh key={x} position={[x,1.55,-.5]} castShadow><cylinderGeometry args={[.55,.55,3.1,32]}/><meshStandardMaterial color="#eee5c9"/></mesh>)}
 <mesh position={[0,4.1,-.5]} castShadow><cylinderGeometry args={[1.45,1.8,2,40]}/><meshStandardMaterial color="#eee5c9"/></mesh>
 <mesh position={[0,6.05,-.5]} castShadow><coneGeometry args={[2,2,40]}/><meshStandardMaterial color="#477e75"/></mesh>
 <mesh position={[0,4.4,1.04]}><circleGeometry args={[.32,24]}/><meshStandardMaterial color="#326966"/></mesh>
 </group>
 <group ref={blades} position={[mini.rotor.x,mini.rotor.y,mini.rotor.z]}>
 {[0,Math.PI/2].map((a,i)=><group key={i} rotation={[0,0,a]}><mesh castShadow><boxGeometry args={[mini.rotor.radius*2,mini.rotor.width*2,mini.rotor.depth*2]}/><meshStandardMaterial color="#c59554"/></mesh>
 {[-1,1].map(sign=><group key={sign} position={[sign*mini.rotor.radius*.63,0,mini.rotor.depth+.06]}><mesh castShadow><boxGeometry args={[mini.rotor.radius*.6,mini.rotor.width*2,.1]}/><meshStandardMaterial color="#f2dfac"/></mesh>{[-.8,-.4,0,.4,.8].map(x=><mesh key={x} position={[x,0,.1]}><boxGeometry args={[.04,mini.rotor.width*2,.04]}/><meshStandardMaterial color="#9b7b4e"/></mesh>)}</group>)}
 </group>)}
 <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,.6,24]}/><meshStandardMaterial color="#bd8b49"/></mesh>
 </group>
 </group>
}
const MiniCourse=React.memo(function MiniCourse({game}) {
 const cup=miniCup(game);const floor=useMemo(()=>{const s=greenShape(game.hole);const hole=new THREE.Path();hole.absarc(cup.x,cup.z,.55,0,Math.PI*2,true);s.holes.push(hole);return s},[game.hole,cup.x,cup.z]);
 return <group>
 <MiniLandscape hole={game.hole} cup={cup} game={game}/><PuttingTurf floor={floor} hole={game.hole}/><SignatureGreen hole={game.hole} game={game}/>
 <CurvedBanks hole={game.hole} game={game}/><PuttingVisibility game={game}/>
 {game.hole===3&&<CascadeCrossing/>}

 <group position={[0,miniHeight(game.hole,cup.x,cup.z),0]}><GolfCup cup={cup}/></group>
 {game.hole===1&&<Windmill game={game}/>}
 </group>
});
function Dynamics({game,view,refresh}){
 const ball=useRef(),acc=useRef(0),ticker=useRef(0),previousBall=useRef({...game.ball}),priorGame=useRef(game),wasMoving=useRef(false);const {camera,controls,size}=useThree();if(priorGame.current!==game){priorGame.current=game;previousBall.current={...game.ball};acc.current=0;wasMoving.current=false;}
 useFrame((_,delta)=>{acc.current+=Math.min(delta,.1)*playbackRate(game);while(acc.current>=DT){previousBall.current={...game.ball};step(game);acc.current-=DT}gameAudio.consume(game);gameAudio.updateAmbience(game);
 const movingMini=game.mini&&game.mode==='rolling',movingFull=!game.mini&&['flight','rolling','green-arrival'].includes(game.mode);if(controls){controls.enabled=game.mode==='ready'&&!game.pull&&!game.paused;if((movingFull||movingMini)&&!wasMoving.current){const position=camera.position.clone(),target=controls.target.clone();controls.enableDamping=false;controls.update();camera.position.copy(position);controls.target.copy(target);controls.update();controls.enableDamping=true;}}wasMoving.current=movingFull||movingMini;const course=getCourse(game.hole),b=['flight','rolling','sinking'].includes(game.mode)?renderBallBetween(previousBall.current,game.ball,acc.current/DT):game.ball;ball.current.position.set(b.x,b.y,b.z);const physical=game.mini?.3:course.ballRadius,perPixel=2*camera.position.distanceTo(new THREE.Vector3(b.x,b.y,b.z))*Math.tan(camera.fov*Math.PI/360)/size.height;ball.current.scale.setScalar(Math.max(physical,(view==='aerial'||!game.mini||movingMini)?perPixel*(game.mini&&view!=='aerial'?4:5):physical)/.3);

 if(['sinking','holed'].includes(game.mode)){camera.clearViewOffset();const holeCup=miniCup(game),surface=miniHeight(game.hole,holeCup.x,holeCup.z),cup=new THREE.Vector3(holeCup.x,surface-.1,holeCup.z);camera.position.lerp(new THREE.Vector3(holeCup.x+3.6,surface+4.5,holeCup.z+5.5),1-Math.exp(-delta*4));if(controls){controls.target.lerp(cup,1-Math.exp(-delta*5));controls.update()}}else if(view!=='aerial'&&(!game.freeCamera||(game.mini&&game.pull)||(['flight','rolling','green-arrival'].includes(game.mode)))){
 const moving=['flight','rolling','green-arrival'].includes(game.mode);const dir=new THREE.Vector3(Math.sin(game.angle),0,-Math.cos(game.angle));
 const pose=game.mini?puttingCameraPose(game,size.width/size.height):golfCameraPose(game,moving,size.width<size.height,b);const dest=new THREE.Vector3(...pose.position),look=new THREE.Vector3(...pose.target);
 {const blend=cameraBlend(delta,game.pull?9:movingMini?6.5:moving&&!game.mini?4.5:3);camera.position.lerp(dest,blend);if(controls){controls.target.lerp(look,blend);if(moving||game.pull)camera.lookAt(controls.target);else controls.update();if(game.mini){camera.position.set(...keepPuttingBallVisible(camera.position.toArray(),controls.target.toArray(),b,size.width/size.height,camera.fov));camera.lookAt(controls.target)}}}}
 if(game.mini&&game.pull&&controls)camera.lookAt(controls.target);if(game.wind){const target=controls?.target??new THREE.Vector3(game.ball.x,game.ball.y,game.ball.z);game.windViewAngle=game.wind.angle-Math.atan2(target.x-camera.position.x,camera.position.z-target.z)}camera.updateMatrixWorld();const project=(p)=>{const v=new THREE.Vector3(p.x,p.y,p.z).project(camera);return {x:Math.max(35,Math.min(size.width-35,(v.x*.5+.5)*size.width)),y:Math.max(18,Math.min(size.height-18,(-v.y*.5+.5)*size.height)),visible:v.z>-1&&v.z<1}};const aim=game.mini?puttingAim(game):(selectedTarget(game)??aimPoint(game));game.screenAim={...project(aim),out:aim.out,selected:!!game.target,distance:aim.yards,label:game.mini?`${aim.contact?'FIRST CONTACT':'ROLL TARGET'} · ${aim.distance.toFixed(1)} ft`:aim.out?'TARGET · OUT OF BOUNDS':`TARGET · ${aim.yards} yd carry`};game.screenSize={width:size.width,height:size.height};game.screenBall=project(game.ball);game.screenPin=project(game.mini?{...miniCup(game),y:miniHeight(game.hole,miniCup(game).x,miniCup(game).z)+1}:{...pinFor(game,course),y:height(pinFor(game,course).x,pinFor(game,course).z,game.hole)+5});ticker.current+=delta;if(ticker.current>.05){refresh(x=>x+1);ticker.current=0}
 },-1);
 return <><mesh ref={ball} castShadow renderOrder={104}><sphereGeometry args={[.3,24,24]}/><meshStandardMaterial color="white" roughness={.3} depthTest={game.mini}/></mesh></>
}
function Overview({view,game,showControls}){const {camera,controls,size}=useThree();useEffect(()=>{const damping=controls?.enableDamping;if(controls){controls.enableDamping=false;controls.update()}camera.near=game.mini?.1:2;camera.clearViewOffset();if(view==='aerial'){const pose=overviewCamera(game,size.width,size.height,showControls);camera.position.set(...pose.position);camera.setViewOffset(size.width,size.height,pose.viewOffsetX,pose.viewOffsetY,size.width,size.height);if(controls){controls.target.set(...pose.target);controls.update()}}if(controls)controls.enableDamping=damping;camera.updateProjectionMatrix()},[view,game.mini,game.hole,showControls,camera,controls,size.width,size.height]);return null}
function InputSurface({game,view}){
 const press=useRef(null);const {camera,controls,gl}=useThree();
 function readPull(event,start){
   const {left,top,width,height}=gl.domElement.getBoundingClientRect();
   const pointer=new THREE.Vector2((event.clientX-left)/width*2-1,1-(event.clientY-top)/height*2);
   start.raycaster.setFromCamera(pointer,start.camera);
   const hit=start.raycaster.ray.intersectPlane(start.plane,new THREE.Vector3());
   const end=hit??{x:start.x-(game.pull?.x??0),z:start.z-(game.pull?.z??0)};
   return pullback(start,{x:end.x,z:end.z,sx:event.clientX,sy:event.clientY},game.angle);
 }
 const restore=()=>{if(controls)controls.enabled=!game.pull&&game.mode==='ready'};
 useEffect(()=>{press.current=null;if(import.meta.env.DEV&&game.previewHold){game.puttCameraAnchor={x:game.ball.x,z:game.ball.z,angle:game.angle};game.pull={x:Math.sin(game.angle),z:-Math.cos(game.angle),percent:28.3};}else game.pull=null;restore()},[game,view,controls]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,game.mini?bridgeHeightFor(game,game.ball.x,game.ball.z)+.05:height(game.ball.x,game.ball.z,game.hole),0]}
 onPointerDown={e=>{if(game.mode!=='ready'||game.inputLocked)return;e.stopPropagation();if(press.current){press.current.cameraGesture=true;if(press.current.ballDrag){e.target.releasePointerCapture(press.current.id);press.current.ballDrag=false;game.pull=null;game.freeCamera=true;restore()}return}const hit=game.mini?e.point:courseHit(e.ray.origin,e.ray.direction,game.hole);if(!hit)return;const ballDrag=game.mini&&Math.hypot(e.point.x-game.ball.x,e.point.z-game.ball.z)<1.5;press.current={id:e.pointerId,x:hit.x,z:hit.z,sx:e.clientX,sy:e.clientY,ballDrag};if(ballDrag){
 camera.updateMatrixWorld();
 // Read the whole gesture against the original camera so zoom cannot steer the putt.
 Object.assign(press.current,{camera:camera.clone(),raycaster:new THREE.Raycaster(),plane:new THREE.Plane(new THREE.Vector3(0,1,0),-hit.y)});
 if(controls)controls.enabled=false;
 game.puttCameraAnchor={x:game.ball.x,z:game.ball.z,angle:game.angle,view:controls?{position:camera.position.toArray(),target:controls.target.toArray()}:null};game.puttPointer={x:e.clientX,y:e.clientY};game.pull={x:Math.sin(game.angle),z:-Math.cos(game.angle),percent:0};e.target.setPointerCapture(e.pointerId)}}}
 onPointerMove={e=>{const p=press.current;if(p?.ballDrag&&p.id===e.pointerId){game.puttPointer={x:e.clientX,y:e.clientY};game.pull=readPull(e,p)}}}
 onPointerUp={e=>{const p=press.current;if(!p||p.id!==e.pointerId)return;if(p.ballDrag){releasePutt(game,readPull(e,p));e.target.releasePointerCapture(e.pointerId)}else if(!p.cameraGesture&&isAimClick({x:p.sx,y:p.sy},{x:e.clientX,y:e.clientY})){if(game.mini)game.angle=Math.atan2(p.x-game.ball.x,game.ball.z-p.z);else selectTarget(game,p)}press.current=null;game.pull=null;game.puttPointer=null;restore()}}
 onPointerCancel={()=>{press.current=null;game.pull=null;game.puttCameraAnchor=null;restore()}}>
 <planeGeometry args={[2500,2500]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/></mesh>
}
function DirectionCue({game}){
 const ref=useRef();const {camera,size}=useThree();const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.4,0,.3,0,0,-.6,.4,0,.3],3));g.computeVertexNormals();return g},[]);
 useFrame(()=>{if(!ref.current)return;const b=game.ball;let dx=game.pull?.x??Math.sin(game.angle),dz=game.pull?.z??-Math.cos(game.angle);const n=Math.hypot(dx,dz)||1;dx/=n;dz/=n;const pixel=2*camera.position.distanceTo(new THREE.Vector3(b.x,b.y,b.z))*Math.tan(camera.fov*Math.PI/360)/size.height,scale=Math.max(game.mini?.7:.6,pixel*8),offset=Math.max(game.mini?1:1.2,scale*1.7),x=b.x+dx*offset,z=b.z+dz*offset;ref.current.position.set(x,game.mini?.055:height(x,z,game.hole)+.12,z);ref.current.rotation.y=-Math.atan2(dx,-dz);ref.current.scale.setScalar(scale)});
 return <group ref={ref}><mesh geometry={geometry} renderOrder={101}><meshBasicMaterial color="#fff4d4" depthTest={false} depthWrite={false} side={THREE.DoubleSide}/></mesh><mesh geometry={geometry} scale={.74} position={[0,.003,0]} renderOrder={102}><meshBasicMaterial color="#225a44" depthTest={false} depthWrite={false} side={THREE.DoubleSide}/></mesh></group>
}
function TargetDisc({point,miniature=false}){const r=miniature?.38:2.4;return <group position={[point.x,miniature?(point.y??.04):point.y,point.z]}>
 <mesh rotation={[-Math.PI/2,0,0]} renderOrder={100}><ringGeometry args={[r*.78,r,48]}/><meshBasicMaterial color={point.out?'#db805e':'#f5d48b'} side={THREE.DoubleSide} depthTest={false} depthWrite={false}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} renderOrder={101}><circleGeometry args={[r*.17,24]}/><meshBasicMaterial color="#285e4a" side={THREE.DoubleSide} depthTest={false} depthWrite={false}/></mesh>
 </group>}
function GolfAim({game}){return <><TargetDisc point={selectedTarget(game)??aimPoint(game)}/><DirectionCue game={game}/></>}
function ShotTrail({game}){if(!['flight','rolling','green-arrival'].includes(game.mode))return null;return game.trail?.length>1?<Line points={[...game.trail]} color="#fff2ba" renderOrder={102} lineWidth={game.mini?2:4} transparent opacity={game.mode==='ready'?.45:.95} depthTest={false}/>:null}
function bridgeHeightFor(game,x,z){return miniHeight(game.hole,x,z)}
const FullCourseScenery=React.memo(function FullCourseScenery({game}){const course=getCourse(game.hole);return <>{game.hole>=4?<NewTerrain hole={game.hole} game={game}/>:game.hole===3?<KingfisherTerrain/>:game.hole===2?<CascadeTerrain/>:<Terrain/>}<CourseBunkers hole={game.hole}/><IslandCliffs hole={game.hole}/>{game.hole!==9&&<ValleyForest hole={game.hole} game={game}/>}<Line points={Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2,x=(course.bounds.cx??0)+course.bounds.rx*Math.cos(a),z=course.bounds.rz*Math.sin(a);return [x,height(x,z,game.hole)+.03,z]})} color="#efdfb0" lineWidth={1}/>{game.hole===1&&<><WaterPond pond={ponds.course} terrain flow={.25}/><Decorations game={game}/></>}<CourseGrass game={game}/><CourseLanding game={game}/><Green hole={game.hole} wind={game.wind} game={game}/><TeeBox hole={game.hole}/></>});
export function World({game,view,refresh,showControls,swingPhase, swingClock,atmosphere=null,children}){const course=getCourse(game.hole),initialPose=useMemo(()=>game.mini?puttingCameraPose(game):golfCameraPose(game),[game]);
 return <Canvas shadows dpr={[1,1.7]} camera={{position:initialPose.position,fov:45,near:.5,far:3500}}>
 <color attach="background" args={[atmosphere?.sky??(game.weather==='stormy'?'#8caaa7':'#c3d9b4')]}/><fog attach="fog" args={[atmosphere?.sky??(game.weather==='stormy'?'#8caaa7':'#c3d9b4'),1800,3500]}/>
 <hemisphereLight args={[atmosphere?.skyLight??'#fff3d6',atmosphere?.groundLight??'#3c6146',atmosphere?.hemisphere??1.6]}/><directionalLight position={game.mini?[-25,65,35]:[-100,250,140]} color={atmosphere?.sun??'#ffffff'} intensity={atmosphere?.intensity??(game.weather==='stormy'?1.9:3.1)} castShadow shadow-bias={-.0005} shadow-normalBias={.12} shadow-mapSize={[2048,2048]} shadow-camera-left={game.mini?-24:-260} shadow-camera-right={game.mini?24:260} shadow-camera-top={game.mini?28:270} shadow-camera-bottom={game.mini?-28:-270} shadow-camera-far={game.mini?200:1000}/>
 <mesh position={[0,game.mini?-5.5:-12,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2500,2500]}/><meshStandardMaterial color={atmosphere?.water??'#9fd4cc'} roughness={.36}/></mesh>
 {game.mini?<MiniCourse game={game} cupKey={`${miniCup(game).x}:${miniCup(game).z}`}/>:<FullCourseScenery game={game} hole={game.hole} weather={game.weather} layout={game.layout}/>}
 {children}<WeatherEffects game={game} miniature={game.mini} condition={game.weather}/>
 <InputSurface game={game} view={view}/>
 {!game.mini&&game.mode==='ready'&&<GolfAim game={game}/>}
 <ShotTrail game={game}/>
 {!game.mini&&<SwingGolfer game={game} phase={swingPhase} clock={swingClock}/>}
 {game.mini&&game.mode==='ready'&&<PuttAim game={game}/>}

 <Dynamics game={game} view={view} refresh={refresh}/>
 <OrbitControls makeDefault target={initialPose.target} enabled={!game.pull&&game.mode==='ready'} onStart={()=>{game.cameraGesture=true}} onChange={()=>{if(game.cameraGesture&&!game.pull)game.freeCamera=true}} onEnd={()=>{game.cameraGesture=false}} enablePan enableDamping minDistance={2} maxDistance={1800} maxPolarAngle={Math.PI*.47}/><Overview view={view} game={game} showControls={showControls}/>
 </Canvas>
}
export default function App(){
 if(import.meta.env.DEV&&new URLSearchParams(location.search).has('soundcheck'))return <AudioCheck/>;
 const [game,setGame]=useState(()=>{const g=createGame(Math.max(1,Math.min(HOLE_COUNT,Number(new URLSearchParams(location.search).get('hole'))||1))),course=getCourse(g.hole);if(import.meta.env.DEV){const preview=new URLSearchParams(location.search).get('preview');if(preview==='bank-putt'||preview==='bank-hold'){g.strokes=2;g.ball.x=course.pin.x;g.ball.z=course.pin.z;enterGreen(g);g.ball={x:0,z:10,y:miniHeight(g.hole,0,10)+.3,vx:0,vy:0,vz:0};g.angle=Math.PI/2;g.puttPower=70;if(preview==='bank-hold')g.previewHold=true;}if(preview==='central-close'||preview==='central-far'){const p=pinFor(g,course),d=preview==='central-close'?1:12,a=Number(new URLSearchParams(location.search).get('side')??0);g.strokes=2;g.ball.x=p.x+Math.sin(a)*d;g.ball.z=p.z+Math.cos(a)*d;enterGreen(g)}if((preview==='grotto-side'||preview==='putt-hold')&&g.hole===3){g.strokes=1;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=1.65;g.ball.z=-4.5;g.angle=Math.atan2(miniCup(g).x-g.ball.x,g.ball.z-miniCup(g).z);if(preview==='putt-hold'){g.previewHold=true;g.puttCameraAnchor={x:g.ball.x,z:g.ball.z,angle:g.angle};g.pull={x:Math.sin(g.angle),z:-Math.cos(g.angle),percent:28.3};}}if(preview==='double-bogey'&&g.hole===2){g.scorecard=[{hole:1,par:4,strokes:3}];g.strokes=6;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=miniCup(g).x;g.ball.z=miniCup(g).z+1;}if(preview==='round-finish'){g.scorecard=Array.from({length:g.hole-1},(_,i)=>({hole:i+1,par:getCourse(i+1).par,strokes:getCourse(i+1).par}));g.strokes=1;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=miniCup(g).x;g.ball.z=miniCup(g).z+1;}if(preview==='grotto-exit'&&g.hole===3){g.strokes=1;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=0;g.ball.z=-5.2;g.angle=0;}if(preview==='grotto'&&g.hole===3){g.strokes=1;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=0;g.ball.z=10;g.angle=0;}if(preview==='challenge'&&g.hole>=4){g.strokes=getCourse(g.hole).par-2;g.ball.x=course.pin.x;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=0;g.ball.z=11;g.angle=0;}if(preview==='wall-rest'){g.strokes=2;g.ball.x=course.pin.x;g.ball.z=course.pin.z;enterGreen(g);const p=projectInside(g.hole,-20,0,.32);Object.assign(g.ball,p);g.ball.y=bridgeHeightFor(g,p.x,p.z)+.3;g.angle=Math.atan2(miniCup(g).x-p.x,p.z-miniCup(g).z)}if(preview==='green'){g.strokes=2;g.ball.x=course.pin.x;g.ball.z=course.pin.z;enterGreen(g)}if(preview==='approach'){g.strokes=1;g.ball={x:0,y:height(0,course.pin.z+83*METRES_PER_YARD)+course.ballRadius,z:course.pin.z+83*METRES_PER_YARD,vx:0,vy:0,vz:0};g.club='Wedge';g.lie=lie(g.ball.x,g.ball.z);g.message='83-yard approach. Choose your power, then strike near center.'}if(preview==='shortputt'){g.strokes=3;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=-5;g.ball.z=7;g.angle=Math.atan2(-g.ball.x,g.ball.z+12);g.message='A 19.6-foot putt. Half power is about 20 feet.'}if(preview==='pitch'){g.strokes=1;g.club='Sand wedge';g.ball={x:0,z:course.pin.z+38*METRES_PER_YARD,y:height(0,course.pin.z+38*METRES_PER_YARD)+course.ballRadius,vx:0,vy:0,vz:0};g.lie='Fairway';g.message='38-yard approach · watch the flight, landing and green reveal.'}if(preview==='slope'){g.strokes=2;g.club='Sand wedge';g.ball={x:20,z:course.pin.z+38*METRES_PER_YARD,y:height(20,course.pin.z+38*METRES_PER_YARD,g.hole)+course.ballRadius,vx:0,vy:0,vz:0};g.lie=lie(g.ball.x,g.ball.z,g.hole);alignToPin(g)}if(preview==='fairway-address'){g.strokes=3;g.ball={x:0,z:0,y:height(0,0,g.hole)+course.ballRadius,vx:0,vy:0,vz:0};alignToPin(g)}if(preview==='flagstick'){const pin=pinFor(g,course);g.strokes=1;g.mode='flight';g.angle=Math.PI/2;g.spin=0;g.ball={x:pin.x-2,y:height(pin.x,pin.z,g.hole)+flagstick.baseOffset+2,z:pin.z,vx:12,vy:0,vz:0};g.origin={...g.ball};g.history.push({type:'shot',club:'Sand wedge',origin:{...g.ball},power:.5,accuracy:0});g.trail=[];}if(preview==='bunker'){const p=(bunkersByHole[g.hole]??[]).find(p=>p.id===new URLSearchParams(location.search).get('bunker'))??bunkersByHole[g.hole][0];g.strokes=2;g.club='Sand wedge';g.ball={x:p.x,y:height(p.x,p.z,g.hole)+course.ballRadius,z:p.z,vx:0,vy:0,vz:0};g.lie='Sand';alignToPin(g);g.message='Sand wedge selected · loft the ball over the bunker lip.';}if(preview==='tapin'){g.strokes=3;g.ball.z=course.pin.z;enterGreen(g);g.ball.x=0;g.ball.z=-4.1;g.message='A short putt for par. Tap it in or play your own line.'}}return g}),[view,setView]=useState('ball'),[,refresh]=useState(0),[soundOn,setSoundOn]=useState(()=>{try{return localStorage.getItem('fairway-sound')!=='off'}catch{return true}}),[phase,setPhase]=useState('ready');const clock=useRef(0);
 useEffect(()=>{gameAudio.setEnabled(soundOn);try{localStorage.setItem('fairway-sound',soundOn?'on':'off')}catch{}},[soundOn]);

 const [panel,setPanel]=useState(()=>matchLink().id?'match':new URLSearchParams(location.search).has('result')?'board':new URLSearchParams(location.search).has('hole')?null:'setup');
 const [weather,setWeather]=useState(()=>new URLSearchParams(location.search).get('weather')??stored('fairway-weather','calm'));
 const [layout,setLayout]=useState(()=>Math.max(0,Math.min(3,Number(new URLSearchParams(location.search).get('layout')??stored('fairway-next-layout','0'))||0)));
 const [round,setRound]=useState(()=>import.meta.env.DEV&&new URLSearchParams(location.search).get('preview')==='round-finish'?{id:'qa-round-flow',name:'QA round test',weather:game.weather,layout:game.layout,holes:game.hole}:null),[completed,setCompleted]=useState(null);
 const [entries,setEntries]=useState(()=>{let list=[];try{list=JSON.parse(stored('fairway-leaderboard','[]'));if(!Array.isArray(list))list=[]}catch{}const code=new URLSearchParams(location.search).get('result'),card=code?decodeScorecard(code):null;return card?addScorecard(list,card):list.filter(e=>validScorecard(e))});
 useEffect(()=>{try{localStorage.setItem('fairway-leaderboard',JSON.stringify(entries))}catch{}},[entries]);
 const multiplayer=usePrivateMatch(game,()=>setPanel('match'));
 const inMatch=multiplayer.engaged&&!!multiplayer.match;
 const canPlayMatch=!inMatch||myTurn(multiplayer.match,multiplayer.user);
 game.paused=!!panel||!canPlayMatch||!!multiplayer.error;
 function playMatch(){const m=multiplayer.load();setRound(null);setCompleted(null);const g=matchGame(m,multiplayer.user);if(import.meta.env.DEV&&new URLSearchParams(location.search).get('preview')==='match-putt'&&!m.snapshot){g.strokes=g.par-1;g.ball.x=pinFor(g,getCourse(g.hole)).x;g.ball.z=pinFor(g,getCourse(g.hole)).z;enterGreen(g);g.ball.x=miniCup(g).x;g.ball.z=miniCup(g).z+1;g.ball.y=.3;}setGame(g);setPhase('ready');setView('ball');setPanel(null)}
 function leaveMatch(){multiplayer.leave();setRound(null);setGame(createGame());setPanel('setup');setPhase('ready');setView('ball')}
 const savedHoles=useRef(new Map());
 function setConditions(value){setWeather(value);if(!round){game.weather=value;game.wind=courseWind(game.hole,value)}try{localStorage.setItem('fairway-weather',value)}catch{}}
 function startCourse(name,condition,pins,count=HOLE_COUNT){const id=crypto.randomUUID?.()??String(Date.now())+Math.random().toString(36).slice(2);const g=createGame(1);g.weather=condition;g.wind=courseWind(1,condition);g.layout=pins;g.cup=cupFor(1,pins);alignToPin(g);setRound({id,name,weather:condition,layout:pins,holes:count});setCompleted(null);setWeather(condition);setLayout(pins);savedHoles.current.clear();setGame(g);setPhase('ready');setView('ball');setPanel(null);holeUrl(1);try{localStorage.setItem('fairway-player',name);localStorage.setItem('fairway-weather',condition);localStorage.setItem('fairway-layout',pins);localStorage.setItem('fairway-next-layout',(pins+1)%4)}catch{}}
 useEffect(()=>{if(!round||game.mode!=='holed'||game.hole!==(round.holes??HOLE_COUNT)||game.scorecard.length!==(round.holes??HOLE_COUNT)-1)return;const card=validScorecard({v:2,id:round.id,name:round.name,weather:round.weather,layout:round.layout,holes:[...game.scorecard.map(h=>h.strokes),game.strokes],date:new Date().toISOString()});if(card){setCompleted(card);setEntries(previous=>addScorecard(previous,card));const timer=setTimeout(()=>setPanel('board'),4200);return()=>clearTimeout(timer)}},[game.mode,game.hole,game.strokes,round]);

 function holeUrl(id){const u=new URL(location.href);u.searchParams.set('hole',id);history.replaceState(null,'',u)}
 function chooseHole(id){setRound(null);setCompleted(null);holeUrl(id);savedHoles.current.set(game.hole,game);setGame(savedHoles.current.get(id)??createGame(id));setPhase('ready');setView('aerial')}
 function restart(){const next=createGame(game.hole,game.scorecard);next.weather=game.weather;next.wind=courseWind(next.hole,game.weather);next.layout=game.layout;next.cup=cupFor(next.hole,next.layout);alignForPlay(next);setGame(next);setPhase('ready');setView('ball')}
 const hit=React.useCallback((now=performance.now())=>{
   if(game.mode!=='ready'||game.paused)return;
   const elapsed=Math.max(0,now-clock.current)/1000;
   if(phase==='ready'){
     game.swingCue=null;
     game.inputLocked=true;
     clock.current=now;
     setPhase('power');
   }else if(phase==='power'){
     game.power=swingMeter(phase,elapsed);
     game.previewPower=game.power;
     clock.current=now;
     setPhase('accuracy');
   }else{
     const accuracy=swingMeter(phase,elapsed);
     game.inputLocked=false;
     game.swingCue={time:game.time,ball:{...game.ball},angle:game.angle,power:game.power,accuracy,club:game.club};
     swing(game,game.power,accuracy);
     setPhase('ready');
   }
 },[game,phase]);
 useEffect(()=>{
   if(phase!=='accuracy'||game.paused)return;
   const deadline=clock.current+swingTiming.accuracyHalfSweep*1000;
   const timer=setTimeout(()=>hit(deadline),Math.max(0,deadline-performance.now()));
   return ()=>clearTimeout(timer);
 },[phase,game.paused,hit]);

 function advance(){if(inMatch){multiplayer.finish();return}if(round&&game.hole===(round.holes??HOLE_COUNT)&&game.mode==='holed'){setPanel('board');return}const next=nextHole(game)??createGame();next.weather=round?.weather??game.weather;next.wind=courseWind(next.hole,next.weather);next.layout=round?.layout??game.layout;next.cup=cupFor(next.hole,next.layout);alignForPlay(next);savedHoles.current.set(game.hole,game);savedHoles.current.set(next.hole,next);holeUrl(next.hole);setGame(next);setPhase('ready');setView('ball')}
 const distance=game.mini?Math.hypot(game.ball.x-miniCup(game).x,game.ball.z-miniCup(game).z).toFixed(1)+' ft':Math.round(yardsToPin(game.ball,game.hole,pinFor(game,getCourse(game.hole))))+' yd';
 return <div onPointerDownCapture={()=>gameAudio.unlock()} onClickCapture={()=>gameAudio.unlock()} onPointerUpCapture={()=>gameAudio.unlock()} onKeyDownCapture={()=>gameAudio.unlock()} className={'app '+(view==='aerial'?'inspect':'')+(game.mode==='holed'?'':' controls-hidden')+(game.mode==='holed'?' completed':'')+(game.mini?' mini-scene':'')+(game.pull?' is-pulling':'')}>{panel==='match'&&<MatchPanel {...multiplayer} onCreate={multiplayer.create} onJoin={multiplayer.join} onPlay={playMatch} onLeave={leaveMatch} onRefresh={multiplayer.refresh} onNew={multiplayer.newMatch}/>} {panel==='setup'&&<CourseSetup onMultiplayer={()=>multiplayer.open()} weather={weather} layout={layout} onWeather={setConditions} onStart={startCourse} onClose={()=>setPanel(null)} onBoard={(w,l)=>{setWeather(w);setLayout(l);setPanel('board')}}/>}{panel==='board'&&<Leaderboard entries={entries} onRemove={id=>setEntries(previous=>previous.filter(e=>e.id!==id))} weather={completed?.weather??weather} layout={completed?.layout??layout} current={completed} onImport={card=>setEntries(previous=>addScorecard(previous,card))} onClose={()=>setPanel(null)} onNew={()=>{setLayout(Number(stored('fairway-next-layout','0')));setPanel('setup')}}/>}<World key={game.hole} game={game} view={view} refresh={refresh} showControls={false} swingPhase={phase} swingClock={clock}/>
 <header><div className="eyebrow">THE VERDANT ISLES · HOLE {String(game.hole).padStart(2,'0')} · {getCourse(game.hole).title}</div><h1>Fairway <em>&</em> Folly</h1><p>A little golf. A little mischief.</p></header>
 {inMatch&&<button className="match-pill" disabled={multiplayer.busy||phase!=='ready'||!['ready','holed'].includes(game.mode)} onClick={()=>setPanel('match')}>Private match · Hole {multiplayer.match.hole}/{multiplayer.match.holes}<small>{multiplayer.busy?'Saving…':multiplayer.error?'Reconnect needed':multiplayer.match.status==='complete'?'Match complete':multiplayer.match.status==='waiting'?'Waiting for friend':myTurn(multiplayer.match,multiplayer.user)?'Your turn':'Friend’s turn'} · Scorecard</small></button>}
 {round&&<button className="round-progress" onClick={()=>setPanel('board')}>{round.name} · Round {roundProgress(game).over===0?'Even par':scoreText(roundProgress(game).over)}<small>{roundProgress(game).total} total strokes · Hole {game.hole}/{round.holes??HOLE_COUNT}</small></button>}
 <aside className="score"><span>PAR <b>{game.par}</b></span><span>STROKES <b>{game.strokes}</b></span><span>TO PIN <b>{distance}</b></span></aside><aside className="phone-score" aria-label={`Hole ${game.hole}, par ${game.par}, ${game.strokes} strokes, ${distance} to pin`}><span>H{game.hole} · P{game.par}{round&&<small>{roundProgress(game).over===0?'Even par':scoreText(roundProgress(game).over)} overall</small>}</span><b>{game.strokes} {game.strokes===1?'shot':'shots'}</b><strong>{distance}</strong></aside>
 {!game.mini&&<div className={'wind-readout '+(game.wind?.mph?'':'is-calm')} title="Arrow shows where the wind blows relative to your view" aria-label={`Wind blowing ${windLabel(game.wind)}`}><span style={{transform:`rotate(${(game.windViewAngle??game.wind?.angle??0)*180/Math.PI}deg)`}}>{game.wind?.mph?'↑':'·'}</span><b className="wind-full">{windLabel(game.wind)}</b><b className="wind-short">{game.wind?.mph??0} mph</b></div>}
 <nav><details className="game-menu"><summary>☰ Menu</summary><div><button disabled={phase!=='ready'||!['ready','holed'].includes(game.mode)} onClick={()=>multiplayer.open()}>Private multiplayer</button>{round&&<button className="menu-round-score" onClick={()=>setPanel('board')}>{round.name} · Round {roundProgress(game).over===0?'Even par':scoreText(roundProgress(game).over)} · {roundProgress(game).total} strokes</button>}<label className="hole-choice"><span>Choose hole</span><select aria-label="Choose hole" value={game.hole} disabled={inMatch||!!round||phase!=='ready'} onChange={e=>{chooseHole(Number(e.target.value));e.currentTarget.closest('details').open=false}}><option value="1">1 · Verdant Isles · Par 4</option><option value="2">2 · Cascade Reach · Par 5</option><option value="3">3 · Kingfisher Cove · Par 3</option>{Object.values(newHoles).map(c=><option key={c.id} value={c.id}>{c.id} · {c.title} · Par {c.par}</option>)}</select></label><label className="hole-choice"><span>Conditions</span><select aria-label="Conditions" value={game.weather} disabled={inMatch||!!round||game.mode!=='ready'} onChange={e=>setConditions(e.target.value)}>{['calm','windy','stormy'].map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}</select></label><button disabled={inMatch} onClick={()=>{setLayout(Number(stored('fairway-next-layout','0')));setPanel('setup')}}>Play Course</button><button onClick={()=>setPanel('board')}>Leaderboard</button><button disabled={inMatch} onClick={restart}>Restart this hole</button><button onClick={()=>{gameAudio.setEnabled(!soundOn);if(!soundOn)gameAudio.unlock();setSoundOn(!soundOn)}}>{soundOn?'Sound on':'Sound off'}</button><a href={`${import.meta.env.BASE_URL}audio/credits.html`} target="_blank" rel="noreferrer">Audio credits</a></div></details><button onClick={()=>{game.freeCamera=false;setView(view==='aerial'?'ball':'aerial');}}>{view==='aerial'?'Behind ball':'View hole'}</button>{view==='ball'&&<button className="camera-reset" aria-label="Reset camera" onClick={()=>{game.freeCamera=false;game.cameraGesture=false;refresh(x=>x+1)}}>Reset camera</button>}</nav>
 {game.mini&&game.mode==='ready'&&<><div className="putt-hint">Pull back · release to putt{canTapIn(game)&&!game.pull&&<button onClick={()=>tapIn(game)}>Tap in</button>}</div>{game.pull&&<PuttLiveReadout game={game}/>}</>}{import.meta.env.DEV&&new URLSearchParams(location.search).get('preview')==='flagstick'&&<output className="flagstick-check">{game.pinHitAt?'Flagstick contacted':game.mode==='flight'?'Approach in flight':'Shot stopped'}</output>}<ScreenMarkers game={game} view={view}/>{game.mode==='holed'&&<FinishBanner game={game}/>}
 {!game.paused&&!game.mini&&game.mode==='ready'&&<><ShotMeter vertical game={game} phase={phase} clock={clock} onHit={hit} mode={game.mode} club={game.club} lie={game.lie}/>
 {phase==='ready'&&<div className="shot-dock" role="group" aria-label="Choose club">
   {Object.keys(clubs).map(name=><button key={name} aria-label={name} aria-pressed={game.club===name} onClick={()=>{game.club=name;refresh(x=>x+1)}}>
     <span>{name==='Sand wedge'?'SW':name}</span>
     <small>{Math.round(carryYards({...game,club:name}))} yd</small>
   </button>)}
 </div>}</>}
 {game.mode==='holed'&&<section className="controls putting-controls"><div className="status">{greenNames[game.hole].toUpperCase()} <span>HOLED</span></div><div className="win"><h2>{game.strokes-game.par>=2?'Get your head in the game.':game.strokes>game.par?'Shake it off.':'Beautifully done.'}</h2><p>{game.strokes} strokes · {game.strokes===game.par?'Par':game.strokes<game.par?`${game.par-game.strokes} under par`:`${game.strokes-game.par} over par`}</p><button className="primary" disabled={inMatch&&multiplayer.busy} onClick={advance}>{inMatch?(multiplayer.busy?'Saving…':'Submit hole · View match'):game.hole<(round?.holes??HOLE_COUNT)?`Next hole · ${getCourse(game.hole+1).title} · Par ${getCourse(game.hole+1).par}`:round?'View round results':'Start a new round'}</button>{!inMatch&&<button onClick={restart}>Play hole again</button>}{game.hole===HOLE_COUNT&&<p>{game.scorecard.length?'Round total':`Hole ${game.hole} practice`}: {game.scorecard.reduce((s,h)=>s+h.strokes,game.strokes)} strokes</p>}</div></section>}
 </div>
}

function PuttLiveReadout({game}){const placement=useRef(null);if(!placement.current){const size=game.screenSize??{width:window.innerWidth,height:window.innerHeight};placement.current=puttReadoutPlacement(size.width,size.height,game.screenPin,game.screenBall,game.puttPointer)}const p=placement.current;return <div className="putt-live-readout compact-putt-readout" style={{left:p.x,top:p.y,width:p.width,transform:'none'}} role="status" aria-label="Putt strength and estimated distance"><span>PUTT POWER</span><b>{Math.round(game.pull.percent)}% <small>≈ {puttInfo(game.pull.percent).distance.toFixed(1)} ft</small></b><div className="putt-live-track"><i style={{transform:`scaleX(${game.pull.percent/100})`}}/></div></div>}

function PutterCue({game}){
 const ref=useRef();
 useFrame(()=>{const p=putterPose(game);ref.current.position.set(...p.position);ref.current.rotation.y=p.rotation});
 return <group ref={ref}><PutterModel/></group>
}
function PuttAim({game}){const aim=game.pull?puttingAim(game):null;return <><PutterCue game={game}/>{aim&&aim.distance>.35&&<TargetDisc point={aim} miniature/>}</>}
function ScreenMarkers({game,view}){if(['sinking','holed'].includes(game.mode))return null;const aim=game.screenAim,pin=game.screenPin;return <div className="screen-markers">{pin?.visible&&<div className="pin-tag" style={{left:pin.x,top:Math.max(105,pin.y-12)}} aria-label="Pin">⚑<small>{game.mini?'CUP':'PIN'}</small></div>}{game.mode==='ready'&&aim?.visible&&(!game.mini||game.pull)&&aim.selected&&<div className={'aim-tag '+(aim.out?'warning':'')} style={{left:aim.x,top:aim.y}}>{`${Math.round(aim.distance??selectedTarget(game)?.yards??0)} yd${aim.out?' · outside boundary':''}`}</div>}</div>}

function FinishBanner({game}){const over=game.strokes-game.par,label=scoreName(game.strokes,game.par);return <>{(over===-2||over===-1)&&<BirdCelebration eagle={over===-2}/>}<div className="finish-banner"><div className="finish-kicker">IN THE CUP</div><h2>{label}!</h2><p>{game.strokes} strokes · Hole {String(game.hole).padStart(2,'0')} complete</p>{over>=2&&<p className="finish-encouragement">Get your head in the game.</p>}{over<=0&&Array.from({length:22},(_,i)=><i key={i} className="confetti" style={{'--x':(i/21*360-180)+'px','--r':(i*57)+'deg','--delay':(i%5)*.06+'s',background:i%2?'#f0c370':'#7eae80'}}/>)}</div></>}
