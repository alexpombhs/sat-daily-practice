import type {ReactNode} from 'react'
import AlexRichText from '../atoms/AlexRichText'

const SUPERSCRIPTS:Record<string,string>={'2':'²','3':'³'}
const FULL_CHOICE=/^[A-D][.)]\s+\S/i
const QUESTION_STEM=/^(Which|What|How|Why|According to|Based on|As used in|The student wants|To which|Which finding|Which quotation|Which choice|Which statement|Which response)\b/i

function cleanPdfMathArtifacts(value:string){
  let text=value
    .replace(/^(?:[-–—]\s*){2,}(?=\S)/,'')
    .replace(/\b([A-Za-z])\s+x\s*\(\s*\)/g,'$1(x)')
    .replace(/\b([A-Za-z])\s*\(\s*x\s*\)/g,'$1(x)')
    .replace(/\(\s*([A-Za-z])\s*\)/g,'($1)')
    .trim()

  if(/[=<>]/.test(text)||/^\s*[A-Za-z]\(x\)/.test(text)){
    text=text.replace(/\b([A-Za-z])([23])\b/g,(_,letter:string,power:string)=>`${letter}${SUPERSCRIPTS[power]??power}`)
  }
  return text
}

function isPdfDecoration(value:string){
  const compact=value.replace(/\s+/g,'')
  return compact.length>=4&&/^[I|l1\-–—_]+$/.test(compact)
}

function choiceLabel(value:string){
  return value.match(/^([A-D])[.)]\s*$/i)?.[1]?.toUpperCase()??null
}

function isChoiceStart(value:string){
  return Boolean(choiceLabel(value)||FULL_CHOICE.test(value))
}

function tableCells(value:string){
  const text=cleanPdfMathArtifacts(value).trim()
  if(!text||/[.!?]$/.test(text))return null
  const cells=(text.includes('\t')?text.split(/\t+/):text.split(/\s+/)).map(cell=>cell.trim()).filter(Boolean)
  if(cells.length<2||cells.length>7)return null
  if(cells.some(cell=>cell.length>18))return null
  return cells
}

function isNumericCell(value:string){
  return /^[-−+]?\d+(?:[.,]\d+)?%?$/.test(value)||/^[-−+]?\d+\/\d+$/.test(value)
}

function tableHeaderText(value:string){
  return /^[A-Za-z](?:\([A-Za-z]\))?$/.test(value)?`$${value}$`:value
}

function isTableValueRow(row:string[]){
  return row.length>=3&&row.slice(1).filter(isNumericCell).length>=2
}

