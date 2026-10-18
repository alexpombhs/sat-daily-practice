import {useEffect,useRef,useState} from 'react'

GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString()
import {GlobalWorkerOptions,getDocument,type PDFDocumentProxy,type PDFPageProxy} from 'pdfjs-dist'
import {getQuestionImage,saveQuestionImage} from '../lib/questionImageStore'
import {questionCropForParts} from '../lib/questionCrops'
import type {ModuleKey,PracticeTestId,SourceCrop} from '../types'


const cache=new Map<string,PDFDocumentProxy>()
async function loadPdf(key:string,bytes:ArrayBuffer){
  const cacheKey=`${key}:${bytes.byteLength}`
  // PT9 PDFs must never reuse a document keyed by byte length alone.
  // A previous incorrect asset can have the same length as the canonical PDF.
  if(key.startsWith('practice-test-9:'))return getDocument({data:new Uint8Array(bytes.slice(0))}).promise
  const cached=cache.get(cacheKey);if(cached)return cached
  const doc=await getDocument({data:new Uint8Array(bytes.slice(0))}).promise;cache.set(cacheKey,doc);return doc
}

type TextItemLike={str:string;transform:number[];width?:number}
function isTextItem(item:unknown):item is TextItemLike{return !!item&&typeof item==='object'&&'str' in item&&'transform' in item}
function isMarker(text:string,n:number){const s=text.trim().replace(/\s+/g,' ');return new RegExp(`^(?:Question\s*)?${n}(?:\s|[.)]|$)`,'i').test(s)}

function moduleForPage(page:number):ModuleKey|null{
  if(page>=4&&page<=17)return'rw1';if(page>=18&&page<=30)return'rw2';if(page>=34&&page<=41)return'math1';if(page>=42&&page<=50)return'math2';return null
}

type Marker={n:number;x:number;y:number}
type CropBounds={left:number;right:number;top:number;bottom:number;viewport:ReturnType<PDFPageProxy['getViewport']>}
type ExplanationBounds=CropBounds&{currentFound:boolean;nextFound:boolean}
const MAX_EXPLANATION_PAGES=2

async function pageTextItems(page:PDFPageProxy,scale:number){
  const viewport=page.getViewport({scale});const text=await page.getTextContent()
  const items=text.items.flatMap(raw=>{if(!isTextItem(raw))return[];const [x,y]=viewport.convertToViewportPoint(raw.transform[4],raw.transform[5]);const width=typeof raw.width==='number'?raw.width*scale:Math.max(raw.str.length*4.5*scale,8*scale);return[{text:raw.str.trim(),x,y,width}]})
  return{viewport,items}
}

async function explanationBounds(page:PDFPageProxy,scale:number,questionNumber:number){
  const {viewport,items}=await pageTextItems(page,scale)

  // PDF.js may return "QUESTION" and "14" as separate text items. Build visual
  // rows first so we can reliably identify the current and next question heading.
  const rowTolerance=4*scale
  const rows:{y:number;items:typeof items;text:string}[]=[]
  for(const item of [...items].filter(item=>item.text).sort((a,b)=>a.y-b.y||a.x-b.x)){
    const row=rows.find(candidate=>Math.abs(candidate.y-item.y)<=rowTolerance)
    if(row){
      row.items.push(item)
      row.items.sort((a,b)=>a.x-b.x)
      row.text=row.items.map(part=>part.text).join(' ').replace(/\s+/g,' ').trim()
    }else{
      rows.push({y:item.y,items:[item],text:item.text.replace(/\s+/g,' ').trim()})
    }
  }

  const headingFor=(n:number)=>rows.find(row=>new RegExp(`^QUESTION\\s*${n}(?:\\s|$)`,'i').test(row.text))
  const currentHeading=headingFor(questionNumber)
  const nextHeading=headingFor(questionNumber+1)

  let current:Marker|undefined
  let next:Marker|undefined

  if(currentHeading){
    current={
      n:questionNumber,
      x:Math.min(...currentHeading.items.map(item=>item.x)),
      y:currentHeading.y,
    }
    if(nextHeading&&nextHeading.y>current.y){
      next={
        n:questionNumber+1,
        x:Math.min(...nextHeading.items.map(item=>item.x)),
        y:nextHeading.y,
      }
    }
  }else{
    // Fallback for answer PDFs that do not use an explicit QUESTION heading.
    const markers:Marker[]=[]
    for(const item of items){
      for(let n=Math.max(1,questionNumber-2);n<=questionNumber+5;n++){
        if(isMarker(item.text,n)){markers.push({n,x:item.x,y:item.y});break}
      }
    }
    current=[...markers.filter(marker=>marker.n===questionNumber)].sort((a,b)=>a.y-b.y||a.x-b.x)[0]
    if(current){
      next=markers
        .filter(marker=>marker.n===questionNumber+1&&marker.y>current!.y+8*scale)
        .sort((a,b)=>a.y-b.y)[0]
    }
  }

  if(!current)return{left:0,right:viewport.width,top:0,bottom:viewport.height,viewport,currentFound:false,nextFound:false}

  // Start just above the current heading and stop just before the next heading.
  // This intentionally excludes adjacent question explanations on the same page.
  const top=Math.max(0,current.y-10*scale)
  const bottom=Math.min(viewport.height,next?next.y-10*scale:viewport.height-52*scale)
  const blockItems=items.filter(item=>item.text&&item.y>=top&&item.y<bottom)
  if(!blockItems.length)return{left:0,right:viewport.width,top,bottom,viewport,currentFound:true,nextFound:!!next}

  const horizontalItems=blockItems.filter(item=>item.y>=current!.y-2*scale)
  const measured=horizontalItems.length?horizontalItems:blockItems
  const padding=14*scale
  const left=Math.max(0,Math.min(...measured.map(item=>item.x))-padding)
  const right=Math.min(viewport.width,Math.max(...measured.map(item=>item.x+item.width))+padding)
  return{left,right,top,bottom,viewport,currentFound:true,nextFound:!!next}
}

