import {useEffect,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import PracticeTestCard from '../molecules/PracticeTestCard'
import SessionReviewSelector from '../molecules/SessionReviewSelector'
import PracticeSettingField from '../molecules/PracticeSettingField'
import type {PracticeTestFilter} from '../../types'

type TestSummary={
  value:PracticeTestFilter
  label:string
  questionCount:number
  practicedCount:number
}

type ActiveSessionSummary={
  questionCount:number
  answeredCount:number
  lastActivityAt:string
}

type LastSessionSummary={
  id:string
  endedAt:string
  correct:number
  total:number
  accuracy:number
}

type Props={
  tests:TestSummary[]
  sessionSummary:string
  activeSession?:ActiveSessionSummary|null
  sessionHistory?:LastSessionSummary[]
  onStartTest:(value:PracticeTestFilter)=>void
  onOpenSetup:()=>void
  onResumeSession?:()=>void
  onEndSession?:()=>void
  onReviewSession?:(sessionId:string)=>void
}

export default function PracticeTestsDashboard({tests,sessionSummary,activeSession,sessionHistory=[],onStartTest,onOpenSetup,onResumeSession,onEndSession,onReviewSession}:Props){
  const[selectedReviewSession,setSelectedReviewSession]=useState(sessionHistory[0]?.id??'')
  useEffect(()=>{
    if(!sessionHistory.length){
      setSelectedReviewSession('')
      return
    }
    if(!sessionHistory.some(session=>session.id===selectedReviewSession))setSelectedReviewSession(sessionHistory[0].id)
  },[sessionHistory,selectedReviewSession])
  const reviewSessionOptions=sessionHistory.map(session=>({
    value:session.id,
    label:`${new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(session.endedAt))} · ${session.accuracy}% · ${session.total} question${session.total===1?'':'s'}`,
  }))

  return <AlexBox component="section" sx={{width:'100%',px:{xs:.5,sm:1.5,md:2.5,lg:4},py:{xs:2,sm:2.75,lg:4}}}>
    <AlexBox sx={{maxWidth:960,mx:'auto'}}>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:28,sm:32,lg:36},fontWeight:500,lineHeight:1.12,m:0,color:'#08275B'}}>Practice tests</AlexText>
      <AlexText sx={{fontSize:15,color:'#667085',mt:1}}>Pick a question source and start with your current session setup.</AlexText>

      {activeSession&&<AlexSurface sx={{mt:3,p:2,border:'1px solid #C7D7FE',borderRadius:2.5,bgcolor:'#F5F8FF',display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:2,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#3448A3'}}>Session in progress</AlexText>
          <AlexText sx={{mt:.35,fontSize:15,fontWeight:800,color:'#08275B'}}>{activeSession.answeredCount} of {activeSession.questionCount} answered</AlexText>
          <AlexText sx={{mt:.25,fontSize:12.5,color:'#667085'}}>Last activity {new Date(activeSession.lastActivityAt).toLocaleString()} · Resume on this device without losing your place.</AlexText>
        </AlexBox>
        <AlexBox sx={{display:'flex',gap:1,width:{xs:'100%',sm:'auto'},flexDirection:{xs:'column',sm:'row'}}}>
          <AlexButton fullWidth onClick={onResumeSession} sx={{width:{xs:'100%',sm:'auto'}}}>Resume session</AlexButton>
          <AlexButton fullWidth tone="secondary" onClick={onEndSession} sx={{width:{xs:'100%',sm:'auto'}}}>End session</AlexButton>
        </AlexBox>
      </AlexSurface>}

      <AlexSurface sx={{mt:activeSession?2:3,px:{xs:2.5,md:3},border:'1px solid #E4E7EC',bgcolor:'#F8FAFC'}}>
        <PracticeSettingField
          label="Current setup"
          helperText={sessionSummary}
          control={<AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'minmax(0,1fr) 110px'},gap:1,alignItems:'center'}}>
            <AlexBox/>
            <AlexButton tone="secondary" onClick={onOpenSetup} sx={{width:'100%'}}>Edit setup</AlexButton>
          </AlexBox>}
        />
      </AlexSurface>

      {sessionHistory.length>0&&<AlexSurface sx={{mt:2,px:{xs:2.5,md:3},border:'1px solid #E4E7EC',bgcolor:'#fff'}}>
        <SessionReviewSelector
          value={selectedReviewSession}
          options={reviewSessionOptions}
          onChange={setSelectedReviewSession}
          onReview={()=>selectedReviewSession&&onReviewSession?.(selectedReviewSession)}
        />
      </AlexSurface>}

      <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'repeat(2,minmax(0,1fr))'},gap:{xs:1,sm:1.5},mt:2}}>
        {tests.map(test=><PracticeTestCard
          key={test.value}
          title={test.label}
          questionCount={test.questionCount}
          practicedCount={test.practicedCount}
          onStart={()=>onStartTest(test.value)}
        />)}
      </AlexBox>
    </AlexBox>
  </AlexBox>
}
