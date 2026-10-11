import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
const reply=(msg:string,status:number)=>new Response(JSON.stringify({message:msg}),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
const safeEqual=(a:string,b:string)=>{
 const encoder=new TextEncoder();const x=encoder.encode(a),y=encoder.encode(b)
 if(x.length!==y.length)return false
 let delta=0;for(let i=0;i<x.length;i++)delta|=x[i]^y[i]
 return delta===0
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors})
 if(req.method!=='POST')return reply('Method not allowed',405)
 const secret=Deno.env.get('SAT_TEST_MASTER_CODE')
 const allowed=(Deno.env.get('SAT_TEST_ALLOWED_USER_IDS')??'').split(',').map(s=>s.trim()).filter(Boolean)
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!secret||!allowed.length||!url||!anon||!service)return reply('Test activation is not configured',503)
 const bearer=req.headers.get('authorization')??''
 if(!bearer.startsWith('Bearer '))return reply('Sign in first',401)
 const viewer=createClient(url,anon,{auth:{persistSession:false}})
 const {data:{user},error}=await viewer.auth.getUser(bearer.slice(7))
 if(error||!user)return reply('Sign in first',401)
 if(!allowed.includes(user.id))return reply('This account is not authorized for test access',403)
 let supplied=''
 try{const body=await req.json();supplied=String(body.code??'').trim().toUpperCase()}catch{return reply('Enter the test code',400)}
 if(!safeEqual(supplied,secret.trim().toUpperCase()))return reply('Invalid test code',403)
 const db=createClient(url,service,{auth:{persistSession:false}})
 const {data,error:grantError}=await db.rpc('sat_activate_master_test_pass',{p_user_id:user.id})
 if(grantError||typeof data!=='string')return reply('Test access cannot be activated',503)
 return new Response(JSON.stringify({expiresAt:data}),{headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
})
