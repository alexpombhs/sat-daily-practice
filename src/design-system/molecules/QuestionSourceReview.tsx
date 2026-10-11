import AlexBox from '../atoms/AlexBox'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import QuestionContent from './QuestionContent'
import SourceViewer from './SourceViewer'
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
  const label=`${moduleLabel(question.module)} · Q${question.number}`
  const questionSource=usePracticeTestPdfState(question,'questions',questionsPdf)
  const answerSource=usePracticeTestPdfState(question,'answers',answersPdf,showExplanation)
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
        <AlexBox sx={{px:2,py:1.25,borderBottom:'1px solid #E6E2DB',bgcolor:'#F7F6F2'}}>
          <AlexText sx={{fontSize:12,fontWeight:800,color:'#475467',textTransform:'uppercase',letterSpacing:'.07em'}}>Original source</AlexText>
        </AlexBox>
        {question.practiceTestId==='practice-test-1'
          ?<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:'#667085'}}>This is an original SAT-style question authored for PT1. There is no third-party source PDF; the canonical question and its diagrams appear in Text reconstruction.</AlexText></AlexBox>
          :hasQuestionSource&&resolvedQuestionsPdf
          ?<SourceViewer pdfKey="questions" bytes={resolvedQuestionsPdf} page={question.sourcePage} questionNumber={question.number} alt={`${label} original PDF`} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/>
          :<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:questionSource.error?'#B42318':'#667085'}}>{questionSource.loading?'Loading shared source PDF…':questionSource.error||'Shared source PDF is unavailable right now.'}</AlexText></AlexBox>}
      </AlexSurface>
    </AlexBox>

    {showExplanation&&<AlexSurface sx={{border:'1px solid #E6E2DB',borderRadius:2.5,overflow:'hidden'}}>
      <AlexBox sx={{px:2,py:1.25,borderBottom:'1px solid #E6E2DB',bgcolor:'#F7F6F2'}}>
        <AlexText sx={{fontSize:12,fontWeight:800,color:'#475467',textTransform:'uppercase',letterSpacing:'.07em'}}>Explanation</AlexText>
      </AlexBox>
      {resolvedAnswersPdf
        ?<SourceViewer pdfKey="answers" bytes={resolvedAnswersPdf} page={question.answerPage} questionNumber={question.number} alt={`Original explanation for ${label}`} label="Original explanation" practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/>
        :<AlexBox sx={{p:3}}><AlexText sx={{fontSize:14,color:answerSource.error?'#B42318':'#667085'}}>{answerSource.loading?'Loading shared explanation PDF…':answerSource.error||'Shared explanation PDF is unavailable right now.'}</AlexText></AlexBox>}
    </AlexSurface>}
  </AlexBox>
}