async function continuationExplanationBounds(page:PDFPageProxy,scale:number,nextQuestionNumber:number):Promise<CropBounds|null>{
  const {viewport,items}=await pageTextItems(page,scale)
  const rowTolerance=4*scale
  const rows:{y:number;items:typeof items;text:string}[]=[]
  for(const item of [...items].filter(item=>item.text).sort((a,b)=>a.y-b.y||a.x-b.x)){
    const row=rows.find(candidate=>Math.abs(candidate.y-item.y)<=rowTolerance)
    if(row){
      row.items.push(item)
      row.items.sort((a,b)=>a.x-b.x)
      row.text=row.items.map(part=>part.text).join(' ').replace(/\s+/g,' ').trim()
    }else{
      rows.push({y:item.y,items:[item],text:item.text.replace(/\s+/g,' ').trim()})
    }
  }

  const nextHeading=rows.find(row=>new RegExp(`^QUESTION\\s*${nextQuestionNumber}(?:\\s|$)`,'i').test(row.text))
  // Module numbering restarts at question 1. If a continuation page starts a
  // different question sequence, don't attach the next module's explanation.
  const firstQuestionHeading=rows.find(row=>/^QUESTION\\s+\\d+(?:\\s|$)/i.test(row.text))
  if(firstQuestionHeading&&!nextHeading)return null
  const footerCutoff=viewport.height-52*scale
  const usable=items.filter(item=>{
    if(!item.text||item.y<38*scale||item.y>=footerCutoff)return false
    const normalized=item.text.replace(/\s+/g,' ').trim()
    if(/^SAT (?:PRACTICE TEST|ANSWER EXPLANATIONS)/i.test(normalized))return false
    return true
  })

  const stop=nextHeading?nextHeading.y-10*scale:footerCutoff
  const blockItems=usable.filter(item=>item.y<stop)
  if(!blockItems.length)return null

  const top=Math.max(0,Math.min(...blockItems.map(item=>item.y))-10*scale)
  const bottom=Math.min(footerCutoff,Math.max(...blockItems.map(item=>item.y))+22*scale,stop)
  if(bottom<=top+8*scale)return null

  const padding=14*scale
  const left=Math.max(0,Math.min(...blockItems.map(item=>item.x))-padding)
  const right=Math.min(viewport.width,Math.max(...blockItems.map(item=>item.x+item.width))+padding)
  return{left,right,top,bottom,viewport}
}

async function renderCrop(page:PDFPageProxy,bounds:CropBounds,dpr:number,onTask:(task:{cancel:()=>void;promise:Promise<void>})=>void){
  const width=Math.max(1,Math.ceil((bounds.right-bounds.left)*dpr))
  const height=Math.max(1,Math.ceil((bounds.bottom-bounds.top)*dpr))
  const canvas=document.createElement('canvas')
  canvas.width=width;canvas.height=height
  const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height)
  const task=page.render({
    canvasContext:ctx,
    viewport:bounds.viewport,
    transform:[dpr,0,0,dpr,-bounds.left*dpr,-bounds.top*dpr],
  }) as {cancel:()=>void;promise:Promise<void>}
  onTask(task)
  await task.promise
  return canvas
}

