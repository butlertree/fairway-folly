import {ExpansionGreen} from './ExpansionGreens';
import React,{useMemo,useRef,useEffect} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei';
import * as THREE from 'three';
import {gardenObstacles,gardenBanks,sandstoneElbows,timberRoots,timberStoneBanks,cedarBanks} from './green-features';
import {miniHeight} from './mini-surfaces';
import {boundaryClearance} from './mini-boundary';
import {CascadeChannel} from './CentralGreens';
import {CourseWaterfall} from './CourseWaterfall';

function Flowers({x,z,r=.7,color='#e9ba71',y=.7}){const blooms=useRef(),stems=useRef();useEffect(()=>{const object=new THREE.Object3D();for(let i=0;i<24;i++){const a=i*2.399,rr=r*Math.sqrt((i+.5)/24),px=x+Math.cos(a)*rr,pz=z+Math.sin(a)*rr,h=.18+.12*(i%3);object.position.set(px,y+h/2,pz);object.scale.set(.025,h,.025);object.updateMatrix();stems.current.setMatrixAt(i,object.matrix);object.position.set(px,y+h,pz);object.scale.set(.12,.07,.12);object.updateMatrix();blooms.current.setMatrixAt(i,object.matrix)}blooms.current.instanceMatrix.needsUpdate=true;stems.current.instanceMatrix.needsUpdate=true},[x,z,r,y]);return <><instancedMesh ref={stems} args={[null,null,24]}><cylinderGeometry args={[1,1,1,5]}/><meshStandardMaterial color="#527445"/></instancedMesh><instancedMesh ref={blooms} args={[null,null,24]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={color} roughness={.9}/></instancedMesh></>}
function Boulder({position,scale=[1,1,1],color='#829080'}){return <mesh position={position} scale={scale} castShadow receiveShadow><icosahedronGeometry args={[1,2]}/><meshStandardMaterial color={color} roughness={1}/></mesh>}
function Bank({s,hole,game}){const bank=useRef();const shape=useMemo(()=>{const dx=s.bx-s.ax,dz=s.bz-s.az,len=Math.hypot(dx,dz),p=new THREE.Shape();p.moveTo(-s.r,-len/2);p.absarc(0,-len/2,s.r,Math.PI,Math.PI*2,false);p.lineTo(s.r,len/2);p.absarc(0,len/2,s.r,0,Math.PI,false);p.closePath();return p},[s]);const length=Math.hypot(s.bx-s.ax,s.bz-s.az),angle=Math.atan2(s.bx-s.ax,s.bz-s.az),height=hole===3?1.5:hole===11?1.05:hole===12?.56:.55;return <group ref={bank} position={[(s.ax+s.bx)/2,miniHeight(hole,(s.ax+s.bx)/2,(s.az+s.bz)/2),(s.az+s.bz)/2]} rotation={[0,angle,0]}><mesh rotation={[Math.PI/2,0,0]} position={[0,height,0]} receiveShadow castShadow><extrudeGeometry args={[shape,{depth:height,bevelEnabled:hole>=11,bevelSize:.045,bevelThickness:.045,bevelSegments:1,curveSegments:32}]}/><meshStandardMaterial color={hole===12?'#777b60':hole===11?'#b19a75':hole===9?'#b69e89':hole===1?'#b9aa7e':hole===2?'#7e958c':'#7d8e7a'} roughness={1}/></mesh>{hole<11&&hole!==3&&Array.from({length:Math.ceil(length/.55)+1},(_,i)=><Boulder key={i} position={[0,.48,-length/2+i/Math.ceil(length/.55)*length]} scale={[s.r*.9,.16,.33]} color={hole===11?'#c5b28c':hole===1?'#b7b18b':'#a2b19c'}/>)}{hole===3&&Array.from({length:5},(_,i)=><Boulder key={i} position={[0,1.48,-length/2+i/4*length]} scale={[s.r,.45,.8]} color={i%2?'#92a084':'#7d9078'}/>)}</group>}
function SandstoneShoulder({face,join}){
 const rockColors=['#b29c78','#a48c69','#c6ae84'];
 const layers=[
   ...[.08,.31,.55,.79,1].map((t,i)=>[join.ax+(join.bx-join.ax)*t,join.az+(join.bz-join.az)*t,
     .91+.19*t,.83+.39*t,.38+.38*t,.76+.32*t,i]),
   ...[.26,.66].map((t,i)=>[face.ax+(face.bx-face.ax)*t,face.az+(face.bz-face.az)*t,
     .92,.59,.25+i*.08,.79,i+2])
 ];
 const flowerX=join.ax+(join.bx-join.ax)*.65,flowerZ=join.az+(join.bz-join.az)*.65;
 return <>
   <Bank s={face} hole={11}/>
   <Bank s={join} hole={11}/>
   {layers.map(([x,z,y,sx,sy,sz,shade],i)=><Boulder key={i} position={[x,miniHeight(11,x,z)+y,z]}
     scale={[sx,sy,sz]} color={rockColors[shade%rockColors.length]}/>)}
   <Flowers x={flowerX} z={flowerZ} y={1.56} r={.46} color="#e8d7a3"/>
 </>;
}
function TerracePlanter({o,index}){
 const {x,z,r}=o;
 const clay=['#a7614b','#627e72','#b28755'][index];
 const blooms=[['#f2a4b7','#f7dbd7','#c95379'],['#bda2e2','#eee0fa','#8063ad'],['#f4cb63','#f6ead0','#db8e43']][index];
 return <group position={[x,miniHeight(13,x,z),z]}>
   <mesh position={[0,.44,0]} castShadow receiveShadow><cylinderGeometry args={[r*.94,r*.72,1.16,40]}/><meshStandardMaterial color={clay} roughness={.84}/></mesh>
   <mesh position={[0,.94,0]} castShadow><cylinderGeometry args={[r,r,.18,40]}/><meshStandardMaterial color={clay} roughness={.7}/></mesh>
   <mesh position={[0,1.04,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[r*.86,40]}/><meshStandardMaterial color="#44543a"/></mesh>
   <mesh position={[0,.67,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[r*.88,.045,8,40]}/><meshStandardMaterial color="#ead2a8"/></mesh>
   {blooms.map((color,i)=><Flowers key={color} x={Math.cos(i*2.4)*r*.31} z={Math.sin(i*2.4)*r*.31} r={r*.53} y={1.04+i*.04} color={color}/>)}
 </group>;
}
function Planter({o,hole,index}){if(hole===13)return <TerracePlanter o={o} index={index}/>;return <group position={[0,miniHeight(hole,o.x,o.z),0]}><mesh position={[o.x,.35,o.z]} receiveShadow castShadow><cylinderGeometry args={[o.r,o.r,.7,48]}/><meshStandardMaterial color={hole===1?'#bdad83':'#82978a'} roughness={1}/></mesh><mesh position={[o.x,.71,o.z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[o.r*.86,40]}/><meshStandardMaterial color="#586d3d"/></mesh>{hole===1?<Flowers x={o.x} z={o.z} r={o.r*.7} color={index?'#e2a6a0':'#f5cf79'} y={.73}/>:<><Boulder position={[o.x,.95,o.z]} scale={[o.r*.7,.55,o.r*.55]} color="#b3bfaa"/><mesh position={[o.x,.76,o.z]} scale={[o.r*.8,.15,o.r*.7]}><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color="#8fae66"/></mesh></>}</group>}
function Lantern({x,z}){return <group position={[x,0,z]}><mesh position={[0,.6,0]} castShadow><cylinderGeometry args={[.12,.22,1.2,8]}/><meshStandardMaterial color="#72877b"/></mesh><RoundedBox position={[0,1.3,0]} args={[.55,.6,.55]} radius={.06}><meshStandardMaterial color="#e7d6a4" emissive="#e5bc6a" emissiveIntensity={.25}/></RoundedBox><mesh position={[0,1.7,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[.55,.35,4]}/><meshStandardMaterial color="#4e7067"/></mesh></group>}
function RootPine({x,z,scale=1,signature=false}){
 return <group position={[x,-.42,z]} scale={scale} userData={{miniFoliage:true}}>
   <mesh position={[0,signature?2.2:1.65,0]} castShadow><cylinderGeometry args={[signature?.32:.24,signature?.83:.72,signature?4.7:3.6,10]}/><meshStandardMaterial color="#76513a"/></mesh>
   {signature&&<mesh position={[0,.41,0]} castShadow receiveShadow><cylinderGeometry args={[.63,1.18,1.45,11]}/><meshStandardMaterial color="#76513a" roughness={1}/></mesh>}
   {[0,1,2].map(i=><mesh key={i} position={[i*.12,(signature?4.65:3)+i*1.28,0]} rotation={[0,i*.4,0]} scale={[1,.95,.85]} castShadow>
     <coneGeometry args={[(signature?2.75:2.3)-i*.5,2.5-i*.35,12]}/><meshStandardMaterial color={['#385d3a','#517645','#698a4d'][i]}/>
   </mesh>)}
 </group>
}
// Build one continuous bark surface from the same capsule footprints used for rebounds.
function RootMesh(){
 const mesh=useMemo(()=>{
   const roots=timberRoots.map((root,i)=>({...root,
     from:[.42,.83,.96,1.08,1.25,1.22,.83][i],to:[.83,.96,1.08,1.25,1.72,.83,.38][i]
   }));
   // The small feeder roots taper into the soil at the trunk, outside the bank.
   roots.push({ax:12.55,az:5.5,bx:13.35,bz:3.35,r:.52,from:1.55,to:.04},
     {ax:12.55,az:5.5,bx:12.6,bz:7.95,r:.6,from:1.55,to:.04},
     {ax:12.45,az:5.7,bx:11.1,bz:7.1,r:.43,from:1.55,to:.04});
   const positions=[],colors=[],indices=[],raised=[],columns=128,rows=96;
   const bark=new THREE.Color(),dark=new THREE.Color('#4b3427'),light=new THREE.Color('#aa8157');
   for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
     const x=2+i/columns*11.5,z=j/rows*10;
     let relief=0,grain=0;
     for(const root of roots){
       const dx=root.bx-root.ax,dz=root.bz-root.az;
       const t=THREE.MathUtils.clamp(((x-root.ax)*dx+(z-root.az)*dz)/(dx*dx+dz*dz),0,1);
       const length=Math.hypot(dx,dz);
       const side=((x-root.ax)*dz-(z-root.az)*dx)/length;
       const width=root.r*(.95+.045*Math.cos(t*6.5));
       const edge=Math.hypot(x-root.ax-t*dx,z-root.az-t*dz)/width;
       const ridge=Math.max(0,1-edge**2)**.55;
       const furrow=Math.sin(side*29+1.3*Math.sin(t*8+x*.8));
       const height=ridge*root.r*(THREE.MathUtils.lerp(root.from,root.to,t)+.05*furrow);
       if(height>relief){
         relief=height;
         grain=.46+.24*furrow+.09*Math.sin(side*65+Math.sin(t*13));
       }
     }
     const apron=THREE.MathUtils.smoothstep(-boundaryClearance(12,x,z),.15,1);
     positions.push(x,miniHeight(12,x,z)+relief-.035-.48*apron,z);
     raised.push(relief>.015);
     colors.push(...bark.copy(dark).lerp(light,grain*THREE.MathUtils.smoothstep(relief,0,.6)).toArray());
   }
   for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
     const a=j*(columns+1)+i,b=a+columns+1;
     if(raised[a]||raised[b]||raised[a+1])indices.push(a,b,a+1);
     if(raised[a+1]||raised[b]||raised[b+1])indices.push(a+1,b,b+1);
   }
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
   geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
   geometry.setIndex(indices);
   geometry.computeVertexNormals();
   return geometry;
 },[]);
 useEffect(()=>()=>mesh.dispose(),[mesh]);
 return <mesh geometry={mesh} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={1}/></mesh>;
}
function MossyLedge({bank}){
 const x=(bank.ax+bank.bx)/2,z=(bank.az+bank.bz)/2,length=Math.hypot(bank.bx-bank.ax,bank.bz-bank.az);
 return <><Bank s={bank} hole={12}/><group position={[x,miniHeight(12,x,z),z]} rotation={[0,Math.atan2(bank.bx-bank.ax,bank.bz-bank.az),0]}>
   <Boulder position={[.04,.52,0]} scale={[bank.r*.91,.16,length*.48+bank.r*.42]} color="#617d42"/>
   <Boulder position={[-.13,.53,-length*.24]} scale={[bank.r*.56,.12,length*.22]} color="#8b9d57"/>
 </group></>;
}
function TimberrootGarden(){
 return <>
   <RootMesh/>
   <RootPine x={12.55} z={5.5} scale={1.08} signature/>
   {timberStoneBanks.map(bank=><MossyLedge key={bank.ax} bank={bank}/>)}
   {[[-11.6,-5.6,.69],[-7.1,-11.8,.78],[7,-11.8,.8],[-9.8,11,.62],[8.2,12.6,.67]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-11.5,-2],[-4.6,13.6],[9.2,-8.7],[12.5,1.5]].map(([x,z],i)=><Flowers key={x} x={x} z={z} r={.67} y={-.3} color={i%2?'#d8ba70':'#e7ddaf'}/>)}
 </>;
}
function FallenCedar({s}){
 const a=new THREE.Vector3(s.ax,miniHeight(15,s.ax,s.az)+s.r*.38,s.az);
 const b=new THREE.Vector3(s.bx,miniHeight(15,s.bx,s.bz)+s.r*.38,s.bz);
 const axis=b.clone().sub(a),length=axis.length()+s.r*1.65;
 const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());
 return <group position={a.lerp(b,.5)} quaternion={rotation}>
   <mesh castShadow receiveShadow><cylinderGeometry args={[s.r*.96,s.r,length,14]}/><meshStandardMaterial color="#72553d" roughness={1} flatShading/></mesh>
   {Array.from({length:12},(_,i)=>{
     const angle=i*Math.PI/6;
     return <mesh key={i} position={[Math.cos(angle)*s.r*.95,0,Math.sin(angle)*s.r*.95]} rotation={[0,-angle,0]} scale={[.045,length*(.31+(i%3)*.07),.07]}>
       <sphereGeometry args={[1,8,8]}/><meshStandardMaterial color={i%3===0?'#7e8856':i%3===1?'#4f392c':'#967659'} roughness={1}/>
     </mesh>;
   })}
   {[-1,1].map(end=><group key={end} position={[0,end*length/2,0]} rotation={[end*-Math.PI/2,0,0]}>
     <mesh position={[0,0,.009]}><circleGeometry args={[s.r*.88,32]}/><meshStandardMaterial color="#c5a176" roughness={1}/></mesh>
     {[.24,.46,.67,.81].map((r,i)=><mesh key={r} position={[s.r*.055,-s.r*.035,.012+i*.001]} scale={[1,.88,1]}>
       <ringGeometry args={[s.r*r,s.r*(r+.025),32]}/><meshStandardMaterial color="#927052" roughness={1}/>
     </mesh>)}
   </group>)}
 </group>;
}
function HollowGarden(){
 return <>
   {gardenObstacles[16].map((rock,i)=><Boulder key={rock.x} position={[rock.x,miniHeight(16,rock.x,rock.z)+.05,rock.z]} scale={[rock.r,.61+i*.08,rock.r]} color={i%2?'#989d86':'#788775'}/>)}
   {[[-12,-9,.68],[7,-14,.77],[14,1,.66],[-13,7,.59]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-10,13],[12,7],[10,-11]].map(([x,z],i)=><Flowers key={x} x={x} z={z} r={.62} y={-.4} color={i%2?'#c9bdd8':'#e8d5a1'}/>)}
 </>;
}
function SanctuaryGarden(){
 const rocks=gardenObstacles[6];
 return <>
   {rocks.map((rock,i)=><Boulder key={rock.x} position={[rock.x,miniHeight(6,rock.x,rock.z)+.08,rock.z]} scale={[rock.r,i?.82:.65,rock.r]} color={i?'#8e9981':'#818d77'}/>)}
   {[[-12,-7,.64],[5,-14,.78],[13,1,.66],[-11,10,.56]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-14,3],[-8.8,-13],[12.2,-7],[9.4,11.5],[-3,15.6]].map(([x,z],i)=><group key={x} position={[x,-.38,z]}>
     <Boulder position={[0,.08,0]} scale={[1.1,.48,.86]} color={i%2?'#a3a597':'#818d77'}/>
     <Boulder position={[Math.sign(x)*.68,-.04,.31]} scale={[.58,.28,.54]} color="#929f83"/>
     <Flowers x={-.55} z={.55} r={.58} y={.04} color={i%2?'#e7d5a4':'#c9b2db'}/>
   </group>)}
 </>;
}
function CedarGarden(){
 return <>
   {cedarBanks.map(s=><FallenCedar key={s.ax} s={s}/>)}
   {[[-12,-8,.68],[8,-13,.81],[14,-4,.68],[-12,9,.58],[9,13,.57]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-14,1],[13,5],[-6,-13],[1,15]].map(([x,z],i)=><group key={x} position={[x,-.37,z]}>
     <Boulder position={[0,.02,0]} scale={[1.03,.43,.68]} color="#888e72"/>
     <Flowers x={.65} z={.23} r={.48} y={0} color={i%2?'#c7b4d3':'#edd6a5'}/>
   </group>)}
 </>;
}
function AlderGarden(){
 return <>
   {[[-11,-7,.68],[6,-13,.83],[12,3,.75],[-8,12,.61]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-10.8,5.5],[-8.1,-10.5],[10.5,5.6],[8,-9.6]].map(([x,z],i)=><group key={x} position={[x,-.29,z]}>
     <Boulder position={[0,0,0]} scale={[.72,.35,1.05]} color={i%2?'#a2a58a':'#808c71'}/>
     <Flowers x={.4} z={.45} r={.54} y={.15} color={i%2?'#d4d9f2':'#efe1ac'}/>
   </group>)}
 </>;
}
function DuneGarden(){
 return <>
   {[[-10,-8,.67],[3,-13,.78],[12,7,.72],[-7,11,.62]].map(([x,z,scale])=><RootPine key={x} x={x} z={z} scale={scale}/>)}
   {[[-12,2],[-8,-11],[10,-8],[7,11],[-2,14]].map(([x,z],i)=><group key={x} position={[x,-.3,z]}>
     <Boulder position={[0,-.08,0]} scale={[1.2,.25,1]} color="#ad9e76"/>
     {Array.from({length:9},(_,j)=><mesh key={j} position={[Math.sin(j*2.4)*.62,.25,Math.cos(j*2.4)*.52]} rotation={[.24*Math.sin(j),j*2.4,.26*Math.cos(j)]}>
       <coneGeometry args={[.041,.59+(j%3)*.13,3]}/><meshStandardMaterial color={j%2?'#a5a468':'#788e53'}/>
     </mesh>)}
   </group>)}
 </>;
}
function MillCottage(){return <group position={[-11,.1,-1]} rotation={[0,.15,0]}><RoundedBox args={[2.3,2.2,3.4]} radius={.16} position={[0,1.1,0]} castShadow><meshStandardMaterial color="#ede3c8"/></RoundedBox><mesh position={[0,2.5,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[2.35,1.5,4]}/><meshStandardMaterial color="#507d68"/></mesh>{[-.65,.65].map(z=><group key={z} position={[1.17,1.3,z]} rotation={[0,Math.PI/2,0]}><mesh><planeGeometry args={[.45,.6]}/><meshStandardMaterial color="#385f58"/></mesh><mesh position={[0,0,.01]}><boxGeometry args={[.04,.65,.04]}/><meshStandardMaterial color="#e4cf9e"/></mesh></group>)}</group>}
function Waterwheel(){const wheel=useRef();useFrame((_,dt)=>{if(wheel.current)wheel.current.rotation.z+=dt*.28});return <group position={[10.3,-.2,-7.5]} rotation={[0,Math.PI/2,0]}><group ref={wheel} position={[0,1.4,0]}>{[-.3,.3].map(z=><mesh key={z} position={[0,0,z]}><torusGeometry args={[1.2,.1,8,48]}/><meshStandardMaterial color="#8f6c43"/></mesh>)}{Array.from({length:12},(_,i)=><group key={i} rotation={[0,0,i*Math.PI/6]}><mesh position={[0,.63,0]}><boxGeometry args={[.07,1.25,.6]}/><meshStandardMaterial color="#b39359"/></mesh><mesh position={[0,1.18,0]}><boxGeometry args={[.45,.16,.8]}/><meshStandardMaterial color="#9d7c4c"/></mesh></group>)}</group><Boulder position={[0,.3,0]} scale={[1,.7,1]}/></group>}
function MoonPavilion(){return <group position={[-11.25,.15,-1]}><mesh position={[0,.1,0]} castShadow><cylinderGeometry args={[1.8,2,.3,6]}/><meshStandardMaterial color="#aab59c"/></mesh>{Array.from({length:6},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/3)*1.35,1.4,Math.sin(i*Math.PI/3)*1.35]} castShadow><cylinderGeometry args={[.08,.12,2.6,8]}/><meshStandardMaterial color="#9d7650"/></mesh>)}{[0,1].map(i=><mesh key={i} position={[0,3.1+i*.6,0]} castShadow><coneGeometry args={[2.3-i*.7,1,6]}/><meshStandardMaterial color={i?'#538078':'#426b63'}/></mesh>)}<mesh position={[0,4,0]}><sphereGeometry args={[.13,12,12]}/><meshStandardMaterial color="#dac183" metalness={.4} roughness={.4}/></mesh></group>}
function KingfisherFalls(){return <><CascadeChannel/><group position={[10.9,-.27,9.2]}>{[0,1,2].map(i=><Boulder key={i} position={[i*.45,.3+i*.45,-i*.18]} scale={[1.25,.4,.85]} color={i%2?'#a4b89a':'#7d967d'}/>)}<Flowers x={-.2} z={-1.1} y={.65} r={.55} color="#e5cf8f"/></group><group position={[-11,0,5.8]}><mesh position={[0,.14,0]} scale={[.9,.24,.55]} castShadow receiveShadow><sphereGeometry args={[1,24,12]}/><meshStandardMaterial color="#c4bfa2"/></mesh></group>{[[-11,8],[-11,-10],[10.8,10]].map(([x,z],i)=><Flowers key={i} x={x} z={z} r={.65} y={.1} color={i%2?'#b5c8db':'#e6cc91'}/>)}</>}

