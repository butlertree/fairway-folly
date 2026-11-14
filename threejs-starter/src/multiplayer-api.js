import {createClient} from '@supabase/supabase-js';
import {multiplayerConfig} from './multiplayer-config.js';
let client,signingIn;
export function multiplayerReady(){return !!multiplayerConfig.key}
export function matchClient(){if(!multiplayerReady())throw Error('Private matches are not connected yet.');return client??=createClient(multiplayerConfig.url,multiplayerConfig.key,{auth:{storageKey:'fairway-multiplayer-auth'+(import.meta.env.DEV?(new URLSearchParams(location.search).get('testplayer')??''):'')}})}
export function isConnectionError(error){
 return /load failed|failed to fetch|networkerror|network request failed/i.test(error?.message??'');
}

async function readSession(client){
 let result=await client.auth.getSession();
 if(isConnectionError(result.error)){
   await new Promise(resolve=>setTimeout(resolve,400));
   result=await client.auth.getSession();
 }
 if(result.error)throw result.error;
 return result.data.session;
}

export async function playerSession(){
 if(signingIn)return signingIn;
 signingIn=(async()=>{
   const client=matchClient(),session=await readSession(client);
   if(session)return session.user;
   const signed=await client.auth.signInAnonymously();
   if(signed.error)throw signed.error;
   return signed.data.user;
 })();
 try{return await signingIn}finally{signingIn=null}
}
export async function matchRpc(name,args){const {data,error}=await matchClient().rpc(name,args);if(error)throw Error(error.message);return data}
export function inviteSecret(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('')}
