import {Fragment,type ReactNode} from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props={text:string;className?:string}

function renderMath(math:string,displayMode:boolean,key:string){
  return <span
    key={key}
    className={displayMode?'rich-math display':'rich-math inline'}
    dangerouslySetInnerHTML={{__html:katex.renderToString(math,{throwOnError:false,displayMode,strict:'ignore'})}}
  />
}

const NATURAL_LANGUAGE_WORD=/\b(?:a|an|and|at|by|each|for|from|in|is|of|on|or|per|purchase|than|that|the|to|was|were|with)\b/i
const CURRENCY_AT_START=/^\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?(?=$|[\s.,;:!?)\]}])/
const UNDERLINE_MARKUP=/<u>([\s\S]*?)<\/u>/gi

export function isLikelyMathToken(math:string,displayMode=false){
  if(displayMode)return true
  const value=math.trim()
  if(!value)return false
  if(/\\[A-Za-z]+|[=<>^_{}]|[+*/]|[≤≥≈≠±×÷√∞π]/.test(value))return true
  if(NATURAL_LANGUAGE_WORD.test(value))return false
  const plainWords=value.match(/[A-Za-z]{2,}/g)??[]
  if(plainWords.some(word=>word===word.toLowerCase()&&!/^(sin|cos|tan|log|ln|max|min)$/i.test(word)))return false
  return /^[A-Za-z0-9\s.,:;()\[\]|'′″%\-]+$/.test(value)
}

function currencyAt(text:string,index:number){
  return text.slice(index).match(CURRENCY_AT_START)?.[0]??null
}

function renderMathAwareText(text:string,keyPrefix:string){
  const nodes:ReactNode[]=[]
  let cursor=0
  let index=0

  const pushText=(value:string)=>{
    if(value)nodes.push(value)
  }

  while(cursor<text.length){
    const dollar=text.indexOf('$',cursor)
    if(dollar<0){
      pushText(text.slice(cursor))
      break
    }

    pushText(text.slice(cursor,dollar))

    if(text.startsWith('$$',dollar)){
      const end=text.indexOf('$$',dollar+2)
      if(end>=0){
        const math=text.slice(dollar+2,end)
        nodes.push(renderMath(math,true,`${keyPrefix}-math-${index++}`))
        cursor=end+2
        continue
      }
      pushText('$$')
      cursor=dollar+2
      continue
    }

    const currency=currencyAt(text,dollar)
    if(currency){
      pushText(currency)
      cursor=dollar+currency.length
      continue
    }

    const end=text.indexOf('$',dollar+1)
    if(end<0){
      pushText('$')
      cursor=dollar+1
      continue
    }

    const math=text.slice(dollar+1,end)
    if(math.trim()){
      nodes.push(renderMath(math,false,`${keyPrefix}-math-${index++}`))
      cursor=end+1
      continue
    }

    pushText('$')
    cursor=dollar+1
  }

  return nodes.length?nodes:[text]
}

export default function AlexRichText({text,className}:Props){
  const nodes:ReactNode[]=[]
  let cursor=0
  let index=0
  UNDERLINE_MARKUP.lastIndex=0

  let match:RegExpExecArray|null
  while((match=UNDERLINE_MARKUP.exec(text))!==null){
    if(match.index>cursor){
      nodes.push(<Fragment key={`text-${index}`}>{renderMathAwareText(text.slice(cursor,match.index),`text-${index}`)}</Fragment>)
    }
    nodes.push(<u className="rich-underline" key={`underline-${index}`}>{renderMathAwareText(match[1],`underline-${index}`)}</u>)
    cursor=match.index+match[0].length
    index++
  }

  if(cursor<text.length){
    nodes.push(<Fragment key={`text-${index}`}>{renderMathAwareText(text.slice(cursor),`text-${index}`)}</Fragment>)
  }

  return <span className={className}>{nodes.length?nodes:renderMathAwareText(text,'text')}</span>
}
