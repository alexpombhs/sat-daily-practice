import {describe,expect,it} from 'vitest'
import {TARGETED_MOCK_QUESTIONS,targetedMockContent} from './targetedMockQuestions'
import {QUESTION_BANK} from './questionBank'

describe('targeted mock content quality',()=>{
  it('provides 48 distinct questions with four options, answer keys and explanations',()=>{
    expect(TARGETED_MOCK_QUESTIONS).toHaveLength(48)
    expect(new Set(TARGETED_MOCK_QUESTIONS.map(question=>question.id)).size).toBe(48)
    for(const question of TARGETED_MOCK_QUESTIONS){
      const content=targetedMockContent(question.id)
      expect(content).toBeDefined()
      expect(content!.questionLines.length).toBe(5)
      expect(content!.explanationLines.join(' ').trim().length).toBeGreaterThan(18)
      const letters=content!.questionLines.slice(1).map(line=>line.slice(0,2))
      expect(letters).toEqual(['A)','B)','C)','D)'])
      expect(['A','B','C','D']).toContain(question.correctAnswer)
    }
  })
  it('keeps the original SAT question IDs and mock IDs disjoint',()=>{
    const originalIds=new Set(QUESTION_BANK.filter(q=>q.practiceTestId!=='practice-test-8').map(q=>q.id))
    expect(TARGETED_MOCK_QUESTIONS.some(q=>originalIds.has(q.id))).toBe(false)
  })
})
