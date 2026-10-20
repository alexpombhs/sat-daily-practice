import {useEffect,useRef} from 'react'
import katex from 'katex'

type Props={value:string;onChange:(value:string)=>void}

const escapeHtml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function render(value:string){
  return value.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g).map(part=>{
    if(part.startsWith('$')&&part.endsWith('$')&&part.length>2){
      const display=part.startsWith('$$')
      const expression=part.slice(display?2:1,display?-2:-1)
      try{
        return '<span contenteditable="false" data-latex="'+escapeHtml(part)+'" class="latex-live-token">'+katex.renderToString(expression,{throwOnError:false,displayMode:display,output:'html'})+'</span>'
      }catch{return escapeHtml(part)}
    }
    return escapeHtml(part).replace(/\n/g,'<br>')
  }).join('')
}

function serialize(root:HTMLElement){
  function walk(node:Node):string{
    if(node.nodeType===Node.TEXT_NODE)return node.textContent??''
    if(!(node instanceof HTMLElement))return ''
    const latex=node.getAttribute('data-latex')
    if(latex!==null)return latex
    if(node.tagName==='BR')return '\n'
    const inner=Array.from(node.childNodes).map(walk).join('')
    return node===root?inner:node.tagName==='DIV'||node.tagName==='P'?inner+'\n':inner
  }
  return walk(root).replace(/\n$/,'')
}

export default function LiveLatexEditor({value,onChange}:Props){
  const ref=useRef<HTMLDivElement|null>(null)
  const last=useRef<string|null>(null)
  useEffect(()=>{
    const element=ref.current
    if(!element||last.current===value)return
    element.innerHTML=render(value)
    last.current=value
  },[value])
  return <div
    ref={ref}
    role="textbox"
    aria-label="Visual question editor"
    aria-multiline="true"
    contentEditable
    suppressContentEditableWarning
    onInput={event=>{
      const next=serialize(event.currentTarget)
      last.current=next
      onChange(next)
    }}
    style={{minHeight:180,padding:16,border:'1px solid #D0D5DD',borderRadius:10,background:'#fff',fontFamily:'Georgia, serif',fontSize:18,lineHeight:1.65,whiteSpace:'pre-wrap',outlineOffset:2}}
  />
}
