import {fireEvent,render,screen,waitFor} from '@testing-library/react'
import {beforeEach,describe,expect,it,vi} from 'vitest'
import VocabularyPractice from './VocabularyPractice'

vi.mock('../../lib/supabase',()=>({
  loadVocabularyAttempts:vi.fn().mockResolvedValue([]),
  saveVocabularyAttempt:vi.fn().mockResolvedValue(undefined),
}))

describe('VocabularyPractice answer actions',()=>{
  const scrollIntoView=vi.fn()

  beforeEach(()=>{
    scrollIntoView.mockClear()
    HTMLElement.prototype.scrollIntoView=scrollIntoView
    vi.stubGlobal('crypto',{randomUUID:()=> 'vocabulary-attempt-id'})
  })

  it('automatically brings Next word into view after answering',async()=>{
    render(<VocabularyPractice
      signedIn
      onSignIn={vi.fn()}
      onPreferencesChange={vi.fn()}
    />)

    const choices=await screen.findAllByRole('button',{pressed:false})
    fireEvent.click(choices[0])

    await waitFor(()=>expect(scrollIntoView).toHaveBeenCalledWith({
      block:'nearest',
      behavior:'smooth',
    }))
    const actions=screen.getByTestId('vocabulary-actions')
    expect(actions).toContainElement(screen.getByRole('button',{name:'Next word'}))
    expect(screen.getByRole('button',{name:'Next word'})).toBeEnabled()

    fireEvent.click(screen.getByRole('button',{name:'Next word'}))
    expect(screen.getByRole('button',{name:'Next word'})).toBeDisabled()
  })
})
