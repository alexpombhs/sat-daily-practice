import {useEffect,useRef,useState} from 'react'
import AlexAccordion from '../atoms/AlexAccordion'
import AlexBox from '../atoms/AlexBox'
import AlexButton from '../atoms/AlexButton'
import AlexInfoTooltipButton from '../atoms/AlexInfoTooltipButton'
import AlexIconButton from '../atoms/AlexIconButton'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import StructuredQuestionLines from './StructuredQuestionLines'
import ReadingQuestionLines from './ReadingQuestionLines'
import AlexTextField from '../atoms/AlexTextField'
import VisualCropEditor from './VisualCropEditor'
import {ensureQuestionText,extractQuestionLines} from '../../lib/pdfStructuredImport'
import {getQuestionContent} from '../../lib/questionContentStore'
import {hasUnderlineMarkup,preserveUnderlineMarkup,refersToUnderlinedText,underlineSelection} from '../../lib/questionTextMarkup'
import {readingTableSpec,stripEmbeddedReadingTableLines} from '../../lib/readingTables'
import {editorTextToReadingLines,readingLinesToEditorText,READING_LATEX_QUOTE_END,READING_LATEX_QUOTE_START} from '../../lib/readingQuestionFormat'
import {loadSharedQuestionContent,saveSharedQuestionRepair} from '../../lib/sharedQuestionBank'
import {verifiedMathContent} from '../../lib/verifiedMathQuestions'
import {verifiedPracticeTest5Math1Content} from '../../lib/verifiedPracticeTest5Math1'
import {verifiedPracticeTest6Reading1Content} from '../../lib/verifiedPracticeTest6Reading1'
import {verifiedPracticeTest6Reading2Content} from '../../lib/verifiedPracticeTest6Reading2'
import {verifiedPracticeTest6Math1Content} from '../../lib/verifiedPracticeTest6Math1'
import {verifiedPracticeTest6Math2Content} from '../../lib/verifiedPracticeTest6Math2'
import {verifiedPracticeTest7Math1Content} from '../../lib/verifiedPracticeTest7Math1'
import {verifiedPracticeTest7Math2Content} from '../../lib/verifiedPracticeTest7Math2'
import {questionVisualSpecs,type QuestionVisualSpec} from '../../lib/questionVisuals'
import usePracticeTestPdf from '../../hooks/usePracticeTestPdf'
import type {PracticeQuestion} from '../../types'

type Props={
  question:PracticeQuestion
  questionsPdf:ArrayBuffer|null
  onSaved?:()=>void
}

const toPlainLines=(value:string)=>value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean)

