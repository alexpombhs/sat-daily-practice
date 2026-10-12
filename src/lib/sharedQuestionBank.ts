import {supabase} from './supabase'
import type {QuestionVisualSpec} from './questionVisuals'
import type {ModuleKey,PracticeQuestion,SourceCrop,Subject} from '../types'

export type SharedQuestionContent={
  questionId:string
  practiceTestId:string
  updatedAt:string
  questionLines:string[]
  explanationLines:string[]
  needsVisual:boolean
  contentStatus:'metadata'|'verified'|'imported'
  visualSpec:QuestionVisualSpec|null
  visualSpecs:QuestionVisualSpec[]
  sourceCrop:SourceCrop|null
  questionMode:'text'|'image-fallback'
  inlineVisuals:Array<{title:string;labels:string[];values:number[];kind:'bar'|'line'|'scatter';xLabel?:string;yLabel?:string}>
}

function parseOneVisualSpec(crop:unknown,afterLine:unknown):QuestionVisualSpec|null{
  if(!crop||typeof crop!=='object'||Array.isArray(crop))return null
  const value=crop as Record<string,unknown>
  const x=Number(value.x),y=Number(value.y),width=Number(value.width),height=Number(value.height)
  const line=Number(value.afterLine??afterLine)
  if([x,y,width,height,line].some(number=>Number.isNaN(number)))return null
  if(x<0||y<0||width<=0||height<=0||x+width>1||y+height>1||line<-1)return null
  const kind=value.kind==='choice-grid'?'choice-grid':value.kind==='figure'?'figure':undefined
  return {afterLine:line,crop:{x,y,width,height},exact:true,kind}
}

function parseVisualSpecs(crop:unknown,afterLine:unknown):QuestionVisualSpec[]{
  if(Array.isArray(crop))return crop.flatMap(item=>{
    const parsed=parseOneVisualSpec(item,afterLine)
    return parsed?[parsed]:[]
  })
  const parsed=parseOneVisualSpec(crop,afterLine)
  return parsed?[parsed]:[]
}

export function idMatchesPracticeTest(id:string,practiceTestId:string){
  if(practiceTestId==='practice-test-1')return /^pt1-(?:rw[12]|math[12])-\d{2}$/.test(id)
  if(practiceTestId==='practice-test-4')return !id.startsWith('practice-test-')
  return id.startsWith(`${practiceTestId}:`)
}

export function mergeQuestionBanks(bundled:PracticeQuestion[],shared:PracticeQuestion[]|null|undefined){
  if(!shared?.length)return bundled
  const merged=new Map(bundled.map(question=>[question.id,question]))
  shared.forEach(question=>merged.set(question.id,question))
  return [...merged.values()]
}

export async function loadSharedQuestionBank():Promise<PracticeQuestion[]|null>{
  if(!supabase)return null
  const {data,error}=await supabase
    .from('sat_question_bank')
    .select('id,practice_test_id,subject,module,question_number,source_page,answer_page,correct_answer,accepted_answers,response_type,source_crop,content_status,question_mode')
    .order('module',{ascending:true})
    .order('question_number',{ascending:true})
  if(error)throw error
  const {data:difficultyRows,error:difficultyError}=await supabase
    .from('sat_question_difficulty').select('question_id,difficulty')
  // Public question content remains available when optional difficulty metadata is restricted.
  if(difficultyError)console.warn('Difficulty metadata unavailable; continuing with shared questions.',difficultyError)
  const difficulties=new Map((difficultyError?[]:difficultyRows??[]).map(row=>[row.question_id,row.difficulty]))
  const remote=(data??[]).filter(row=>idMatchesPracticeTest(row.id,row.practice_test_id)).map(row=>({
    id:row.id,
    difficulty:difficulties.get(row.id) as PracticeQuestion['difficulty'],
    practiceTestId:row.practice_test_id,
    subject:row.subject as Subject,
    module:row.module as ModuleKey,
    number:row.question_number,
    sourcePage:row.source_page,
    answerPage:row.answer_page,
    correctAnswer:row.correct_answer,
    acceptedAnswers:Array.isArray(row.accepted_answers)?row.accepted_answers as string[]:[row.correct_answer],
    responseType:row.response_type as PracticeQuestion['responseType'],
    sourceCrop:row.source_crop as SourceCrop|null,
    contentStatus:row.content_status as PracticeQuestion['contentStatus'],
    questionMode:row.question_mode as PracticeQuestion['questionMode'],
  }))
  return remote
}

