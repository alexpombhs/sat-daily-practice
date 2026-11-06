import {describe,expect,it} from 'vitest'
import {matchesPsatDomain,questionPsatDomain,selectedPsatCategories,PSAT_DOMAINS} from './psatDomains'
import {choosePracticeQuestions,countCategoryQuestions,countDifficultyQuestions,countFailedPracticeQuestions,countNewPracticeQuestions,practiceQuestionPool} from './practiceGamification'
import type {Attempt,PracticeQuestion,Settings} from '../types'

function question(id:string,subject:'english'|'math',concepts:string[],difficulty:'easy'|'medium'|'advanced'='medium'):PracticeQuestion{
  return {
    id,practiceTestId:'practice-test-4',subject,module:subject==='math'?'math1':'rw1',number:1,
    sourcePage:1,answerPage:1,correctAnswer:'A',responseType:'multiple-choice',concepts,difficulty,
  }
}
const questions=[
  {...question('rw-craft','english',['Words in Context'],'advanced'),psatDomain:'craft-structure' as const},
  {...question('rw-info','english',['Command of Evidence']),psatDomain:'information-ideas' as const},
  {...question('rw-expression','english',['Rhetorical Synthesis']),psatDomain:'expression-ideas' as const},
  {...question('rw-conventions','english',['Punctuation']),psatDomain:'standard-conventions' as const},
  {...question('math-algebra','math',['Systems of linear equations']),psatDomain:'algebra' as const},
  {...question('math-advanced','math',['Quadratic Functions'],'advanced'),psatDomain:'advanced-math' as const},
  {...question('math-data','math',['Percent increase']),psatDomain:'problem-solving-data' as const},
  {...question('math-geometry','math',['Similar triangles']),psatDomain:'geometry-trigonometry' as const},
  question('math-unclassified','math',['unknown specialized tag']),
]
const settings:Settings={mode:'both',practiceTest:'all',questionsPerSession:10,shuffle:true,showExplanations:true,psatDomain:'all'}
function failedAttempt(questionId:string,correct=false):Attempt{
  return {id:'attempt-'+questionId,sessionId:'session1',questionId,subject:'english',module:'rw1',questionNumber:1,selectedAnswer:'B',correctAnswer:'A',correct,elapsedMs:1000,createdAt:'2026-01-01T12:00:00Z'}
}

describe('PSAT content domains',()=>{
  it('has exactly the four official categories per section',()=>{
    expect(PSAT_DOMAINS).toHaveLength(8)
    expect(PSAT_DOMAINS.filter(item=>item.subject==='math')).toHaveLength(4)
    expect(PSAT_DOMAINS.filter(item=>item.subject==='english')).toHaveLength(4)
  })
  it('uses audited category metadata for all eight content areas',()=>{
    expect(questions.slice(0,8).map(questionPsatDomain)).toEqual([
      'craft-structure','information-ideas','expression-ideas','standard-conventions',
      'algebra','advanced-math','problem-solving-data','geometry-trigonometry',
    ])
  })
  it('does not pretend to know the category of an untagged or unknown question',()=>{
    expect(questionPsatDomain(question('no-tag','math',[]))).toBeNull()
    expect(questionPsatDomain(questions[8])).toBeNull()
    expect(matchesPsatDomain(questions[8],'uncategorized')).toBe(true)
    expect(matchesPsatDomain(questions[8],'algebra')).toBe(false)
  })
  it('rejects incorrect cross-section domain metadata',()=>{
    expect(questionPsatDomain({...questions[0],psatDomain:'expression-ideas'})).toBe('expression-ideas')
    expect(questionPsatDomain({...questions[0],psatDomain:'algebra'})).toBeNull()
  })
})

