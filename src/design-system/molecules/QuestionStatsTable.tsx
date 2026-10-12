import {useEffect,useMemo,useState} from 'react'
import {ChevronRight} from 'lucide-react'
import AlexBox from '../atoms/AlexBox'
import AlexButtonBase from '../atoms/AlexButtonBase'
import AlexDropdown from '../atoms/AlexDropdown'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import QuestionReviewDrawer from './QuestionReviewDrawer'
import {formatDuration} from '../../lib/practiceGamification'
import {practiceTestLabel} from '../../lib/questionBank'
import {loadSharedQuestionBank} from '../../lib/sharedQuestionBank'
import type {QuestionPerformance} from '../../lib/performanceAnalytics'
import type {PracticeQuestion,PracticeTestFilter,PracticeTestId} from '../../types'

type Props={questions:QuestionPerformance[];questionsPdf?:ArrayBuffer|null;answersPdf?:ArrayBuffer|null}

export default function QuestionStatsTable({questions,questionsPdf=null,answersPdf=null}:Props){
  const[selectedId,setSelectedId]=useState<string|null>(null)
  const[practiceTestFilter,setPracticeTestFilter]=useState<PracticeTestFilter>('all')
  const[bank,setBank]=useState<PracticeQuestion[]>([])

  useEffect(()=>{
    let cancelled=false
    void loadSharedQuestionBank().then(shared=>{if(!cancelled&&shared?.length)setBank(shared)}).catch(()=>{})
    return()=>{cancelled=true}
  },[])

  const practiceTests=useMemo(()=>{
    const ids=[...new Set(questions.map(question=>question.practiceTestId).filter((id):id is PracticeTestId=>Boolean(id)))]
    return ids.sort((a,b)=>Number(a.replace('practice-test-',''))-Number(b.replace('practice-test-','')))
  },[questions])
  const filteredQuestions=useMemo(()=>questions.filter(question=>practiceTestFilter==='all'||question.practiceTestId===practiceTestFilter),[questions,practiceTestFilter])
  const selectedPerformance=filteredQuestions.find(question=>question.questionId===selectedId)??null
  const selectedQuestion=useMemo(()=>bank.find(question=>question.id===selectedId)??null,[bank,selectedId])
  const options=[{value:'all' as const,label:'All practice tests'},...practiceTests.map(value=>({value,label:practiceTestLabel(value)}))]

  useEffect(()=>{
    if(selectedId&&!filteredQuestions.some(question=>question.questionId===selectedId))setSelectedId(null)
  },[filteredQuestions,selectedId])

  return <>
    <AlexSurface sx={{border:'1px solid #E6E2DB',borderRadius:3,overflow:'hidden'}}>
      <AlexBox sx={{
        p:{xs:1.75,sm:2,md:2.5},
        borderBottom:'1px solid #E6E2DB',
        display:'flex',
        justifyContent:'space-between',
        gap:2,
        alignItems:{xs:'stretch',sm:'flex-end'},
        flexDirection:{xs:'column',sm:'row'},
      }}>
        <AlexBox>
          <AlexText component="h2" sx={{fontSize:18,fontWeight:800,color:'#08275B'}}>Question details</AlexText>
          <AlexText sx={{fontSize:13,color:'#667085',mt:.5}}>Sorted from lowest success rate upward. Select a question to review it or flag a parsing problem.</AlexText>
        </AlexBox>
        <AlexBox sx={{width:{xs:'100%',sm:220},flex:'0 0 auto'}}>
          <AlexDropdown id="question-stats-practice-test" label="Practice test" value={practiceTestFilter} options={options} onChange={setPracticeTestFilter}/>
        </AlexBox>
      </AlexBox>

      <AlexBox sx={{display:{xs:'grid',lg:'none'},gap:0}}>
        {filteredQuestions.map(question=><AlexButtonBase
          key={question.questionId}
          onClick={()=>setSelectedId(question.questionId)}
          aria-label={`Review ${practiceTestLabel(question.practiceTestId)} ${question.subject==='math'?'Math':'Reading and Writing'} question ${question.questionNumber}`}
          sx={{
            width:'100%',
            textAlign:'left',
            p:{xs:1.5,sm:1.75},
            display:'grid',
            gap:1.15,
            borderBottom:'1px solid #F0EDE7',
            '&:hover':{bgcolor:'#F8FAFC'},
            '&:focus-visible':{outline:'2px solid #6558F5',outlineOffset:-2},
          }}
        >
          <AlexBox sx={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:1}}>
            <AlexBox sx={{minWidth:0}}>
              <AlexText sx={{fontSize:14,fontWeight:800,color:'#08275B'}}>{question.subject==='math'?'Math':'Reading & Writing'} · Q{question.questionNumber}</AlexText>
              <AlexText sx={{fontSize:11.5,color:'#667085',mt:.15}}>{practiceTestLabel(question.practiceTestId)} · {question.module.toUpperCase()}</AlexText>
            </AlexBox>
            <ChevronRight size={18} color="#6558F5"/>
          </AlexBox>
          <AlexBox sx={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:.7}}>
            <MobileMetric label="Attempts" value={String(question.attempts)}/>
            <MobileMetric label="Correct" value={String(question.correct)}/>
            <MobileMetric label="Success" value={`${question.successRate}%`} emphasis={question.successRate<60?'bad':'good'}/>
            <MobileMetric label="Avg. time" value={formatDuration(question.averageMs)}/>
          </AlexBox>
        </AlexButtonBase>)}
        {!filteredQuestions.length&&<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:'#667085'}}>No question statistics match this Practice Test filter yet.</AlexText></AlexBox>}
      </AlexBox>

      <AlexBox sx={{display:{xs:'none',lg:'block'},overflowX:'auto',maxHeight:520,overflowY:'auto'}}>
        <AlexBox sx={{minWidth:790}}>
          <AlexBox sx={{display:'grid',gridTemplateColumns:'1.8fr .9fr .8fr .8fr .9fr .55fr',gap:1,p:'10px 16px',position:'sticky',top:0,bgcolor:'#F7F6F2',borderBottom:'1px solid #E6E2DB',zIndex:1}}>
            {['Question','Attempts','Correct','Success','Avg. time','Review'].map(label=><AlexText key={label} sx={{fontSize:12,fontWeight:800,color:'#475467'}}>{label}</AlexText>)}
          </AlexBox>
          {filteredQuestions.map(question=><AlexButtonBase
            key={question.questionId}
            onClick={()=>setSelectedId(question.questionId)}
            aria-label={`Review ${practiceTestLabel(question.practiceTestId)} ${question.subject==='math'?'Math':'Reading and Writing'} question ${question.questionNumber}`}
            sx={{display:'grid',gridTemplateColumns:'1.8fr .9fr .8fr .8fr .9fr .55fr',gap:1,p:'12px 16px',alignItems:'center',width:'100%',textAlign:'left',borderBottom:'1px solid #F0EDE7','&:hover':{bgcolor:'#F8FAFC'},'&:focus-visible':{outline:'2px solid #6558F5',outlineOffset:-2}}}
          >
            <AlexBox>
              <AlexText sx={{fontSize:14,fontWeight:750,color:'#08275B'}}>{question.subject==='math'?'Math':'Reading & Writing'} · Q{question.questionNumber}</AlexText>
              <AlexText sx={{fontSize:12,color:'#667085'}}>{practiceTestLabel(question.practiceTestId)} · {question.module.toUpperCase()}</AlexText>
            </AlexBox>
            <AlexText sx={{fontSize:14}}>{question.attempts}</AlexText>
            <AlexText sx={{fontSize:14}}>{question.correct}</AlexText>
            <AlexText sx={{fontSize:14,fontWeight:800,color:question.successRate<60?'#B42318':'#067647'}}>{question.successRate}%</AlexText>
            <AlexText sx={{fontSize:14}}>{formatDuration(question.averageMs)}</AlexText>
            <AlexBox sx={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:.5,color:'#6558F5'}}><AlexText sx={{fontSize:12,fontWeight:800,color:'inherit'}}>Open</AlexText><ChevronRight size={15}/></AlexBox>
          </AlexButtonBase>)}
          {!filteredQuestions.length&&<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:'#667085'}}>No question statistics match this Practice Test filter yet.</AlexText></AlexBox>}
        </AlexBox>
      </AlexBox>
    </AlexSurface>
    <QuestionReviewDrawer open={Boolean(selectedId)} onClose={()=>setSelectedId(null)} question={selectedQuestion} performance={selectedPerformance} questionsPdf={questionsPdf} answersPdf={answersPdf}/>
  </>
}

function MobileMetric({label,value,emphasis}:{label:string;value:string;emphasis?:'good'|'bad'}){
  return <AlexBox sx={{minWidth:0}}>
    <AlexText sx={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.04em',fontWeight:800,color:'#98A2B3'}}>{label}</AlexText>
    <AlexText sx={{fontSize:13,fontWeight:800,color:emphasis==='bad'?'#B42318':emphasis==='good'?'#067647':'#344054',mt:.15,whiteSpace:'nowrap'}}>{value}</AlexText>
  </AlexBox>
}
