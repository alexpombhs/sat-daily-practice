import {createClient} from 'npm:@supabase/supabase-js@2.57.4'

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization,apikey,content-type',
 'Access-Control-Allow-Methods':'POST,OPTIONS',
}
function result(message:string,status:number){return new Response(JSON.stringify({message}),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors})
 if(req.method!=='POST')return result('Method not allowed',405)
 const turnstileSecret=Deno.env.get('TURNSTILE_SECRET_KEY')
 const supabaseUrl=Deno.env.get('SUPABASE_URL')
 const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!turnstileSecret||!supabaseUrl||!key)return result('Waitlist is temporarily unavailable.',503)
 let body:{email?:string;birthDate?:string;captchaToken?:string}
 try{body=await req.json()}catch{return result('Invalid submission.',400)}
 if(!body.captchaToken||!body.email||!body.birthDate)return result('Complete all fields and the security check.',400)
 const validation=new URLSearchParams({secret:turnstileSecret,response:body.captchaToken})
 const remoteIp=req.headers.get('cf-connecting-ip')
 if(remoteIp)validation.set('remoteip',remoteIp)
 let success=false
 try{
   const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:validation})
   const details=await verification.json()
   success=verification.ok&&details.success===true
 }catch{return result('Security check temporarily unavailable.',503)}
 if(!success)return result('Security check failed. Please try again.',403)
 const admin=createClient(supabaseUrl,key,{auth:{persistSession:false}})
 const {error}=await admin.rpc('sat_join_waitlist',{email_input:body.email,birth_date_input:body.birthDate})
 if(error)return result(error.message.includes('age')?'Waitlist is available only to eligible users.':'Unable to join waitlist. Check the form and try again.',400)
 return result('Waitlist request received.',200)
})
