import {useEffect,useState,type ReactNode} from 'react'
import '../../structured.css'
import QuestionVisualSlice from '../../components/QuestionVisualSlice'
import SourceViewer from './SourceViewer'
import StructuredQuestionLines from './StructuredQuestionLines'
import OriginalPT1Graph from './OriginalPT1Graph'
import ReadingQuestionLines from './ReadingQuestionLines'
import {loadSharedQuestionContent} from '../../lib/sharedQuestionBank'
import {QUESTION_CONTENT_VERSION,type StoredQuestionContent} from '../../lib/questionContentStore'
import type {QuestionVisualSpec} from '../../lib/questionVisuals'
import type {CanonicalGraphic} from './OriginalPT1Graph'
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
  const[inlineVisuals,setInlineVisuals]=useState<CanonicalGraphic[]>([])
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
    setInlineVisuals([])
    void (async()=>{
      try{
        // Canonical content only: no bundled question bodies, edits-overlays or PDF fallback.
        const shared=await loadSharedQuestionContent(question.id,question.practiceTestId)
        if(cancelled)return
        if(!shared||!shared.questionLines.length){
          setError('Canonical question text is unavailable. Please report this question to the content administrator.')
          return
        }
        const canonicalVisuals=shared.visualSpecs??[]
        setVisuals(canonicalVisuals)
        setInlineVisuals(shared.inlineVisuals??[])
        setContent(storedFromShared(question.id,shared.questionLines,shared.explanationLines,canonicalVisuals.length>0||shared.needsVisual,shared.questionMode))
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to load canonical question.')
      }
    })()
    return()=>{cancelled=true}
  },[question,revision])

  if(content?.questionMode==='image-fallback'){
    if(sourceBytes)return <SourceViewer pdfKey="questions" bytes={sourceBytes} page={question.sourcePage} questionNumber={question.number} alt={alt} practiceTestId={question.practiceTestId} module={question.module} sourceCrop={question.sourceCrop}/>
    return <div className="structured-loading">Source question is not available for this practice set.</div>
  }
  if(error)return <div className="structured-loading">{error}</div>
  if(!content)return <div className="structured-loading">Preparing text question…</div>

  return <div className={question.subject==='english'?'structured-question reading-structured-question':'structured-question'}>
    <OriginalPT1Graph graph={inlineVisuals[0]??null}/>
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
