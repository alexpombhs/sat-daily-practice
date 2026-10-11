// Operator-only invite sender; deploy with JWT verification enabled.
// Configure LA_OPERATOR_SECRET, RESEND_API_KEY and LA_FROM_EMAIL server-side.
// Uses an independent admin secret because this endpoint must never be exposed
// as an ordinary authenticated-user action.
import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const secret=Deno.env.get('LA_OPERATOR_SECRET')
 if(!secret||req.headers.get('x-la-operator-secret')!==secret)return new Response('Forbidden',{status:403})
 const key=Deno.env.get('RESEND_API_KEY'),sender=Deno.env.get('LA_FROM_EMAIL')
 const url=Deno.env.get('SUPABASE_URL'),role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 const website=Deno.env.get('LA_APP_URL')
 if(!key||!sender||!url||!role||!website)return new Response('Not configured',{status:503})
 const db=createClient(url,role,{auth:{persistSession:false}})
 const {data:rows,error}=await db.from('sat_launch_waitlist')
   .select('id,email').eq('status','waiting').order('created_at',{ascending:true}).limit(1)
 if(error)return new Response('Queue unavailable',{status:503})
 const row=rows?.[0]
 if(!row)return new Response(JSON.stringify({sent:0}),{headers:{'Content-Type':'application/json'}})
 // The invite does NOT reserve a place or bypass the 100-user cap.
 // Operators should only send invitations when capacity is available.
 const site=new URL(website)
 if(site.protocol!=='https:')return new Response('Invalid app URL',{status:503})
 const response=await fetch('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({from:sender,to:[row.email],subject:'SAT Daily Practice registration update',
      text:`A registration place may be available. Visit ${site.origin} to sign up if you would like. Places are limited and not reserved. Ignore this email if you are no longer interested.`})
 })
 if(!response.ok)return new Response('Email delivery request failed',{status:502})
 const {error:updateError}=await db.from('sat_launch_waitlist')
   .update({status:'invited',contacted_at:new Date().toISOString()}).eq('id',row.id).eq('status','waiting')
 if(updateError)return new Response('Sent, but status update failed; check before retrying',{status:500})
 return new Response(JSON.stringify({sent:1}),{headers:{'Content-Type':'application/json'}})
})
