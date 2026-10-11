import {createClient} from 'npm:@supabase/supabase-js@2.57.4'

// Restricted operator endpoint. Never put LA_OPERATOR_SECRET in the browser.
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const secret=Deno.env.get('LA_OPERATOR_SECRET')
 if(!secret||req.headers.get('x-la-operator-secret')!==secret)return new Response('Forbidden',{status:403})
 const key=Deno.env.get('RESEND_API_KEY'),sender=Deno.env.get('LA_FROM_EMAIL')
 const url=Deno.env.get('SUPABASE_URL'),role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 const website=Deno.env.get('LA_APP_URL')
 if(!key||!sender||!url||!role||!website)return new Response('Not configured',{status:503})
 let site:URL
 try{site=new URL(website);if(site.protocol!=='https:')throw new Error('invalid')}catch{return new Response('Invalid app URL',{status:503})}
 const db=createClient(url,role,{auth:{persistSession:false}})
 // Do not send invites if enrollment is still full.
 const {data:full,error:capacityError}=await db.rpc('sat_registration_is_full')
 if(capacityError)return new Response('Capacity unavailable',{status:503})
 if(full)return new Response('Registration is full; no invitation sent',{status:409})
 // The waitlist is a communications queue, not a reservation.
 const {data:claimed,error:claimError}=await db.rpc('sat_claim_waitlist_invite')
 if(claimError)return new Response('Unable to claim invitation',{status:503})
 const row=claimed?.[0] as {id:number;email:string;claim_token:string;unsubscribe_token:string}|undefined
 if(!row)return new Response(JSON.stringify({sent:0}),{headers:{'Content-Type':'application/json'}})
 let sent=false
 try{
   const unsub=new URL('/functions/v1/sat-waitlist-unsubscribe',url)
   unsub.searchParams.set('token',row.unsubscribe_token)
   const response=await fetch('https://api.resend.com/emails',{
     method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',
       'Idempotency-Key':`sat-la-invite-${row.id}`},
     body:JSON.stringify({from:sender,to:[row.email],subject:'SAT Daily Practice registration update',
       text:`A registration place may be available. Your registration place is reserved for 24 hours. Visit ${site.toString()} and sign up using this email address before the reservation expires. To stop waitlist emails, use this link: ${unsub.toString()}`})
   })
   sent=response.ok
 }catch{sent=false}
 const {data:finished,error:finishError}=await db.rpc('sat_finish_waitlist_invite',{
   invite_id:row.id,token:row.claim_token,was_sent:sent
 })
 if(finishError||!finished)return new Response('Invite status requires operator review',{status:503})
 if(!sent)return new Response('Email provider rejected invitation',{status:502})
 return new Response(JSON.stringify({sent:1}),{headers:{'Content-Type':'application/json'}})
})
