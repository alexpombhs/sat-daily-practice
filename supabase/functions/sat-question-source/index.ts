const SOURCES={
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
} as const

type PracticeTestId=keyof typeof SOURCES
type SourceKind='questions'|'answers'

const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'GET, OPTIONS',
  'Access-Control-Allow-Headers':'content-type, authorization, apikey, x-client-info',
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{headers:corsHeaders})
  if(req.method!=='GET')return new Response('Method not allowed',{status:405,headers:corsHeaders})

  const url=new URL(req.url)
  const kind=url.searchParams.get('kind')??'questions'
  const practiceTestId=url.searchParams.get('practiceTestId')??'practice-test-4'

  if(kind!=='questions'&&kind!=='answers'){
    return new Response('Unknown SAT source kind',{status:400,headers:corsHeaders})
  }
  if(!(practiceTestId in SOURCES)){
    return new Response('Unknown SAT practice test',{status:400,headers:corsHeaders})
  }

  try{
    const sourceUrl=SOURCES[practiceTestId as PracticeTestId][kind as SourceKind]
    const range=req.headers.get('range')
    const upstream=await fetch(sourceUrl,{headers:{
      'User-Agent':'SAT Practice source proxy',
      ...(range?{Range:range}:{}),
    }})
    if(!upstream.ok)return new Response(`Source unavailable (${upstream.status})`,{status:502,headers:corsHeaders})
    if(!upstream.body)return new Response('Source PDF is empty',{status:502,headers:corsHeaders})
    const headers={
      ...corsHeaders,
      'Content-Type':upstream.headers.get('content-type')??'application/pdf',
      'Cache-Control':'public, max-age=3600, s-maxage=3600',
      'Accept-Ranges':upstream.headers.get('accept-ranges')??'bytes',
      'X-SAT-Practice-Test-Id':practiceTestId,
      'X-SAT-Source-Kind':kind,
    } as Record<string,string>
    const contentLength=upstream.headers.get('content-length')
    const contentRange=upstream.headers.get('content-range')
    if(contentLength)headers['Content-Length']=contentLength
    if(contentRange)headers['Content-Range']=contentRange
    return new Response(upstream.body,{status:upstream.status,headers})
  }catch(error){
    console.error(error)
    return new Response('Unable to load SAT source PDF',{status:502,headers:corsHeaders})
  }
})