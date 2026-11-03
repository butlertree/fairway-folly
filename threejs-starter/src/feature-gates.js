// Release switches stay off until the experiences pass gameplay testing.
export const premiumRelease=Object.freeze({identity:false,environments:false});
export const canPreviewPremium=({development=false,requested=false}={})=>development===true&&requested===true;
