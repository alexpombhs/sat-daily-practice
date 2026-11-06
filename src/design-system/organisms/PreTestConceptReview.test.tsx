
import {render,screen,within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe,expect,it,vi} from 'vitest'
import {rankReviewConcepts} from '../../lib/conceptReview'
import type {Attempt,PracticeQuestion} from '../../types'
import PreTestConceptReview from './PreTestConceptReview'

const math:PracticeQuestion={
  id:'algebra-1',subject:'math',psatDomain:'advanced-math',difficulty:'advanced',
  concepts:['quadratic functions'],practiceTestId:'practice-test-6',module:'math2',
  number:14,sourcePage:1,answerPage:2,responseType:'multiple-choice',correctAnswer:'B',
}
const unseen:PracticeQuestion={...math,id:'algebra-2',number:15}
const attempt:Attempt={
  id:'one',sessionId:'s1',questionId:math.id,subject:'math',module:'math2',
  questionNumber:14,correct:false,selectedAnswer:'A',correctAnswer:'B',
  elapsedMs:45000,createdAt:'2026-11-01T12:00:00Z',
}

function setup(){
  const onPractice=vi.fn()
  const onReview=vi.fn()
  const onStartGroup=vi.fn()
  const questions=[math,unseen]
  render(<PreTestConceptReview
    concepts={rankReviewConcepts(questions,[attempt])}
    questions={questions}
    attempts={[attempt]}
    coaching={null}
    psatResults={[]}
    onPractice={onPractice}
    onReview={onReview}
    onStartGroup={onStartGroup}
  />)
  return {onPractice,onReview,onStartGroup}
}

describe('Pre-test Review navigation',()=>{
  it('preserves the original concept groups and provides official SAT categories in the same layout',async()=>{
    const user=userEvent.setup()
    setup()
    expect(screen.getByRole('navigation',{name:'Pre-test review groups'})).toBeTruthy()
    expect(screen.getAllByText('Quadratics & Nonlinear Functions').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading',{name:'Individual questions'})).toBeTruthy()
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    const nav=screen.getByRole('navigation',{name:'Pre-test review groups'})
    expect(within(nav).getByText('Advanced Math')).toBeTruthy()
    expect(screen.getByRole('heading',{name:'Individual questions'})).toBeTruthy()
    await user.click(screen.getByRole('button',{name:'Concepts'}))
    expect(screen.getAllByText('Quadratics & Nonlinear Functions').length).toBeGreaterThan(0)
  })

  it('starts a group session from either view using only the selected group, unseen first',async()=>{
    const user=userEvent.setup()
    const {onStartGroup}=setup()
    await user.click(screen.getByRole('button',{name:'Start group session'}))
    expect(onStartGroup).toHaveBeenLastCalledWith('math','Quadratics & Nonlinear Functions',[unseen.id,math.id])
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    await user.click(screen.getByRole('button',{name:'Start group session'}))
    expect(onStartGroup).toHaveBeenLastCalledWith('math','Advanced Math',[unseen.id,math.id])
  })

  it('supports reviewing and practicing individual questions in both views',async()=>{
    const user=userEvent.setup()
    const {onPractice,onReview}=setup()
    const questionList=screen.getByRole('heading',{name:'Individual questions'}).parentElement?.parentElement
    expect(questionList).toBeTruthy()
    await user.click(screen.getByRole('button',{name:'Review'}))
    expect(onReview).toHaveBeenCalledWith(math)
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    await user.click(screen.getByRole('tab',{name:'Unseen'}))
    expect(screen.getByText(/Not attempted/)).toBeTruthy()
    await user.click(screen.getByRole('button',{name:'Practice'}))
    expect(onPractice).toHaveBeenCalledWith(unseen)
  })

  it('keeps the selected subject while switching views and filters each group list',async()=>{
    const user=userEvent.setup()
    setup()
    await user.click(screen.getByRole('tab',{name:'Reading & Writing'}))
    await user.click(screen.getByRole('button',{name:'SAT categories'}))
    const nav=screen.getByRole('navigation',{name:'Pre-test review groups'})
    expect(within(nav).getByText('Craft and Structure')).toBeTruthy()
    expect(within(nav).queryByText('Advanced Math')).toBeNull()
    await user.click(screen.getByRole('button',{name:'Concepts'}))
    expect(screen.getByRole('tab',{name:'Reading & Writing','selected':true})).toBeTruthy()
  })
})
