import type {PracticeTestId} from '../types'

const DB='sat-practice-pdfs', STORE='pdfs', CACHE_VERSION=3
const OFFICIAL_SOURCES:Record<PracticeTestId,{questions:string;answers:string}>={
  'practice-test-4':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-4-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-4-answers-digital.pdf',
  },
  'practice-test-5':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-5-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-5-answers-digital.pdf',
  },
  'practice-test-6':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-6-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-6-answers-digital.pdf',
  },
  'practice-test-7':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-7-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-7-answers-digital.pdf',
  },
  'practice-test-8':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-8-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-8-answers-digital.pdf',
  },
  'practice-test-9':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-9-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-9-answers-digital.pdf',
  },
  'practice-test-10':{
    questions:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-10-digital.pdf',
    answers:'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-10-answers-digital.pdf',
  },
}
const supabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined
export type PdfKind='questions'|'answers'

// Validate the actual PT9 content, not byte-for-byte PDF metadata.
// Source files can be re-optimized upstream without changing their questions.
async function verifiedCanonicalBytes(testId:PracticeTestId,kind:PdfKind,bytes:ArrayBuffer){
  if(testId!=='practice-test-9'&&testId!=='practice-test-10')return true
  const {GlobalWorkerOptions,getDocument}=await import('pdfjs-dist')
  GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).toString()
  const doc=await getDocument({data:new Uint8Array(bytes.slice(0))}).promise
  try{
    if(kind==='questions'&&doc.numPages!==56)return false
    if(kind==='answers'&&doc.numPages!==47)return false
    const pageNumber=testId==='practice-test-10'
      ?kind==='questions'?34:33
      :kind==='questions'?34:31
    const page=await doc.getPage(pageNumber)
    const content=await page.getTextContent()
    const text=content.items.flatMap(item=>'str' in item?[item.str]:[]).join(' ').toLowerCase()
    if(testId==='practice-test-10'){
      return kind==='questions'
        ?text.includes('used car lot')&&text.includes('system of linear equations')
        :text.includes('sat answer explanations')&&text.includes('math')&&text.includes('module 1')
    }
    return kind==='questions'
      ?text.includes('triangle')&&text.includes('perimeter')&&text.includes('centimeters')
      :text.includes('question 1')&&text.includes('triangle')
  }finally{await doc.destroy()}
}

const inMemorySources=new Map<string,Promise<ArrayBuffer|null>>()

function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function storageKey(testId:PracticeTestId,kind:PdfKind){return `v${testId==='practice-test-10'?CACHE_VERSION+21:testId==='practice-test-9'?CACHE_VERSION+10:testId==='practice-test-8'?CACHE_VERSION+1:CACHE_VERSION}:${testId}:${kind}`}
function memoryKey(testId:PracticeTestId,kind:PdfKind){return `${testId}:${kind}`}

async function storeBytes(testId:PracticeTestId,kind:PdfKind,bytes:ArrayBuffer){
  const db=await openDb();const key=storageKey(testId,kind)
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(bytes,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})
}

async function readStored(testId:PracticeTestId,kind:PdfKind):Promise<ArrayBuffer|null>{
  try{
    const db=await openDb()
    const stored=await new Promise<ArrayBuffer|undefined>((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(storageKey(testId,kind));req.onsuccess=()=>resolve(req.result as ArrayBuffer|undefined);req.onerror=()=>reject(req.error)})
    return stored?.byteLength?stored:null
  }catch{
    return null
  }
}

