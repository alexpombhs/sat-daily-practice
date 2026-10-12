import {describe,expect,it} from 'vitest'
import {questionExtractionCrop} from './pdfStructuredImport'
import type {PracticeQuestion} from '../types'
const makeQuestion=(sourceCrop:PracticeQuestion['sourceCrop']):PracticeQuestion=>({
  id:'synthetic-1',practiceTestId:'practice-test-4',subject:'math',module:'math2',number:1,
  sourcePage:1,answerPage:1,correctAnswer:'A',acceptedAnswers:['A'],
  responseType:'multiple-choice',sourceCrop,
})
describe('questionExtractionCrop',()=>{
  it('uses sourceCrop supplied by canonical metadata',()=>{
    const crop={x:10,y:20,width:100,height:120}
    expect(questionExtractionCrop(makeQuestion(crop))).toEqual(crop)
  })
  it('never falls back to baked-in question coordinates',()=>{
    expect(questionExtractionCrop(makeQuestion(null))).toBeUndefined()
  })
})
