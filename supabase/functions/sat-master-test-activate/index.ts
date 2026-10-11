import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
const reply=(message:string,status:number)=>new Response(JSON.stringify({message}),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors})
 if(req.method!=='POST')return reply('Method not allowed',405)
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!anon||!service)return reply('Test activation is not configured',503)
 const bearer=req.headers.get('authorization')??''
 if(!bearer.startsWith('Bearer '))return reply('Sign in first',401)
 const viewer=createClient(url,anon,{auth:{persistSession:false}})
 const {data:{user},error}=await viewer.auth.getUser(bearer.slice(7))
 if(error||!user)return reply('Sign in first',401)
 let code=''
 try{const body=await req.json();code=String(body.code??'').trim().toUpperCase()}
 catch{return reply('Enter the test code',400)}
 if(!/^SAT-TEST-[A-Z0-9-]{12,60}$/.test(code))return reply('Invalid test activation code',400)
 const admin=createClient(url,service,{auth:{persistSession:false}})
 // Supabase checks the bcrypt hash, allowlisted user ID, and per-account rate limit.
 const {data:expiresAt,error:grantError}=await admin.rpc('sat_redeem_master_test_code',{
  p_user_id:user.id,p_code:code,
 })
 if(grantError)return reply('Test activation is unavailable',503)
 if(typeof expiresAt!=='string')return reply('Invalid code or this account is not authorized',403)
 return new Response(JSON.stringify({expiresAt}),{headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
})
