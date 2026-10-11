import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
// Called only by the trusted daily operator job, never directly by the app.
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const secret=Deno.env.get('LA_OPERATOR_SECRET')
 if(!secret||req.headers.get('x-la-operator-secret')!==secret)
  return new Response('Forbidden',{status:403})
 const url=Deno.env.get('SUPABASE_URL'),role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!role)return new Response('Service unavailable',{status:503})
 const db=createClient(url,role,{auth:{persistSession:false}})
 const {error}=await db.rpc('sat_cleanup_launch_data')
 if(error){console.error('Launch data cleanup failed');return new Response('Cleanup unavailable',{status:503})}
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}})
})
