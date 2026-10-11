import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}
const page=(title:string,body:string,status=200)=>new Response(
 `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font:16px system-ui;max-width:38rem;margin:12vh auto;padding:1rem"><h1>${title}</h1><p>${body}</p></body></html>`,{status,headers})
Deno.serve(async(req:Request)=>{
 if(req.method!=='GET')return page('Unsupported request','Please open the link from your email.',405)
 const token=new URL(req.url).searchParams.get('token')??''
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))
  return page('Invalid link','Please request a new waitlist confirmation.',400)
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!key)return page('Temporarily unavailable','Please try again later.',503)
 const db=createClient(url,key,{auth:{persistSession:false}})
 const {error}=await db.rpc('sat_verify_waitlist_email',{token_input:token})
 if(error)return page('Temporarily unavailable','Please try again later.',503)
 return page('Email confirmed','Your waitlist request is confirmed. We will email you when a registration place is reserved, if one becomes available.')
})