export function SignatureGreen({hole,game}){return <>{[12,15].includes(hole)?null:hole===11?sandstoneElbows.map(([face,join])=><SandstoneShoulder key={face.ax} face={face} join={join}/>):(gardenBanks[hole]??[]).map((s,i)=><Bank key={i} s={s} hole={hole} game={game}/>)}{(gardenObstacles[hole]??[]).filter((_,i)=>hole!==6&&hole!==10&&hole!==16&&(hole!==1||i<2)).map((o,i)=><Planter key={i} o={o} hole={hole} index={i}/>)}{hole===1?<><MillCottage/><Waterwheel/><CourseWaterfall outlet={{x:12.6,z:-7.5,width:1.3}} level={.04} rotation={Math.PI/2} bottom={-5.4}/>{[[-10,9],[-10,-10],[10,8],[10,-13]].map(([x,z],i)=><Flowers key={i} x={x} z={z} r={.8} y={.1} color={i%2?'#dca0a4':'#edcb76'}/>)}</>:hole===2?<><MoonPavilion/>{[[-9.8,-9],[10.5,8],[-10.7,9],[10.5,-11]].map(([x,z],i)=><Lantern key={i} x={x} z={z}/>)}{[-1,1].map(s=><group key={s} position={[s*10.2,-.2,s*11]}><Boulder position={[0,.3,0]} scale={[1.7,.6,2.2]} color="#a4b493"/><Flowers x={0} z={0} y={.8} r={.8} color="#e2b9c1"/></group>)}<CourseWaterfall outlet={{x:-12.5,z:-7,width:1.6}} level={.04} rotation={Math.PI/2} bottom={-5.4}/></>:hole===3?<KingfisherFalls/>:hole===6?<SanctuaryGarden/>:hole===12?<TimberrootGarden/>:hole===13?<DuneGarden/>:hole===14?<AlderGarden/>:hole===15?<CedarGarden/>:hole===16?<HollowGarden/>:<ExpansionGreen hole={hole} game={game}/>}</>}
