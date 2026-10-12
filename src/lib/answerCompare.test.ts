import {describe,expect,it} from 'vitest'
import {answerLabel,matchesAnswer} from './answerCompare'
import type {PracticeQuestion} from '../types'
const q=(correct:string,acceptedAnswers=[correct]):PracticeQuestion=>({
  id:'synthetic',practiceTestId:'practice-test-4',subject:'math',module:'math1',number:1,
  sourcePage:0,answerPage:0,correctAnswer:correct,acceptedAnswers,responseType:'student-produced',
})
describe('matchesAnswer without bundled question keys',()=>{
  it('checks multiple-choice labels case-insensitively',()=>{
    expect(matchesAnswer(q('B'),'b')).toBe(true)
    expect(matchesAnswer(q('B'),' A ')).toBe(false)
  })
  it('accepts equivalent fraction and decimal answers',()=>{
    expect(matchesAnswer(q('1/5'),'0.2')).toBe(true)
    expect(matchesAnswer(q('1/5'),'2/10')).toBe(true)
  })
  it('accepts and labels alternate numeric answers',()=>{
    const sample=q('15',['15','-5'])
    expect(matchesAnswer(sample,'15')).toBe(true)
    expect(matchesAnswer(sample,'−5')).toBe(true)
    expect(matchesAnswer(sample,'5')).toBe(false)
    expect(answerLabel(sample)).toBe('15 or -5')
  })
})
