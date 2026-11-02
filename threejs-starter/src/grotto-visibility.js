// Clip the actual camera-to-ball segment against the overhead canopy volume.
// The controls target can be several feet ahead of the ball and is not an occlusion test.
export function grottoCanopyBlocks(camera,ball,padding=0){
 const min={x:-4.6-padding,y:2.3-padding,z:-3.8-padding},max={x:4.6+padding,y:4.9+padding,z:1+padding};
 let lo=0,hi=1;
 for(const axis of ['x','y','z']){const d=ball[axis]-camera[axis];if(Math.abs(d)<1e-9){if(camera[axis]<min[axis]||camera[axis]>max[axis])return false;continue}let a=(min[axis]-camera[axis])/d,b=(max[axis]-camera[axis])/d;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>hi)return false}
 return hi>0&&lo<.995;
}
export function grottoAddressHeight(x,z){return Math.abs(x)<1.8&&z> -7.5&&z<3?1.15:null}
