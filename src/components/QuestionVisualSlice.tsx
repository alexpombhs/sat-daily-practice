import {useEffect,useState} from 'react'

GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString()
import {GlobalWorkerOptions,getDocument,type PDFDocumentProxy} from 'pdfjs-dist'
import {getQuestionImage,saveQuestionImage} from '../lib/questionImageStore'
import {questionCropForParts} from '../lib/questionCrops'
import {expandNormalizedCrop,type NormalizedCrop} from '../lib/questionVisuals'
import type {PracticeQuestion,SourceCrop} from '../types'


const cache=new Map<string,PDFDocumentProxy>()
async function loadPdf(bytes:ArrayBuffer){
  const key=`questions:${bytes.byteLength}`
  const cached=cache.get(key)
  if(cached)return cached
  const doc=await getDocument({data:new Uint8Array(bytes.slice(0))}).promise
  cache.set(key,doc)
  return doc
}

function canvasToBlob(canvas:HTMLCanvasElement):Promise<Blob>{
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not create visual image.')),'image/png'))
}

type Props={question:PracticeQuestion;bytes:ArrayBuffer;crop:NormalizedCrop;alt:string;expand?:boolean;sourceCrop?:SourceCrop|null;sourcePage?:number;variant?:'figure'|'choice-grid'}

export default function QuestionVisualSlice({question,bytes,crop,alt,expand=true,sourceCrop,sourcePage,variant='figure'}:Props){
  const[src,setSrc]=useState('')
  const[error,setError]=useState('')

  useEffect(()=>{
    let cancelled=false
    let objectUrl=''
    let renderTask:{cancel:()=>void;promise:Promise<void>}|null=null
    const expandedCrop=expand?expandNormalizedCrop(crop):crop
    // Bump the cache version when crop/render behavior changes so browsers do not keep a clipped image.
    const imageKey=`visual-v3:${bytes.byteLength}:${question.id}:${sourcePage??question.sourcePage}:${expandedCrop.x}:${expandedCrop.y}:${expandedCrop.width}:${expandedCrop.height}`

    async function showBlob(blob:Blob){
      objectUrl=URL.createObjectURL(blob)
      if(!cancelled)setSrc(objectUrl)
    }

    async function render(){
      try{
        setError('')
        setSrc('')
        const existing=await getQuestionImage(imageKey)
        if(existing){await showBlob(existing);return}

        const questionCrop=sourceCrop??question.sourceCrop??questionCropForParts(question.practiceTestId,question.module,question.number)
        if(!questionCrop)throw new Error(`Question ${question.number} crop is not configured.`)

        const doc=await loadPdf(bytes)
        const pdfPage=await doc.getPage(sourcePage??question.sourcePage)
        const scale=2.4
        const viewport=pdfPage.getViewport({scale})
        const dpr=window.devicePixelRatio||1

        const full=document.createElement('canvas')
        const fullCtx=full.getContext('2d')!
        full.width=Math.ceil(viewport.width*dpr)
        full.height=Math.ceil(viewport.height*dpr)
        renderTask=pdfPage.render({canvasContext:fullCtx,viewport,transform:dpr===1?undefined:[dpr,0,0,dpr,0,0]}) as typeof renderTask
        await renderTask!.promise
        if(cancelled)return

        const left=(questionCrop.x+questionCrop.width*expandedCrop.x)*scale
        const top=(questionCrop.y+questionCrop.height*expandedCrop.y)*scale
        const right=(questionCrop.x+questionCrop.width*(expandedCrop.x+expandedCrop.width))*scale
        const bottom=(questionCrop.y+questionCrop.height*(expandedCrop.y+expandedCrop.height))*scale
        const srcX=Math.max(0,Math.floor(left*dpr))
        const srcY=Math.max(0,Math.floor(top*dpr))
        const srcRight=Math.min(full.width,Math.ceil(right*dpr))
        const srcBottom=Math.min(full.height,Math.ceil(bottom*dpr))
        const srcWidth=Math.max(1,srcRight-srcX)
        const srcHeight=Math.max(1,srcBottom-srcY)

        const out=document.createElement('canvas')
        out.width=srcWidth
        out.height=srcHeight
        const ctx=out.getContext('2d')!
        ctx.fillStyle='#fff'
        ctx.fillRect(0,0,out.width,out.height)
        ctx.drawImage(full,srcX,srcY,srcWidth,srcHeight,0,0,out.width,out.height)

        const blob=await canvasToBlob(out)
        await saveQuestionImage(imageKey,blob)
        if(!cancelled)await showBlob(blob)
      }catch(reason){
        if(!cancelled)setError(reason instanceof Error?reason.message:'Unable to render the source visual.')
      }
    }

    void render()
    return()=>{
      cancelled=true
      try{renderTask?.cancel()}catch{}
      if(objectUrl)URL.revokeObjectURL(objectUrl)
    }
  },[question,bytes,crop,expand,sourceCrop,sourcePage])

  return <div className={`question-visual-slice ${variant==='choice-grid'?'graphical-choice-grid':''}`} role="img" aria-label={alt}>
    {error?<div className="source-error">{error}</div>:src?<img src={src} alt={alt}/>:<div className="source-loading">Preparing figure…</div>}
  </div>
}