function ChoiceTable({label,rows}:{label:string;rows:string[][]}){
  return <div className="structured-choice-table">
    <div className="structured-choice-label">{label})</div>
    <table aria-label={`Choice ${label}`}>
      <tbody>
        {rows.map((row,rowIndex)=><tr key={`${label}-${rowIndex}`}>
          {row.map((cell,columnIndex)=>columnIndex===0
            ?<th key={`${label}-${rowIndex}-${columnIndex}`} scope="row"><AlexRichText text={tableHeaderText(cell)}/></th>
            :<td key={`${label}-${rowIndex}-${columnIndex}`}><AlexRichText text={cell}/></td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
}

function DataTable({headers,rows}:{headers:string[];rows:string[][]}){
  return <div className="structured-data-table-wrap">
    <table className="structured-data-table">
      <thead>
        <tr>{headers.map((header,index)=><th key={`header-${index}`} scope="col"><AlexRichText text={tableHeaderText(header)}/></th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row,rowIndex)=><tr key={`row-${rowIndex}`}>
          {row.map((cell,columnIndex)=><td key={`cell-${rowIndex}-${columnIndex}`}><AlexRichText text={cell}/></td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
}

function ChoiceDataTable({label,headers,rows}:{label:string;headers:string[];rows:string[][]}){
  return <div className="structured-choice-table">
    <div className="structured-choice-label">{label})</div>
    <table aria-label={`Choice ${label}`}>
      <thead>
        <tr>{headers.map((header,index)=><th key={`choice-${label}-header-${index}`} scope="col"><AlexRichText text={tableHeaderText(header)}/></th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row,rowIndex)=><tr key={`choice-${label}-row-${rowIndex}`}>
          {row.map((cell,columnIndex)=><td key={`choice-${label}-cell-${rowIndex}-${columnIndex}`}><AlexRichText text={cell}/></td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
}

function explicitTableAt(lines:string[],start:number){
  if(lines[start]?.trim().toUpperCase()!=='[TABLE]')return null
  const end=lines.findIndex((line,index)=>index>start&&line.trim().toUpperCase()==='[/TABLE]')
  if(end<0)return null
  const tableLines=lines.slice(start+1,end).map(line=>line.trim()).filter(Boolean)
  if(tableLines.length<2)return null
  const rows=tableLines.map(line=>{
    const cells=line.includes('|')
      ?line.split('|').map(cell=>cell.trim()).filter(Boolean)
      :tableCells(line)
    return cells??[]
  })
  const width=rows[0]?.length??0
  if(width<2||rows.some(row=>row.length!==width))return {invalid:true,nextIndex:end+1}
  return {headers:rows[0],rows:rows.slice(1),nextIndex:end+1}
}

function dataTableAt(lines:string[],start:number){
  // Choice rows such as "B) -9", "C) 11", "D) 15" are not table headers.
  // Only explicit [TABLE] or actual data headers should enter table parsing.
  if(isChoiceStart(cleanPdfMathArtifacts(lines[start]??'')))return null
  const header=tableCells(lines[start])
  if(!header||header.some(isNumericCell))return null

  const rows:string[][]=[]
  let index=start+1
  while(index<lines.length&&rows.length<8){
    const row=tableCells(lines[index])
    if(!row)break
    const numericCount=row.filter(isNumericCell).length
    const minimumNumericCells=Math.max(1,header.length-1)
    if(numericCount<minimumNumericCells)break
    if(row.length!==header.length&&row.length!==header.length+1)break
    rows.push(row)
    index++
  }

  if(rows.length<2)return null
  const rowLength=rows[0].length
  if(rows.some(row=>row.length!==rowLength))return null
  const headers=rowLength===header.length+1?['',...header]:header
  if(headers.length!==rowLength)return null
  return {headers,rows,nextIndex:index}
}

function parseInlineChoiceTable(value:string){
  const match=cleanPdfMathArtifacts(value).match(/^([A-D])[.)]\s+(.+)$/i)
  if(!match)return null
  const label=match[1].toUpperCase()
  const body=match[2].replace(/\$/g,'')
  const parts=body.split(';').map(part=>part.trim()).filter(Boolean)
  if(parts.length<2)return null

  const rows=parts.map(part=>{
    const row=part.match(/^([^:]+):\s*(.+)$/)
    if(!row)return null
    const values=row[2].split(',').map(value=>value.trim()).filter(Boolean)
    if(values.length<2)return null
    return [row[1].trim(),...values]
  })
  if(rows.some(row=>!row))return null
  const typedRows=rows as string[][]
  const width=typedRows[0].length
  if(typedRows.some(row=>row.length!==width))return null
  return {label,rows:typedRows,nextIndex:1}
}

function choiceTableAt(lines:string[],start:number){
  const inline=parseInlineChoiceTable(lines[start])
  if(inline)return {...inline,nextIndex:start+inline.nextIndex}

  const first=cleanPdfMathArtifacts(lines[start])
  const match=first.match(/^([A-D])[.)]\s+(.+)$/i)
  if(!match)return null
  const firstRow=tableCells(match[2])
  if(!firstRow||!isTableValueRow(firstRow))return null

  const rows=[firstRow]
  let index=start+1
  while(index<lines.length&&rows.length<4){
    const next=cleanPdfMathArtifacts(lines[index])
    if(isChoiceStart(next))break
    const row=tableCells(next)
    if(!row||row.length!==firstRow.length||!isTableValueRow(row))break
    rows.push(row)
    index++
  }
  if(rows.length<2)return null
  return {label:match[1].toUpperCase(),rows,nextIndex:index}
}

function consumeChoice(lines:string[],start:number){
  const first=cleanPdfMathArtifacts(lines[start])
  const standalone=choiceLabel(first)
  const full=first.match(/^([A-D][.)])\s+(.+)$/i)
  if(!standalone&&!full)return null

  const label=standalone?`${standalone})`:full![1]
  const parts:string[]=[]
  if(full)parts.push(full[2])

  let index=start+1
  while(index<lines.length){
    const next=cleanPdfMathArtifacts(lines[index])
    if(!next||isPdfDecoration(next)||isChoiceStart(next)||/^\$\$/.test(next))break
    parts.push(next)
    index++
  }

  return {line:`${label}${parts.length?` ${parts.join(' ').replace(/\s+/g,' ').trim()}`:''}`,nextIndex:index}
}

export function reflowProseLines(lines:string[]){
  const result:string[]=[]
  let index=0
  let paragraph:string[]=[]
  const flush=()=>{
    if(paragraph.length){
      result.push(paragraph.join(' ').replace(/\s+/g,' ').trim())
      paragraph=[]
    }
  }

  while(index<lines.length){
    const line=cleanPdfMathArtifacts(lines[index])
    if(!line||isPdfDecoration(line)){
      flush()
      index++
      continue
    }

    const table=dataTableAt(lines,index)
    if(table){
      flush()
      for(let row=index;row<table.nextIndex;row++)result.push(cleanPdfMathArtifacts(lines[row]))
      index=table.nextIndex
      continue
    }

    const optionTable=choiceTableAt(lines,index)
    if(optionTable){
      flush()
      for(let row=index;row<optionTable.nextIndex;row++)result.push(cleanPdfMathArtifacts(lines[row]))
      index=optionTable.nextIndex
      continue
    }

    const standaloneLabel=choiceLabel(line)
    if(standaloneLabel){
      const choiceData=dataTableAt(lines,index+1)
      if(choiceData){
        flush()
        result.push(line)
        for(let row=index+1;row<choiceData.nextIndex;row++)result.push(cleanPdfMathArtifacts(lines[row]))
        index=choiceData.nextIndex
        continue
      }
    }

    const choice=consumeChoice(lines,index)
    if(choice){
      flush()
      result.push(choice.line)
      index=choice.nextIndex
      continue
    }

    if(/^\$\$/.test(line)){
      flush()
      result.push(line)
      index++
      continue
    }

    if(QUESTION_STEM.test(line)&&paragraph.length)flush()
    paragraph.push(line)
    if(/[?]$/.test(line))flush()
    index++
  }

  flush()
  return result
}

export default function StructuredQuestionLines({lines,reflowProse=false}:{lines:string[];reflowProse?:boolean}){
  const sourceLines=reflowProse?reflowProseLines(lines):lines
  const output:ReactNode[]=[]
  let index=0

  while(index<sourceLines.length){
    const line=cleanPdfMathArtifacts(sourceLines[index])
    if(!line){
      output.push(<div key={`blank-line-${index}`} aria-hidden="true" style={{height:'0.9em'}} />)
      index++
      continue
    }
    if(isPdfDecoration(line)){
      index++
      continue
    }

    const explicitTable=explicitTableAt(sourceLines,index)
    if(explicitTable){
      if('invalid' in explicitTable){
        output.push(<p key={`invalid-table-${index}`}><strong>Invalid table format.</strong> Use one row per line and separate columns with | (or whitespace).</p>)
      }else{
        output.push(<DataTable key={`explicit-table-${index}`} headers={explicitTable.headers} rows={explicitTable.rows}/>)
      }
      index=explicitTable.nextIndex
      continue
    }

    const dataTable=dataTableAt(sourceLines,index)
    if(dataTable){
      output.push(<DataTable key={`data-table-${index}`} headers={dataTable.headers} rows={dataTable.rows}/>)
      index=dataTable.nextIndex
      continue
    }

    const optionTable=choiceTableAt(sourceLines,index)
    if(optionTable){
      output.push(<ChoiceTable key={`choice-table-${index}`} label={optionTable.label} rows={optionTable.rows}/>)
      index=optionTable.nextIndex
      continue
    }

    const label=choiceLabel(line)
    if(label){
      const choiceData=dataTableAt(sourceLines,index+1)
      if(choiceData){
        output.push(<ChoiceDataTable key={`choice-data-table-${index}`} label={label} headers={choiceData.headers} rows={choiceData.rows}/>)
        index=choiceData.nextIndex
        continue
      }
    }
    if(label&&index+2<sourceLines.length){
      const first=tableCells(sourceLines[index+1])
      const second=tableCells(sourceLines[index+2])
      if(first&&second&&first.length===second.length&&isTableValueRow(first)&&isTableValueRow(second)){
        output.push(<ChoiceTable key={`choice-table-${index}`} label={label} rows={[first,second]}/>)
        index+=3
        continue
      }
    }

    // Render consecutive standalone display equations in one KaTeX block.
    const displayEquation=/^\$\$([\s\S]+)\$\$$/
    if(displayEquation.test(line)){
      const equations:string[]=[]
      let end=index
      while(end<sourceLines.length){
        const match=cleanPdfMathArtifacts(sourceLines[end]).match(displayEquation)
        if(!match)break
        equations.push(match[1])
        end++
      }
      if(equations.length>1){
        const grouped='$$\\begin{gathered}'+equations.join(' \\\\ ')+'\\end{gathered}$$'
        output.push(<p key={`equation-group-${index}`} className="structured-equation-group"><AlexRichText text={grouped}/></p>)
        index=end
        continue
      }
    }

    output.push(<p key={`line-${index}`} className={/^\$\$[\s\S]*\$\$/.test(line)?'structured-display-equation':undefined}><AlexRichText text={line}/></p>)
    index++
  }

  return <>{output}</>
}
