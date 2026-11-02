// Shared island silhouette for terrain, cliff edges and waterfall outlets.
export function edgeShape(a){return 1+.06*Math.sin(a*5+1.2)+.04*Math.sin(a*9-.7)}
