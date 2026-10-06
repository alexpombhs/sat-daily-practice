export const READING_PARAGRAPH_BREAK='[[SAT_PARAGRAPH_BREAK]]'
export const READING_QUOTE_START='[[SAT_QUOTE_START]]'
export const READING_QUOTE_END='[[SAT_QUOTE_END]]'
export const READING_LATEX_QUOTE_START='\\begin{quote}'
export const READING_LATEX_QUOTE_END='\\end{quote}'


export function readingLinesToEditorText(lines:string[]){
  return lines
    .map(line=>line.trim()===READING_PARAGRAPH_BREAK?'':line)
    .join('\n')
}

export function editorTextToReadingLines(value:string){
  const output:string[]=[]
  let pendingBreak=false

  for(const raw of value.split(/\r?\n/)){
    const line=raw.trim()
    if(!line||line===READING_PARAGRAPH_BREAK){
      if(output.length)pendingBreak=true
      continue
    }
    if(pendingBreak&&output[output.length-1]!==READING_PARAGRAPH_BREAK){
      output.push(READING_PARAGRAPH_BREAK)
    }
    output.push(line)
    pendingBreak=false
  }

  while(output[output.length-1]===READING_PARAGRAPH_BREAK)output.pop()
  return output
}
