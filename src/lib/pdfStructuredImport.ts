import {GlobalWorkerOptions,getDocument,type PDFDocumentProxy} from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString()
import {loadSharedQuestionBank} from './sharedQuestionBank'
import {questionCropForParts} from './questionCrops'
import {getQuestionContent,isCurrentQuestionContent,QUESTION_CONTENT_VERSION,saveQuestionContent,type StoredQuestionContent} from './questionContentStore'
import {READING_PARAGRAPH_BREAK} from './readingQuestionFormat'
import {expandNormalizedCrop,questionVisualSpecs,type NormalizedCrop} from './questionVisuals'
import {readingTableSpec} from './readingTables'
import {isPracticeTest5Math1Verified,normalizePracticeTest5Math1Lines,PRACTICE_TEST_5_MATH1_IMAGE_FALLBACK} from './practiceTest5Math1Layout'
import {verifiedPracticeTest5Math1Content} from './verifiedPracticeTest5Math1'
import type {PracticeQuestion} from '../types'


const pdfCache=new Map<string,PDFDocumentProxy>()

type TextItem={text:string;x:number;y:number}

async function loadPdf(key:string,bytes:ArrayBuffer){
  const cacheKey=`${key}:${bytes.byteLength}`
  const cached=pdfCache.get(cacheKey)
  if(cached)return cached
  const doc=await getDocument({data:new Uint8Array(bytes.slice(0))}).promise
  pdfCache.set(cacheKey,doc)
  return doc
}

function normalizeSpace(value:string){return value.replace(/\s+/g,' ').trim()}

function groupedRows(items:TextItem[]){
  const rows:TextItem[][]=[]
  for(const item of [...items].sort((a,b)=>a.y-b.y||a.x-b.x)){
    const row=rows.find(candidate=>Math.abs(candidate[0].y-item.y)<3)
    if(row)row.push(item)
    else rows.push([item])
  }
  return rows.map(row=>{
    const ordered=row.sort((a,b)=>a.x-b.x)
    return {text:normalizeSpace(ordered.map(item=>item.text).join(' ')),x:ordered[0].x,y:ordered[0].y}
  }).filter(row=>Boolean(row.text))
}

function groupLines(items:TextItem[]){return groupedRows(items).map(row=>row.text)}

function groupReadingLines(items:TextItem[]){
  const rows=groupedRows(items)
  if(rows.length<2)return rows.map(row=>row.text)
  const gaps=rows.slice(1).map((row,index)=>row.y-rows[index].y).filter(gap=>gap>5&&gap<16)
  const baseline=gaps.length?[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length/2)]:12.5
  const paragraphGap=Math.max(16,baseline*1.35)
  const lines:string[]=[]
  rows.forEach((row,index)=>{
    if(index>0&&row.y-rows[index-1].y>=paragraphGap)lines.push(READING_PARAGRAPH_BREAK)
    lines.push(row.text)
  })
  return lines
}

function groupReadingQuestionItems(question:PracticeQuestion,crop:{x:number;y:number;width:number;height:number},items:TextItem[]){
  const spansColumns=question.id==='rw2-13'||(
    question.practiceTestId==='practice-test-7'&&question.module==='rw1'&&[13,14,15,16].includes(question.number)
  )
  if(!spansColumns)return groupReadingLines(items)
  const divider=crop.x+crop.width*.5
  const left=items.filter(item=>item.x<divider)
  const right=items.filter(item=>item.x>=divider)
  const leftLines=groupReadingLines(left)
  const rightLines=groupReadingLines(right)
  return [...leftLines,READING_PARAGRAPH_BREAK,...rightLines]
}

async function pageItems(doc:PDFDocumentProxy,pageNumber:number){
  const page=await doc.getPage(pageNumber)
  const viewport=page.getViewport({scale:1})
  const content=await page.getTextContent()
  const items:TextItem[]=content.items.flatMap(raw=>{
    if(!raw||typeof raw!=='object'||!('str' in raw)||!('transform' in raw))return[]
    const text=String((raw as {str:string}).str??'').trim()
    const transform=(raw as {transform:number[]}).transform
    if(!text||!Array.isArray(transform))return[]
    const [x,y]=viewport.convertToViewportPoint(transform[4],transform[5])
    return[{text,x,y}]
  })
  return {items,viewport}
}

