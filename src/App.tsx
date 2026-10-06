import {useEffect,useState,type ReactNode} from 'react'
import {CalendarDays,Clock3,ListChecks,PenLine,Target} from 'lucide-react'
import AlexBox from './design-system/atoms/AlexBox'
import AlexButton from './design-system/atoms/AlexButton'
import AlexStatusChip from './design-system/atoms/AlexStatusChip'
import AlexTabs from './design-system/atoms/AlexTabs'
import ExplanationContent from './design-system/molecules/ExplanationContent'
import ParsingIssueReporter from './design-system/molecules/ParsingIssueReporter'
import DashboardCard from './design-system/molecules/DashboardCard'
import QuestionContent from './design-system/molecules/QuestionContent'
import AccountAuthPanel from './design-system/organisms/AccountAuthPanel'
import AppSidebarLayout from './design-system/organisms/AppSidebarLayout'
import ParsingIssuesDashboard from './design-system/organisms/ParsingIssuesDashboard'
import PerformanceDashboard,{type PerformanceTimeRange} from './design-system/organisms/PerformanceDashboard'
import DailyPracticeGoals from './design-system/organisms/DailyPracticeGoals'
import PracticeAnswerPanel from './design-system/organisms/PracticeAnswerPanel'
import PracticeSessionHeader from './design-system/organisms/PracticeSessionHeader'
import PracticeSetupPanel from './design-system/organisms/PracticeSetupPanel'
import PracticeTestsDashboard from './design-system/organisms/PracticeTestsDashboard'
import StudyPlanCalendar from './design-system/organisms/StudyPlanCalendar'
import StudyPlanHero from './design-system/organisms/StudyPlanHero'
import QuestionBankReview from './design-system/organisms/QuestionBankReview'
import {dashboardTypography} from './design-system/theme'
import {answerLabel,matchesAnswer} from './lib/answerCompare'
import {getPdf} from './lib/pdfStore'
import {availablePracticeTests,moduleLabel,practiceTestLabel,QUESTION_BANK} from './lib/questionBank'
import {buildPracticePlanRecommendation} from './lib/practicePlan'
import {buildNationalMeritOutlook} from './lib/nationalMeritOutlook'
import {loadSharedQuestionBank,mergeQuestionBanks} from './lib/sharedQuestionBank'
import {choosePracticeQuestions,countFailedPracticeQuestions,countMissedPracticeQuestions,formatDuration,summarizePerformance,summarizeSession} from './lib/practiceGamification'
import {pathForView,viewFromPathname,type AppRouteView} from './lib/appRoutes'
import {DEFAULT_SETTINGS} from './lib/storage'
import {abandonActiveSession,createActiveSession,getCurrentAuthUser,loadActiveSession,loadCloudHistory,loadUserSettings,saveActiveSessionProgress,saveUserSettings,subscribeToAuth,syncActiveAttempt,syncSession,type AuthUser} from './lib/supabase'
import type {ActivePracticeSession,Attempt,PracticeQuestion,SessionSummary,Settings,SubjectMode} from './types'

const uid=()=>crypto.randomUUID()

type View=AppRouteView
type SidebarKey='dashboard'|'practice-tests'|'practice-setup'|'question-bank'|'parsing-issues'|'performance'|'resources'