export async function loadSharedQuestionContent(questionId:string,expectedPracticeTestId?:string):Promise<SharedQuestionContent|null>{
  if(!supabase)return null
  const {data,error}=await supabase
    .from('sat_question_bank')
    .select('id,practice_test_id,updated_at,question_lines,explanation_lines,needs_visual,content_status,visual_specs,visual_crop,visual_after_line,source_crop,question_mode,inline_visuals')
    .eq('id',questionId)
    .maybeSingle()
  if(error)throw error
  if(!data)return null
  if(expectedPracticeTestId&&data.practice_test_id!==expectedPracticeTestId)return null
  if(!idMatchesPracticeTest(data.id,data.practice_test_id))return null
  const visualSpecs=parseVisualSpecs(Array.isArray(data.visual_specs)&&data.visual_specs.length?data.visual_specs:data.visual_crop,data.visual_after_line)
  return {
    questionId:data.id,
    practiceTestId:data.practice_test_id,
    updatedAt:data.updated_at,
    questionLines:Array.isArray(data.question_lines)?data.question_lines as string[]:[],
    explanationLines:Array.isArray(data.explanation_lines)?data.explanation_lines as string[]:[],
    needsVisual:Boolean(data.needs_visual),
    contentStatus:data.content_status as SharedQuestionContent['contentStatus'],
    visualSpec:visualSpecs[0]??null,
    visualSpecs,
    sourceCrop:data.source_crop as SourceCrop|null,
    questionMode:data.question_mode as SharedQuestionContent['questionMode'],
    inlineVisuals:Array.isArray(data.inline_visuals)?data.inline_visuals as SharedQuestionContent['inlineVisuals']:[],
  }
}

export function questionLinesEqual(actual:unknown,expected:string[]){
  return Array.isArray(actual)
    &&actual.length===expected.length
    &&actual.every((line,index)=>typeof line==='string'&&line===expected[index])
}

export async function saveSharedQuestionRepair(input:{
  questionId:string
  questionLines:string[]
  expectedUpdatedAt:string
  visualSpec?:QuestionVisualSpec|null
  visualSpecs?:QuestionVisualSpec[]
}){
  if(!supabase)throw new Error('Supabase is not configured for shared question repairs.')
  const {data:authData,error:authError}=await supabase.auth.getUser()
  if(authError||!authData.user)throw new Error('Sign in before saving a shared Question Bank repair.')
  const visuals=input.visualSpecs??(input.visualSpec?[input.visualSpec]:[])
  const encodeVisual=(visual:QuestionVisualSpec,includeLine:boolean)=>({
    ...visual.crop,
    ...(includeLine?{afterLine:visual.afterLine}:{}),
    ...(visual.kind?{kind:visual.kind}:{}),
  })
  const encodedVisuals=visuals.map(visual=>encodeVisual(visual,true))
  const legacyVisualCrop=visuals[0]?encodeVisual(visuals[0],false):null
  const {data,error}=await supabase.from('sat_question_bank').update({
    question_lines:input.questionLines,
    question_mode:'text',
    needs_visual:visuals.length>0,
    visual_specs:encodedVisuals,
    // Keep the legacy single-visual columns valid for older readers. Multi-visual
    // questions are canonical in visual_specs; never write an array into visual_crop.
    visual_crop:legacyVisualCrop,
    visual_after_line:visuals[0]?.afterLine??null,
    content_status:'verified',
    updated_at:new Date().toISOString(),
  }).eq('id',input.questionId).eq('updated_at',input.expectedUpdatedAt)
    .select('id,question_lines,question_mode,visual_specs,updated_at')
    .maybeSingle()
  if(error)throw new Error(`Supabase save failed: ${error.message}${error.code?` (code ${error.code})`:''}`)
  if(!data)throw new Error('This question changed on another device, or the save was not permitted. Reload the canonical question before saving again; newer edits were preserved.')
  if(data.id!==input.questionId||data.question_mode!=='text'||!questionLinesEqual(data.question_lines,input.questionLines)){
    throw new Error('Supabase did not persist the exact edited question text in text mode. Reload the question before trying again.')
  }
  const savedVisuals=parseVisualSpecs(data.visual_specs,-1)
  const visualsMatch=savedVisuals.length===visuals.length&&savedVisuals.every((saved,index)=>{
    const expected=visuals[index]
    return saved.afterLine===expected.afterLine&&saved.kind===expected.kind
      &&Math.abs(saved.crop.x-expected.crop.x)<.000001&&Math.abs(saved.crop.y-expected.crop.y)<.000001
      &&Math.abs(saved.crop.width-expected.crop.width)<.000001&&Math.abs(saved.crop.height-expected.crop.height)<.000001
  })
  if(!visualsMatch)throw new Error('Supabase did not persist all visual crops and placements. Reload the question before trying again.')
  const savedLines=data.question_lines as string[]
  window.dispatchEvent(new CustomEvent('sat-question-content-updated',{detail:{questionId:input.questionId}}))
  return {questionId:data.id,questionLines:savedLines,updatedAt:data.updated_at as string}
}

