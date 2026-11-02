export const cupLayouts={1:[{x:0,z:-12},{x:-5,z:-10.5},{x:3,z:-11.8},{x:-6.7,z:-8}],2:[{x:0,z:-12},{x:-4,z:-10.7},{x:4.3,z:-11.8},{x:-7,z:-9}],3:[{x:0,z:-12},{x:-5.8,z:-9},{x:5.1,z:-9.8},{x:0,z:-6.3}]};
export function cupFor(hole=1,layout=0){return {...(cupLayouts[hole]??cupLayouts[1])[((layout%4)+4)%4]}}
export function miniCup(game){return game.cup??cupLayouts[game.hole??1]?.[0]??cupLayouts[1][0]}
export function pinFor(game,course){const cup=miniCup(game);return {x:course.pin.x+cup.x/9*course.green.rx*.65,z:course.pin.z+(cup.z+12)/9*course.green.rz*.65}}