const normalizeMathEditorLine=(line:string)=>line
  .replace(/\$\$([^$]+)\$\$/g,(_match,math:string)=>'type TextOrigin='shared'|'verified'|'browser'|'source'|'empty'

export default function QuestionRepairEditor({question,questionsPdf,onSaved}:Props){
  const resolvedQuestionsPdf=usePracticeTestPdf(question,'questions',questionsPdf)
  const[questionText,setQuestionText]=useState('')
  const[textOrigin,setTextOrigin]=useState<TextOrigin>('empty')
  const questionTextRef=useRef<HTMLInputElement|HTMLTextAreaElement|null>(null)
  const[visualSpecs,setVisualSpecs]=useState<QuestionVisualSpec[]>([])
  const[loading,setLoading]=useState(true)
  const[saving,setSaving]=useState(false)
  const[extracting,setExtracting]=useState(false)
  const[message,setMessage]=useState('')
  const[error,setError]=useState('')

  useEffect(()=>{
    let cancelled=false
    setLoading(true);setError('');setMessage('')
    void (async()=>{
      try{
        const shared=await loadSharedQuestionContent(question.id,question.practiceTestId).catch(()=>null)
        let local=await getQuestionContent(question.id).catch(()=>undefined)
        const verified=question.practiceTestId==='practice-test-6'&&(question.module==='rw1'||question.module==='rw2'||question.module==='math1'||question.module==='math2')
          ?question.module==='rw1'
            ?verifiedPracticeTest6Reading1Content(question.number)
            :question.module==='rw2'
              ?verifiedPracticeTest6Reading2Content(question.number)
              :question.module==='math1'
                ?verifiedPracticeTest6Math1Content(question.number)
                :verifiedPracticeTest6Math2Content(question.number)
          :question.practiceTestId==='practice-test-7'&&(question.module==='math1'||question.module==='math2')
            ?question.module==='math1'?verifiedPracticeTest7Math1Content(question.number):verifiedPracticeTest7Math2Content(question.number)
          :question.practiceTestId==='practice-test-5'&&question.module==='math1'
            ?verifiedPracticeTest5Math1Content(question.number)
            :question.practiceTestId==='practice-test-4'&&question.subject==='math'?verifiedMathContent(question.id):undefined

        if(!local?.questionLines.length&&resolvedQuestionsPdf&&!verified){
          local=await ensureQuestionText(question,resolvedQuestionsPdf).catch(()=>local)
        }
        if(cancelled)return

        const sharedHasText=Boolean(shared?.questionLines.length)
        const verifiedHasText=Boolean(verified?.lines?.length)
        const localHasText=Boolean(local?.questionLines.length)
        const questionLines=sharedHasText?shared!.questionLines:verifiedHasText?verified!.lines:local?.questionLines??[]
        const origin:TextOrigin=sharedHasText?'shared':verifiedHasText?'verified':localHasText?'browser':'empty'
        const bundledVisuals=questionVisualSpecs(question.id)
        const sharedControlsVisual=Boolean(shared&&shared.contentStatus!=='metadata'&&!(verified&&!sharedHasText))
        const resolvedVisuals=shared?.visualSpecs?.length
          ?shared.visualSpecs
          :sharedControlsVisual&&!shared?.needsVisual?[]:bundledVisuals

        setQuestionText(editorText(question,stripEmbeddedReadingTableLines(question.id,questionLines)))
        setTextOrigin(origin)
        setVisualSpecs(resolvedVisuals)
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to prepare this question for editing.')
      }finally{if(!cancelled)setLoading(false)}
    })()
    return()=>{cancelled=true}
  },[question,resolvedQuestionsPdf])

  async function reloadFromSource(){
    if(!resolvedQuestionsPdf){
      setError('The question source PDF is not available yet.')
      return
    }
    setExtracting(true);setError('');setMessage('')
    try{
      const rawLines=await extractQuestionLines(question,resolvedQuestionsPdf)
      const verifiedSource=question.practiceTestId==='practice-test-5'&&question.module==='math1'?verifiedPracticeTest5Math1Content(question.number):undefined
      const lines=verifiedSource?.lines?.length?verifiedSource.lines:rawLines
      if(!lines.length)throw new Error('No quality-reviewed text could be reconstructed from this question’s source.')
      const extractedText=editorText(question,stripEmbeddedReadingTableLines(question.id,lines))
      const nextText=preserveUnderlineMarkup(questionText,extractedText)
      setQuestionText(nextText)
      setTextOrigin('source')
      if(refersToUnderlinedText(nextText)&&!hasUnderlineMarkup(nextText)){
        setMessage('Fresh text loaded from the source PDF. The PDF text layer does not identify the underline span, so the underline still needs review. Select the source text and use the Underline tool before saving.')
      }else{
        setMessage('Loaded fresh text from the source PDF. Existing underline formatting was preserved when the same source text was found. Review formatting, then save it to the shared Question Bank.')
      }
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to extract text from the source PDF.')
    }finally{setExtracting(false)}
  }

  function underlineSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const result=underlineSelection(questionText,input.selectionStart??0,input.selectionEnd??0)
    if(!result){
      setError('Select the exact text that should be underlined, then choose Underline selected text.')
      input.focus()
      return
    }
    setError('')
    setMessage('')
    setQuestionText(result.value)
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(result.start,result.end)
    })
  }

  function quoteSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){
      setError('Select the passage text that should appear inside the quote block first.')
      input.focus()
      return
    }
    const replacement=`${READING_LATEX_QUOTE_START}\n${selected}\n${READING_LATEX_QUOTE_END}`
    setError('');setMessage('')
    setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(start,start+replacement.length)
    })
  }

  function applyMathSelection(kind:'power'|'sqrt'|'fraction'|'variable'){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){setError('Select the exponent or radicand in the question text first.');input.focus();return}
    const replacement=kind==='power'?'^{'+selected+'}':kind==='sqrt'?'\\sqrt{'+selected+'}':kind==='fraction'?'\\frac{'+selected+'}{}':'$'+selected+'$'
    setError('');setMessage('');setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{input.focus();input.setSelectionRange(start,start+replacement.length)})
  }

  async function save(){
    const questionLines=stripEmbeddedReadingTableLines(question.id,editorLines(question,questionText).map(normalizeMathEditorLine))
    if(!questionLines.length){setError('Question text cannot be empty.');return}
    setSaving(true);setError('');setMessage('')
    try{
      await saveSharedQuestionRepair({questionId:question.id,questionLines,visualSpecs})
      setTextOrigin('shared')
      setMessage('Fix saved to the shared Question Bank.')
      onSaved?.()
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to save the shared question repair.')
    }finally{setSaving(false)}
  }

  return <AlexSurface sx={{p:{xs:2,md:2.5},border:'1px solid #D8D2FF',borderRadius:3,bgcolor:'#FCFBFF'}}>
    <AlexText component="h2" sx={{fontSize:19,fontWeight:850,color:'#08275B'}}>Fix parsed question</AlexText>
    <AlexText sx={{fontSize:13,color:'#667085',mt:.4,mb:1.75}}>Edit only the reconstructed question text and source visual. The explanation always stays in its original PDF format.</AlexText>
    {loading?<AlexText sx={{color:'#667085'}}>Preparing editable content…</AlexText>:<AlexBox sx={{display:'grid',gap:1.5}}>
      {readingTableSpec(question.id)&&<AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>Structured table preserved separately</AlexText>
        <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>The table is not part of the editable prose. Editing and saving this text will preserve the structured table without duplicating it into the question body.</AlexText>
      </AlexSurface>}
      <AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
          <AlexBox>
            <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>{textOrigin==='shared'?'Shared parsed text':'Not stored as shared parsed text yet'}</AlexText>
            <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>{textOrigin==='shared'?'This question has a saved shared repair. You can still re-extract from the original source while the parsing issue is open.':textOrigin==='source'?'Freshly extracted from the source PDF.':textOrigin==='verified'?'Loaded from bundled verified text.':textOrigin==='browser'?'Loaded from this browser’s extracted cache.':'No parsed text is available yet.'} {textOrigin!=='shared'&&'Saving a repair will persist the edited text to the shared Question Bank.'}</AlexText>
          </AlexBox>
          <AlexButton size="small" tone="secondary" disabled={extracting||!resolvedQuestionsPdf} onClick={reloadFromSource}>{extracting?'Extracting…':'Re-extract from source'}</AlexButton>
        </AlexBox>
      </AlexSurface>
      <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Text formatting</AlexText>
          
        </AlexBox>
        <AlexBox sx={{display:'flex',gap:.5,alignItems:'center',flexWrap:'wrap'}}>
          <AlexIconButton label="Power" onClick={()=>applyMathSelection('power')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:17,fontWeight:700}}>x<sup>y</sup></span></AlexIconButton>
          <AlexIconButton label="Square root" onClick={()=>applyMathSelection('sqrt')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:20}}>√x</span></AlexIconButton>
          <AlexIconButton label="Fraction" onClick={()=>applyMathSelection('fraction')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:15,lineHeight:1}}>x⁄y</span></AlexIconButton>
          <AlexIconButton label="Variable" onClick={()=>applyMathSelection('variable')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,fontStyle:'italic'}}>x</span></AlexIconButton>
          <AlexIconButton label="Underline" onClick={underlineSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,textDecoration:'underline'}}>U</span></AlexIconButton>
          <AlexIconButton label="Quote" onClick={quoteSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:22,lineHeight:1}}>❝</span></AlexIconButton>
          <AlexIconButton label="Table" onClick={()=>{const input=questionTextRef.current;if(!input)return;const start=input.selectionStart??0,end=input.selectionEnd??0;const selected=questionText.slice(start,end);const replacement='[TABLE]\\n'+(selected||'x | y\\n')+'\\n[/TABLE]';setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end));requestAnimationFrame(()=>input.focus())}} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontSize:17}}>▦</span></AlexIconButton>
        </AlexBox>
      </AlexBox>
      {refersToUnderlinedText(questionText)&&!hasUnderlineMarkup(questionText)&&<AlexSurface sx={{p:1.25,border:'1px solid #FEC84B',borderRadius:2,bgcolor:'#FFFAEB'}}>
        <AlexText sx={{fontSize:12.5,color:'#93370D'}}>This question refers to underlined text, but no underlined span is currently defined. Select the matching source text and apply underline before saving.</AlexText>
      </AlexSurface>}
      <AlexTextField
        label="Question text"
        multiline
        minRows={8}
        value={questionText}
        inputRef={questionTextRef}
        onChange={event=>setQuestionText(event.target.value)}
      />
      <AlexBox sx={{display:'flex',justifyContent:'flex-end',alignItems:'center',mt:-1,color:'#667085'}}>
        <AlexText sx={{fontSize:12}}>LaTeX help</AlexText>
        <AlexInfoTooltipButton
          label="LaTeX formatting help"
          title={<AlexBox sx={{lineHeight:1.6}}>
            <div><b>LaTeX formatting</b></div>
            <div>Variable: $x$</div><div>Power: $x^2$ or $x^&#123;2&#125;$</div>
            <div>Square root: $\\sqrt&#123;37&#125;$</div><div>Fraction: $\\frac&#123;12&#125;&#123;35&#125;$</div>
            <div>Quote block: \\begin&#123;quote&#125; ... \\end&#123;quote&#125;</div>
            <div>Use the Quote tool on only the quoted passage; keep the author/source line outside the quote block.</div>
            <div>Table: wrap rows in [TABLE] and [/TABLE], with columns separated by |.</div>
            <div>[TABLE]<br/>x | y<br/>2 | 5<br/>[/TABLE]</div>
          </AlexBox>}
        />
      </AlexBox>
      <AlexAccordion
        summary={<AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Live preview</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.15}}>Expand to see how formatting will appear to students.</AlexText>
        </AlexBox>}
      >
        <AlexBox sx={{fontFamily:'Georgia, serif',fontSize:18,lineHeight:1.55,whiteSpace:'pre-wrap',pt:.5}}>
          {question.subject==='english'
            ?<ReadingQuestionLines lines={editorLines(question,questionText)} questionId={question.id}/>
            :<StructuredQuestionLines lines={editorLines(question,questionText)}/>}
        </AlexBox>
      </AlexAccordion>
      <AlexBox sx={{display:'grid',gap:1.25}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Source visuals</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.2}}>Each visual has its own crop and placement. Adjust every figure or graphical answer group independently; placement is relative to the parsed text lines above.</AlexText>
        </AlexBox>
        {visualSpecs.map((visual,index)=><AlexSurface key={index} sx={{p:1.25,border:'1px solid #D8D2FF',borderRadius:2.5,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#344054',mb:.75}}>{`Visual ${index+1} · ${visual.kind==='choice-grid'?'Graphical answer choices':'Figure'}`}</AlexText>
          <VisualCropEditor
            question={question}
            bytes={resolvedQuestionsPdf}
            value={visual}
            onChange={next=>setVisualSpecs(current=>next?current.map((item,itemIndex)=>itemIndex===index?{...next,kind:item.kind}:item):current.filter((_,itemIndex)=>itemIndex!==index))}
            lineCount={editorLines(question,questionText).length}
          />
        </AlexSurface>)}
        <AlexButton size="small" tone="secondary" onClick={()=>setVisualSpecs(current=>[...current,{afterLine:-1,crop:{x:.05,y:.05,width:.9,height:.4},exact:true,kind:'figure'}])} sx={{justifySelf:'start'}}>Add source visual</AlexButton>
      </AlexBox>
      {error&&<AlexText role="alert" sx={{fontSize:13,color:'#B42318'}}>{error}</AlexText>}
      {message&&<AlexText role="status" sx={{fontSize:13,color:'#067647'}}>{message}</AlexText>}
      <AlexButton disabled={saving} onClick={save} sx={{justifySelf:'start'}}>{saving?'Saving fix…':'Save shared fix'}</AlexButton>
    </AlexBox>}
  </AlexSurface>
}
+math+'type TextOrigin='shared'|'verified'|'browser'|'source'|'empty'