function cleanQuestionLines(lines:string[],questionNumber:number){
  return lines.filter(line=>{
    const normalized=line.trim()
    if(!normalized)return false
    if(normalized.length>=8&&/^[.·•\s]+$/.test(normalized))return false
    if(/^[\s.\-~_]+$/.test(normalized))return false
    if(/^(?:I\s*){5,}$/.test(normalized))return false
    if(normalized===String(questionNumber))return false
    if(/^Module\s+\d+$/i.test(normalized))return false
    if(/Unauthorized copying or reuse/i.test(normalized))return false
    if(/^CONTINUE$/i.test(normalized)||/^STOP$/i.test(normalized))return false
    return true
  })
}

function withoutNormalizedRegion(crop:{x:number;y:number;width:number;height:number},region:NormalizedCrop,items:TextItem[]){
  const left=crop.x+crop.width*region.x
  const top=crop.y+crop.height*region.y
  const right=crop.x+crop.width*(region.x+region.width)
  const bottom=crop.y+crop.height*(region.y+region.height)
  return items.filter(item=>item.x<left||item.x>right||item.y<top||item.y>bottom)
}

function withoutKnownVisualText(question:PracticeQuestion,crop:{x:number;y:number;width:number;height:number},items:TextItem[]){
  let result=items
  for(const visual of questionVisualSpecs(question.id)){
    result=withoutNormalizedRegion(crop,expandNormalizedCrop(visual.crop,.012,.008),result)
  }
  const table=readingTableSpec(question.id)
  if(table)result=withoutNormalizedRegion(crop,table.sourceCrop,result)
  return result
}

function cleanExplanationLines(lines:string[],questionNumber:number){
  return lines.filter(line=>{
    const normalized=line.trim()
    if(!normalized)return false
    if(new RegExp(`^QUESTION\\s+${questionNumber}$`,'i').test(normalized))return false
    if(/^SAT ANSWER EXPLANATIONS/i.test(normalized))return false
    if(/^\d+ SAT PRACTICE TEST/i.test(normalized))return false
    if(/READING AND WRITING: MODULE/i.test(normalized)||/MATH: MODULE/i.test(normalized))return false
    return true
  })
}

function hasVisualReference(lines:string[]){
  const text=lines.join(' ').toLowerCase()
  return /\b(graph|scatterplot|diagram|figure|line graph|bar graph|chart)\b/.test(text)
}

export function questionExtractionCrop(question:PracticeQuestion){
  return question.sourceCrop??questionCropForParts(question.practiceTestId,question.module,question.number)
}

export async function extractQuestionLines(question:PracticeQuestion,questionPdf:ArrayBuffer){
  const doc=await loadPdf(`${question.practiceTestId}:questions`,questionPdf)
  const {items}=await pageItems(doc,question.sourcePage)
  const crop=questionExtractionCrop(question)
  if(!crop)return[]
  const margin=4
  const selected=items.filter(item=>
    item.x>=crop.x-margin&&item.x<=crop.x+crop.width+margin&&
    item.y>=crop.y-margin&&item.y<=crop.y+crop.height+margin
  )
  const textItems=withoutKnownVisualText(question,crop,selected)
  const cleaned=cleanQuestionLines(question.subject==='english'?groupReadingQuestionItems(question,crop,textItems):groupLines(textItems),question.number)
  return isPracticeTest5Math1Verified(question.id)?normalizePracticeTest5Math1Lines(question.number,cleaned):cleaned
}

export async function extractExplanationLines(question:PracticeQuestion,answerPdf:ArrayBuffer){
  const doc=await loadPdf(`${question.practiceTestId}:answers`,answerPdf)
  const {items,viewport}=await pageItems(doc,question.answerPage)
  const markers=items
    .filter(item=>/^QUESTION\s+\d+$/i.test(item.text))
    .map(item=>({number:Number(item.text.match(/\d+/)?.[0]??0),y:item.y}))
    .sort((a,b)=>a.y-b.y)
  const current=markers.find(marker=>marker.number===question.number)
  if(!current)return[]
  const next=markers.find(marker=>marker.y>current.y+6)
  const selected=items.filter(item=>item.y>=current.y-3&&item.y<(next?.y??viewport.height-8))
  return cleanExplanationLines(groupLines(selected),question.number)
}

