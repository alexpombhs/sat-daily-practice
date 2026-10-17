import {describe,expect,it} from 'vitest'
import {buildStudyPlanCalendarDays} from './studyPlanCalendar'
import type {Attempt,SessionSummary} from '../types'

function session(id:string,date:string,questionCount:number):SessionSummary{
  return {
    id,
    startedAt:`${date}T15:00:00.000Z`,
    endedAt:`${date}T15:20:00.000Z`,
    mode:'both',
    questionCount,
    attempts:[],
  }
}

function attempts(date:string,count:number,sessionId='active'):Attempt[]{
  return Array.from({length:count},(_,index)=>({
    id:`${sessionId}-a${index}`,
    sessionId,
    questionId:`q-${date}-${index}`,
    practiceTestId:'practice-test-4',
    subject:'math',
    module:'math1',
    questionNumber:index+1,
    selectedAnswer:'A',
    correctAnswer:'A',
    correct:true,
    elapsedMs:60_000,
    createdAt:`${date}T16:${String(index%60).padStart(2,'0')}:00.000Z`,
  }))
}

describe('study plan calendar',()=>{
  it('marks days against the daily question target, independent of session count',()=>{
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:8,
      sessions:[
        session('s1','2026-09-10',20),
        session('s2','2026-09-11',10),
        session('s3','2026-09-11',10),
        session('s4','2026-09-12',8),
        session('s5','2026-09-12',8),
        session('s6','2026-09-12',8),
      ],
      attempts:[
        ...attempts('2026-09-10',20,'s1'),
        ...attempts('2026-09-11',20,'s2'),
        ...attempts('2026-09-12',24,'s4'),
      ],
      recommendedSessionsPerDay:2,
      questionsPerSession:10,
      today:new Date(2026,8,13,12),
      examDate:'2026-10-19',
    })
    expect(days[9]).toMatchObject({day:10,sessionCount:1,questionCount:20,practiced:true,status:'on-track'})
    expect(days[10]).toMatchObject({day:11,sessionCount:2,practiced:true,status:'on-track'})
    expect(days[11]).toMatchObject({day:12,sessionCount:3,practiced:true,status:'ahead'})
    expect(days[12]).toMatchObject({day:13,sessionCount:0,practiced:false,status:'behind'})
    expect(days[13]).toMatchObject({day:14,status:'planned'})
  })


  it('keeps historical status stable when the current session size changes',()=>{
    const historical={...session('s1','2026-09-10',20),dailyQuestionGoal:20}
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:8,
      sessions:[historical],
      attempts:attempts('2026-09-10',20,'s1'),
      recommendedSessionsPerDay:4,
      questionsPerSession:5,
      today:new Date(2026,8,13,12),
    })
    expect(days[9]).toMatchObject({day:10,questionCount:20,targetQuestionCount:20,status:'on-track'})
  })

  it('does not label days before the first recorded practice day as behind',()=>{
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:8,
      sessions:[session('s1','2026-09-10',10)],
      attempts:attempts('2026-09-10',10,'s1'),
      recommendedSessionsPerDay:1,
      questionsPerSession:10,
      today:new Date(2026,8,12,12),
    })
    expect(days[0].status).toBe('neutral')
    expect(days[8].status).toBe('neutral')
    expect(days[9].status).toBe('on-track')
  })
  it('uses submitted attempts, including an active session, for today progress',()=>{
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:8,
      sessions:[session('completed','2026-09-30',10)],
      attempts:attempts('2026-09-30',28,'mixed'),
      recommendedSessionsPerDay:2,
      questionsPerSession:10,
      today:new Date(2026,8,30,12),
    })

    expect(days[29]).toMatchObject({
      day:30,
      sessionCount:1,
      questionCount:28,
      practiced:true,
      targetQuestionCount:20,
      status:'ahead',
    })
  })


  it('treats exam dates as no-practice days even when a daily goal exists',()=>{
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:9,
      sessions:[session('s1','2026-10-16',10)],
      attempts:attempts('2026-10-16',10,'s1'),
      recommendedSessionsPerDay:1,
      questionsPerSession:10,
      today:new Date(2026,9,17,12),
      examDates:['2026-10-17','2026-12-05'],
    })
    expect(days[16]).toMatchObject({
      day:17,
      questionCount:0,
      status:'neutral',
    })
  })

  it('keeps planning active through the last configured test date',()=>{
    const days=buildStudyPlanCalendarDays({
      year:2026,
      month:10,
      sessions:[session('s1','2026-10-16',10)],
      attempts:attempts('2026-10-16',10,'s1'),
      recommendedSessionsPerDay:1,
      questionsPerSession:10,
      today:new Date(2026,10,1,12),
      examDates:['2026-10-17','2026-12-05'],
    })
    expect(days[0].status).toBe('behind')
    expect(days[1].status).toBe('planned')
  })

})