export default function QuestionRepairEditor({question,questionsPdf,onSaved}:Props){
  const resolvedQuestionsPdf=usePracticeTestPdf(question,'questions',questionsPdf)
  const[questionText,setQuestionText]=useState('')
  const[textOrigin,setTextOrigin]=useState<TextOrigin>('empty')
  const questionTextRef=useRef<HTMLInputElement|HTMLTextAreaElement|null>(null)
  const[visualSpecs,setVisualSpecs]=useState<QuestionVisualSpec[]>([])
  const[loading,setLoading]=useState(true)
  const[saving,setSaving]=useState(false)
  const[extracting,setExtracting]=useState(false)
  const[message,setMessage]=useState('')
  const[error,setError]=useState('')

  useEffect(()=>{
    let cancelled=false
    setLoading(true);setError('');setMessage('')
    void (async()=>{
      try{
        const shared=await loadSharedQuestionContent(question.id,question.practiceTestId).catch(()=>null)
        let local=await getQuestionContent(question.id).catch(()=>undefined)
        const verified=question.practiceTestId==='practice-test-6'&&(question.module==='rw1'||question.module==='rw2'||question.module==='math1'||question.module==='math2')
          ?question.module==='rw1'
            ?verifiedPracticeTest6Reading1Content(question.number)
            :question.module==='rw2'
              ?verifiedPracticeTest6Reading2Content(question.number)
              :question.module==='math1'
                ?verifiedPracticeTest6Math1Content(question.number)
                :verifiedPracticeTest6Math2Content(question.number)
          :question.practiceTestId==='practice-test-7'&&(question.module==='math1'||question.module==='math2')
            ?question.module==='math1'?verifiedPracticeTest7Math1Content(question.number):verifiedPracticeTest7Math2Content(question.number)
          :question.practiceTestId==='practice-test-5'&&question.module==='math1'
            ?verifiedPracticeTest5Math1Content(question.number)
            :question.practiceTestId==='practice-test-4'&&question.subject==='math'?verifiedMathContent(question.id):undefined

        if(!local?.questionLines.length&&resolvedQuestionsPdf&&!verified){
          local=await ensureQuestionText(question,resolvedQuestionsPdf).catch(()=>local)
        }
        if(cancelled)return

        const sharedHasText=Boolean(shared?.questionLines.length)
        const verifiedHasText=Boolean(verified?.lines?.length)
        const localHasText=Boolean(local?.questionLines.length)
        const questionLines=sharedHasText?shared!.questionLines:verifiedHasText?verified!.lines:local?.questionLines??[]
        const origin:TextOrigin=sharedHasText?'shared':verifiedHasText?'verified':localHasText?'browser':'empty'
        const bundledVisuals=questionVisualSpecs(question.id)
        const sharedControlsVisual=Boolean(shared&&shared.contentStatus!=='metadata'&&!(verified&&!sharedHasText))
        const resolvedVisuals=shared?.visualSpecs?.length
          ?shared.visualSpecs
          :sharedControlsVisual&&!shared?.needsVisual?[]:bundledVisuals

        setQuestionText(stripEmbeddedReadingTableLines(question.id,questionLines).join('\n'))
        setTextOrigin(origin)
        setVisualSpecs(resolvedVisuals)
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to prepare this question for editing.')
      }finally{if(!cancelled)setLoading(false)}
    })()
    return()=>{cancelled=true}
  },[question,resolvedQuestionsPdf])

  async function reloadFromSource(){
    if(!resolvedQuestionsPdf){
      setError('The question source PDF is not available yet.')
      return
    }
    setExtracting(true);setError('');setMessage('')
    try{
      const rawLines=await extractQuestionLines(question,resolvedQuestionsPdf)
      const verifiedSource=question.practiceTestId==='practice-test-5'&&question.module==='math1'?verifiedPracticeTest5Math1Content(question.number):undefined
      const lines=verifiedSource?.lines?.length?verifiedSource.lines:rawLines
      if(!lines.length)throw new Error('No quality-reviewed text could be reconstructed from this question’s source.')
      setQuestionText(stripEmbeddedReadingTableLines(question.id,lines).join('\n'))
      setTextOrigin('source')
      setMessage('Loaded fresh text from the source PDF. Review formatting, then save it to the shared Question Bank.')
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to extract text from the source PDF.')
    }finally{setExtracting(false)}
  }

  function underlineSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const result=underlineSelection(questionText,input.selectionStart??0,input.selectionEnd??0)
    if(!result){
      setError('Select the exact text that should be underlined, then choose Underline selected text.')
      input.focus()
      return
    }
    setError('')
    setMessage('')
    setQuestionText(result.value)
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(result.start,result.end)
    })
  }

  function quoteSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){
      setError('Select the passage text that should appear inside the quote block first.')
      input.focus()
      return
    }
    const replacement=`${READING_LATEX_QUOTE_START}\n${selected}\n${READING_LATEX_QUOTE_END}`
    setError('');setMessage('')
    setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(start,start+replacement.length)
    })
  }

  function applyMathSelection(kind:'power'|'sqrt'|'fraction'|'variable'){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){setError('Select the exponent or radicand in the question text first.');input.focus();return}
    const replacement=kind==='power'?'^{'+selected+'}':kind==='sqrt'?'\\sqrt{'+selected+'}':kind==='fraction'?'\\frac{'+selected+'}{}':'$'+selected+'$'
    setError('');setMessage('');setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{input.focus();input.setSelectionRange(start,start+replacement.length)})
  }

  async function save(){
    const questionLines=stripEmbeddedReadingTableLines(question.id,toLines(questionText).map(normalizeMathEditorLine))
    if(!questionLines.length){setError('Question text cannot be empty.');return}
    setSaving(true);setError('');setMessage('')
    try{
      await saveSharedQuestionRepair({questionId:question.id,questionLines,visualSpecs})
      setTextOrigin('shared')
      setMessage('Fix saved to the shared Question Bank.')
      onSaved?.()
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to save the shared question repair.')
    }finally{setSaving(false)}
  }

  return <AlexSurface sx={{p:{xs:2,md:2.5},border:'1px solid #D8D2FF',borderRadius:3,bgcolor:'#FCFBFF'}}>
    <AlexText component="h2" sx={{fontSize:19,fontWeight:850,color:'#08275B'}}>Fix parsed question</AlexText>
    <AlexText sx={{fontSize:13,color:'#667085',mt:.4,mb:1.75}}>Edit only the reconstructed question text and source visual. The explanation always stays in its original PDF format.</AlexText>
    {loading?<AlexText sx={{color:'#667085'}}>Preparing editable content…</AlexText>:<AlexBox sx={{display:'grid',gap:1.5}}>
      {readingTableSpec(question.id)&&<AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>Structured table preserved separately</AlexText>
        <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>The table is not part of the editable prose. Editing and saving this text will preserve the structured table without duplicating it into the question body.</AlexText>
      </AlexSurface>}
      <AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
          <AlexBox>
            <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>{textOrigin==='shared'?'Shared parsed text':'Not stored as shared parsed text yet'}</AlexText>
            <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>{textOrigin==='shared'?'This question has a saved shared repair. You can still re-extract from the original source while the parsing issue is open.':textOrigin==='source'?'Freshly extracted from the source PDF.':textOrigin==='verified'?'Loaded from bundled verified text.':textOrigin==='browser'?'Loaded from this browser’s extracted cache.':'No parsed text is available yet.'} {textOrigin!=='shared'&&'Saving a repair will persist the edited text to the shared Question Bank.'}</AlexText>
          </AlexBox>
          <AlexButton size="small" tone="secondary" disabled={extracting||!resolvedQuestionsPdf} onClick={reloadFromSource}>{extracting?'Extracting…':'Re-extract from source'}</AlexButton>
        </AlexBox>
      </AlexSurface>
      <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Text formatting</AlexText>
          
        </AlexBox>
        <AlexBox sx={{display:'flex',gap:.5,alignItems:'center',flexWrap:'wrap'}}>
          <AlexIconButton label="Power" onClick={()=>applyMathSelection('power')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:17,fontWeight:700}}>x<sup>y</sup></span></AlexIconButton>
          <AlexIconButton label="Square root" onClick={()=>applyMathSelection('sqrt')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:20}}>√x</span></AlexIconButton>
          <AlexIconButton label="Fraction" onClick={()=>applyMathSelection('fraction')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:15,lineHeight:1}}>x⁄y</span></AlexIconButton>
          <AlexIconButton label="Variable" onClick={()=>applyMathSelection('variable')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,fontStyle:'italic'}}>x</span></AlexIconButton>
          <AlexIconButton label="Underline" onClick={underlineSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,textDecoration:'underline'}}>U</span></AlexIconButton>
          <AlexIconButton label="Quote" onClick={quoteSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:22,lineHeight:1}}>❝</span></AlexIconButton>
          <AlexIconButton label="Table" onClick={()=>{const input=questionTextRef.current;if(!input)return;const start=input.selectionStart??0,end=input.selectionEnd??0;const selected=questionText.slice(start,end);const replacement='[TABLE]\\n'+(selected||'x | y\\n')+'\\n[/TABLE]';setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end));requestAnimationFrame(()=>input.focus())}} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontSize:17}}>▦</span></AlexIconButton>
        </AlexBox>
      </AlexBox>
      {refersToUnderlinedText(questionText)&&!hasUnderlineMarkup(questionText)&&<AlexSurface sx={{p:1.25,border:'1px solid #FEC84B',borderRadius:2,bgcolor:'#FFFAEB'}}>
        <AlexText sx={{fontSize:12.5,color:'#93370D'}}>This question refers to underlined text, but no underlined span is currently defined. Select the matching source text and apply underline before saving.</AlexText>
      </AlexSurface>}
      <AlexSurface sx={{p:1.25,border:'1px solid #D0D5DD',borderRadius:2,bgcolor:'#FFFFFF'}}>
        <AlexText sx={{fontSize:12,fontWeight:800,color:'#475467',mb:.75}}>Live math preview</AlexText>
        <AlexText sx={{fontSize:11.5,color:'#667085',mb:1}}>Edit the plain text below; this preview shows how math formatting, underlines, quote blocks, and tables will appear to students.</AlexText>
        <AlexBox sx={{fontFamily:'Georgia, serif',fontSize:18,lineHeight:1.55,whiteSpace:'pre-wrap'}}>
          {question.subject==='english'
            ?<ReadingQuestionLines lines={toLines(questionText)} questionId={question.id}/>
            :<StructuredQuestionLines lines={toLines(questionText)}/>}
        </AlexBox>
      </AlexSurface>
      <AlexTextField
        label="Question text"
        multiline
        minRows={8}
        value={questionText}
        inputRef={questionTextRef}
        onChange={event=>setQuestionText(event.target.value)}
      />
      <AlexBox sx={{display:'flex',justifyContent:'flex-end',alignItems:'center',mt:-1,color:'#667085'}}>
        <AlexText sx={{fontSize:12}}>LaTeX help</AlexText>
        <AlexInfoTooltipButton
          label="LaTeX formatting help"
          title={<AlexBox sx={{lineHeight:1.6}}>
            <div><b>LaTeX formatting</b></div>
            <div>Variable: $x$</div><div>Power: $x^2$ or $x^&#123;2&#125;$</div>
            <div>Square root: $\\sqrt&#123;37&#125;$</div><div>Fraction: $\\frac&#123;12&#125;&#123;35&#125;$</div>
            <div>Quote block: \\begin&#123;quote&#125; ... \\end&#123;quote&#125;</div>
            <div>Use the Quote tool on only the quoted passage; keep the author/source line outside the quote block.</div>
            <div>Table: wrap rows in [TABLE] and [/TABLE], with columns separated by |.</div>
            <div>[TABLE]<br/>x | y<br/>2 | 5<br/>[/TABLE]</div>
          </AlexBox>}
        />
      </AlexBox>
      <AlexBox sx={{display:'grid',gap:1.25}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Source visuals</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.2}}>Each visual has its own crop and placement. Adjust every figure or graphical answer group independently; placement is relative to the parsed text lines above.</AlexText>
        </AlexBox>
        {visualSpecs.map((visual,index)=><AlexSurface key={index} sx={{p:1.25,border:'1px solid #D8D2FF',borderRadius:2.5,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#344054',mb:.75}}>{`Visual ${index+1} · ${visual.kind==='choice-grid'?'Graphical answer choices':'Figure'}`}</AlexText>
          <VisualCropEditor
            question={question}
            bytes={resolvedQuestionsPdf}
            value={visual}
            onChange={next=>setVisualSpecs(current=>next?current.map((item,itemIndex)=>itemIndex===index?{...next,kind:item.kind}:item):current.filter((_,itemIndex)=>itemIndex!==index))}
            lineCount={toLines(questionText).length}
          />
        </AlexSurface>)}
        <AlexButton size="small" tone="secondary" onClick={()=>setVisualSpecs(current=>[...current,{afterLine:-1,crop:{x:.05,y:.05,width:.9,height:.4},exact:true,kind:'figure'}])} sx={{justifySelf:'start'}}>Add source visual</AlexButton>
      </AlexBox>
      {error&&<AlexText role="alert" sx={{fontSize:13,color:'#B42318'}}>{error}</AlexText>}
      {message&&<AlexText role="status" sx={{fontSize:13,color:'#067647'}}>{message}</AlexText>}
      <AlexButton disabled={saving} onClick={save} sx={{justifySelf:'start'}}>{saving?'Saving fix…':'Save shared fix'}</AlexButton>
    </AlexBox>}
  </AlexSurface>
}
)

