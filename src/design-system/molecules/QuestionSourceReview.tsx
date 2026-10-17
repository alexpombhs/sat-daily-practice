import {useEffect,useState} from 'react'
import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import QuestionContent from './QuestionContent'
import SourceViewer from './SourceViewer'
import StructuredQuestionLines from './StructuredQuestionLines'
import {loadSharedQuestionContent} from '../../lib/sharedQuestionBank'
import {moduleLabel} from '../../lib/questionBank'
import {usePracticeTestPdfState} from '../../hooks/usePracticeTestPdf'
import type {PracticeQuestion} from '../../types'

type Props={
  question:PracticeQuestion
  questionsPdf:ArrayBuffer|null
  answersPdf?:ArrayBuffer|null
  showExplanation?:boolean
  revision?:number
}

export default function QuestionSourceReview({question,questionsPdf,answersPdf=null,showExplanation=false,revision=0}:Props){
  const [activeTab,setActiveTab]=useState<'source'|'explanation'>('source')
  const [fallbackExplanation,setFallbackExplanation]=useState<string[]>([])
  useEffect(()=>{
    let cancelled=false
    setFallbackExplanation([])
    if(question.practiceTestId==='practice-test-9')void loadSharedQuestionContent(question.id,question.practiceTestId).then(content=>{if(!cancelled)setFallbackExplanation(content?.explanationLines??[])}).catch(()=>{})
    return()=>{cancelled=true}
  },[question.id,question.practiceTestId])
  const label=`${moduleLabel(question.module)} · Q${question.number}`
  const questionSource=usePracticeTestPdfState(question,'questions',questionsPdf)
  const answerSource=usePracticeTestPdfState(question,'answers',answersPdf,showExplanation&&activeTab==='explanation')
  const resolvedQuestionsPdf=questionSource.source
  const resolvedAnswersPdf=answerSource.source
  const hasQuestionSource=Boolean(resolvedQuestionsPdf?.byteLength)

  return <AlexBox sx={{display:'grid',gap:2}}>
    <AlexBox sx={{display:'grid',gridTemplateColumns:{xs:'1fr',xl:'1fr 1fr'},gap:2}}>
      <AlexSurface className="question-source-review-pane" sx={{border:'1px solid #E6E2DB',borderRadius:2.5,overflow:'hidden',minWidth:0}}>
        <AlexBox sx={{px:2,py:1.25,borderBottom:'1px solid #E6E2DB',bgcolor:'#F7F6F2'}}>
          <AlexText sx={{fontSize:12,fontWeight:800,color:'#475467',textTransform:'uppercase',letterSpacing:'.07em'}}>Text reconstruction</AlexText>
        </AlexBox>
        <QuestionContent key={`question-${question.id}-${revision}`} question={question} bytes={resolvedQuestionsPdf} alt={`${label} text`} showOriginalLayout={false}/>
      </AlexSurface>

      <AlexSurface className="question-source-review-pane question-source-review-pane--source" sx={{border:'1px solid #E6E2DB',borderRadius:2.5,overflow:'hidden',minWidth:0}}>
        <AlexBox role="tablist" aria-label="Original question and explanation" sx={{display:'flex',px:1.5,borderBottom:'1px solid #E6E2DB',bgcolor:'#F7F6F2'}}>
          <button type="button" role="tab" aria-selected={activeTab==='source'} onClick={()=>setActiveTab('source')} style={{padding:'12px 16px',border:0,borderBottom:activeTab==='source'?'2px solid #285CD6':'2px solid transparent',background:'transparent',color:activeTab==='source'?'#10284f':'#667085',fontWeight:800,cursor:'pointer'}}>Original Source</button>
          {showExplanation&&<button type="button" role="tab" aria-selected={activeTab==='explanation'} onClick={()=>setActiveTab('explanation')} style={{padding:'12px 16px',border:0,borderBottom:activeTab==='explanation'?'2px solid #285CD6':'2px solid transparent',background:'transparent',color:activeTab==='explanation'?'#10284f':'#667085',fontWeight:800,cursor:'pointer'}}>Explanation</button>}
        </AlexBox>
        <div role="tabpanel">
          {activeTab==='explanation'&&showExplanation
            ?resolvedAnswersPdf
              ?<SourceViewer pdfKey="answers" bytes={resolvedAnswersPdf} page={question.answerPage} questionNumber={question.number} alt={`Original explanation for ${label}`} label="Original explanation" practiceTestId={question.practiceTestId} module={question.module}/>
              :fallbackExplanation.length&&!answerSource.loading
                ?<AlexBox sx={{p:3}}><AlexText sx={{fontSize:12,color:'#667085',mb:1}}>Original explanation PDF is unavailable; showing the saved explanation text instead.</AlexText><StructuredQuestionLines lines={fallbackExplanation}/></AlexBox>
                :<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:answerSource.error?'#B42318':'#667085'}}>{answerSource.loading?'Loading shared explanation PDF…':answerSource.error||'Shared explanation PDF is unavailable right now.'}</AlexText></AlexBox>
            :hasQuestionSource&&resolvedQuestionsPdf
              ?<SourceViewer pdfKey="questions" bytes={resolvedQuestionsPdf} page={question.sourcePage} questionNumber={question.number} alt={`${label} original PDF`} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/>
              :<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:questionSource.error?'#B42318':'#667085'}}>{questionSource.loading?'Loading shared source PDF…':questionSource.error||'Shared source PDF is unavailable right now.'}</AlexText></AlexBox>}
        </div>
      </AlexSurface>
    </AlexBox>
  </AlexBox>
}
