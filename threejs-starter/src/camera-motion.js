export function cameraBlend(seconds,rate=4.5){return 1-Math.exp(-Math.max(0,Math.min(.05,seconds))*rate)}
export function renderBallBetween(previous,current,alpha){const t=Math.max(0,Math.min(1,alpha));return {x:previous.x+(current.x-previous.x)*t,y:previous.y+(current.y-previous.y)*t,z:previous.z+(current.z-previous.z)*t}}
