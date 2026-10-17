import AlexRichText from '../atoms/AlexRichText'
import ReadingDataTable from './ReadingDataTable'
import {READING_LATEX_QUOTE_END,READING_LATEX_QUOTE_START,READING_PARAGRAPH_BREAK,READING_QUOTE_END,READING_QUOTE_START} from '../../lib/readingQuestionFormat'
import {readingTableSpec,stripEmbeddedReadingTableLines,type ReadingTableSpec} from '../../lib/readingTables'

const LABELED_CHOICE=/^([A-D])(?:[.)]\s*|\s+)(.+)$/i
const STANDALONE_CHOICE=/^([A-D])[.)]\s*$/i
const QUESTION_STEM=/^(Which|What|How|Why|According to|Based on|As used in|The student wants|To which|Which finding|Which quotation|Which choice|Which statement|Which response|The passage|The text|The main purpose|The author|The speaker)\b/i
const INTRO_START=/^The following text is (?:from|adapted from)\b/i
const CHOICE_ORDER=['A','B','C','D'] as const

export type ReadingChoice={label:string;text:string}
export type ParsedReadingQuestion={intro:string[];stimulusBlocks:string[][];stem:string;choices:ReadingChoice[];isQuote:boolean;isVerse:boolean}

function clean(value:string){return value.replace(/\s+/g,' ').trim()}
function isBreak(value:string){return value===READING_PARAGRAPH_BREAK}

function normalizeQuoteMarkers(lines:string[]){
  const output:string[]=[]
  let hasExplicitQuote=false
  for(const line of lines){
    if(line===READING_QUOTE_START||line===READING_LATEX_QUOTE_START){
      hasExplicitQuote=true
      if(output[output.length-1]!==READING_PARAGRAPH_BREAK)output.push(READING_PARAGRAPH_BREAK)
      continue
    }
    if(line===READING_QUOTE_END||line===READING_LATEX_QUOTE_END){
      if(output[output.length-1]!==READING_PARAGRAPH_BREAK)output.push(READING_PARAGRAPH_BREAK)
      continue
    }
    output.push(line)
  }
  return {lines:output,hasExplicitQuote}
}

function choiceParts(value:string){
  const line=clean(value)
  const full=line.match(LABELED_CHOICE)
  if(full)return {label:full[1].toUpperCase(),text:full[2].trim()}
  const standalone=line.match(STANDALONE_CHOICE)
  if(standalone)return {label:standalone[1].toUpperCase(),text:''}
  return null
}

function splitBlocks(lines:string[]){
  const blocks:string[][]=[]
  let current:string[]=[]
  for(const line of lines){
    if(isBreak(line)){if(current.length){blocks.push(current);current=[]};continue}
    current.push(line)
  }
  if(current.length)blocks.push(current)
  return blocks
}

function parseChoiceSequence(lines:string[]){
  const choices:ReadingChoice[]=[]
  let current:ReadingChoice|null=null
  let expectedIndex=0

  for(const raw of lines){
    if(isBreak(raw))continue
    const line=clean(raw)
    const parts=choiceParts(line)
    const expected=CHOICE_ORDER[expectedIndex]

    if(parts&&parts.label===expected){
      if(current)choices.push(current)
      current={label:parts.label,text:parts.text}
      expectedIndex++
      continue
    }

    if(current)current.text=clean(`${current.text} ${line}`)
  }

  if(current)choices.push(current)
  return choices
}

function findChoiceBlock(source:string[]){
  for(let start=source.length-1;start>=0;start--){
    if(isBreak(source[start]))continue
    const parts=choiceParts(source[start])
    if(parts?.label!=='A')continue
    const choices=parseChoiceSequence(source.slice(start))
    if(choices.map(choice=>choice.label).join('')==='ABCD')return {start,choices}
  }
  return null
}

function previousContentIndex(source:string[],from:number){
  for(let index=from;index>=0;index--){if(!isBreak(source[index]))return index}
  return -1
}

function stemBlockStart(source:string[],end:number){
  let blockStart=end
  while(blockStart>0&&!isBreak(source[blockStart-1]))blockStart--

  for(let index=blockStart;index<=end;index++){
    if(!isBreak(source[index])&&QUESTION_STEM.test(clean(source[index])))return index
  }

  for(let index=end;index>=0;index--){
    if(isBreak(source[index]))break
    if(QUESTION_STEM.test(clean(source[index])))return index
  }

  return blockStart
}

