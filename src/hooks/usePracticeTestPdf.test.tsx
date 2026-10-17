import {render,screen,waitFor} from '@testing-library/react'
import {beforeEach,describe,expect,it,vi} from 'vitest'
import {getPracticeTestPdf} from '../lib/pdfStore'
import {usePracticeTestPdfState} from './usePracticeTestPdf'
import type {PracticeQuestion} from '../types'

vi.mock('../lib/pdfStore',()=>({
  getPracticeTestPdf:vi.fn(),
}))

const question:PracticeQuestion={
  id:'rw2-9',
  practiceTestId:'practice-test-4',
  subject:'english',
  module:'rw2',
  number:9,
  sourcePage:21,
  answerPage:22,
  correctAnswer:'C',
  responseType:'multiple-choice',
}

function Harness({fallback=null,testQuestion=question}:{fallback?:ArrayBuffer|null;testQuestion?:PracticeQuestion}){
  const state=usePracticeTestPdfState(testQuestion,'questions',fallback)
  return <div>
    <span>{state.loading?'loading':'done'}</span>
    <span>{state.source?.byteLength?'source-ready':'no-source'}</span>
    <span>{state.error||'no-error'}</span>
    <span>{state.usingFallback?'fallback':'shared'}</span>
  </div>
}

describe('usePracticeTestPdfState',()=>{
  beforeEach(()=>vi.resetAllMocks())

  it('loads the shared source for the selected practice test',async()=>{
    vi.mocked(getPracticeTestPdf).mockResolvedValue(new Uint8Array([1,2,3]).buffer)
    render(<Harness/>)
    expect(screen.getByText('loading')).toBeInTheDocument()
    await waitFor(()=>expect(screen.getByText('source-ready')).toBeInTheDocument())
    expect(screen.getByText('done')).toBeInTheDocument()
    expect(screen.getByText('shared')).toBeInTheDocument()
    expect(getPracticeTestPdf).toHaveBeenCalledWith('practice-test-4','questions')
  })

  it('uses a browser PDF only as fallback when the shared source is unavailable',async()=>{
    vi.mocked(getPracticeTestPdf).mockResolvedValue(null)
    render(<Harness fallback={new Uint8Array([9]).buffer}/>)
    await waitFor(()=>expect(screen.getByText('done')).toBeInTheDocument())
    expect(screen.getByText('source-ready')).toBeInTheDocument()
    expect(screen.getByText('fallback')).toBeInTheDocument()
  })

  it('never displays a mismatched fallback PDF for PT10',async()=>{
    const pt10Question={...question,id:'practice-test-10:math1-2',practiceTestId:'practice-test-10' as const,module:'math1' as const,subject:'math' as const,number:2,sourcePage:34,answerPage:32,correctAnswer:'A'}
    vi.mocked(getPracticeTestPdf).mockResolvedValue(null)
    render(<Harness testQuestion={pt10Question} fallback={new Uint8Array([9]).buffer}/>)
    await waitFor(()=>expect(screen.getByText('done')).toBeInTheDocument())
    expect(screen.getByText('no-source')).toBeInTheDocument()
    expect(screen.getByText('shared')).toBeInTheDocument()
    expect(screen.getByText('The shared source PDF is temporarily unavailable.')).toBeInTheDocument()
  })

  it('reports a shared-source failure without asking for a device-local upload',async()=>{
    vi.mocked(getPracticeTestPdf).mockResolvedValue(null)
    render(<Harness/>)
    await waitFor(()=>expect(screen.getByText('done')).toBeInTheDocument())
    expect(screen.getByText('The shared source PDF is temporarily unavailable.')).toBeInTheDocument()
    expect(screen.getByText('no-source')).toBeInTheDocument()
  })
})
