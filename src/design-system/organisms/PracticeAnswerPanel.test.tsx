import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import PracticeAnswerPanel from './PracticeAnswerPanel'
import type {PracticeQuestion} from '../../types'

const openResponseQuestion:PracticeQuestion={
  id:'synthetic-open-response',practiceTestId:'practice-test-4',subject:'math',
  module:'math1',number:1,sourcePage:0,answerPage:0,
  correctAnswer:'31',acceptedAnswers:['31'],responseType:'student-produced',
}

describe('PracticeAnswerPanel open response keyboard submit',()=>{
  it('submits a non-empty open response when Enter is pressed',()=>{
    const onSubmit=vi.fn()
    render(<PracticeAnswerPanel
      question={openResponseQuestion}
      selected="31"
      submitted={false}
      explanationBytes={null}
      onSelect={()=>undefined}
      onSubmit={onSubmit}
    />)

    fireEvent.keyDown(screen.getByPlaceholderText('Type a number, decimal, or fraction'),{key:'Enter'})
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not submit an empty open response when Enter is pressed',()=>{
    const onSubmit=vi.fn()
    render(<PracticeAnswerPanel
      question={openResponseQuestion}
      selected="   "
      submitted={false}
      explanationBytes={null}
      onSelect={()=>undefined}
      onSubmit={onSubmit}
    />)

    fireEvent.keyDown(screen.getByPlaceholderText('Type a number, decimal, or fraction'),{key:'Enter'})
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