function findQuestionStructure(source:string[]){
  const choiceBlock=findChoiceBlock(source)
  if(!choiceBlock)return null

  let end=previousContentIndex(source,choiceBlock.start-1)
  while(end>=0&&!/[?]$/.test(clean(source[end]))){
    const previous=previousContentIndex(source,end-1)
    if(previous<0||isBreak(source[end-1]))break
    end=previous
  }
  if(end<0)return null

  const start=stemBlockStart(source,end)
  return {start,end,choices:choiceBlock.choices}
}

function legacyIntroSplit(lines:string[]){
  if(!lines.length||!INTRO_START.test(clean(lines[0])))return {intro:[] as string[],bodyBlocks:lines.length?[lines]:[]}
  const body=[...lines]
  const intro:string[]=[]
  while(body.length){
    const line=body.shift()!
    intro.push(line)
    if(/[.!?][”\"']?$/.test(clean(line)))break
  }
  return {intro,bodyBlocks:body.length?[body]:[]}
}

function looksLikeVerse(intro:string[]){
  return /\bpoem\b/i.test(intro.map(clean).join(' '))
}

function explicitlyQuoted(blocks:string[][]){
  const text=blocks.flat().map(clean).filter(Boolean).join(' ')
  return /^[“\"‘]/.test(text)||/[”\"’]$/.test(text)
}

export function parseReadingQuestion(lines:string[]):ParsedReadingQuestion{
  const normalized=normalizeQuoteMarkers(lines)
  const source=normalized.lines.map(line=>line.trim()).filter(Boolean)
  const structure=findQuestionStructure(source)
  const start=structure?.start??Math.max(0,source.length-1)
  const end=structure?.end??start
  const rawStimulus=source.slice(0,start)
  const blocks=splitBlocks(rawStimulus)
  let intro:string[]=[]
  let stimulusBlocks=blocks

  if(blocks[0]?.length&&INTRO_START.test(clean(blocks[0][0]))){
    intro=blocks[0]
    stimulusBlocks=blocks.slice(1)
    if(!stimulusBlocks.length){
      const legacy=legacyIntroSplit(blocks[0])
      intro=legacy.intro
      stimulusBlocks=legacy.bodyBlocks
    }
  }

  const stem=source.slice(start,end+1).filter(line=>!isBreak(line)).map(clean).join(' ')
  const choices=structure?.choices??[]
  const isVerse=looksLikeVerse(intro)
  return {intro,stimulusBlocks,stem,choices,isVerse,isQuote:Boolean(intro.length)||isVerse||explicitlyQuoted(stimulusBlocks)||normalized.hasExplicitQuote}
}

function canonicalTabTable(lines:string[]){
  const normalizedLines=lines.filter(line=>!/^\[\/?TABLE\]$/i.test(line.trim()))
  const first=normalizedLines.findIndex(line=>line.includes('\t'))
  if(first<0)return null
  let end=first
  while(end<normalizedLines.length&&normalizedLines[end].includes('\t'))end++
  if(end-first<2)return null
  const rows=normalizedLines.slice(first,end).map(line=>line.split(/\t+/).map(cell=>clean(cell)).filter(Boolean))
  const width=rows[0].length
  if(width<2||rows.some(row=>row.length!==width))return null
  const title=first>0?clean(normalizedLines[first-1]):''
  const table:ReadingTableSpec={title,headers:rows[0],rows:rows.slice(1),sourceCrop:{x:0,y:0,width:1,height:1}}
  const content=normalizedLines.filter((_,index)=>index<Math.max(0,first-1)||index>=end)
  return {table,content}
}

export function hasCompleteReadingChoices(lines:string[]){return parseReadingQuestion(lines).choices.map(choice=>choice.label).join('')==='ABCD'}

function JoinedBlock({lines}:{lines:string[]}){return <p><AlexRichText text={lines.map(clean).join(' ')}/></p>}

type BulletNotes={intro:string;items:string[];trailing:string}

function parseBulletNotes(lines:string[]):BulletNotes|null{
  const text=lines.map(clean).filter(Boolean).join(' ')
  if(!/[•●▪◦]/.test(text))return null

  const firstMarker=text.search(/[•●▪◦]/)
  if(firstMarker<0)return null

  const intro=clean(text.slice(0,firstMarker))
  const parts=text.slice(firstMarker)
    .split(/\s*[•●▪◦]\s*/)
    .map(clean)
    .filter(Boolean)
  if(!parts.length)return null

  let trailing=''
  const lastIndex=parts.length-1
  const trailingMatch=parts[lastIndex].match(/^(.*?[.!?])\s+(The student\b[\s\S]*)$/i)
  if(trailingMatch){
    parts[lastIndex]=clean(trailingMatch[1])
    trailing=clean(trailingMatch[2])
  }

  const items=parts.filter(Boolean)
  return items.length?{intro,items,trailing}:null
}

function ReadingStimulusBlock({lines}:{lines:string[]}){
  const notes=parseBulletNotes(lines)
  if(!notes)return <JoinedBlock lines={lines}/>

  return <div className="reading-notes">
    {notes.intro&&<p className="reading-notes-intro"><AlexRichText text={notes.intro}/></p>}
    <ul className="reading-notes-list">
      {notes.items.map((item,index)=><li key={'note-'+index}><AlexRichText text={item}/></li>)}
    </ul>
    {notes.trailing&&<p className="reading-notes-goal"><AlexRichText text={notes.trailing}/></p>}
  </div>
}

type PairedTextSection={label:string;lines:string[]}

function pairedTextSections(blocks:string[][]):PairedTextSection[]|null{
  const lines=blocks.flat()
  const first=lines.findIndex(line=>/^Text\s+1$/i.test(clean(line)))
  const second=lines.findIndex(line=>/^Text\s+2$/i.test(clean(line)))
  if(first<0||second<=first)return null
  const firstLines=lines.slice(first+1,second).filter(line=>!isBreak(line))
  const secondLines=lines.slice(second+1).filter(line=>!isBreak(line))
  if(!firstLines.length||!secondLines.length)return null
  return[
    {label:'Text 1',lines:firstLines},
    {label:'Text 2',lines:secondLines},
  ]
}

function PairedTextPassages({sections}:{sections:PairedTextSection[]}){
  return <div className="reading-paired-texts">
    {sections.map(section=><section className="reading-paired-text" key={section.label}>
      <div className="reading-paired-label">{section.label}</div>
      <blockquote className="reading-quote reading-paired-quote"><JoinedBlock lines={section.lines}/></blockquote>
    </section>)}
  </div>
}

function isSourceAttribution(block:string[]){
  const text=block.map(clean).filter(Boolean).join(' ')
  return /^(?:©|Copyright\b|Source:|Excerpted from\b|by\s+[A-Z])/i.test(text)
}

export default function ReadingQuestionLines({lines,questionId}:{lines:string[];questionId?:string}){
  const withoutMarkers=lines.filter(line=>!/^\[\/?TABLE\]$/i.test(line.trim()))
  const safeLines=questionId?stripEmbeddedReadingTableLines(questionId,withoutMarkers):withoutMarkers
  const canonicalTable=canonicalTabTable(safeLines)
  const parsed=parseReadingQuestion(canonicalTable?.content??safeLines)
  const table=canonicalTable?.table??(questionId?readingTableSpec(questionId):undefined)
  const attributionBlocks=parsed.stimulusBlocks.filter(isSourceAttribution)
  const stimulusBlocks=parsed.stimulusBlocks.filter(block=>!isSourceAttribution(block))
  const pairedTexts=pairedTextSections(stimulusBlocks)
  return <div className="reading-question-content">
    {table&&<ReadingDataTable table={table}/>} 
    {parsed.intro.length>0&&<div className="reading-intro">{splitBlocks(parsed.intro).map((block,index)=><JoinedBlock key={`intro-${index}`} lines={block}/>)}</div>}
    {pairedTexts
      ?<PairedTextPassages sections={pairedTexts}/>
      :stimulusBlocks.length>0&&(parsed.isQuote
        ?<blockquote role="blockquote" className={`reading-stimulus reading-quote${parsed.isVerse?' reading-verse':''}`}>
          {parsed.isVerse
            ?stimulusBlocks.flat().map((line,index)=><span className="reading-verse-line" key={`verse-${index}`}><AlexRichText text={line}/></span>)
            :stimulusBlocks.map((block,index)=><JoinedBlock key={`quote-${index}`} lines={block}/>)}
        </blockquote>
        :<div className="reading-stimulus">{stimulusBlocks.map((block,index)=><ReadingStimulusBlock key={`stimulus-${index}`} lines={block}/>)}</div>)}
    {attributionBlocks.length>0&&<div className="reading-source-attribution">{attributionBlocks.map((block,index)=><JoinedBlock key={`attribution-${index}`} lines={block}/>)}</div>}
    {parsed.stem&&<p className="reading-question-stem"><AlexRichText text={parsed.stem}/></p>}
    {parsed.choices.length>0&&<div className="reading-answer-options" role="list" aria-label="Answer choices">
      {parsed.choices.map(choice=><div className="reading-answer-choice" role="listitem" key={choice.label}>
        <span className="reading-choice-label" aria-hidden="true">{choice.label})</span>
        <span className="reading-choice-text"><AlexRichText text={choice.text}/></span>
      </div>)}
    </div>}
  </div>
}
