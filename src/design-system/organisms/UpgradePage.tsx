import {CheckCircle2,Sparkles} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'

const freeFeatures=[
  '2 practice sessions every day',
  '10 randomly selected SAT questions per session',
  'Instant feedback on your answers',
  'Detailed answer explanations',
  'End-of-session performance summary',
]
const proFeatures=[
  'Unlimited practice sessions',
  'Customize the number of questions in each session',
  'Choose practice sets, difficulty and practice modes',
  'Targeted practice for missed questions and concepts',
  'Personalized study plan based on your goals and SAT date',
  'Full performance dashboard and practice history',
  'Estimated SAT score and performance trends',
  'Daily goals, practice calendar and streak tracking',
  'Personalized vocabulary practice',
]

type Props={onPractice:()=>void;onAccount:()=>void;signedIn:boolean}

function FeatureList({items}:{items:string[]}){
  return <AlexBox component="ul" sx={{listStyle:'none',p:0,m:0,display:'grid',gap:1.5}}>
    {items.map(item=><AlexBox component="li" key={item} sx={{display:'flex',alignItems:'flex-start',gap:1.1,color:'#344054',fontSize:{xs:14,sm:15},lineHeight:1.45}}>
      <CheckCircle2 size={19} color="#188457" style={{flexShrink:0,marginTop:2}} aria-hidden="true"/>
      <span>{item}</span>
    </AlexBox>)}
  </AlexBox>
}

export default function UpgradePage({onPractice,onAccount,signedIn}:Props){
  return <AlexBox component="main" sx={{maxWidth:1060,mx:'auto',px:{xs:.5,sm:2},py:{xs:3,md:5},pb:7}}>
    <AlexBox sx={{textAlign:'center',maxWidth:670,mx:'auto',mb:{xs:3,md:5}}}>
      <AlexBox component="p" sx={{textTransform:'uppercase',fontWeight:850,letterSpacing:1.6,fontSize:12,color:'#188457',mb:1}}>SAT Daily Practice</AlexBox>
      <AlexBox component="h1" sx={{fontFamily:'Georgia, serif',fontSize:{xs:32,sm:40,md:48},lineHeight:1.13,letterSpacing:'-.035em',color:'#08275B',m:0}}>
        Find your practice rhythm.
      </AlexBox>
      <AlexBox component="p" sx={{fontSize:{xs:15,sm:17},color:'#667085',lineHeight:1.55,mt:2,mb:0}}>
        Start with free daily practice or make every session your own with Early Adopter access.
      </AlexBox>
    </AlexBox>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',md:'repeat(2,minmax(0,1fr))'},alignItems:'stretch',gap:{xs:2.5,md:3}}}>
      <AlexBox component="section" aria-labelledby="free-plan-heading" sx={{bgcolor:'#fff',border:'1px solid #DDE4ED',borderRadius:3,p:{xs:3,sm:4},display:'flex',flexDirection:'column',gap:2.3,minWidth:0}}>
        <AlexBox>
          <AlexBox component="h2" id="free-plan-heading" sx={{fontSize:21,m:0,color:'#08275B'}}>Free</AlexBox>
          <AlexBox sx={{display:'flex',alignItems:'baseline',gap:1,mt:1}}>
            <AlexBox component="strong" sx={{fontSize:42,lineHeight:1.1,color:'#08275B'}}>$0</AlexBox>
            <AlexBox component="span" sx={{color:'#667085',fontSize:14}}>Forever free</AlexBox>
          </AlexBox>
          <AlexBox component="p" sx={{fontSize:16,fontWeight:750,color:'#344054',mt:1.5,mb:.5}}>Build your daily SAT practice habit.</AlexBox>
          <AlexBox component="p" sx={{color:'#667085',lineHeight:1.5,m:0,fontSize:14}}>Practice consistently, learn from each question, and build confidence every day.</AlexBox>
        </AlexBox>
        <AlexBox sx={{borderTop:'1px solid #E8EDF2',pt:2.5,flex:1}}>
          <AlexBox component="h3" sx={{fontSize:14,fontWeight:850,color:'#08275B',mt:0,mb:2}}>What's included</AlexBox>
          <FeatureList items={freeFeatures}/>
        </AlexBox>
        <AlexButton tone="secondary" fullWidth onClick={onPractice} sx={{mt:1,minHeight:46,borderRadius:2}}>Start practicing free</AlexButton>
      </AlexBox>
      <AlexBox component="section" aria-labelledby="early-adopter-plan-heading" sx={{bgcolor:'#F7FBFF',border:'2px solid #0B376D',borderRadius:3,p:{xs:3,sm:4},display:'flex',flexDirection:'column',gap:2.3,minWidth:0}}>
        <AlexBox>
          <AlexBox sx={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:1}}>
            <AlexBox component="h2" id="early-adopter-plan-heading" sx={{fontSize:21,m:0,color:'#08275B'}}>Early Adopter</AlexBox>
            <AlexBox component="span" sx={{display:'inline-flex',alignItems:'center',gap:.6,px:1.4,py:.55,borderRadius:5,bgcolor:'#E0F5E9',fontWeight:800,color:'#176744',fontSize:12}}><Sparkles size={14}/> Introductory offer</AlexBox>
          </AlexBox>
          <AlexBox sx={{display:'flex',alignItems:'baseline',gap:1,mt:1}}>
            <AlexBox component="strong" sx={{fontSize:42,lineHeight:1.1,color:'#08275B'}}>$10</AlexBox>
            <AlexBox component="span" sx={{color:'#667085',fontSize:14}}>for 3 months</AlexBox>
          </AlexBox>
          <AlexBox component="p" sx={{fontSize:16,fontWeight:750,color:'#344054',mt:1.5,mb:.5}}>Practice your way. Track your progress.</AlexBox>
          <AlexBox component="p" sx={{color:'#667085',lineHeight:1.5,m:0,fontSize:14}}>Personalize your preparation, focus your efforts, and see how you're improving.</AlexBox>
        </AlexBox>
        <AlexBox sx={{borderTop:'1px solid #DFE7F0',pt:2.5,flex:1}}>
          <AlexBox component="h3" sx={{fontSize:14,fontWeight:850,color:'#08275B',mt:0,mb:2}}>Everything in Free, plus</AlexBox>
          <FeatureList items={proFeatures}/>
        </AlexBox>
        <AlexBox>
          <AlexButton fullWidth onClick={onAccount} sx={{mt:1,minHeight:46,borderRadius:2}}>{signedIn?'View your account':'Create an account'}</AlexButton>
          <AlexBox component="p" sx={{textAlign:'center',color:'#667085',fontSize:12,lineHeight:1.5,mt:1.25,mb:0}}>One-time payment · 90 days of access · No automatic renewal</AlexBox>
          <AlexBox component="p" sx={{textAlign:'center',color:'#667085',fontSize:12,lineHeight:1.5,mt:1,mb:0}}>Checkout will be available when payments launch.</AlexBox>
        </AlexBox>
      </AlexBox>
    </AlexBox>
  </AlexBox>
}
