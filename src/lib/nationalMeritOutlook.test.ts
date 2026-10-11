import {describe,expect,it} from 'vitest'
import {buildNationalMeritOutlook} from './nationalMeritOutlook'
import type {ScoreEstimateConfidence,ScorePredictionBasis} from './performanceAnalytics'

function basis(rw:number,math:number):ScorePredictionBasis{
  return {
    sessionCount:10,
    questionCount:80,
    averageQuestionSuccessRate:Math.round((rw+math)/2),
    sections:[
      {subject:'english',label:'Reading & Writing',questions:40,observedQuestions:40,successRate:rw},
      {subject:'math',label:'Math',questions:40,observedQuestions:40,successRate:math},
    ],
  }
}

function confidence(overrides:Partial<ScoreEstimateConfidence>={}):ScoreEstimateConfidence{
  return {
    within40:52,
    within50:63,
    within80:85,
    within100:93,
    sigmaPoints:51,
    readingWritingQuestionSigmaPoints:16,
    mathQuestionSigmaPoints:17,
    trendSigmaPoints:24,
    label:'High',
    ...overrides,
  }
}

describe('National Merit outlook',()=>{
  it('projects a maximum PSAT Selection Index from very strong balanced performance',()=>{
    const outlook=buildNationalMeritOutlook(basis(100,100),confidence())
    expect(outlook).not.toBeNull()
    expect(outlook!.projectedReadingWriting).toBe(760)
    expect(outlook!.projectedMath).toBe(760)
    expect(outlook!.projectedSelectionIndex).toBe(228)
    expect(outlook!.qualifyingChance).toBeGreaterThan(50)
    expect(outlook!.qualifyingChance).toBeLessThan(100)
  })

  it('improves dynamically as section performance improves',()=>{
    const lower=buildNationalMeritOutlook(basis(90,90),confidence())
    const higher=buildNationalMeritOutlook(basis(95,95),confidence())
    expect(lower).not.toBeNull()
    expect(higher).not.toBeNull()
    expect(higher!.projectedSelectionIndex).toBeGreaterThan(lower!.projectedSelectionIndex)
    expect(higher!.qualifyingChance).toBeGreaterThan(lower!.qualifyingChance)
  })

  it('reduces the outlook when the same score estimate is less reliable',()=>{
    const stable=buildNationalMeritOutlook(
      basis(95,95),
      confidence({readingWritingQuestionSigmaPoints:10,mathQuestionSigmaPoints:10,trendSigmaPoints:10}),
    )
    const noisy=buildNationalMeritOutlook(
      basis(95,95),
      confidence({readingWritingQuestionSigmaPoints:35,mathQuestionSigmaPoints:35,trendSigmaPoints:50}),
    )
    expect(stable).not.toBeNull()
    expect(noisy).not.toBeNull()
    expect(stable!.projectedSelectionIndex).toBe(noisy!.projectedSelectionIndex)
    expect(stable!.qualifyingChance).toBeGreaterThan(noisy!.qualifyingChance)
  })

  it('requires enough recent questions in both sections',()=>{
    const sparse:ScorePredictionBasis={
      ...basis(95,95),
      sections:[
        {subject:'english',label:'Reading & Writing',questions:2,observedQuestions:2,successRate:95},
        {subject:'math',label:'Math',questions:40,observedQuestions:40,successRate:95},
      ],
    }
    expect(buildNationalMeritOutlook(sparse,confidence())).toBeNull()
  })

  it('requires estimate confidence before showing a qualification probability',()=>{
    expect(buildNationalMeritOutlook(basis(95,95),null)).toBeNull()
  })
})
