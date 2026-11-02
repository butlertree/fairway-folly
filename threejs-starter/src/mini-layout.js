// Shared corner geometry: nine by fifteen feet half extents, three-foot bank radius.
export const miniCorner={x:6,z:12,r:3};
export function cornerContact(x,z,radius=.3){const c=miniCorner,dx=Math.abs(x)-c.x,dz=Math.abs(z)-c.z;if(dx<=0||dz<=0)return null;const d=Math.hypot(dx,dz),limit=c.r-radius;if(d<=limit)return null;return {x:Math.sign(x)*(c.x+dx/d*limit),z:Math.sign(z)*(c.z+dz/d*limit),nx:Math.sign(x)*dx/d,nz:Math.sign(z)*dz/d}}
