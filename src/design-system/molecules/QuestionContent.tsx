import {useEffect,useState,type ReactNode} from 'react'
import '../../structured.css'
import QuestionVisualSlice from '../../components/QuestionVisualSlice'
import SourceViewer from './SourceViewer'
import StructuredQuestionLines from './StructuredQuestionLines'
import ReadingQuestionLines from './ReadingQuestionLines'
import {ensureQuestionText} from '../../lib/pdfStructuredImport'
import {getQuestionContent,isCurrentQuestionContent,QUESTION_CONTENT_VERSION,type StoredQuestionContent} from '../../lib/questionContentStore'
import {loadSharedQuestionContent} from '../../lib/sharedQuestionBank'
import {verifiedMathContent} from '../../lib/verifiedMathQuestions'
import {questionVisualSpecs,type QuestionVisualSpec} from '../../lib/questionVisuals'
import {isPracticeTest5Math1Verified} from '../../lib/practiceTest5Math1Layout'
import {verifiedPracticeTest5Math1Content} from '../../lib/verifiedPracticeTest5Math1'
import {verifiedPracticeTest6Reading1Content} from '../../lib/verifiedPracticeTest6Reading1'
import {verifiedPracticeTest6Reading2Content} from '../../lib/verifiedPracticeTest6Reading2'
import {verifiedPracticeTest6Math1Content} from '../../lib/verifiedPracticeTest6Math1'
import {verifiedPracticeTest6Math2Content} from '../../lib/verifiedPracticeTest6Math2'
import {verifiedPracticeTest7Math1Content} from '../../lib/verifiedPracticeTest7Math1'
import {verifiedPracticeTest7Math2Content} from '../../lib/verifiedPracticeTest7Math2'
import usePracticeTestPdf from '../../hooks/usePracticeTestPdf'
import type {PracticeQuestion} from '../../types'

type Props={question:PracticeQuestion;bytes:ArrayBuffer|null;alt:string;showOriginalLayout?:boolean;reflowProse?:boolean}

function RenderQuestionLines({question,lines,reflowProse=false}:{question:PracticeQuestion;lines:string[];reflowProse?:boolean}){
  return question.subject==='english'?<ReadingQuestionLines lines={lines} questionId={question.id}/>:<StructuredQuestionLines lines={lines} reflowProse={reflowProse}/>
}

function LinesWithSourceVisuals({question,bytes,lines,alt,visuals,sourceCrop,reflowProse=false}:{question:PracticeQuestion;bytes:ArrayBuffer|null;lines:string[];alt:string;visuals:QuestionVisualSpec[];sourceCrop?:PracticeQuestion['sourceCrop'];reflowProse?:boolean}){
  if(!bytes)return <RenderQuestionLines question={question} lines={lines} reflowProse={reflowProse}/>
  const ordered=[...visuals].sort((a,b)=>a.afterLine-b.afterLine)
  const output:ReactNode[]=[]
  let cursor=0
  ordered.forEach((visual,index)=>{
    const split=Math.max(cursor,Math.min(lines.length,visual.afterLine+1))
    const before=lines.slice(cursor,split)
    if(before.length)output.push(<RenderQuestionLines key={`text-${index}`} question={question} lines={before} reflowProse={reflowProse}/>)
    const visualAlt=visual.kind==='choice-grid'
      ?`${alt} graphical answer choices A through D from source PDF`
      :`${alt} figure ${index+1} from source PDF`
    output.push(<QuestionVisualSlice key={`visual-${index}`} question={question} bytes={bytes} crop={visual.crop} alt={visualAlt} expand={!visual.exact} sourceCrop={sourceCrop} variant={visual.kind}/>)
    cursor=split
  })
  const after=lines.slice(cursor)
  if(after.length)output.push(<RenderQuestionLines key="text-final" question={question} lines={after} reflowProse={reflowProse}/>)
  return <>{output}</>
}

