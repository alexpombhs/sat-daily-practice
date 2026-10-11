import Stripe from 'npm:stripe@17.7.0'
import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS',
 'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info'}
const errorResponse=(message:string,status:number)=>new Response(message,{status,headers:{...cors,'Cache-Control':'no-store'}})

Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors})
 if(req.method!=='POST')return errorResponse('Method not allowed',405)
 if(Deno.env.get('LA_CHECKOUT_ENABLED')!=='true'
 ||Deno.env.get('SAT_CONTENT_RIGHTS_APPROVED')!=='true'
 ||Deno.env.get('SAT_LEGAL_APPROVED')!=='true')
  return errorResponse('Paid access is not yet available',503)
 const bearer=req.headers.get('Authorization')??''
 if(!bearer.startsWith('Bearer '))return errorResponse('Sign in required',401)
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY')
 const stripeKey=Deno.env.get('STRIPE_SECRET_KEY'),price=Deno.env.get('STRIPE_LA_PRICE_ID')
 const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 const site=Deno.env.get('LA_APP_URL')
 if(!url||!anon||!serviceKey||!stripeKey||!price||!site)return errorResponse('Checkout not configured',503)
 const visitor=createClient(url,anon,{auth:{persistSession:false}})
 const {data:{user},error}=await visitor.auth.getUser(bearer.slice(7))
 if(error||!user||!user.email)return errorResponse('Authentication required',401)
 let origin:URL
 try{origin=new URL(site);if(origin.protocol!=='https:')throw Error('Invalid URL')}
 catch{return errorResponse('Invalid site configuration',503)}
 try{
  const admin=createClient(url,serviceKey,{auth:{persistSession:false}})
  const {data:contentCleared,error:clearanceError}=await admin.rpc('sat_commercial_content_is_cleared')
  if(clearanceError||contentCleared!==true)return errorResponse('Paid content is not yet cleared for sale',503)
  const stripe=new Stripe(stripeKey)
  const verifiedPrice=await stripe.prices.retrieve(price)
  if(!verifiedPrice.active||verifiedPrice.currency!=='usd'
     ||verifiedPrice.unit_amount!==1000||verifiedPrice.recurring)
   return errorResponse('One-time pricing is not configured correctly',503)
  const base=origin.href.endsWith('/')?origin.href:origin.href+'/'
  const session=await stripe.checkout.sessions.create({
   mode:'payment',payment_method_types:['card'],
   customer_email:user.email,client_reference_id:user.id,
   line_items:[{price,quantity:1}],
   success_url:new URL('account?checkout=success',base).toString(),
   cancel_url:new URL('account?checkout=cancelled',base).toString(),
   metadata:{user_id:user.id,product:'sat-90-day-pass'},
  })
  if(!session.url)return errorResponse('Checkout unavailable',503)
  return new Response(JSON.stringify({url:session.url}),{headers:{...cors,'Content-Type':'application/json','Cache-Control':'no-store'}})
 }catch{return errorResponse('Checkout temporarily unavailable',503)}
})
