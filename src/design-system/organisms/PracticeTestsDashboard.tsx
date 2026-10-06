import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import PracticeTestCard from '../molecules/PracticeTestCard'
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
  lastSession?:LastSessionSummary|null
  sessionHistory?:LastSessionSummary[]
  onStartTest:(value:PracticeTestFilter)=>void
  onOpenSetup:()=>void
  onResumeSession?:()=>void
  onEndSession?:()=>void
  onReviewLastSession?:()=>void
  onReviewSession?:(sessionId:string)=>void
}

export default function PracticeTestsDashboard({tests,sessionSummary,activeSession,lastSession,sessionHistory=[],onStartTest,onOpenSetup,onResumeSession,onEndSession,onReviewLastSession,onReviewSession}:Props){
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

      {lastSession&&<AlexSurface sx={{mt:activeSession?2:3,p:2,border:'1px solid #D8E6DD',borderRadius:2.5,bgcolor:'#F7FBF8',display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:2,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#28734A'}}>Last completed session</AlexText>
          <AlexText sx={{mt:.35,fontSize:15,fontWeight:800,color:'#08275B'}}>{lastSession.accuracy}% · {lastSession.correct} of {lastSession.total} correct</AlexText>
          <AlexText sx={{mt:.25,fontSize:12.5,color:'#667085'}}>Completed {new Date(lastSession.endedAt).toLocaleString()} · Reopen the test-style review with answers and explanations.</AlexText>
        </AlexBox>
        <AlexButton fullWidth tone="secondary" onClick={onReviewLastSession} sx={{width:{xs:'100%',sm:'auto'}}}>Review last session</AlexButton>
      </AlexSurface>}

      <AlexSurface sx={{mt:(activeSession||lastSession)?2:3,p:2,border:'1px solid #E4E7EC',borderRadius:2.5,bgcolor:'#F8FAFC',display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:2,flexDirection:{xs:'column',sm:'row'}}}>
        <AlexBox>
          <AlexText sx={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em',color:'#667085'}}>Current setup</AlexText>
          <AlexText sx={{mt:.35,fontSize:14.5,fontWeight:700,color:'#08275B'}}>{sessionSummary}</AlexText>
        </AlexBox>
        <AlexButton fullWidth tone="secondary" onClick={onOpenSetup} sx={{width:{xs:'100%',sm:'auto'}}}>Edit setup</AlexButton>
      </AlexSurface>

      {sessionHistory.length>0&&<AlexSurface sx={{mt:2,p:2,border:'1px solid #E4E7EC',borderRadius:2.5,bgcolor:'#fff'}}>
        <AlexBox sx={{display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:2,mb:1.25}}>
          <AlexBox>
            <AlexText sx={{fontSize:12,fontWeight:850,textTransform:'uppercase',letterSpacing:'.06em',color:'#667085'}}>Session history</AlexText>
            <AlexText sx={{mt:.25,fontSize:13,color:'#667085'}}>Review any completed session using the same read-only test UI.</AlexText>
          </AlexBox>
          <AlexText sx={{fontSize:12.5,color:'#667085',whiteSpace:'nowrap'}}>{sessionHistory.length} completed</AlexText>
        </AlexBox>
        <AlexBox sx={{display:'grid',maxHeight:320,overflowY:'auto',borderTop:'1px solid #EAECF0'}}>
          {sessionHistory.map(session=><AlexBox key={session.id} sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1.5,py:1.25,borderBottom:'1px solid #EAECF0',flexDirection:{xs:'column',sm:'row'}}}>
            <AlexBox>
              <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>{session.accuracy}% · {session.correct} of {session.total} correct</AlexText>
              <AlexText sx={{fontSize:12.5,color:'#667085',mt:.2}}>{new Date(session.endedAt).toLocaleString()}</AlexText>
            </AlexBox>
            <AlexButton tone="secondary" onClick={()=>onReviewSession?.(session.id)} sx={{width:{xs:'100%',sm:'auto'}}}>Review session</AlexButton>
          </AlexBox>)}
        </AlexBox>
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
