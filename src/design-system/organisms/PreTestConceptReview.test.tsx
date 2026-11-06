import {render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe,expect,it,vi} from 'vitest'
import {rankReviewConcepts} from '../../lib/conceptReview'
import type {Attempt,PracticeQuestion} from '../../types'
import PreTestConceptReview from './PreTestConceptReview'

const math:PracticeQuestion={
  id:'algebra-1',subject:'math',psatDomain:'advanced-math',difficulty:'advanced',
  concepts:['quadratic equations'],practiceTestId:'practice-test-6',module:'math2',
  number:14,sourcePage:1,answerPage:2,responseType:'multiple-choice',correctAnswer:'B',
}
const unseen:PracticeQuestion={
  ...math,id:'algebra-2',number:15,
}
const attempt:Attempt={
  id:'one',sessionId:'s1',questionId:math.id,subject:'math',module:'math2',
  questionNumber:14,correct:false,selectedAnswer:'A',correctAnswer:'B',
  elapsedMs:45000,createdAt:'2026-11-01T12:00:00Z',
}

function setup(){
  const onPractice=vi.fn()
  const onReview=vi.fn()
  const questions=[math,unseen]
  render(<PreTestConceptReview
    concepts={rankReviewConcepts(questions,[attempt])}
    questions={questions}
    attempts={[attempt]}
    coaching={null}
    psatResults={[]}
    onPractice={onPractice}
    onReview={onReview}
    onStartCategory={vi.fn()}
  />)
  return {onPractice,onReview}
}

describe('Pre-test Review navigation',()=>{
  it('preserves the original concept groupings and switches to the official SAT categories',async()=>{
    const user=userEvent.setup()
    setup()
    expect(screen.getByText('TOP REVIEW CONCEPTS')).toBeTruthy()
    expect(screen.getAllByText('Quadratics & Nonlinear Functions').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    expect(screen.getByText('Advanced Math')).toBeTruthy()
    expect(screen.queryByText('TOP REVIEW CONCEPTS')).toBeNull()
    await user.click(screen.getByRole('button',{name:'Concepts'}))
    expect(screen.getByText('TOP REVIEW CONCEPTS')).toBeTruthy()
  })

  it('reveals question details on demand instead of showing an overwhelming list',async()=>{
    const user=userEvent.setup()
    const {onPractice}=setup()
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    await user.click(screen.getByRole('button',{name:/Advanced Math/}))
    expect(screen.getByText('Review and practice questions')).toBeTruthy()
    expect(screen.queryByRole('tab',{name:'Unseen'})).toBeNull()
    await user.click(screen.getByText('Review and practice questions'))
    await user.click(screen.getByRole('tab',{name:'Unseen'}))
    const open=screen.getByRole('button',{name:'Open'})
    await user.click(open)
    expect(onPractice).toHaveBeenCalledWith(unseen)
  })

  it('keeps the selected subject when switching between concepts and SAT categories',async()=>{
    const user=userEvent.setup()
    setup()
    await user.click(screen.getByRole('tab',{name:'Reading & Writing'}))
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    expect(screen.getByText('Craft and Structure')).toBeTruthy()
    expect(screen.queryByText('Advanced Math')).toBeNull()
    await user.click(screen.getByRole('button',{name:'Concepts'}))
    expect(screen.getByRole('tab',{name:'Reading & Writing','selected':true})).toBeTruthy()
  })
})