async function fetchPdf(url:string,expectedTestId?:PracticeTestId,expectedKind?:PdfKind){
  const response=await fetch(url,{cache:expectedTestId==='practice-test-10'||expectedTestId==='practice-test-9'||expectedTestId==='practice-test-8'?'reload':'force-cache'})
  if(!response.ok)throw new Error(`PDF source returned ${response.status}.`)
  const contentType=response.headers.get('content-type')??''
  if(contentType&&!contentType.includes('pdf')&&!contentType.includes('octet-stream'))throw new Error(`Unexpected PDF content type: ${contentType}`)
  if(expectedTestId){const actual=response.headers.get('x-sat-practice-test-id');if(actual&&actual!==expectedTestId)throw new Error(`Wrong SAT source returned: expected ${expectedTestId}, received ${actual}.`)}
  if(expectedKind){const actual=response.headers.get('x-sat-source-kind');if(actual&&actual!==expectedKind)throw new Error(`Wrong SAT source kind returned: expected ${expectedKind}, received ${actual}.`)}
  const bytes=await response.arrayBuffer()
  if(!bytes.byteLength)throw new Error('PDF source returned an empty file.')
  if(expectedTestId&&expectedKind&&!(await verifiedCanonicalBytes(expectedTestId,expectedKind,bytes)))throw new Error(`${expectedTestId} PDF is not the expected official question or explanation document.`)
  return bytes
}

export function sharedSourceCandidates(testId:PracticeTestId,kind:PdfKind){
  const source=OFFICIAL_SOURCES[testId]?.[kind]
  const proxy=supabaseUrl?`${supabaseUrl.replace(/\/$/,'')}/functions/v1/sat-question-source?kind=${kind}&practiceTestId=${encodeURIComponent(testId)}${testId==='practice-test-10'?'&sourceVersion=2':''}`:null
  // PT10 is intentionally proxy-only in the browser. College Board's PDF host does not
  // consistently allow cross-origin browser fetches, so a direct fallback can turn a useful
  // proxy error into the misleading generic "Failed to fetch".
  return (testId==='practice-test-10'?[proxy]:[proxy,source??null])
    .filter((value):value is string=>Boolean(value))
}

async function loadCanonicalSource(testId:PracticeTestId,kind:PdfKind){
  let lastError:unknown=null
  for(const url of sharedSourceCandidates(testId,kind)){
    const attempts=testId==='practice-test-10'?2:1
    for(let attempt=1;attempt<=attempts;attempt++){
      try{
        const bytes=await fetchPdf(url,testId,kind)
        void storeBytes(testId,kind,bytes).catch(error=>console.warn('Unable to update optional SAT source cache.',error))
        return bytes
      }catch(error){
        lastError=error
        console.warn(`Shared SAT ${testId} ${kind} source failed (attempt ${attempt}/${attempts}): ${url}`,error)
      }
    }
  }
  if(testId==='practice-test-9'||testId==='practice-test-10'){
    const label=testId==='practice-test-10'?'PT10':'PT9'
    throw new Error(lastError instanceof Error?`${label} ${kind} PDF unavailable: ${lastError.message}`:`${label} ${kind} PDF could not be loaded.`)
  }
  return null
}

async function loadCachedThenShared(testId:PracticeTestId,kind:PdfKind){
  const cached=await readStored(testId,kind)
  if(cached&&await verifiedCanonicalBytes(testId,kind,cached))return cached
  // Source PDFs are immutable by test ID; the PT8 cache-version bump invalidates older mismatched copies.

  // Official SAT PDFs are immutable for a given practice-test ID. Once a browser
  // has a verified copy, reuse it instead of proxying the full PDF through
  // Supabase on every page load.
  return loadCanonicalSource(testId,kind)
}

export async function savePracticeTestPdf(testId:PracticeTestId,kind:PdfKind,file:File){
  const bytes=await file.arrayBuffer()
  if(!bytes.byteLength)throw new Error('The selected PDF is empty.')
  await storeBytes(testId,kind,bytes)
  return bytes
}

export async function getPracticeTestPdf(testId:PracticeTestId,kind:PdfKind):Promise<ArrayBuffer|null>{
  const key=memoryKey(testId,kind)
  const existing=inMemorySources.get(key)
  if(existing)return existing
  const loading=loadCachedThenShared(testId,kind).then(bytes=>{if(!bytes)inMemorySources.delete(key);return bytes}).catch(error=>{inMemorySources.delete(key);throw error})
  inMemorySources.set(key,loading)
  return loading
}

export async function savePdf(kind:PdfKind,file:File){return savePracticeTestPdf('practice-test-4',kind,file)}
export async function getPdf(kind:PdfKind){return getPracticeTestPdf('practice-test-4',kind)}
export async function clearPdfs(){
  inMemorySources.clear()
  const db=await openDb()
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})
}