function stitchCanvases(parts:HTMLCanvasElement[],dpr:number){
  if(parts.length===1)return parts[0]
  const gap=Math.max(1,Math.round(14*dpr))
  const width=Math.max(...parts.map(part=>part.width))
  const height=parts.reduce((sum,part)=>sum+part.height,0)+gap*(parts.length-1)
  const canvas=document.createElement('canvas')
  canvas.width=width;canvas.height=height
  const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height)
  let y=0
  for(const part of parts){
    const x=Math.floor((width-part.width)/2)
    ctx.drawImage(part,x,y)
    y+=part.height+gap
  }
  return canvas
}

async function dynamicQuestionBounds(page:PDFPageProxy,scale:number,questionNumber:number){
  const {viewport,items}=await pageTextItems(page,scale)
  const marginCandidates=items.filter(item=>isMarker(item.text,questionNumber)&&(item.x<viewport.width*.22||item.x>viewport.width*.50))
  const current=marginCandidates.sort((a,b)=>a.y-b.y||a.x-b.x)[0]
  if(!current)return{left:28*scale,right:569*scale,top:107*scale,bottom:735*scale,viewport}
  const leftColumn=current.x<viewport.width*.5
  const left=(leftColumn?28:306)*scale;const right=(leftColumn?291:569)*scale
  const nextMarkers=items.filter(item=>{
    const raw=item.text.trim();if(!/^\d{1,2}$/.test(raw))return false
    const sameColumn=leftColumn?item.x<viewport.width*.5:item.x>=viewport.width*.5
    return sameColumn&&item.y>current.y+8*scale
  }).sort((a,b)=>a.y-b.y)
  const top=Math.max(0,current.y-12*scale);const bottom=Math.min(viewport.height,nextMarkers.length?nextMarkers[0].y-10*scale:735*scale)
  return{left,right,top,bottom,viewport}
}

