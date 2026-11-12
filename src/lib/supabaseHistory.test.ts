import {beforeEach,describe,expect,it,vi} from 'vitest'

const mockData=vi.hoisted(()=>({
  attempts:[] as Record<string,unknown>[],
  sessions:[] as Record<string,unknown>[],
  ranges:[] as {table:string;from:number;to:number}[],
}))

vi.mock('@supabase/supabase-js',()=>({
  createClient:()=>({
    auth:{getSession:async()=>({data:{session:{user:{id:'test-user'}}},error:null})},
    from:(table:string)=>{
      type Query={
        select:(columns:string)=>Query
        eq:(column:string,value:unknown)=>Query
        not:(column:string,operator:string,value:unknown)=>Query
        order:(column:string,options:{ascending:boolean})=>Query
        range:(from:number,to:number)=>Promise<{data:Record<string,unknown>[];error:null}>
      }
      const query:Query={
        select:()=>query,
        eq:()=>query,
        not:()=>query,
        order:()=>query,
        range:async(from,to)=>{
          mockData.ranges.push({table,from,to})
          const rows=table==='sat_attempts'?mockData.attempts:mockData.sessions
          return {data:rows.slice(from,to+1),error:null}
        },
      }
      return query
    },
  }),
}))

import {loadCloudHistory} from './supabase'

function sessionRow(id:string){
  return {
    id,
    started_at:'2026-11-12T20:00:00.000Z',
    ended_at:'2026-11-12T20:20:00.000Z',
    mode:'both',
    question_count:6,
    session_settings:id==='failed'?{failedEverOnly:true}:{failedEverOnly:false},
  }
}

describe('loadCloudHistory pagination',()=>{
  beforeEach(()=>{
    mockData.attempts=[]
    mockData.sessions=[]
    mockData.ranges=[]
  })

  it('loads all answers after the 1,000-row boundary, including the failed-review session',async()=>{
    mockData.sessions=['earlier','math','reading','failed'].map(sessionRow)
    mockData.attempts=Array.from({length:1008},(_,index)=>{
      const sessionId=index<990?'earlier':index<996?'math':index<1002?'reading':'failed'
      return {
        id:`attempt-${String(index).padStart(4,'0')}`,
        session_id:sessionId,
        question_id:`question-${index}`,
        practice_test_id:'practice-test-4',
        subject:sessionId==='math'?'math':'english',
        module:'rw1',
        question_number:1,
        selected_answer:'A',
        correct_answer:'A',
        correct:true,
        self_graded:false,
        elapsed_ms:1200,
        created_at:index<990
          ?'2026-11-11T20:00:00.000Z'
          :new Date(Date.UTC(2026,10,12,20,0,0)+(index-990)*1000).toISOString(),
      }
    })

    const history=await loadCloudHistory()
    expect(history?.attempts).toHaveLength(1008)
    expect(history?.attempts.filter(attempt=>attempt.createdAt.startsWith('2026-11-12'))).toHaveLength(18)
    expect(history?.sessions.find(session=>session.id==='failed')?.attempts).toHaveLength(6)
    expect(mockData.ranges.filter(request=>request.table==='sat_attempts').map(({from,to})=>[from,to]))
      .toEqual([[0,499],[500,999],[1000,1499]])
  })

  it('also retrieves completed sessions beyond a single history page',async()=>{
    mockData.sessions=Array.from({length:501},(_,index)=>sessionRow(`session-${index}`))
    const history=await loadCloudHistory()
    expect(history?.sessions).toHaveLength(501)
    expect(mockData.ranges.filter(request=>request.table==='sat_sessions').map(({from,to})=>[from,to]))
      .toEqual([[0,499],[500,999]])
  })
})
