import {createClient} from 'npm:@supabase/supabase-js@2.57.4'

// Operator verifies external payment independently before using this endpoint.
// Never expose LA_OPERATOR_SECRET to the browser.
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405})
 const secret=Deno.env.get('LA_OPERATOR_SECRET')
 if(!secret||req.headers.get('x-la-operator-secret')!==secret)
   return new Response('Forbidden',{status:403})
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
 if(!url||!key)return new Response('Service unavailable',{status:503})
 let body:{paymentReference?:string;provider?:string;operator?:string}
 try{body=await req.json()}catch{return new Response('Invalid request',{status:400})}
 const reference=body.paymentReference?.trim()
 const operator=body.operator?.trim()
 const provider=body.provider
 if(!reference||reference.length<4||reference.length>200||!operator
    ||operator.length<2||operator.length>100
    ||!['paypal','venmo','other'].includes(provider??''))
  return new Response('Verified payment reference, operator and provider are required',{status:400})
 const random=crypto.getRandomValues(new Uint8Array(18))
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
 const groups=[0,1,2].map(group=>Array.from(random.slice(group*6,group*6+6),
  byte=>alphabet[byte%alphabet.length]).join(''))
 const activationCode='SAT-'+groups.join('-')
 const db=createClient(url,key,{auth:{persistSession:false}})
 const {error}=await db.rpc('sat_issue_prepaid_code',{
  p_code:activationCode,p_issued_by:operator,
  p_payment_reference:reference,p_provider:provider
 })
 if(error)return new Response('Unable to issue code. Check whether this payment reference was already used.',{status:409})
 return new Response(JSON.stringify({activationCode,expiresInDays:90,usage:'single-use',renewal:'none'}),{
  headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
})
