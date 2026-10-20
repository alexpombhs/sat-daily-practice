import {forwardRef,useEffect,useImperativeHandle,useRef} from 'react'
import katex from 'katex'

export type LiveLatexEditorHandle={formatSelection:(kind:string)=>boolean}
type Props={value:string;onChange:(value:string)=>void;onSelectionFormatsChange?:(formats:string[])=>void}

const escapeHtml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

function render(value:string){
  return value.split(/(<(?:u|strong|em|s)>[\s\S]*?<\/(?:u|strong|em|s)>|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/gi).map(part=>{
    const format=part.match(/^<(u|strong|em|s)>([\s\S]*)<\/\1>$/i)
    if(format)return '<'+format[1]+'>'+render(format[2])+'</'+format[1]+'>'
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
    const formats:Record<string,string>={U:'u',STRONG:'strong',B:'strong',EM:'em',I:'em',S:'s',STRIKE:'s'}
    const tag=formats[node.tagName]
    if(tag)return '<'+tag+'>'+inner+'</'+tag+'>'
    return node===root?inner:node.tagName==='DIV'||node.tagName==='P'?inner+'\n':inner
  }
  return walk(root).replace(/\n$/,'')
}

const LiveLatexEditor=forwardRef<LiveLatexEditorHandle,Props>(function LiveLatexEditor({value,onChange,onSelectionFormatsChange},forwardedRef){
  const ref=useRef<HTMLDivElement|null>(null)
  const last=useRef<string|null>(null)
  const selectedRange=useRef<Range|null>(null)
  const activeFormats=useRef<string[]>([])

  function rememberSelection(){
    const root=ref.current
    const selection=window.getSelection()
    if(root&&selection?.rangeCount){
      const range=selection.getRangeAt(0)
      if(root.contains(range.commonAncestorContainer)){
        selectedRange.current=range.cloneRange()
        const formats=['u','strong','em','s'].filter(tag=>{
          let node:Node|null=range.commonAncestorContainer
          while(node&&node!==root){
            if(node instanceof HTMLElement&&node.tagName.toLowerCase()===tag)return true
            node=node.parentNode
          }
          return false
        })
        activeFormats.current=formats
        onSelectionFormatsChange?.(formats)
      }
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
      const tags:Record<string,string>={underline:'u',bold:'strong',italic:'em',strike:'s'}
      const tag=tags[kind]
      const fragment=range.extractContents()
      if(tag){
        const existing=fragment.querySelector?.(tag)
        const wrappingAncestor=(()=>{
          let node:Node|null=range.startContainer
          while(node&&node!==root){
            if(node instanceof HTMLElement&&node.tagName.toLowerCase()===tag)return node
            node=node.parentNode
          }
          return null
        })()
        const container=document.createElement('span')
        container.appendChild(fragment)
        const clean=(node:HTMLElement)=>{
          for(const nested of Array.from(node.querySelectorAll(tag))){
            nested.replaceWith(...Array.from(nested.childNodes))
          }
        }
        if(existing||wrappingAncestor||activeFormats.current.includes(tag)){
          clean(container)
          range.insertNode(container)
          if(wrappingAncestor&&wrappingAncestor.textContent===selected){
            wrappingAncestor.replaceWith(...Array.from(wrappingAncestor.childNodes))
          }
        }else{
          const element=document.createElement(tag)
          element.append(...Array.from(container.childNodes))
          range.insertNode(element)
        }
      }else{
        const element=document.createElement('span')
        element.textContent=wrappers[kind]?.(selected)??selected+(snippets[kind]??'')
        range.insertNode(element)
      }
      const next=serialize(root)
      root.innerHTML=render(next)
      last.current=next
      onChange(next)
      selectedRange.current=null
      activeFormats.current=[]
      onSelectionFormatsChange?.([])
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
