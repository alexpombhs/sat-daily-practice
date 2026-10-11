import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'}
const page=(title:string,body:string,status=200)=>new Response(
 `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font:16px system-ui;max-width:38rem;margin:12vh auto;padding:1rem"><h1>${title}</h1>${body}</body></html>`,
 {status,headers})
const isToken=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
Deno.serve(async(req:Request)=>{
 if(req.method!=='GET'&&req.method!=='POST')return page('Unsupported request','<p>Please open the link from your email.</p>',405)
 let token=''
 if(req.method==='GET')token=new URL(req.url).searchParams.get('token')??''
 else {
  if(!req.headers.get('content-type')?.includes('application/x-www-form-urlencoded'))return page('Invalid request','<p>Please open the link from your email.</p>',400)
  token=new URLSearchParams(await req.text()).get('token')??''
 }
 if(!isToken(token))return page('Invalid link','<p>Please request a new email link.</p>',400)
 if(req.method==='GET')return page('Waitlist confirmation',
  `<p>Confirm your email address to join the SAT Daily Practice waitlist.</p><form method="post"><input type="hidden" name="token" value="${token}"><button type="submit" style="padding:12px 20px;cursor:pointer">Confirm my email</button></form>`)
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!key)return page('Temporarily unavailable','<p>Please try again later.</p>',503)
 const db=createClient(url,key,{auth:{persistSession:false}})
 const {error}=await db.rpc('sat_verify_waitlist_email',{token_input:token})
 if(error)return page('Temporarily unavailable','<p>Please try again later.</p>',503)
 return page('Waitlist confirmation complete','<p>Your request has been processed. You may close this window.</p>')
})