function canvasToBlob(canvas:HTMLCanvasElement):Promise<Blob>{return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not create image.')),'image/png'))}

type Props={pdfKey:string;bytes:ArrayBuffer;page:number;questionNumber:number;alt:string;zoom?:number;practiceTestId:PracticeTestId;module?:ModuleKey;sourceCrop?:SourceCrop|null}

export default function SourceSlice({pdfKey,bytes,page,questionNumber,alt,zoom=1,practiceTestId,module,sourceCrop}:Props){
  const[src,setSrc]=useState('');const[error,setError]=useState('');const isQuestion=pdfKey==='questions'
  const contentRef=useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    let cancelled=false;let objectUrl='';const renderTasks:{cancel:()=>void;promise:Promise<void>}[]=[]
    const cropKey=sourceCrop?`${sourceCrop.x},${sourceCrop.y},${sourceCrop.width},${sourceCrop.height}`:'auto'
    const imageKey=`${practiceTestId==='practice-test-9'?'pt9-clean-v1':isQuestion?'v14':'v15'}:${practiceTestId}:${pdfKey}:${bytes.byteLength}:${page}:${questionNumber}:${cropKey}`
    async function showBlob(blob:Blob){objectUrl=URL.createObjectURL(blob);if(!cancelled)setSrc(objectUrl)}
    async function render(){
      try{
        setError('');setSrc('');const existing=await getQuestionImage(imageKey);if(existing){await showBlob(existing);return}
        const doc=await loadPdf(`${practiceTestId}:${pdfKey}`,bytes);const pdfPage=await doc.getPage(page);const dpr=window.devicePixelRatio||1

        if(!isQuestion){
          const scale=1.8
          const firstBounds:ExplanationBounds=await explanationBounds(pdfPage,scale,questionNumber)
          const parts=[await renderCrop(pdfPage,firstBounds,dpr,task=>renderTasks.push(task))]
          if(cancelled)return

          if(firstBounds.currentFound&&!firstBounds.nextFound&&page<doc.numPages&&MAX_EXPLANATION_PAGES>1){
            const continuationPage=await doc.getPage(page+1)
            const continuationBounds=await continuationExplanationBounds(continuationPage,scale,questionNumber+1)
            if(continuationBounds){
              parts.push(await renderCrop(continuationPage,continuationBounds,dpr,task=>renderTasks.push(task)))
              if(cancelled)return
            }
          }

          const blob=await canvasToBlob(stitchCanvases(parts,dpr))
          await saveQuestionImage(imageKey,blob)
          if(!cancelled)await showBlob(blob)
          return
        }

        const scale=2.4
        let left=0,right=0,top=0,bottom=0,viewport
        const resolvedModule=module??moduleForPage(page)
        if(!resolvedModule)throw new Error(`Question ${questionNumber} has an unsupported source page.`)
        const crop=sourceCrop??questionCropForParts(practiceTestId,resolvedModule,questionNumber)
        if(crop){
          viewport=pdfPage.getViewport({scale})
          left=crop.x*scale;right=(crop.x+crop.width)*scale;top=crop.y*scale;bottom=(crop.y+crop.height)*scale
        }else if(practiceTestId==='practice-test-4'){
          const bounds=await dynamicQuestionBounds(pdfPage,scale,questionNumber);viewport=bounds.viewport;({left,right,top,bottom}=bounds)
        }else{
          throw new Error(`No verified source crop exists for ${practiceTestId} ${resolvedModule} question ${questionNumber}.`)
        }
        const full=document.createElement('canvas');const fullCtx=full.getContext('2d')!;full.width=Math.ceil(viewport.width*dpr);full.height=Math.ceil(viewport.height*dpr)
        const renderTask=pdfPage.render({canvasContext:fullCtx,viewport,transform:dpr===1?undefined:[dpr,0,0,dpr,0,0]}) as {cancel:()=>void;promise:Promise<void>}
        renderTasks.push(renderTask);await renderTask.promise;if(cancelled)return
        const srcX=Math.max(0,Math.floor(left*dpr)),srcY=Math.max(0,Math.floor(top*dpr)),srcRight=Math.min(full.width,Math.ceil(right*dpr)),srcBottom=Math.min(full.height,Math.ceil(bottom*dpr))
        const srcWidth=Math.max(1,srcRight-srcX),srcHeight=Math.max(1,srcBottom-srcY);const out=document.createElement('canvas');out.width=srcWidth;out.height=srcHeight
        const ctx=out.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(full,srcX,srcY,srcWidth,srcHeight,0,0,out.width,out.height)
        let rendered=out
        // PT10 Math Module 1 Q4 is intentionally split across two source pages:
        // the prompt/original graph is on the first page and the graphical answer
        // choices A-D are on the following page. Preserve both in the source view.
        if(practiceTestId==='practice-test-10'&&resolvedModule==='math1'&&questionNumber===4&&page<doc.numPages){
          const continuationPage=await doc.getPage(page+1)
          const continuationViewport=continuationPage.getViewport({scale})
          const continuationBounds={
            left:30*scale,
            right:(30+546)*scale,
            top:102*scale,
            bottom:Math.min(continuationViewport.height,(102+620)*scale),
            viewport:continuationViewport,
          }
          const continuation=await renderCrop(continuationPage,continuationBounds,dpr,task=>renderTasks.push(task))
          if(cancelled)return
          rendered=stitchCanvases([out,continuation],dpr)
        }
        const blob=await canvasToBlob(rendered);await saveQuestionImage(imageKey,blob);if(!cancelled)await showBlob(blob)
      }catch(reason){if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to render item.')}
    }
    void render()
    return()=>{cancelled=true;for(const task of renderTasks){try{task.cancel()}catch{}};if(objectUrl)URL.revokeObjectURL(objectUrl)}
  },[pdfKey,bytes,page,questionNumber,isQuestion,practiceTestId,module,sourceCrop])
  useEffect(()=>{
    const node=contentRef.current
    if(!node||!src)return
    const frame=requestAnimationFrame(()=>{
      node.scrollLeft=Math.max(0,(node.scrollWidth-node.clientWidth)/2)
    })
    return()=>cancelAnimationFrame(frame)
  },[zoom,src])

  const zoomWidth=`${Math.round(zoom*10000)/100}%`
  return <div className={`source-slice ${isQuestion?'question-source':''}`} role="img" aria-label={alt}>
    <div className="source-slice-content source-slice-content--zoomable" ref={contentRef}>
      {error?<div className="source-error">{error}</div>:src?
        <div className="source-slice-zoom" style={{width:zoomWidth}}>
          <img src={src} alt={alt}/>
        </div>
        :<div className="source-loading">{isQuestion?'Preparing question…':'Preparing explanation…'}</div>}
    </div>
  </div>
}
