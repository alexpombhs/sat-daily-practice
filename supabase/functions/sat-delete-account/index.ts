import {createClient} from 'npm:@supabase/supabase-js@2.57.4'

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization,apikey,content-type',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{headers:cors})
  if(req.method!=='POST')return json({error:'Method not allowed'},405)
  const auth=req.headers.get('Authorization')??''
  if(!auth.startsWith('Bearer '))return json({error:'Sign in to delete your account.'},401)
  let payload:{confirmation?:string}
  try{payload=await req.json()}catch{return json({error:'Invalid request.'},400)}
  if(payload.confirmation!=='DELETE MY ACCOUNT')return json({error:'Confirmation required.'},400)
  const url=Deno.env.get('SUPABASE_URL')
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anon=Deno.env.get('SUPABASE_ANON_KEY')
  if(!url||!serviceKey||!anon)return json({error:'Service unavailable.'},503)
  const viewer=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false}})
  const {data:{user},error}=await viewer.auth.getUser(auth.slice(7))
  if(error||!user)return json({error:'Session invalid or expired.'},401)
  const admin=createClient(url,serviceKey,{auth:{persistSession:false}})
  // All user-owned practice tables must reference auth.users with ON DELETE CASCADE.
  // Test complete data removal and storage/third-party records before launch.
  const removed=await admin.auth.admin.deleteUser(user.id)
  if(removed.error)return json({error:'Unable to delete account. Contact support.'},500)
  return json({ok:true})
})
