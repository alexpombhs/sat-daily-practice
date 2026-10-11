import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
Deno.serve(async(req:Request)=>{
 if(req.method!=='GET')return new Response('Method not allowed',{status:405})
 const token=new URL(req.url).searchParams.get('token')??''
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))
  return new Response('Invalid unsubscribe link.',{status:400,headers})
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!key)return new Response('Service unavailable.',{status:503,headers})
 const db=createClient(url,key,{auth:{persistSession:false}})
 const {error}=await db.rpc('sat_unsubscribe_waitlist',{token_input:token})
 if(error)return new Response('We could not process the request. Please contact support.',{status:503,headers})
 return new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Waitlist update</title><body style="font:16px system-ui;max-width:38rem;margin:12vh auto;padding:1rem"><h1>Waitlist updated</h1><p>Your email has been removed from SAT Daily Practice waitlist updates, or was already removed.</p></body></html>',{headers})
})
