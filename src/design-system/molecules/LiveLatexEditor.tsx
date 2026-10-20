import {forwardRef,useEffect,useImperativeHandle,useRef} from 'react'
import katex from 'katex'

export type LiveLatexEditorHandle={formatSelection:(kind:string)=>boolean}
type Props={value:string;onChange:(value:string)=>void}

const escapeHtml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function render(value:string){
  return value.split(/(<u>[\s\S]*?<\/u>|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/gi).map(part=>{
    if(/^<u>[\s\S]*<\/u>$/i.test(part))return '<u>'+render(part.slice(3,-4))+'</u>'
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
    if(node.tagName==='U')return '<u>'+inner+'</u>'
    return node===root?inner:node.tagName==='DIV'||node.tagName==='P'?inner+'\n':inner
  }
  return walk(root).replace(/\n$/,'')
}

const LiveLatexEditor=forwardRef<LiveLatexEditorHandle,Props>(function LiveLatexEditor({value,onChange},forwardedRef){
  const ref=useRef<HTMLDivElement|null>(null)
  const last=useRef<string|null>(null)
  const selectedRange=useRef<Range|null>(null)

  function rememberSelection(){
    const root=ref.current
    const selection=window.getSelection()
    if(root&&selection?.rangeCount){
      const range=selection.getRangeAt(0)
      if(root.contains(range.commonAncestorContainer))selectedRange.current=range.cloneRange()
    }
  }

  useImperativeHandle(forwardedRef,()=>({
    formatSelection(kind:string){
      const root=ref.current
      if(!root)return false
      const range=selectedRange.current
      if(!range||range.collapsed||!root.contains(range.commonAncestorContainer))return false
      const selected=range.toString()
      if(!selected.trim())return false
      const wrappers:Record<string,(text:string)=>string>={
        power:text=>'^{'+text+'}',sqrt:text=>'\\sqrt{'+text+'}',
        fraction:text=>'\\frac{'+text+'}{}',variable:text=>'$'+text+'$',
        subscript:text=>'_{'+text+'}',absolute:text=>'\\left|'+text+'\\right|',
        parentheses:text=>'\\left('+text+'\\right)',quote:text=>'\\begin{quote}\n'+text+'\n\\end{quote}',
        table:text=>'[TABLE]\n'+text+'\n[/TABLE]',
      }
      const snippets:Record<string,string>={
        pi:'\\pi',le:'\\le',ge:'\\ge',ne:'\\ne',degree:'^{\\circ}'
      }
      const fragment=range.extractContents()
      const element=document.createElement(kind==='underline'?'u':'span')
      if(kind==='underline')element.appendChild(fragment)
      else element.textContent=wrappers[kind]?.(selected)??selected+snippets[kind]
      range.insertNode(element)
      const next=serialize(root)
      last.current=next
      onChange(next)
      selectedRange.current=null
      root.focus()
      return true
    }
  }),[onChange])

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
    onMouseUp={rememberSelection}
    onKeyUp={rememberSelection}
    onBlur={rememberSelection}
    onInput={event=>{
      const next=serialize(event.currentTarget)
      last.current=next
      onChange(next)
    }}
    style={{minHeight:180,padding:16,border:'1px solid #D0D5DD',borderRadius:10,background:'#fff',fontFamily:'Georgia, serif',fontSize:18,lineHeight:1.65,whiteSpace:'pre-wrap',outlineOffset:2}}
  />
})
export default LiveLatexEditor