export async function ensureQuestionText(question:PracticeQuestion,questionPdf:ArrayBuffer){
  const existing=await getQuestionContent(question.id)
  if(question.practiceTestId==='practice-test-5'&&question.module==='math1'){
    const verified=verifiedPracticeTest5Math1Content(question.number)
    if(verified){
      const record:StoredQuestionContent={
        questionId:question.id,
        questionLines:verified.lines,
        explanationLines:[],
        questionMode:verified.imageFallback?'image-fallback':'text',
        explanationMode:'image-fallback',
        needsVisual:Boolean(verified.needsVisual),
        importedAt:new Date().toISOString(),
        contentVersion:QUESTION_CONTENT_VERSION,
      }
      await saveQuestionContent(record)
      return record
    }
  }
  if(question.practiceTestId==='practice-test-5'&&question.module==='math1'&&PRACTICE_TEST_5_MATH1_IMAGE_FALLBACK.has(question.number)){
    const record:StoredQuestionContent={
      questionId:question.id,
      questionLines:[],
      explanationLines:existing?.explanationLines??[],
      questionMode:'image-fallback',
      explanationMode:existing?.explanationMode??'image-fallback',
      needsVisual:false,
      importedAt:new Date().toISOString(),
      contentVersion:QUESTION_CONTENT_VERSION,
    }
    await saveQuestionContent(record)
    return record
  }
  if(isCurrentQuestionContent(existing)&&existing?.questionLines.length)return existing
  const questionLines=await extractQuestionLines(question,questionPdf)
  const record:StoredQuestionContent={
    questionId:question.id,
    questionLines,
    explanationLines:existing?.explanationLines??[],
    questionMode:questionLines.length?'text':'image-fallback',
    explanationMode:existing?.explanationMode??'text',
    needsVisual:questionVisualSpecs(question.id).length>0||hasVisualReference(questionLines),
    importedAt:new Date().toISOString(),
    contentVersion:QUESTION_CONTENT_VERSION,
  }
  await saveQuestionContent(record)
  return record
}

export async function ensureExplanationText(question:PracticeQuestion,answerPdf:ArrayBuffer){
  const existing=await getQuestionContent(question.id)
  if(existing?.explanationLines.length)return existing
  const explanationLines=await extractExplanationLines(question,answerPdf)
  const record:StoredQuestionContent={
    questionId:question.id,
    questionLines:existing?.questionLines??[],
    explanationLines,
    questionMode:existing?.questionMode??'text',
    explanationMode:explanationLines.length?'text':'image-fallback',
    needsVisual:existing?.needsVisual??false,
    importedAt:new Date().toISOString(),
    contentVersion:existing?.contentVersion,
  }
  await saveQuestionContent(record)
  return record
}

export async function importPracticeMaterials(questionPdf:ArrayBuffer,answerPdf:ArrayBuffer,onProgress?:(done:number,total:number)=>void,practiceTestId='practice-test-4'){
  let done=0
  const canonicalQuestions=await loadSharedQuestionBank()\n  if(!canonicalQuestions)throw new Error('Canonical question bank unavailable; cannot import local question metadata.')\n  const questions=canonicalQuestions.filter(question=>question.practiceTestId===practiceTestId)
  const total=questions.length
  for(const question of questions){
    if(question.practiceTestId==='practice-test-5'&&question.module==='math1'){
      await ensureQuestionText(question,questionPdf)
      done++
      onProgress?.(done,total)
      continue
    }
    let existing=await getQuestionContent(question.id)
    try{
      const questionLines=existing?.questionLines.length?existing.questionLines:await extractQuestionLines(question,questionPdf)
      const explanationLines=existing?.explanationLines.length?existing.explanationLines:await extractExplanationLines(question,answerPdf)
      const record:StoredQuestionContent={
        questionId:question.id,
        questionLines,
        explanationLines,
        questionMode:questionLines.length?'text':'image-fallback',
        explanationMode:explanationLines.length?'text':'image-fallback',
        needsVisual:questionVisualSpecs(question.id).length>0||hasVisualReference(questionLines),
        importedAt:new Date().toISOString(),
        contentVersion:QUESTION_CONTENT_VERSION,
      }
      await saveQuestionContent(record)
      existing=record
    }catch{
      await saveQuestionContent({
        questionId:question.id,
        questionLines:existing?.questionLines??[],
        explanationLines:existing?.explanationLines??[],
        questionMode:existing?.questionLines.length?'text':'image-fallback',
        explanationMode:existing?.explanationLines.length?'text':'image-fallback',
        needsVisual:existing?.needsVisual??false,
        importedAt:new Date().toISOString(),
        contentVersion:existing?.contentVersion,
      })
    }
    done++
    onProgress?.(done,total)
  }
  return total
}