describe('category-specific practice selection',()=>{
  it('combines category, subject, test, and difficulty without leaking other questions',()=>{
    const filtered={...settings,mode:'english' as const,psatDomain:'craft-structure' as const,difficultyLevels:['advanced' as const]}
    expect(practiceQuestionPool(filtered,[],questions).map(q=>q.id)).toEqual(['rw-craft'])
    expect(choosePracticeQuestions(filtered,[],()=>0,questions).map(q=>q.id)).toEqual(['rw-craft'])
    expect(practiceQuestionPool({...filtered,practiceTest:'practice-test-5'},[],questions)).toEqual([])
    expect(practiceQuestionPool({...filtered,difficultyLevels:['easy']},[],questions)).toEqual([])
  })
  it('keeps new and failed counts scoped to the selected category',()=>{
    const filtered={...settings,psatDomain:'craft-structure' as const}
    const attempts=[failedAttempt('rw-craft')]
    expect(countNewPracticeQuestions(filtered,attempts,questions)).toBe(0)
    expect(countFailedPracticeQuestions(filtered,attempts,questions)).toBe(1)
    expect(practiceQuestionPool({...filtered,failedOnly:true},attempts,questions)).toEqual([])
    expect(practiceQuestionPool({...filtered,failedEverOnly:true},attempts,questions).map(q=>q.id)).toEqual(['rw-craft'])
  })
  it('counts categories separately from the active category choice',()=>{
    const counts=countCategoryQuestions({...settings,psatDomain:'craft-structure'},questions)
    expect(counts.all).toBe(9)
    expect(counts.uncategorized).toBe(1)
    expect(counts['craft-structure']).toBe(1)
    expect(counts['geometry-trigonometry']).toBe(1)
    expect(countDifficultyQuestions({...settings,psatDomain:'craft-structure'},questions)).toEqual({all:1,easy:0,medium:0,advanced:1})
  })
  it('does not silently exclude uncategorized questions from ordinary practice',()=>{
    expect(practiceQuestionPool(settings,[],questions)).toHaveLength(9)
    expect(practiceQuestionPool({...settings,psatDomain:'uncategorized'},[],questions).map(q=>q.id)).toEqual(['math-unclassified'])
  })
})


describe('multiple PSAT content-area selection',()=>{
  it('preserves legacy single-category settings and defaults to all',()=>{
    expect(selectedPsatCategories(undefined)).toEqual([])
    expect(selectedPsatCategories('all')).toEqual([])
    expect(selectedPsatCategories('craft-structure')).toEqual(['craft-structure'])
    expect(selectedPsatCategories(['craft-structure','advanced-math'])).toEqual(['craft-structure','advanced-math'])
  })
  it('combines selected categories without affecting other question filters',()=>{
    const filtered:Settings={...settings,mode:'both',psatDomain:['craft-structure','advanced-math'],difficultyLevels:['advanced']}
    expect(practiceQuestionPool(filtered,[],questions).map(q=>q.id)).toEqual(['rw-craft','math-advanced'])
    expect(countDifficultyQuestions(filtered,questions)).toEqual({all:2,easy:0,medium:0,advanced:2})
    expect(practiceQuestionPool({...filtered,mode:'math'},[],questions).map(q=>q.id)).toEqual(['math-advanced'])
    expect(practiceQuestionPool({...filtered,practiceTest:'practice-test-5'},[],questions)).toEqual([])
  })
  it('supports uncategorized alongside multiple reviewed categories',()=>{
    const selected:Settings={...settings,psatDomain:['algebra','uncategorized']}
    expect(practiceQuestionPool(selected,[],questions).map(q=>q.id)).toEqual(['math-algebra','math-unclassified'])
    expect(practiceQuestionPool({...selected,psatDomain:[]},[],questions)).toHaveLength(9)
  })
  it('keeps New and Failed counts scoped to all selected categories',()=>{
    const selected:Settings={...settings,psatDomain:['craft-structure','advanced-math']}
    const attempts=[failedAttempt('rw-craft')]
    expect(countFailedPracticeQuestions(selected,attempts,questions)).toBe(1)
    expect(countNewPracticeQuestions(selected,attempts,questions)).toBe(1)
    expect(practiceQuestionPool({...selected,failedOnly:true},attempts,questions).map(q=>q.id)).toEqual(['math-advanced'])
  })
})