function editorLines(question:PracticeQuestion,value:string){
  return question.subject==='english'?editorTextToReadingLines(value):toPlainLines(value)
}

function editorText(question:PracticeQuestion,lines:string[]){
  return question.subject==='english'?readingLinesToEditorText(lines):lines.join('\n')
}
type TextOrigin='shared'|'verified'|'browser'|'source'|'empty'

export default function QuestionRepairEditor({question,questionsPdf,onSaved}:Props){
  const resolvedQuestionsPdf=usePracticeTestPdf(question,'questions',questionsPdf)
  const[questionText,setQuestionText]=useState('')
  const[textOrigin,setTextOrigin]=useState<TextOrigin>('empty')
  const questionTextRef=useRef<HTMLInputElement|HTMLTextAreaElement|null>(null)
  const[visualSpecs,setVisualSpecs]=useState<QuestionVisualSpec[]>([])
  const[loading,setLoading]=useState(true)
  const[saving,setSaving]=useState(false)
  const[extracting,setExtracting]=useState(false)
  const[message,setMessage]=useState('')
  const[error,setError]=useState('')

  useEffect(()=>{
    let cancelled=false
    setLoading(true);setError('');setMessage('')
    void (async()=>{
      try{
        const shared=await loadSharedQuestionContent(question.id,question.practiceTestId).catch(()=>null)
        let local=await getQuestionContent(question.id).catch(()=>undefined)
        const verified=question.practiceTestId==='practice-test-6'&&(question.module==='rw1'||question.module==='rw2'||question.module==='math1'||question.module==='math2')
          ?question.module==='rw1'
            ?verifiedPracticeTest6Reading1Content(question.number)
            :question.module==='rw2'
              ?verifiedPracticeTest6Reading2Content(question.number)
              :question.module==='math1'
                ?verifiedPracticeTest6Math1Content(question.number)
                :verifiedPracticeTest6Math2Content(question.number)
          :question.practiceTestId==='practice-test-7'&&(question.module==='math1'||question.module==='math2')
            ?question.module==='math1'?verifiedPracticeTest7Math1Content(question.number):verifiedPracticeTest7Math2Content(question.number)
          :question.practiceTestId==='practice-test-5'&&question.module==='math1'
            ?verifiedPracticeTest5Math1Content(question.number)
            :question.practiceTestId==='practice-test-4'&&question.subject==='math'?verifiedMathContent(question.id):undefined

        if(!local?.questionLines.length&&resolvedQuestionsPdf&&!verified){
          local=await ensureQuestionText(question,resolvedQuestionsPdf).catch(()=>local)
        }
        if(cancelled)return

        const sharedHasText=Boolean(shared?.questionLines.length)
        const verifiedHasText=Boolean(verified?.lines?.length)
        const localHasText=Boolean(local?.questionLines.length)
        const questionLines=sharedHasText?shared!.questionLines:verifiedHasText?verified!.lines:local?.questionLines??[]
        const origin:TextOrigin=sharedHasText?'shared':verifiedHasText?'verified':localHasText?'browser':'empty'
        const bundledVisuals=questionVisualSpecs(question.id)
        const sharedControlsVisual=Boolean(shared&&shared.contentStatus!=='metadata'&&!(verified&&!sharedHasText))
        const resolvedVisuals=shared?.visualSpecs?.length
          ?shared.visualSpecs
          :sharedControlsVisual&&!shared?.needsVisual?[]:bundledVisuals

        setQuestionText(stripEmbeddedReadingTableLines(question.id,questionLines).join('\n'))
        setTextOrigin(origin)
        setVisualSpecs(resolvedVisuals)
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to prepare this question for editing.')
      }finally{if(!cancelled)setLoading(false)}
    })()
    return()=>{cancelled=true}
  },[question,resolvedQuestionsPdf])

  async function reloadFromSource(){
    if(!resolvedQuestionsPdf){
      setError('The question source PDF is not available yet.')
      return
    }
    setExtracting(true);setError('');setMessage('')
    try{
      const rawLines=await extractQuestionLines(question,resolvedQuestionsPdf)
      const verifiedSource=question.practiceTestId==='practice-test-5'&&question.module==='math1'?verifiedPracticeTest5Math1Content(question.number):undefined
      const lines=verifiedSource?.lines?.length?verifiedSource.lines:rawLines
      if(!lines.length)throw new Error('No quality-reviewed text could be reconstructed from this question’s source.')
      setQuestionText(stripEmbeddedReadingTableLines(question.id,lines).join('\n'))
      setTextOrigin('source')
      setMessage('Loaded fresh text from the source PDF. Review formatting, then save it to the shared Question Bank.')
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to extract text from the source PDF.')
    }finally{setExtracting(false)}
  }

  function underlineSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const result=underlineSelection(questionText,input.selectionStart??0,input.selectionEnd??0)
    if(!result){
      setError('Select the exact text that should be underlined, then choose Underline selected text.')
      input.focus()
      return
    }
    setError('')
    setMessage('')
    setQuestionText(result.value)
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(result.start,result.end)
    })
  }

  function quoteSelectedText(){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){
      setError('Select the passage text that should appear inside the quote block first.')
      input.focus()
      return
    }
    const replacement=`${READING_LATEX_QUOTE_START}\n${selected}\n${READING_LATEX_QUOTE_END}`
    setError('');setMessage('')
    setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{
      input.focus()
      input.setSelectionRange(start,start+replacement.length)
    })
  }

  function applyMathSelection(kind:'power'|'sqrt'|'fraction'|'variable'){
    const input=questionTextRef.current
    if(!input)return
    const start=input.selectionStart??0,end=input.selectionEnd??0
    const selected=questionText.slice(start,end).trim()
    if(!selected){setError('Select the exponent or radicand in the question text first.');input.focus();return}
    const replacement=kind==='power'?'^{'+selected+'}':kind==='sqrt'?'\\sqrt{'+selected+'}':kind==='fraction'?'\\frac{'+selected+'}{}':'$'+selected+'$'
    setError('');setMessage('');setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end))
    requestAnimationFrame(()=>{input.focus();input.setSelectionRange(start,start+replacement.length)})
  }

  async function save(){
    const questionLines=stripEmbeddedReadingTableLines(question.id,toLines(questionText).map(normalizeMathEditorLine))
    if(!questionLines.length){setError('Question text cannot be empty.');return}
    setSaving(true);setError('');setMessage('')
    try{
      await saveSharedQuestionRepair({questionId:question.id,questionLines,visualSpecs})
      setTextOrigin('shared')
      setMessage('Fix saved to the shared Question Bank.')
      onSaved?.()
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Unable to save the shared question repair.')
    }finally{setSaving(false)}
  }

  return <AlexSurface sx={{p:{xs:2,md:2.5},border:'1px solid #D8D2FF',borderRadius:3,bgcolor:'#FCFBFF'}}>
    <AlexText component="h2" sx={{fontSize:19,fontWeight:850,color:'#08275B'}}>Fix parsed question</AlexText>
    <AlexText sx={{fontSize:13,color:'#667085',mt:.4,mb:1.75}}>Edit only the reconstructed question text and source visual. The explanation always stays in its original PDF format.</AlexText>
    {loading?<AlexText sx={{color:'#667085'}}>Preparing editable content…</AlexText>:<AlexBox sx={{display:'grid',gap:1.5}}>
      {readingTableSpec(question.id)&&<AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>Structured table preserved separately</AlexText>
        <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>The table is not part of the editable prose. Editing and saving this text will preserve the structured table without duplicating it into the question body.</AlexText>
      </AlexSurface>}
      <AlexSurface sx={{p:1.4,border:'1px solid #B2CCFF',borderRadius:2,bgcolor:'#F5F8FF'}}>
        <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
          <AlexBox>
            <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#1849A9'}}>{textOrigin==='shared'?'Shared parsed text':'Not stored as shared parsed text yet'}</AlexText>
            <AlexText sx={{fontSize:12,color:'#475467',mt:.2}}>{textOrigin==='shared'?'This question has a saved shared repair. You can still re-extract from the original source while the parsing issue is open.':textOrigin==='source'?'Freshly extracted from the source PDF.':textOrigin==='verified'?'Loaded from bundled verified text.':textOrigin==='browser'?'Loaded from this browser’s extracted cache.':'No parsed text is available yet.'} {textOrigin!=='shared'&&'Saving a repair will persist the edited text to the shared Question Bank.'}</AlexText>
          </AlexBox>
          <AlexButton size="small" tone="secondary" disabled={extracting||!resolvedQuestionsPdf} onClick={reloadFromSource}>{extracting?'Extracting…':'Re-extract from source'}</AlexButton>
        </AlexBox>
      </AlexSurface>
      <AlexBox sx={{display:'flex',alignItems:{xs:'flex-start',sm:'center'},justifyContent:'space-between',gap:1,flexWrap:'wrap'}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Text formatting</AlexText>
          
        </AlexBox>
        <AlexBox sx={{display:'flex',gap:.5,alignItems:'center',flexWrap:'wrap'}}>
          <AlexIconButton label="Power" onClick={()=>applyMathSelection('power')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:17,fontWeight:700}}>x<sup>y</sup></span></AlexIconButton>
          <AlexIconButton label="Square root" onClick={()=>applyMathSelection('sqrt')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:20}}>√x</span></AlexIconButton>
          <AlexIconButton label="Fraction" onClick={()=>applyMathSelection('fraction')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:15,lineHeight:1}}>x⁄y</span></AlexIconButton>
          <AlexIconButton label="Variable" onClick={()=>applyMathSelection('variable')} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,fontStyle:'italic'}}>x</span></AlexIconButton>
          <AlexIconButton label="Underline" onClick={underlineSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:18,textDecoration:'underline'}}>U</span></AlexIconButton>
          <AlexIconButton label="Quote" onClick={quoteSelectedText} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontFamily:'Georgia, serif',fontSize:22,lineHeight:1}}>❝</span></AlexIconButton>
          <AlexIconButton label="Table" onClick={()=>{const input=questionTextRef.current;if(!input)return;const start=input.selectionStart??0,end=input.selectionEnd??0;const selected=questionText.slice(start,end);const replacement='[TABLE]\\n'+(selected||'x | y\\n')+'\\n[/TABLE]';setQuestionText(questionText.slice(0,start)+replacement+questionText.slice(end));requestAnimationFrame(()=>input.focus())}} sx={{border:'1px solid #B2CCFF',borderRadius:1,width:40,height:40}}><span style={{fontSize:17}}>▦</span></AlexIconButton>
        </AlexBox>
      </AlexBox>
      {refersToUnderlinedText(questionText)&&!hasUnderlineMarkup(questionText)&&<AlexSurface sx={{p:1.25,border:'1px solid #FEC84B',borderRadius:2,bgcolor:'#FFFAEB'}}>
        <AlexText sx={{fontSize:12.5,color:'#93370D'}}>This question refers to underlined text, but no underlined span is currently defined. Select the matching source text and apply underline before saving.</AlexText>
      </AlexSurface>}
      <AlexSurface sx={{p:1.25,border:'1px solid #D0D5DD',borderRadius:2,bgcolor:'#FFFFFF'}}>
        <AlexText sx={{fontSize:12,fontWeight:800,color:'#475467',mb:.75}}>Live math preview</AlexText>
        <AlexText sx={{fontSize:11.5,color:'#667085',mb:1}}>Edit the plain text below; this preview shows how math formatting, underlines, quote blocks, and tables will appear to students.</AlexText>
        <AlexBox sx={{fontFamily:'Georgia, serif',fontSize:18,lineHeight:1.55,whiteSpace:'pre-wrap'}}>
          {question.subject==='english'
            ?<ReadingQuestionLines lines={toLines(questionText)} questionId={question.id}/>
            :<StructuredQuestionLines lines={toLines(questionText)}/>}
        </AlexBox>
      </AlexSurface>
      <AlexTextField
        label="Question text"
        multiline
        minRows={8}
        value={questionText}
        inputRef={questionTextRef}
        onChange={event=>setQuestionText(event.target.value)}
      />
      <AlexBox sx={{display:'flex',justifyContent:'flex-end',alignItems:'center',mt:-1,color:'#667085'}}>
        <AlexText sx={{fontSize:12}}>LaTeX help</AlexText>
        <AlexInfoTooltipButton
          label="LaTeX formatting help"
          title={<AlexBox sx={{lineHeight:1.6}}>
            <div><b>LaTeX formatting</b></div>
            <div>Variable: $x$</div><div>Power: $x^2$ or $x^&#123;2&#125;$</div>
            <div>Square root: $\\sqrt&#123;37&#125;$</div><div>Fraction: $\\frac&#123;12&#125;&#123;35&#125;$</div>
            <div>Quote block: \\begin&#123;quote&#125; ... \\end&#123;quote&#125;</div>
            <div>Use the Quote tool on only the quoted passage; keep the author/source line outside the quote block.</div>
            <div>Table: wrap rows in [TABLE] and [/TABLE], with columns separated by |.</div>
            <div>[TABLE]<br/>x | y<br/>2 | 5<br/>[/TABLE]</div>
          </AlexBox>}
        />
      </AlexBox>
      <AlexBox sx={{display:'grid',gap:1.25}}>
        <AlexBox>
          <AlexText sx={{fontSize:13,fontWeight:800,color:'#344054'}}>Source visuals</AlexText>
          <AlexText sx={{fontSize:12,color:'#667085',mt:.2}}>Each visual has its own crop and placement. Adjust every figure or graphical answer group independently; placement is relative to the parsed text lines above.</AlexText>
        </AlexBox>
        {visualSpecs.map((visual,index)=><AlexSurface key={index} sx={{p:1.25,border:'1px solid #D8D2FF',borderRadius:2.5,bgcolor:'#fff'}}>
          <AlexText sx={{fontSize:12.5,fontWeight:800,color:'#344054',mb:.75}}>{`Visual ${index+1} · ${visual.kind==='choice-grid'?'Graphical answer choices':'Figure'}`}</AlexText>
          <VisualCropEditor
            question={question}
            bytes={resolvedQuestionsPdf}
            value={visual}
            onChange={next=>setVisualSpecs(current=>next?current.map((item,itemIndex)=>itemIndex===index?{...next,kind:item.kind}:item):current.filter((_,itemIndex)=>itemIndex!==index))}
            lineCount={toLines(questionText).length}
          />
        </AlexSurface>)}
        <AlexButton size="small" tone="secondary" onClick={()=>setVisualSpecs(current=>[...current,{afterLine:-1,crop:{x:.05,y:.05,width:.9,height:.4},exact:true,kind:'figure'}])} sx={{justifySelf:'start'}}>Add source visual</AlexButton>
      </AlexBox>
      {error&&<AlexText role="alert" sx={{fontSize:13,color:'#B42318'}}>{error}</AlexText>}
      {message&&<AlexText role="status" sx={{fontSize:13,color:'#067647'}}>{message}</AlexText>}
      <AlexButton disabled={saving} onClick={save} sx={{justifySelf:'start'}}>{saving?'Saving fix…':'Save shared fix'}</AlexButton>
    </AlexBox>}
  </AlexSurface>
}