function storedFromShared(questionId:string,questionLines:string[],explanationLines:string[],needsVisual:boolean,questionMode:'text'|'image-fallback'='text'):StoredQuestionContent{
  return {
    questionId,questionLines,explanationLines,questionMode,
    explanationMode:explanationLines.length?'text':'image-fallback',needsVisual,
    importedAt:new Date().toISOString(),contentVersion:QUESTION_CONTENT_VERSION,
  }
}

export default function QuestionContent({question,bytes,alt,showOriginalLayout=true,reflowProse=false}:Props){
  const sourceBytes=usePracticeTestPdf(question,'questions',bytes)
  const[content,setContent]=useState<StoredQuestionContent|null>(null)
  const[visuals,setVisuals]=useState<QuestionVisualSpec[]>([])
  const[error,setError]=useState('')
  const[revision,setRevision]=useState(0)

  useEffect(()=>{
    const handler=(event:Event)=>{
      const detail=(event as CustomEvent<{questionId?:string}>).detail
      if(!detail?.questionId||detail.questionId===question.id)setRevision(value=>value+1)
    }
    window.addEventListener('sat-question-content-updated',handler)
    return()=>window.removeEventListener('sat-question-content-updated',handler)
  },[question.id])

  useEffect(()=>{
    let cancelled=false
    setContent(null)
    setError('')
    setVisuals([])

    void (async()=>{
      try{
        const shared=await loadSharedQuestionContent(question.id,question.practiceTestId).catch(()=>null)
        if(cancelled)return

        const bundledVisuals=questionVisualSpecs(question.id)
        const verifiedBundled=question.practiceTestId==='practice-test-6'
          ?question.module==='rw1'
            ?verifiedPracticeTest6Reading1Content(question.number)
            :question.module==='rw2'
              ?verifiedPracticeTest6Reading2Content(question.number)
              :question.module==='math1'
                ?verifiedPracticeTest6Math1Content(question.number)
                :question.module==='math2'
                  ?verifiedPracticeTest6Math2Content(question.number)
                  :undefined
          :question.practiceTestId==='practice-test-7'
            ?question.module==='math1'
              ?verifiedPracticeTest7Math1Content(question.number)
              :question.module==='math2'
                ?verifiedPracticeTest7Math2Content(question.number)
                :undefined
            :undefined
        const sharedHasText=Boolean(shared?.questionLines.length)&&!(question.id==='practice-test-6:math2-26'&&shared?.questionLines.some(line=>/no test material on this page/i.test(line)))
        const sharedControlsVisual=Boolean(shared&&shared.contentStatus!=='metadata'&&!(verifiedBundled&&!sharedHasText))
        const sharedVisuals=shared?.visualSpecs??[]
        const hasRequiredBundledVisuals=question.id==='practice-test-5:math1-16'
        const resolvedVisuals=sharedVisuals.length?sharedVisuals:(hasRequiredBundledVisuals?bundledVisuals:(sharedControlsVisual&&!shared?.needsVisual?[]:bundledVisuals))
        setVisuals(resolvedVisuals)

        if(sharedHasText&&shared){
          setContent(storedFromShared(question.id,shared.questionLines,shared.explanationLines,resolvedVisuals.length>0,'text'))
          return
        }

        if(verifiedBundled){
          setContent(storedFromShared(question.id,verifiedBundled.lines,shared?.explanationLines??[],resolvedVisuals.length>0||Boolean(verifiedBundled.needsVisual),'text'))
          return
        }

        const canExtractVerifiedSource=Boolean(
          sourceBytes
          &&question.contentStatus==='verified'
          &&question.sourceCrop
        )

        if(canExtractVerifiedSource&&sourceBytes){
          const extracted=await ensureQuestionText(question,sourceBytes)
          if(cancelled)return
          if(extracted&&isCurrentQuestionContent(extracted)&&extracted.questionLines.length){
            setContent({...extracted,questionMode:'text',needsVisual:resolvedVisuals.length>0||extracted.needsVisual})
            return
          }
        }

        if(shared?.questionMode==='image-fallback'){
          setContent(storedFromShared(question.id,[],shared.explanationLines,resolvedVisuals.length>0,'image-fallback'))
          return
        }

        if(question.questionMode==='image-fallback'&&question.contentStatus==='verified'){
          setContent(storedFromShared(question.id,[],[],false,'image-fallback'))
          return
        }

        if(question.practiceTestId==='practice-test-5'&&question.module==='math1'){
          const verified=verifiedPracticeTest5Math1Content(question.number)
          if(verified?.imageFallback){
            setContent({questionId:question.id,questionLines:[],explanationLines:[],questionMode:'image-fallback',explanationMode:'image-fallback',needsVisual:false,importedAt:new Date().toISOString(),contentVersion:QUESTION_CONTENT_VERSION})
            return
          }
          if(verified){
            setContent(storedFromShared(question.id,verified.lines,[],resolvedVisuals.length>0||Boolean(verified.needsVisual)))
            return
          }
        }

        const verified=question.practiceTestId==='practice-test-4'&&question.subject==='math'?verifiedMathContent(question.id):undefined
        if(verified){
          setContent(storedFromShared(question.id,verified.lines,shared?.explanationLines??[],resolvedVisuals.length>0||Boolean(verified.needsVisual)))
          return
        }

        const sourceExtractable=Boolean(sourceBytes&&question.sourceCrop&&question.contentStatus==='verified')
          ||question.practiceTestId==='practice-test-7'&&(question.module==='rw1'||question.module==='rw2')&&question.contentStatus==='verified'
        if(question.practiceTestId!=='practice-test-4'&&!isPracticeTest5Math1Verified(question.id)&&!sourceExtractable&&!shared?.questionLines.length){
          setError('This question has not been parsed and verified for this practice set yet.')
          return
        }

        if(question.subject==='english'&&sourceBytes){
          const extracted=await ensureQuestionText(question,sourceBytes)
          if(cancelled)return
          if(extracted&&isCurrentQuestionContent(extracted))setContent({...extracted,needsVisual:resolvedVisuals.length>0||extracted.needsVisual})
          else setError('Question text is not available in this browser yet.')
          return
        }

        const local=sourceBytes?await ensureQuestionText(question,sourceBytes):await getQuestionContent(question.id)
        if(cancelled)return
        if(local&&isCurrentQuestionContent(local))setContent({...local,needsVisual:resolvedVisuals.length>0||local.needsVisual})
        else setError('Question text is not available in this browser yet.')
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to read this question as text.')
      }
    })()

    return()=>{cancelled=true}
  },[question,sourceBytes,revision])

  if(content?.questionMode==='image-fallback'){
    if(sourceBytes)return <SourceViewer pdfKey="questions" bytes={sourceBytes} page={question.sourcePage} questionNumber={question.number} alt={alt} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/>
    return <div className="structured-loading">Source question is not available for this practice set.</div>
  }
  if(error)return <div className="structured-loading">{error}</div>
  if(!content)return <div className="structured-loading">Preparing text question…</div>

  return <div className={question.subject==='english'?'structured-question reading-structured-question':'structured-question'}>
    <div className="structured-lines">
      {visuals.length&&sourceBytes
        ?<LinesWithSourceVisuals question={question} bytes={sourceBytes} lines={content.questionLines} alt={alt} visuals={visuals} sourceCrop={question.sourceCrop} reflowProse={reflowProse}/>
        :<RenderQuestionLines question={question} lines={content.questionLines} reflowProse={reflowProse}/>} 
    </div>
    {(content.needsVisual||visuals.length>0)&&!sourceBytes
      ?<div className="visual-fallback"><div className="visual-fallback-label">Source figure will appear when the source asset is available.</div></div>
      :content.needsVisual&&!visuals.length&&sourceBytes
        ?<div className="visual-fallback"><div className="visual-fallback-label">Figure from the source material</div><SourceViewer pdfKey="questions" bytes={sourceBytes} page={question.sourcePage} questionNumber={question.number} alt={`${alt} figure`} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/></div>
        :(showOriginalLayout&&!content.needsVisual&&!visuals.length&&sourceBytes&&<details className="source-layout-details"><summary>View original layout</summary><SourceViewer pdfKey="questions" bytes={sourceBytes} page={question.sourcePage} questionNumber={question.number} alt={alt} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/></details>)}
  </div>
}
