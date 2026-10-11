import Stripe from 'npm:stripe@17.7.0'
import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const key=Deno.env.get('STRIPE_SECRET_KEY'),secret=Deno.env.get('STRIPE_WEBHOOK_SECRET')
 const url=Deno.env.get('SUPABASE_URL'),role=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!key||!secret||!url||!role)return new Response('Service unavailable',{status:503})
 const stripe=new Stripe(key)
 let event:Stripe.Event
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),req.headers.get('stripe-signature')??'',secret)}
 catch{return new Response('Invalid signature',{status:400})}
 const db=createClient(url,role,{auth:{persistSession:false}})
 if(event.type==='checkout.session.completed'){
  const session=event.data.object as Stripe.Checkout.Session
  if(session.payment_status!=='paid'||session.metadata?.product!=='sat-90-day-pass')return new Response('Ignored',{status:200})
  const uid=session.client_reference_id
  if(!uid)return new Response('Missing user',{status:400})
  const payment=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id??null
  const {data:existing,error:readError}=await db.from('sat_access_passes').select('id').eq('checkout_session_id',session.id).maybeSingle()
  if(readError)return new Response('Database unavailable',{status:503})
  if(!existing){
   const start=new Date((session.created??Math.floor(Date.now()/1000))*1000)
   const end=new Date(start.getTime()+90*24*3600*1000)
   const {error}=await db.from('sat_access_passes').insert({
    user_id:uid,checkout_session_id:session.id,payment_intent_id:payment,
    purchased_at:start.toISOString(),starts_at:start.toISOString(),expires_at:end.toISOString()
   })
   if(error&&!error.message.includes('duplicate'))return new Response('Database unavailable',{status:503})
  }
 }else if(event.type==='charge.refunded'){
  const charge=event.data.object as Stripe.Charge
  const intent=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id
  if(intent){
   const {error}=await db.from('sat_access_passes').update({refunded_at:new Date().toISOString()}).eq('payment_intent_id',intent)
   if(error)return new Response('Database unavailable',{status:503})
  }
 }
 return new Response('ok',{status:200})
})
