export const UNDERLINE_OPEN='<u>'
export const UNDERLINE_CLOSE='</u>'

export function hasUnderlineMarkup(value:string|string[]){
  const text=Array.isArray(value)?value.join('\n'):value
  return /<u>[\s\S]*?<\/u>/i.test(text)
}

export function refersToUnderlinedText(value:string|string[]){
  const text=Array.isArray(value)?value.join(' '):value
  return /\bunderlined\b/i.test(text)
}

export function underlineSelection(value:string,start:number,end:number){
  if(start<0||end<=start||start>value.length||end>value.length)return null
  const selected=value.slice(start,end)
  if(!selected.trim())return null

  const wrapped=selected
    .split('\n')
    .map(line=>line.trim()?UNDERLINE_OPEN+line+UNDERLINE_CLOSE:line)
    .join('\n')

  return {
    value:value.slice(0,start)+wrapped+value.slice(end),
    start,
    end:start+wrapped.length,
  }
}


export function preserveUnderlineMarkup(previousValue:string,nextValue:string){
  const spans=[...previousValue.matchAll(/<u>([\s\S]*?)<\/u>/gi)]
    .map(match=>match[1])
    .filter(span=>span.trim().length>0)

  let output=nextValue
  for(const span of spans){
    const wrapped=UNDERLINE_OPEN+span+UNDERLINE_CLOSE
    if(output.includes(wrapped))continue
    const index=output.indexOf(span)
    if(index<0)continue
    output=output.slice(0,index)+wrapped+output.slice(index+span.length)
  }
  return output
}