export default function App(){
  const[settings,setSettings]=useState<Settings>(()=>({...DEFAULT_SETTINGS}))
  const[qpdf,setQpdf]=useState<ArrayBuffer|null>(null)
  const[apdf,setApdf]=useState<ArrayBuffer|null>(null)
  const[attempts,setAttempts]=useState<Attempt[]>([])
  const[sessions,setSessions]=useState<SessionSummary[]>([])
  const[qs,setQs]=useState<PracticeQuestion[]>([])
  const[sid,setSid]=useState('')
  const[started,setStarted]=useState('')
  const[i,setI]=useState(0)
  const[qStart,setQStart]=useState(0)
  const[selected,setSelected]=useState('')
  const[submitted,setSubmitted]=useState(false)
  const[currentAttempts,setCurrentAttempts]=useState<Attempt[]>([])
  const[view,setView]=useState<View>(()=>viewFromPathname(window.location.pathname))
  const[sidebarCollapsed,setSidebarCollapsed]=useState(false)
  const[authUser,setAuthUser]=useState<AuthUser|null>(null)
  const[authReady,setAuthReady]=useState(false)
  const[settingsCloudReady,setSettingsCloudReady]=useState(false)
  const[questionBank,setQuestionBank]=useState<PracticeQuestion[]>(()=>QUESTION_BANK)
  const[resumableSession,setResumableSession]=useState<ActivePracticeSession|null>(null)
  const[reviewMode,setReviewMode]=useState(false)
  const[reviewContentTab,setReviewContentTab]=useState<'question'|'explanation'>('question')
  const[performanceTimeRange,setPerformanceTimeRange]=useState<PerformanceTimeRange>('30d')
  const[performanceCustomStart,setPerformanceCustomStart]=useState('')
  const[performanceCustomEnd,setPerformanceCustomEnd]=useState('')

  function navigateTo(next:View,{replace=false}:{replace?:boolean}={}){
    setView(next)
    const path=pathForView(next)
    if(window.location.pathname===path)return
    if(replace)window.history.replaceState({},'',path)
    else window.history.pushState({},'',path)
  }

  useEffect(()=>{
    const handlePopState=()=>setView(viewFromPathname(window.location.pathname))
    window.addEventListener('popstate',handlePopState)
    const initial=viewFromPathname(window.location.pathname)
    const canonical=pathForView(initial)
    if(window.location.pathname!==canonical)window.history.replaceState({},'',canonical)
    return()=>window.removeEventListener('popstate',handlePopState)
  },[])

  useEffect(()=>{
    void loadSharedQuestionBank().then(shared=>setQuestionBank(mergeQuestionBanks(QUESTION_BANK,shared))).catch(error=>console.warn('Shared question bank load failed; using bundled metadata.',error))
    Promise.all([getPdf('questions'),getPdf('answers')]).then(([questionsPdf,answersPdf])=>{
      setQpdf(questionsPdf)
      setApdf(answersPdf)
    })
  },[])
  useEffect(()=>{
    let cancelled=false
    void getCurrentAuthUser()
      .then(user=>{if(!cancelled)setAuthUser(user)})
      .catch(error=>console.warn('Supabase auth check failed',error))
      .finally(()=>{if(!cancelled)setAuthReady(true)})
    const unsubscribe=subscribeToAuth(user=>{
      if(cancelled)return
      setAuthUser(user)
      setAuthReady(true)
    })
    return()=>{cancelled=true;unsubscribe()}
  },[])
  useEffect(()=>{
    if(!authUser){
      setAttempts([])
      setSessions([])
      setResumableSession(null)
      return
    }
    let cancelled=false
    void (async()=>{
      const [historyResult,activeResult]=await Promise.allSettled([loadCloudHistory(),loadActiveSession()])
      if(cancelled)return
      if(historyResult.status==='fulfilled'&&historyResult.value){
        setAttempts(historyResult.value.attempts)
        setSessions(historyResult.value.sessions)
      }else if(historyResult.status==='rejected'){
        console.warn('Supabase history load failed',historyResult.reason)
      }
      if(activeResult.status==='fulfilled')setResumableSession(activeResult.value)
      else console.warn('Supabase active-session load failed',activeResult.reason)
    })()
    return()=>{cancelled=true}
  },[authUser?.id])
  useEffect(()=>{
    if(!authReady)return
    if(!authUser){
      setSettings({...DEFAULT_SETTINGS})
      setSettingsCloudReady(false)
      return
    }
    let cancelled=false
    setSettingsCloudReady(false)
    void (async()=>{
      try{
        const cloudSettings=await loadUserSettings()
        if(cancelled)return
        const nextSettings={...DEFAULT_SETTINGS,...(cloudSettings??{})}
        setSettings(nextSettings)
        if(!cloudSettings)await saveUserSettings(nextSettings)
      }catch(error){
        console.warn('Supabase settings load failed',error)
      }finally{
        if(!cancelled)setSettingsCloudReady(true)
      }
    })()
    return()=>{cancelled=true}
  },[authReady,authUser?.id])
  useEffect(()=>{
    if(authUser&&settingsCloudReady){
      void saveUserSettings(settings).catch(error=>console.warn('Supabase settings save failed',error))
    }
  },[settings,authUser?.id,settingsCloudReady])
  useEffect(()=>{
    setReviewContentTab('question')
  },[i,reviewMode])

  useEffect(()=>{
    if(!authUser||view!=='practice'||!sid||reviewMode)return
    const lastActivityAt=new Date().toISOString()
    setResumableSession(previous=>previous&&previous.id===sid
      ?{...previous,currentIndex:i,draftAnswer:selected,lastActivityAt}
      :previous)
    const timeout=window.setTimeout(()=>{
      void saveActiveSessionProgress(sid,i,selected).catch(error=>console.warn('Active session progress sync failed',error))
    },400)
    return()=>window.clearTimeout(timeout)
  },[authUser?.id,view,sid,i,selected,reviewMode])


  const current=qs[i]
  const currentRec=current?currentAttempts.find(attempt=>attempt.questionId===current.id):undefined
  const performance=summarizePerformance(attempts,sessions,questionBank.length)
  const performanceRangeBounds=(()=>{
    const now=new Date()
    const endOfToday=new Date(now)
    endOfToday.setHours(23,59,59,999)
    if(performanceTimeRange==='all')return {start:null as Date|null,end:null as Date|null}
    if(performanceTimeRange==='custom'){
      const start=performanceCustomStart?new Date(`${performanceCustomStart}T00:00:00`):null
      const end=performanceCustomEnd?new Date(`${performanceCustomEnd}T23:59:59.999`):null
      return {start,end}
    }
    const days=performanceTimeRange==='7d'?7:performanceTimeRange==='14d'?14:performanceTimeRange==='21d'?21:performanceTimeRange==='30d'?30:90
    const start=new Date(endOfToday)
    start.setDate(start.getDate()-(days-1))
    start.setHours(0,0,0,0)
    return {start,end:endOfToday}
  })()
  const performanceSessions=sessions.filter(session=>{
    const time=new Date(session.startedAt).getTime()
    if(!Number.isFinite(time))return false
    if(performanceRangeBounds.start&&time<performanceRangeBounds.start.getTime())return false
    if(performanceRangeBounds.end&&time>performanceRangeBounds.end.getTime())return false
    return true
  })
  const performanceSessionIds=new Set(performanceSessions.map(session=>session.id))
  const performanceAttempts=attempts.filter(attempt=>performanceSessionIds.has(attempt.sessionId))
  const rangePerformanceBase=summarizePerformance(performanceAttempts,performanceSessions,questionBank.length)
  const rangeScoreTrend=performance.scoreTrend.filter(point=>{
    const time=new Date(point.startedAt).getTime()
    if(!Number.isFinite(time))return false
    if(performanceRangeBounds.start&&time<performanceRangeBounds.start.getTime())return false
    if(performanceRangeBounds.end&&time>performanceRangeBounds.end.getTime())return false
    return true
  })
  const rangePerformance={
    ...rangePerformanceBase,
    scoreTrend:rangeScoreTrend,
    latestScoreEstimate:performance.latestScoreEstimate,
    weeklyScoreChange:performance.weeklyScoreChange,
    scorePredictionBasis:performance.scorePredictionBasis,
    scoreEstimateConfidence:performance.scoreEstimateConfidence,
  }
  const missedQuestionCount=countMissedPracticeQuestions(settings,attempts,questionBank)
  const failedQuestionCount=countFailedPracticeQuestions(settings,attempts,questionBank)
  const practiceRecommendation=buildPracticePlanRecommendation(settings,questionBank,attempts,performance)
  const nationalMeritOutlook=buildNationalMeritOutlook(performance.scorePredictionBasis,performance.scoreEstimateConfidence)
  const practiceTestOptions=[
    {value:'all' as const,label:'All available tests'},
    ...availablePracticeTests(questionBank).map(value=>({value,label:practiceTestLabel(value)})),
  ]
  const practiceSummary=[settings.selectionMode==='random'?'Random':'Adaptive',settings.failedOnly?'Missed questions only':settings.failedEverOnly?'Failed questions only':''].filter(Boolean).join(' · ')
  const practiceTestSummaries=availablePracticeTests(questionBank).map(value=>{
    const questions=questionBank.filter(question=>question.practiceTestId===value)
    const practicedIds=new Set(attempts.filter(attempt=>attempt.practiceTestId===value).map(attempt=>attempt.questionId))
    return{value,label:practiceTestLabel(value),questionCount:questions.length,practicedCount:questions.filter(question=>practicedIds.has(question.id)).length}
  })

  const completedSessionHistory=[...sessions]
    .sort((a,b)=>b.endedAt.localeCompare(a.endedAt))
    .map(session=>{
      const metrics=summarizeSession(session.attempts)
      return {id:session.id,endedAt:session.endedAt,correct:metrics.correct,total:metrics.total,accuracy:metrics.accuracy}
    })

  async function beginPractice(nextMode:SubjectMode=settings.mode,nextPracticeTest=settings.practiceTest??'all'){
    if(!authUser){
      window.alert('Sign in to practice so your progress stays identical across devices.')
      navigateTo('account')
      return
    }
    if(resumableSession){
      const replace=window.confirm('You already have a practice session in progress. Start a new session and mark the unfinished one as ended?')
      if(!replace)return
      try{
        await abandonActiveSession(resumableSession.id)
        setResumableSession(null)
      }catch(error){
        console.warn('Unable to end previous active session',error)
        window.alert('The previous active session could not be ended. Please try again before starting a new session.')
        return
      }
    }
    const nextSettings={...settings,mode:nextMode,practiceTest:nextPracticeTest}
    const nextQuestions=choosePracticeQuestions(nextSettings,attempts,Math.random,questionBank)
    if(!nextQuestions.length){
      window.alert('No questions match these practice settings yet. Adjust the practice test, subject, or question-history filter.')
      navigateTo('settings')
      return
    }
    const sessionId=uid()
    const startedAt=new Date().toISOString()
    const active:ActivePracticeSession={
      id:sessionId,
      startedAt,
      mode:nextMode,
      questionCount:nextQuestions.length,
      questionIds:nextQuestions.map(question=>question.id),
      currentIndex:0,
      draftAnswer:'',
      lastActivityAt:startedAt,
      settings:nextSettings,
      attempts:[],
    }
    if(authUser){
      try{
        await createActiveSession(active)
        setResumableSession(active)
      }catch(error){
        console.warn('Unable to create cloud active session',error)
        window.alert('This session could not be saved to the cloud. Check your connection and try again so it can be resumed on another device.')
        return
      }
    }
    setReviewMode(false)
    setSettings(nextSettings)
    setQs(nextQuestions)
    setSid(sessionId)
    setStarted(startedAt)
    setCurrentAttempts([])
    setI(0)
    setSelected('')
    setSubmitted(false)
    setQStart(Date.now())
    navigateTo('practice')
  }

  function resumeActiveSession(){
    if(!resumableSession)return
    const resumedQuestions=resumableSession.questionIds
      .map(questionId=>questionBank.find(question=>question.id===questionId))
      .filter((question):question is PracticeQuestion=>Boolean(question))
    if(resumedQuestions.length!==resumableSession.questionIds.length){
      window.alert('Some questions from this saved session are not available yet. Reload the app and try again.')
      return
    }
    const nextIndex=Math.min(Math.max(resumableSession.currentIndex,0),Math.max(0,resumedQuestions.length-1))
    const currentQuestion=resumedQuestions[nextIndex]
    const priorAttempt=currentQuestion?resumableSession.attempts.find(attempt=>attempt.questionId===currentQuestion.id):undefined
    setReviewMode(false)
    setSettings({...settings,...resumableSession.settings})
    setQs(resumedQuestions)
    setSid(resumableSession.id)
    setStarted(resumableSession.startedAt)
    setCurrentAttempts(resumableSession.attempts)
    setI(nextIndex)
    setSelected(priorAttempt?.selectedAnswer??resumableSession.draftAnswer??'')
    setSubmitted(Boolean(priorAttempt))
    setQStart(Date.now())
    navigateTo('practice')
  }

  async function endResumableSession(){
    if(!resumableSession)return
    if(!window.confirm('End this unfinished session? Your submitted answers will remain in your history, but the session will no longer be resumable.'))return
    try{
      await abandonActiveSession(resumableSession.id)
      setResumableSession(null)
    }catch(error){
      console.warn('Unable to end active session',error)
      window.alert('The session could not be ended. Please try again.')
    }
  }

  function start(){void beginPractice(settings.mode)}

  function reviewSession(session:SessionSummary){
    const reviewQuestions=session.attempts
      .map(attempt=>questionBank.find(question=>question.id===attempt.questionId))
      .filter((question):question is PracticeQuestion=>Boolean(question))
    if(!reviewQuestions.length){
      window.alert('This session has no reviewable questions.')
      return
    }
    setReviewMode(true)
    setQs(reviewQuestions)
    setSid(session.id)
    setStarted(session.startedAt)
    setCurrentAttempts(session.attempts)
    setI(0)
    setSelected(session.attempts[0]?.selectedAnswer??'')
    setSubmitted(true)
    navigateTo('practice')
  }

  function reviewPastSession(sessionId:string){
    const session=sessions.find(item=>item.id===sessionId)
    if(session)reviewSession(session)
  }

  async function record(correct:boolean,selfGraded=false){
    if(!current)return
    const attempt:Attempt={
      id:uid(),sessionId:sid,questionId:current.id,practiceTestId:current.practiceTestId,subject:current.subject,module:current.module,
      questionNumber:current.number,selectedAnswer:selected,correctAnswer:answerLabel(current),correct,selfGraded,
      elapsedMs:Date.now()-qStart,createdAt:new Date().toISOString(),
    }
    if(!authUser)throw new Error('Sign in before recording practice progress.')
    try{
      await syncActiveAttempt(attempt)
      setAttempts(previous=>[...previous,attempt])
      setCurrentAttempts(previous=>[...previous,attempt])
      setResumableSession(previous=>previous&&previous.id===attempt.sessionId
        ?{...previous,attempts:[...previous.attempts,attempt],lastActivityAt:attempt.createdAt,draftAnswer:selected}
        :previous)
    }catch(error){
      console.warn('Active attempt sync failed',error)
      window.alert('Your answer could not be saved to the shared account yet. Check your connection and try again.')
      throw error
    }
  }

  async function submit(){
    if(!current||!selected.trim()||currentRec)return
    setSubmitted(true)
    await record(matchesAnswer(current,selected))
  }

  function goTo(index:number){
    if(index<0||index>=qs.length)return
    const question=qs[index]
    const attempt=currentAttempts.find(item=>item.questionId===question.id)
    setI(index)
    setSelected(attempt?.selectedAnswer??'')
    setSubmitted(Boolean(attempt))
    if(!attempt&&!reviewMode)setQStart(Date.now())
  }

  async function finish(){
    const session:SessionSummary={id:sid,startedAt:started,endedAt:new Date().toISOString(),mode:settings.mode,questionCount:qs.length,attempts:currentAttempts,dailyQuestionGoal:practiceRecommendation.questionsPerSession*practiceRecommendation.recommendedSessionsPerDay}
    try{
      await syncSession(session)
      setSessions(previous=>[...previous,session])
      setResumableSession(previous=>previous?.id===sid?null:previous)
      navigateTo('results')
    }catch(error){
      console.warn('Supabase session completion sync failed',error)
      window.alert('The session could not be completed in your shared account yet. Check your connection and try again.')
    }
  }

  async function next(){
    if(reviewMode){
      if(i+1>=qs.length){
        setReviewMode(false)
        navigateTo('home')
        return
      }
      goTo(i+1)
      return
    }
    if(!currentRec)return
    if(i+1>=qs.length){await finish();return}
    goTo(i+1)
  }

  function withSidebar(active:SidebarKey,content:ReactNode,background='#fff'){
    return <AppSidebarLayout
      active={active}
      collapsed={sidebarCollapsed}
      onToggleCollapsed={()=>setSidebarCollapsed(value=>!value)}
      onDashboard={()=>navigateTo('study')}
      onPracticeTests={()=>navigateTo('home')}
      onPracticeSetup={()=>navigateTo('settings')}
      onQuestionBank={()=>navigateTo('question-bank')}
      onParsingIssues={()=>navigateTo('parsing-issues')}
      onPerformance={()=>navigateTo('stats')}
      onResources={()=>navigateTo('sources')}
      onSettings={()=>navigateTo('account')}
      contentBackground={background}
    >{content}</AppSidebarLayout>
  }

  if(view==='practice'&&!current){
    return withSidebar('practice-tests',<main className="shell">
      <section className="card results">
        <p className="eyebrow">Practice session</p>
        <h1>{resumableSession?'Session ready to resume':'No active session found'}</h1>
        <p>{resumableSession
          ?`${resumableSession.attempts.length} of ${resumableSession.questionCount} questions answered. Continue the same session from this device.`
          :'This link points to a practice session, but there is no resumable cloud session for this account.'}</p>
        <div className="hero-actions">
          {resumableSession&&<AlexButton onClick={resumeActiveSession}>Resume session</AlexButton>}
          <AlexButton tone="secondary" onClick={()=>navigateTo('home')}>Practice tests</AlexButton>
          <AlexButton tone="quiet" onClick={()=>navigateTo('study')}>Dashboard</AlexButton>
        </div>
      </section>
    </main>)
  }

  if(view==='practice'&&current){
    return withSidebar('practice-tests',<main className="practice">
      <PracticeSessionHeader
        moduleLabel={moduleLabel(current.module)}
        subjectLabel={current.subject==='math'?'Math':'Reading & Writing'}
        current={i+1}
        total={qs.length}
        canGoPrevious={i>0}
        canGoNext={reviewMode||Boolean(currentRec)}
        isLast={i+1===qs.length}
        onPrevious={()=>goTo(i-1)}
        onNext={next}
        reviewMode={reviewMode}
      />
      <div className="practice-workspace">
        <section className="question-panel">
          <div className="question-heading">
            <div>
              <span>QUESTION {current.number}</span>
              <b>{current.subject==='math'?'Math':'Reading & Writing'}</b>
            </div>
            <AlexBox sx={{display:'flex',alignItems:'center',gap:.65,flex:'0 0 auto'}}>
              <ParsingIssueReporter question={current} context={reviewMode?'session-review':'practice'} compact/>
              <AlexStatusChip>{reviewMode?'REVIEW':'READY'}</AlexStatusChip>
            </AlexBox>
          </div>
          {reviewMode&&<AlexTabs
            value={reviewContentTab}
            options={[{value:'question',label:'Question'},{value:'explanation',label:'Explanation'}]}
            onChange={setReviewContentTab}
            aria-label="Session review content"
            sx={{mb:2}}
          />}
          {!reviewMode||reviewContentTab==='question'
            ?<QuestionContent question={current} bytes={qpdf} alt={`${moduleLabel(current.module)} question ${current.number}`}/>
            :<AlexBox sx={{minHeight:{xs:420,md:560},width:'100%'}}>
              <ExplanationContent question={current} bytes={apdf}/>
            </AlexBox>}
        </section>
        <PracticeAnswerPanel
          question={current}
          selected={selected}
          submitted={submitted}
          attempt={currentRec}
          onSelect={setSelected}
          onSubmit={submit}
          revealFeedback={reviewMode||(settings.answerFeedbackTiming??'end')==='immediate'}
          reviewMode={reviewMode}
        />
      </div>
    </main>,'#F7F6F2')
  }

  if(view==='results'){
    const session=summarizeSession(currentAttempts)
    const completedSession=sessions.find(item=>item.id===sid)??(sid?{id:sid,startedAt:started,endedAt:new Date().toISOString(),mode:settings.mode,questionCount:qs.length,attempts:currentAttempts}:null)
    return withSidebar('practice-tests',<main className="shell">
      <section className="card results">
        <p className="eyebrow">Session complete</p>
        <h1>{session.accuracy}% accuracy</h1>
        <p>{session.correct} of {session.total} correct · {formatDuration(session.averageMs)} average</p>
        <div className="hero-actions">
          {completedSession&&<AlexButton onClick={()=>reviewSession(completedSession)}>Review answers</AlexButton>}
          <AlexButton tone="secondary" onClick={start}>Start another session</AlexButton>
          <AlexButton tone="quiet" onClick={()=>navigateTo('home')}>Back to practice tests</AlexButton>
        </div>
      </section>
    </main>)
  }

  if(view==='stats')return withSidebar('performance',<main className="shell"><PerformanceDashboard
    summary={rangePerformance}
    hasHistory={performanceAttempts.length>0}
    questionsPdf={qpdf}
    answersPdf={apdf}
    timeRange={performanceTimeRange}
    customStartDate={performanceCustomStart}
    customEndDate={performanceCustomEnd}
    onTimeRangeChange={setPerformanceTimeRange}
    onCustomStartDateChange={setPerformanceCustomStart}
    onCustomEndDateChange={setPerformanceCustomEnd}
    sessionHistory={completedSessionHistory}
    onReviewSession={reviewPastSession}
  /></main>)

  if(view==='question-bank')return withSidebar('question-bank',<QuestionBankReview questionsPdf={qpdf}/>,'#F7F6F2')

  if(view==='parsing-issues')return withSidebar('parsing-issues',<ParsingIssuesDashboard questionsPdf={qpdf} answersPdf={apdf}/>,'#F7F6F2')

  if(view==='account')return withSidebar('practice-tests',<main className="shell">
    <div className="page-heading"><div><p className="eyebrow">Account</p><h1>Account & sync</h1></div></div>
    <AccountAuthPanel email={authUser?.email??null}/>
  </main>,'#F7F6F2')

  if(view==='settings')return withSidebar('practice-setup',<main className="shell">
    <div className="page-heading"><div><p className="eyebrow">Practice Setup</p><h1>Practice setup</h1></div></div>
    <PracticeSetupPanel
      settings={settings}
      practiceTests={practiceTestOptions}
      missedQuestionCount={missedQuestionCount}
      failedQuestionCount={failedQuestionCount}
      onChange={setSettings}
      onStart={()=>void beginPractice(settings.mode)}
      recommendation={practiceRecommendation}
    />
  </main>)

  if(view==='sources')return withSidebar('resources',<main className="shell">
    <div className="page-heading"><div><p className="eyebrow">Resources</p><h1>Shared sources</h1></div></div>
    <section className="card sources">
      <p>Question and explanation sources are shared for the whole app and load from the canonical source service on every device. There is no device-specific question database or user-visible local source override.</p>
      <div className="structured-db-card"><div><b>Question sources</b><span>{qpdf?'Available':'Loading or unavailable'}</span><small>The same canonical Practice Test PDFs are used by Practice, Question Bank, Parsing Issues, and review.</small></div></div>
      <div className="structured-db-card"><div><b>Answer explanations</b><span>{apdf?'Available':'Loading or unavailable'}</span><small>Explanation sources are shared as well; they are not uploaded separately per browser.</small></div></div>
    </section>
  </main>)

  if(view==='study')return withSidebar('dashboard',<main className="shell dashboard-shell">
    <AlexBox className="dashboard-top" sx={{flex:'0 0 auto',minHeight:0}}>
      <StudyPlanHero
        accuracy={attempts.length?performance.accuracy:null}
        estimatedScore={performance.latestScoreEstimate}
        nationalMeritChance={nationalMeritOutlook?.qualifyingChance??null}
        projectedSelectionIndex={nationalMeritOutlook?.projectedSelectionIndex??null}
        estimateConfidence={performance.scoreEstimateConfidence}
        targetScore={practiceRecommendation.targetScore}
        daysRemaining={practiceRecommendation.daysRemaining}
        questionsPerSession={settings.questionsPerSession}
        onChoosePracticeTest={()=>navigateTo('home')}
        onStartPractice={()=>void beginPractice(settings.mode)}
      />
    </AlexBox>

    <AlexBox
      className="dashboard-bottom"
      sx={{
        display:'flex',
        flexDirection:{xs:'column',xl:'row'},
        gap:{xs:2,sm:3,lg:1.5},
        alignItems:'stretch',
        width:'100%',
        flex:{xl:'1 1 0'},
        minHeight:{xl:0},
      }}
    >
      <AlexBox
        className="dashboard-bottom-left"
        sx={{
          display:'flex',
          flexDirection:'column',
          flex:{xs:'1 1 auto',xl:'initial'},
          minWidth:0,
          minHeight:0,
        }}
      >
        <PerformanceDashboard
          summary={performance}
          hasHistory={attempts.length>0}
          compact
          compactRecommendationExtra={
            <DailyPracticeGoals
              attempts={attempts}
              sessions={sessions}
              dailyQuestions={practiceRecommendation.questionsPerSession*practiceRecommendation.recommendedSessionsPerDay}
              dailyMinutes={practiceRecommendation.estimatedDailyMinutes}
              failedQuestionCount={failedQuestionCount}
              recommendationLabel={performance.recommendation?.label}
              recommendationReason={performance.recommendation?.reason}
            />
          }
        />
      </AlexBox>

      <AlexBox
        className="dashboard-bottom-right"
        sx={{
          display:'flex',
          flexDirection:'column',
          flex:{xs:'1 1 auto',xl:'initial'},
          minWidth:{xs:0,xl:260},
          minHeight:0,
          gap:{xs:1.5,sm:2.5},
          boxSizing:'border-box',
          pl:{xl:0},
          pr:{xl:0},
        }}
      >
        <AlexBox sx={{flex:{xs:'0 0 auto',lg:'initial'},height:{xs:'auto',lg:'100%'},minHeight:0}}>
          <StudyPlanCalendar sessions={sessions} attempts={attempts} settings={settings} recommendation={practiceRecommendation}/>
        </AlexBox>
        <DashboardCard
          tone="white"
          variant="support"
          title="Your practice plan"
          trailing={<AlexButton
            tone="quiet"
            aria-label="Edit practice plan"
            onClick={()=>navigateTo('settings')}
            sx={{minWidth:20,width:20,height:20,p:0,display:'grid',placeItems:'center',m:0}}
          >
            <PenLine size={14}/>
          </AlexButton>}
          sx={{flex:{xs:'0 0 auto',xl:'1 1 0'}}}
        >
          <AlexBox sx={{
            display:'grid',
            gridTemplateColumns:{xs:'minmax(0,1fr)',sm:'repeat(2,minmax(0,1fr))'},
            columnGap:0,
            rowGap:0,
          }}>
            {[
              {label:'Daily time',value:`${practiceRecommendation.estimatedDailyMinutes} min`,icon:<Clock3 size={13}/>},
              {label:'Focus',value:practiceRecommendation.focusLabel??'Balanced',icon:<Target size={13}/>},
              {label:'Session size',value:`${settings.questionsPerSession} questions`,icon:<ListChecks size={13}/>},
              {label:'Pace',value:`${practiceRecommendation.recommendedSessionsPerDay}/day`,icon:<CalendarDays size={13}/>},
            ].map((item,index)=><AlexBox
              key={item.label}
              sx={{
                display:'grid',
                gridTemplateColumns:{xs:'28px minmax(0,1fr)',xl:'24px minmax(0,1fr)'},
                alignItems:'center',
                columnGap:1,
                py:{xs:.65,xl:.38},
                pl:{xs:0,xl:index%2===1?1.5:0},
                pr:{xs:0,xl:index%2===0?1.5:0},
                borderLeft:{xs:'none',xl:index%2===1?'1px solid #EEF1F4':'none'},
                borderTop:index<2?'none':'1px solid #EEF1F4',
                minWidth:0,
                maxWidth:'100%',
                overflow:'hidden',
              }}
            >
              <AlexBox sx={{
                width:{xs:28,xl:24},
                height:{xs:28,xl:24},
                borderRadius:'50%',
                display:'grid',
                placeItems:'center',
                bgcolor:'#E8F7EE',
                color:'#20935A',
              }}>
                {item.icon}
              </AlexBox>
              <AlexBox sx={{
                minWidth:0,
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                gap:1,
              }}>
                <AlexBox sx={{fontSize:dashboardTypography.supportBody,lineHeight:1.25,color:'#344054',minWidth:0}}>
                  {item.label}
                </AlexBox>
                <AlexBox sx={{
                  fontSize:dashboardTypography.supportBody,
                  lineHeight:1.2,
                  fontWeight:800,
                  color:'#08275B',
                  minWidth:0,
                  maxWidth:'48%',
                  overflow:'hidden',
                  textOverflow:'ellipsis',
                  whiteSpace:'nowrap',
                  textAlign:'right',
                }}>
                  {item.value}
                </AlexBox>
              </AlexBox>
            </AlexBox>)}
          </AlexBox>
        </DashboardCard>
      </AlexBox>
    </AlexBox>
  </main>,'#F7F6F2')

  return withSidebar('practice-tests',<PracticeTestsDashboard
    tests={practiceTestSummaries}
    sessionSummary={`${settings.questionsPerSession} questions · ${settings.mode==='both'?'Reading & Writing + Math':settings.mode==='english'?'Reading & Writing':'Math'} · ${practiceSummary}`}
    activeSession={resumableSession?{
      questionCount:resumableSession.questionCount,
      answeredCount:resumableSession.attempts.length,
      lastActivityAt:resumableSession.lastActivityAt,
    }:null}
    sessionHistory={completedSessionHistory}
    onStartTest={value=>void beginPractice(settings.mode,value)}
    onOpenSetup={()=>navigateTo('settings')}
    onResumeSession={resumeActiveSession}
    onEndSession={()=>void endResumableSession()}
    onReviewSession={reviewPastSession}
  />)
}
