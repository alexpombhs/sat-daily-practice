import {useEffect,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import AlexDropdown from '../atoms/AlexDropdown'
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
  currentPracticeTest?:PracticeTestFilter
  sessionSummary:string
  activeSession?:ActiveSessionSummary|null
  sessionHistory?:LastSessionSummary[]
  onStartTest:(value:PracticeTestFilter)=>void
  onOpenSetup:()=>void
  onResumeSession?:()=>void
  onEndSession?:()=>void
  onReviewSession?:(sessionId:string)=>void
}

export default function PracticeTestsDashboard({tests,currentPracticeTest='all',sessionSummary,activeSession,sessionHistory=[],onStartTest,onOpenSetup,onResumeSession,onEndSession,onReviewSession}:Props){
  const[selectedReviewSession,setSelectedReviewSession]=useState(sessionHistory[0]?.id??'')
  const[selectedTest,setSelectedTest]=useState<PracticeTestFilter>(currentPracticeTest)
  useEffect(()=>{
    if(!sessionHistory.length){
      setSelectedReviewSession('')
      return
    }
    if(!sessionHistory.some(session=>session.id===selectedReviewSession))setSelectedReviewSession(sessionHistory[0].id)
  },[sessionHistory,selectedReviewSession])
  useEffect(()=>{setSelectedTest(currentPracticeTest)},[currentPracticeTest])
  const reviewSessionOptions=sessionHistory.map(session=>({
    value:session.id,
    label:`${new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(session.endedAt))} · ${session.accuracy}% · ${session.total} question${session.total===1?'':'s'}`,
  }))

  const selectedTestSummary=selectedTest==='all'
    ?{
      questionCount:tests.reduce((sum,test)=>sum+test.questionCount,0),
      practicedCount:tests.reduce((sum,test)=>sum+test.practicedCount,0),
    }
    :tests.find(test=>test.value===selectedTest)
  const testOptions=[
    {value:'all' as PracticeTestFilter,label:`All available tests · ${tests.reduce((sum,test)=>sum+test.questionCount,0)} questions`},
    ...tests.map(test=>({
      value:test.value,
      label:`${test.label} · ${test.questionCount} questions`,
    })),
  ]

  return <AlexBox component="section" sx={{width:'100%',px:{xs:.5,sm:1.5,md:2.5,lg:4},py:{xs:2,sm:2.75,lg:4}}}>
    <AlexBox sx={{maxWidth:960,mx:'auto'}}>
      <AlexText component="h1" sx={{fontFamily:'Georgia, "Times New Roman", serif',fontSize:{xs:28,sm:32,lg:36},fontWeight:500,lineHeight:1.12,m:0,color:'#08275B'}}>Practice</AlexText>
      <AlexText sx={{fontSize:15,color:'#667085',mt:1}}>Choose a test, confirm your setup, and start a session.</AlexText>

      {activeSession&&<AlexSurface sx={{mt:3,p:2,border:'1px solid #C7D7FE',borderRadius:2.5,bgcolor:'#F5F8FF',display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:2,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#3448A3'}}>Session in progress</AlexText>
          <AlexText sx={{mt:.35,fontSize:15,fontWeight:800,color:'#08275B'}}>{activeSession.answeredCount} of {activeSession.questionCount} answered</AlexText>
          <AlexText sx={{mt:.25,fontSize:12.5,color:'#667085'}}>Last activity {new Date(activeSession.lastActivityAt).toLocaleString()}</AlexText>
        </AlexBox>
        <AlexBox sx={{display:'flex',gap:1,width:{xs:'100%',sm:'auto'},flexDirection:{xs:'column',sm:'row'}}}>
          <AlexButton fullWidth onClick={onResumeSession} sx={{width:{xs:'100%',sm:'auto'}}}>Resume</AlexButton>
          <AlexButton fullWidth tone="secondary" onClick={onEndSession} sx={{width:{xs:'100%',sm:'auto'}}}>End session</AlexButton>
        </AlexBox>
      </AlexSurface>}

      <AlexSurface sx={{mt:activeSession?2:3,px:{xs:2.5,md:3},border:'1px solid #E4E7EC',borderRadius:2.5,bgcolor:'#fff'}}>
        <PracticeSettingField
          label="Practice test"
          helperText={selectedTestSummary
            ?`${selectedTestSummary.practicedCount} of ${selectedTestSummary.questionCount} practiced`
            :'Choose one test or mix all available questions.'}
          control={<AlexDropdown
            id="practice-test-launch"
            label="Question source"
            value={selectedTest}
            options={testOptions}
            onChange={setSelectedTest}
          />}
        />
        <AlexBox sx={{borderTop:'1px solid #EAECF0'}}>
          <PracticeSettingField
            label="Current setup"
            helperText={sessionSummary}
            control={<AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'minmax(0,1fr) 120px'},gap:1,alignItems:'center'}}>
              <AlexButton onClick={()=>onStartTest(selectedTest)} sx={{width:'100%'}}>Start practice</AlexButton>
              <AlexButton tone="secondary" onClick={onOpenSetup} sx={{width:'100%'}}>Edit setup</AlexButton>
            </AlexBox>}
          />
        </AlexBox>
      </AlexSurface>

      {sessionHistory.length>0&&<AlexSurface sx={{mt:2,px:{xs:2.5,md:3},border:'1px solid #E4E7EC',bgcolor:'#fff'}}>
        <SessionReviewSelector
          value={selectedReviewSession}
          options={reviewSessionOptions}
          onChange={setSelectedReviewSession}
          onReview={()=>selectedReviewSession&&onReviewSession?.(selectedReviewSession)}
        />
      </AlexSurface>}
    </AlexBox>
  </AlexBox>
}
