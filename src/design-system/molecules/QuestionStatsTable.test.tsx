import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import QuestionStatsTable from './QuestionStatsTable'
import type {QuestionPerformance} from '../../lib/performanceAnalytics'

vi.mock('../../lib/sharedQuestionBank',()=>({
  loadSharedQuestionBank:vi.fn().mockResolvedValue([{
    id:'rw2-8',practiceTestId:'practice-test-4',subject:'english',module:'rw2',number:8,
    sourcePage:1,answerPage:1,correctAnswer:'A',acceptedAnswers:['A'],responseType:'multiple-choice',
  }]),
}))
vi.mock('./QuestionContent',()=>({default:({question}:{question:{id:string}})=><div>Rendered question {question.id}</div>}))
vi.mock('./SourceViewer',()=>({default:({pdfKey,questionNumber}:{pdfKey:string;questionNumber:number})=><div>Source viewer {pdfKey} Q{questionNumber}</div>}))

describe('QuestionStatsTable review drawer',()=>{
  it('opens a drawer with canonical question metadata and original explanation source',async()=>{
    const question:QuestionPerformance={
      questionId:'rw2-8',practiceTestId:'practice-test-4',subject:'english',module:'rw2',questionNumber:8,attempts:2,correct:1,successRate:50,averageMs:42000,lastAttemptAt:'2026-09-18T12:00:00.000Z',
    }
    render(<QuestionStatsTable questions={[question]} answersPdf={new ArrayBuffer(8)}/>)
    await screen.findAllByRole('button',{name:'Review Practice Test 4 Reading and Writing question 8'})
    fireEvent.click(screen.getAllByRole('button',{name:'Review Practice Test 4 Reading and Writing question 8'})[0])
    expect(screen.getByText('Question review')).toBeInTheDocument()
    expect(await screen.findByText('Rendered question rw2-8')).toBeInTheDocument()
    expect(screen.getByText('Original explanation')).toBeInTheDocument()
    expect(screen.getByText('Source viewer answers Q8')).toBeInTheDocument()
    expect(screen.queryByText(/Rendered explanation/)).not.toBeInTheDocument()
  })
})
