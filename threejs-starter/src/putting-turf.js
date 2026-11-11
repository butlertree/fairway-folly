import {turfPalette} from './turf-palette.js';
import {miniCup} from './cups.js';
import {pondFraction} from './course.js';
import {puttingCupRadius} from './putting-cup.js';
import {boundaryEdges} from './mini-boundary.js';
import {cascadeWaterLevel,miniHeight,miniSlope,miniPool} from './mini-surfaces.js';
export const cupCut={radius:puttingCupRadius,segments:192};
const clamp=x=>Math.max(0,Math.min(1,x));
// A uniform circular inner ring prevents long polygon edges from cutting across the cup.
export function turfMeshData(hole,rings=hole===3?144:88){const n=cupCut.segments,positions=[],uv=[],colors=[],index=[],pool=miniPool(hole),cup=miniCup({hole}),edges=boundaryEdges(hole);for(let j=0;j<=rings;j++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,ux=Math.cos(a),uz=Math.sin(a);let outer=Infinity;for(const e of edges){const v=ux*e.nx+uz*e.nz;if(v< -1e-9)outer=Math.min(outer,((e.x-cup.x)*e.nx+(e.z-cup.z)*e.nz)/v)}const r=cupCut.radius+(outer-cupCut.radius)*j/rings,x=cup.x+ux*r,z=cup.z+uz*r,h=miniHeight(hole,x,z);let y=h;if(pool){const f=pondFraction(x,z,pool),t=clamp((f-.82)/.31),shore=t*t*(3-2*t);y=h*shore+(cascadeWaterLevel-.38)*(1-shore)}positions.push(x,y,z);uv.push(x,z);colors.push(...turfShade(hole,x,z));if(j<rings){const a=j*n+i,b=j*n+(i+1)%n;index.push(a,b,a+n,b,b+n,a+n)}}return {positions,uv,colors,index}}
// Broad warm crests and cool shaded shoulders remain readable on a small screen.
export function turfShade(hole,x,z){const h=miniHeight(hole,x,z),s=miniSlope(hole,x,z),t=clamp(hole===13?(h+.78)/1.76:hole===14?(h+.64)/2.15:hole===16?(h+.76)/1.41:h/1.05),hill=clamp(.5+(-s.x*.8-s.z*.6)*2.2),shade=hole===13?1.02-.32*clamp(Math.hypot(s.x,s.z)/.34):hole===14?1.04-.27*clamp(Math.hypot(s.x,s.z)/.52):hole===11?.65+hill*.57:.72+hill*.38,low=turfPalette.puttingLow,high=turfPalette.puttingHigh;return low.map((v,i)=>Math.min(1,(v+(high[i]-v)*t)*shade))}
