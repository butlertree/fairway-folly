// Creekbank Hollow runs downstream toward the tee-side cliff.
const smooth=t=>{const u=Math.max(0,Math.min(1,t));return u*u*(3-2*u)};
export function creekbankCenter(z){
 const landingBend=14*smooth((z+148)/72)*smooth((89-z)/80);
 return 56-112*smooth((z-104)/154)+3.8*Math.sin((z+24)/32)+1.6*Math.sin(z/13)-landingBend;
}
export function creekbankWidth(z){
 return 5.2+.9*Math.sin(z/34)+.45*Math.cos(z/15);
}
export function creekbankFraction(x,z){
 return Math.abs(x-creekbankCenter(z))/creekbankWidth(z);
}
export const timberCrossingZ=181;

// The same gate placements drive the rendered stonework and ball collisions.
export const culverts=[[1,0],[0,1],[-1,0],[0,-1]].map(([dx,dz])=>{
 const x=5.8*dx,z=5.8*dz;
 const feet=[-1.62,1.62].map(offset=>({x:x+dz*offset,z:z-dx*offset,r:.67}));
 return {x,z,dx,dz,feet};
});
export const culvertFeet=culverts.flatMap(gate=>gate.feet);
