import {Color,MathUtils} from 'three';

// One grass palette for the Verdant Isles. Lighting and slope shading provide variation.
export const turfPalette={
 rough:'#659755',
 upland:'#609248',
 fairway:'#a7ca77',
 green:'#b4d181',
 puttingLow:[.21,.36,.07],
 puttingHigh:[.45,.62,.16]
};

const collarColor=new Color('#89ac63');
const greenColor=new Color(turfPalette.green);
export function blendGreenTurf(color,fraction){
 if(fraction>=1.19)return;
 color.lerp(collarColor,1-MathUtils.smoothstep(fraction,1.03,1.19));
 color.lerp(greenColor,1-MathUtils.smoothstep(fraction,.89,1.015));
}
