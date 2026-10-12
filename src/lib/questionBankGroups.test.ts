import {describe,expect,it} from 'vitest'
import {TEST_QUESTION_METADATA as QUESTION_BANK} from '../test/questionMetadataFixture'
import {groupQuestionsByModule,groupQuestionsByPracticeTest} from './questionBankGroups'

describe('Question Bank grouping',()=>{
  it('groups questions by practice test before module',()=>{
    const groups=groupQuestionsByPracticeTest(QUESTION_BANK)
    expect(groups.map(group=>group.practiceTestId)).toContain('practice-test-4')
    expect(groups.map(group=>group.practiceTestId)).toContain('practice-test-5')
    expect(groups.map(group=>group.practiceTestId)).toContain('practice-test-6')
    expect(groups.map(group=>group.practiceTestId)).toContain('practice-test-7')
    expect(groups.every(group=>group.modules.length>0)).toBe(true)
  })

  it('keeps question numbers unique within each practice-test/module group',()=>{
    const groups=groupQuestionsByPracticeTest(QUESTION_BANK)
    for(const group of groups){
      for(const module of group.modules){
        const numbers=module.items.map(question=>question.number)
        expect(new Set(numbers).size).toBe(numbers.length)
      }
    }
  })

  it('preserves SAT module order within a single practice test',()=>{
    const sample=QUESTION_BANK.filter(question=>question.practiceTestId==='practice-test-4'&&(
      (question.module==='rw1'&&question.number<=2)||
      (question.module==='math1'&&question.number<=2)||
      (question.module==='math2'&&question.number===1)
    ))
    const groups=groupQuestionsByModule(sample)
    expect(groups.map(group=>group.module)).toEqual(['rw1','math1','math2'])
    expect(groups.map(group=>group.items.map(question=>question.id))).toEqual([
      ['rw1-1','rw1-2'],['math1-1','math1-2'],['math2-1'],
    ])
  })
})
