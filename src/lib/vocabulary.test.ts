import {describe,expect,it} from 'vitest'
import {VOCABULARY_BANK,buildVocabularyOptions,buildVocabularyPrompt,createVocabularySession} from './vocabulary'

const zero=()=>0

describe('vocabulary practice',()=>{
  it('keeps the SAT-derived vocabulary bank unique and source-linked',()=>{
    expect(VOCABULARY_BANK.length).toBe(86)
    expect(new Set(VOCABULARY_BANK.map(entry=>entry.id)).size).toBe(VOCABULARY_BANK.length)
    expect(VOCABULARY_BANK.every(entry=>entry.word&&entry.definition&&entry.sourceQuestionId)).toBe(true)
  })

  it('builds four unique choices containing the correct answer in either direction',()=>{
    const entry=VOCABULARY_BANK[0]
    const meanings=buildVocabularyOptions(entry,'word-to-definition',VOCABULARY_BANK,zero)
    const words=buildVocabularyOptions(entry,'definition-to-word',VOCABULARY_BANK,zero)
    expect(meanings).toHaveLength(4)
    expect(words).toHaveLength(4)
    expect(new Set(meanings).size).toBe(4)
    expect(new Set(words).size).toBe(4)
    expect(meanings).toContain(entry.definition)
    expect(words).toContain(entry.word)
  })

  it('reverses the prompt and answer cleanly',()=>{
    const entry=VOCABULARY_BANK[0]
    const forward=buildVocabularyPrompt(entry,'word-to-definition',VOCABULARY_BANK,zero)
    const reverse=buildVocabularyPrompt(entry,'definition-to-word',VOCABULARY_BANK,zero)
    expect(forward.prompt).toBe(entry.word)
    expect(forward.answer).toBe(entry.definition)
    expect(reverse.prompt).toBe(entry.definition)
    expect(reverse.answer).toBe(entry.word)
  })

  it('creates a full-bank session without repeating target words',()=>{
    const session=createVocabularySession('word-to-definition',VOCABULARY_BANK.length,VOCABULARY_BANK,zero)
    expect(session).toHaveLength(VOCABULARY_BANK.length)
    expect(new Set(session.map(item=>item.entry.id)).size).toBe(VOCABULARY_BANK.length)
  })
})
