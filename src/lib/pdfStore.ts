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
}
const supabaseUrl=import.meta.env.VITE_SUPABASE_URL as string|undefined
export type PdfKind='questions'|'answers'

const inMemorySources=new Map<string,Promise<ArrayBuffer|null>>()

function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function storageKey(testId:PracticeTestId,kind:PdfKind){return `v${CACHE_VERSION}:${testId}:${kind}`}
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
  const response=await fetch(url,{cache:'force-cache'})
  if(!response.ok)throw new Error(`PDF source returned ${response.status}.`)
  const contentType=response.headers.get('content-type')??''
  if(contentType&&!contentType.includes('pdf')&&!contentType.includes('octet-stream'))throw new Error(`Unexpected PDF content type: ${contentType}`)
  if(expectedTestId){const actual=response.headers.get('x-sat-practice-test-id');if(actual&&actual!==expectedTestId)throw new Error(`Wrong SAT source returned: expected ${expectedTestId}, received ${actual}.`)}
  if(expectedKind){const actual=response.headers.get('x-sat-source-kind');if(actual&&actual!==expectedKind)throw new Error(`Wrong SAT source kind returned: expected ${expectedKind}, received ${actual}.`)}
  const bytes=await response.arrayBuffer()
  if(!bytes.byteLength)throw new Error('PDF source returned an empty file.')
  return bytes
}

export function sharedSourceCandidates(testId:PracticeTestId,kind:PdfKind){
  const source=OFFICIAL_SOURCES[testId]?.[kind]
  return [
    supabaseUrl?`${supabaseUrl.replace(/\/$/,'')}/functions/v1/sat-question-source?kind=${kind}&practiceTestId=${encodeURIComponent(testId)}`:null,
    source??null,
  ].filter((value):value is string=>Boolean(value))
}

async function loadCanonicalSource(testId:PracticeTestId,kind:PdfKind){
  for(const url of sharedSourceCandidates(testId,kind)){
    try{
      const bytes=await fetchPdf(url,testId,kind)
      void storeBytes(testId,kind,bytes).catch(error=>console.warn('Unable to update optional SAT source cache.',error))
      return bytes
    }catch(error){
      console.warn(`Shared SAT ${testId} ${kind} source failed: ${url}`,error)
    }
  }
  return null
}

async function loadCachedThenShared(testId:PracticeTestId,kind:PdfKind){
  const cached=await readStored(testId,kind)
  if(cached)return cached

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
  const loading=loadCachedThenShared(testId,kind)
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
