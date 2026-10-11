// Local development only. The plaintext test code is intentionally not in this repository.
// This unlocks local UI flows, not Supabase production RLS/billing entitlements.
const DEV_CODE_SHA256='994420c293e9f126d8226c81a11b9c8e5d6db47d620c3361798397998761be59'
const key=(userId:string)=>'sat-local-test-pass:'+userId
export function localTestExpiry(userId:string):string|null{
 if(!import.meta.env.DEV||typeof window==='undefined')return null
 const stored=window.localStorage.getItem(key(userId))
 if(!stored)return null
 const expires=new Date(stored)
 return Number.isFinite(expires.getTime())&&expires.getTime()>Date.now()?stored:null
}
export async function redeemLocalTestCode(userId:string,code:string):Promise<string>{
 if(!import.meta.env.DEV||typeof window==='undefined'||!userId)throw new Error('Development activation is unavailable.')
 const bytes=new TextEncoder().encode(code.trim().toUpperCase())
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('')
 if(hash!==DEV_CODE_SHA256)throw new Error('Invalid local development activation code.')
 const expires=new Date(Date.now()+90*24*60*60*1000).toISOString()
 window.localStorage.setItem(key(userId),expires)
 return expires
}
