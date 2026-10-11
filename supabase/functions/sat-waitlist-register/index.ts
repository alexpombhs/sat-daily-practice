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
 const emailKey=Deno.env.get('RESEND_API_KEY'),sender=Deno.env.get('LA_FROM_EMAIL')
 if(!turnstileSecret||!supabaseUrl||!key||!emailKey||!sender)return result('Waitlist is temporarily unavailable.',503)
 let body:{email?:string;birthDate?:string;captchaToken?:string}
 try{body=await req.json()}catch{return result('Invalid submission.',400)}
 if(!body.captchaToken||!body.email||!body.birthDate)return result('Complete all fields and the security check.',400)
 const challenge=new URLSearchParams({secret:turnstileSecret,response:body.captchaToken})
 const remoteIp=req.headers.get('cf-connecting-ip')
 if(remoteIp)challenge.set('remoteip',remoteIp)
 try{
  const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:challenge})
  const payload=await verified.json()
  if(!verified.ok||payload.success!==true)return result('Security check failed. Please try again.',403)
 }catch{return result('Security check temporarily unavailable.',503)}
 const email=body.email.trim().toLowerCase()
 const admin=createClient(supabaseUrl,key,{auth:{persistSession:false}})
 const {data:shouldSend,error}=await admin.rpc('sat_join_waitlist',{
  email_input:email,birth_date_input:body.birthDate
 })
 if(error)return result('Unable to join waitlist. Please check the details.',400)
 if(shouldSend===true){
  const {data:record,error:lookupError}=await admin.from('sat_launch_waitlist')
   .select('verification_token,unsubscribe_token').eq('email',email).eq('status','waiting').maybeSingle()
  if(lookupError||!record)return result('Waitlist is temporarily unavailable.',503)
  const verify=new URL('/functions/v1/sat-waitlist-verify',supabaseUrl)
  verify.searchParams.set('token',record.verification_token)
  const unsub=new URL('/functions/v1/sat-waitlist-unsubscribe',supabaseUrl)
  unsub.searchParams.set('token',record.unsubscribe_token)
  try{
   const response=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{Authorization:`Bearer ${emailKey}`,'Content-Type':'application/json',
      'Idempotency-Key':`sat-waitlist-confirm-${record.verification_token}-${new Date().toISOString().slice(0,13)}`},
    body:JSON.stringify({from:sender,to:[email],subject:'Confirm your SAT Daily Practice waitlist email',
      text:`Please confirm that you want SAT Daily Practice waitlist updates: ${verify.toString()}\n\nIf this wasn't you, ignore the message or remove the address: ${unsub.toString()}`})
   })
   if(!response.ok)return result('We could not send a confirmation email. Please try again later.',503)
  }catch{return result('Email provider temporarily unavailable. Please try again later.',503)}
 }
 return result('Please check your email for a waitlist confirmation link.',200)
})
