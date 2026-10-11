import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexText from '../atoms/AlexText'

type Props={kind:'privacy'|'terms';onBack:()=>void}
const operator=(import.meta.env.VITE_OPERATOR_NAME as string|undefined)?.trim()||'[Operator information pending]'
const support=(import.meta.env.VITE_SUPPORT_EMAIL as string|undefined)?.trim()
const approved=import.meta.env.VITE_LEGAL_APPROVED==='true'

export default function LegalPage({kind,onBack}:Props){
 const title=kind==='privacy'?'Privacy Notice':'Terms of Use'
 return <main className="shell" style={{maxWidth:850,margin:'0 auto'}}>
  <article className="card" style={{padding:'clamp(18px,4vw,36px)'}}>
   <AlexBox sx={{display:'flex',flexDirection:'column',gap:2.25}}>
    <AlexButton tone="quiet" onClick={onBack} sx={{alignSelf:'flex-start'}}>Back to SAT Daily Practice</AlexButton>
    <AlexText component="h1" sx={{fontSize:30,fontWeight:850,m:0}}>{title}</AlexText>
    {!approved&&<AlexText role="status" sx={{fontSize:13,fontWeight:750,color:'warning.main'}}>Draft — awaiting final operator and legal approval</AlexText>}
    <AlexText>Service operator: {operator}. Contact: {support?<a href={`mailto:${support}`}>{support}</a>:'[Support email pending]'}</AlexText>
    {kind==='privacy'?<>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Who can use the service?</AlexText>
     <AlexText>SAT Daily Practice is for students ages 13 and older. The date of birth is checked for signup eligibility before collecting an account email or password. We do not retain the full birthdate in the account metadata after signup.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Information we use</AlexText>
     <AlexText>We use account email, an optional display name, practice answers and sessions, study preferences and security events to operate the service and sync eligible accounts across devices. We do not require a school, grade, biography, or parent contact.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Service providers</AlexText>
     <AlexText>Supabase processes authentication and app records. Cloudflare Turnstile helps prevent automated signups. Resend delivers waitlist emails. Stripe processes optional one-time purchases through hosted checkout; the app does not store your full payment-card number.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Free practice and waitlist</AlexText>
     <AlexText>Free users can complete two random ten-question sessions each day. Detailed free-session records are intended for immediate feedback rather than permanent history. Waitlist emails must be confirmed, and email messages include a removal link. Unverified waitlist requests are scheduled for removal after seven days.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Your choices</AlexText>
     <AlexText>Users can delete their account through account settings. They can also contact support to request access, correction or deletion where required by applicable law. Some backup, payment and security logs may have separate retention requirements.</AlexText>
     <AlexText>We do not design this service to sell student personal information or serve behavioral advertisements. Any new analytics or processors must be disclosed before use.</AlexText>
    </>:<>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Eligibility and accounts</AlexText>
     <AlexText>You must be at least 13 years old to create an account. Keep login credentials secure. A parent or other eligible account holder may need to complete payments for students under 18, depending on the payment provider and applicable law.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Access options</AlexText>
     <AlexText>Free access includes two random ten-question sessions per day. Optional early-adopter Plus access is a one-time $10 payment for 90 days. Payments do not automatically recur, and access does not renew automatically. Additional purchases add another 90-day access period.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Learning estimates</AlexText>
     <AlexText>Study recommendations and estimated scores are informational. We cannot guarantee higher SAT scores, admission decisions, or scholarships.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Acceptable use and rights</AlexText>
     <AlexText>Use the service for personal study. Do not attempt unauthorized access, automated mass registration or content redistribution. SAT Daily Practice is independent and is not endorsed by or affiliated with College Board. Trademarks belong to their respective owners.</AlexText>
     <AlexText component="h2" sx={{fontSize:20,fontWeight:700}}>Purchases and support</AlexText>
     <AlexText>Refund, consumer-rights, jurisdiction and operator-contact details must be completed and approved before paid checkout is enabled. Contact the service operator about purchase or account questions.</AlexText>
    </>}
   </AlexBox>
  </article>
 </main>
}