/**
 * One-time, additive promotion of a currently displayed PDF reconstruction.
 * Never replaces an existing canonical question, explanation, or visual.
 * Only an authenticated content admin can write, through existing Supabase RLS.
 */
export async function promoteMissingCanonicalQuestion(input:{
  questionId:string
  practiceTestId:string
  questionLines:string[]
}):Promise<'saved'|'already-present'>{
  if(!supabase)throw new Error('Supabase is not configured.')
  if(input.practiceTestId!=='practice-test-4')throw new Error('This backfill supports PT4 only.')
  const lines=input.questionLines
  if(!lines.length||lines.join(' ').trim().length<25)throw new Error('Extracted question text is incomplete.')
  const {data:existing,error:loadError}=await supabase.from('sat_question_bank')
    .select('id,practice_test_id,question_lines,content_status,updated_at')
    .eq('id',input.questionId).eq('practice_test_id',input.practiceTestId).maybeSingle()
  if(loadError)throw loadError
  if(!existing)throw new Error('Canonical question was not found.')
  if(Array.isArray(existing.question_lines)&&existing.question_lines.length)return 'already-present'
  if(existing.content_status!=='metadata')throw new Error('This record has already been reviewed; no automatic replacement is allowed.')
  const {data:auth,error:authError}=await supabase.auth.getUser()
  if(authError||!auth.user)throw new Error('Sign in with an authorized content administrator account.')
  const {data,error}=await supabase.from('sat_question_bank').update({
    question_lines:lines,
    question_mode:'text',
    content_status:'imported',
    updated_at:new Date().toISOString(),
  }).eq('id',input.questionId)
    .eq('practice_test_id',input.practiceTestId)
    .eq('content_status','metadata')
    .eq('updated_at',existing.updated_at)
    .is('question_lines',null)
    .select('id,question_lines').maybeSingle()
  if(error)throw new Error(`Canonical backfill failed: ${error.message}`)
  if(!data){
    const {data:current}=await supabase.from('sat_question_bank').select('question_lines').eq('id',input.questionId).maybeSingle()
    if(Array.isArray(current?.question_lines)&&current.question_lines.length)return 'already-present'
    throw new Error('No canonical change was allowed. Ensure content-admin editing is enabled.')
  }
  if(!questionLinesEqual(data.question_lines,lines))throw new Error('The canonical text did not match the extracted source.')
  window.dispatchEvent(new CustomEvent('sat-question-content-updated',{detail:{questionId:input.questionId}}))
  return 'saved'
}
