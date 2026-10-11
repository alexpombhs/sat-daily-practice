import Stripe from 'npm:stripe@17.7.0'
import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const bearer=req.headers.get('Authorization')??''
 if(!bearer.startsWith('Bearer '))return new Response('Sign in required',{status:401})
 const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY')
 const stripeKey=Deno.env.get('STRIPE_SECRET_KEY'),price=Deno.env.get('STRIPE_LA_PRICE_ID')
 const site=Deno.env.get('LA_APP_URL')
 if(!url||!anon||!stripeKey||!price||!site)return new Response('Checkout not configured',{status:503})
 const visitor=createClient(url,anon,{auth:{persistSession:false}})
 const {data:{user},error}=await visitor.auth.getUser(bearer.slice(7))
 if(error||!user||!user.email)return new Response('Authentication required',{status:401})
 const origin=new URL(site)
 if(origin.protocol!=='https:')return new Response('Invalid site configuration',{status:503})
 const stripe=new Stripe(stripeKey)
 const session=await stripe.checkout.sessions.create({
  mode:'payment',customer_email:user.email,client_reference_id:user.id,
  line_items:[{price,quantity:1}],
  success_url:new URL('account?checkout=success',origin.href.endsWith('/')?origin.href:origin.href+'/').toString(),
  cancel_url:new URL('account?checkout=cancelled',origin.href.endsWith('/')?origin.href:origin.href+'/').toString(),
  metadata:{user_id:user.id,product:'sat-90-day-pass'},
 })
 return new Response(JSON.stringify({url:session.url}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
})
