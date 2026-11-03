import {createClient} from '@supabase/supabase-js';
import {multiplayerConfig} from './multiplayer-config.js';
let client,signingIn;
export function multiplayerReady(){return !!multiplayerConfig.key}
export function matchClient(){if(!multiplayerReady())throw Error('Private matches are not connected yet.');return client??=createClient(multiplayerConfig.url,multiplayerConfig.key,{auth:{storageKey:'fairway-multiplayer-auth'+(import.meta.env.DEV?(new URLSearchParams(location.search).get('testplayer')??''):'')}})}
export async function playerSession(){if(signingIn)return signingIn;signingIn=(async()=>{const c=matchClient(),{data,error}=await c.auth.getSession();if(error)throw error;if(data.session)return data.session.user;const signed=await c.auth.signInAnonymously();if(signed.error)throw signed.error;return signed.data.user})();try{return await signingIn}finally{signingIn=null}}
export async function matchRpc(name,args){const {data,error}=await matchClient().rpc(name,args);if(error)throw Error(error.message);return data}
export function inviteSecret(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('')}
