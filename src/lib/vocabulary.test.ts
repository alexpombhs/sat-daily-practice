import {describe,expect,it} from 'vitest'
import {
  DEFAULT_VOCABULARY_SETTINGS,
  PRACTICE_TEST_VOCABULARY,
  VOCABULARY_BANK,
  vocabularySources,
  buildVocabularyOptions,
  buildVocabularyPrompt,
  createVocabularySession,
  filterVocabularyBank,
  vocabularyFailedIds,
  type VocabularyAttempt,
} from './vocabulary'

const zero=()=>0

function attempt(vocabularyId:string,correct:boolean,createdAt:string):VocabularyAttempt{
  return {
    id:vocabularyId+createdAt,
    vocabularyId,
    direction:'word-to-definition',
    selectedAnswer:correct?'correct':'wrong',
    correctAnswer:'correct',
    correct,
    createdAt,
  }
}

describe('vocabulary practice',()=>{
  it('keeps the SAT-derived vocabulary bank unique and source-linked',()=>{
    expect(PRACTICE_TEST_VOCABULARY.length).toBe(86)
    expect(VOCABULARY_BANK.length).toBe(282)
    expect(new Set(VOCABULARY_BANK.map(entry=>entry.id)).size).toBe(VOCABULARY_BANK.length)
    expect(VOCABULARY_BANK.every(entry=>entry.word&&entry.definition)).toBe(true)
    expect(vocabularySources()).toEqual(expect.arrayContaining(['practice-test-derived','sat-open-dataset']))
  })

  it('assigns every vocabulary entry one of the three supported difficulty levels',()=>{
    const allowed=new Set(['easy','medium','advanced'])
    expect(VOCABULARY_BANK.every(entry=>entry.difficulty&&allowed.has(entry.difficulty))).toBe(true)
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
    expect(forward.direction).toBe('word-to-definition')
    expect(forward.prompt).toBe(entry.word)
    expect(forward.answer).toBe(entry.definition)
    expect(reverse.direction).toBe('definition-to-word')
    expect(reverse.prompt).toBe(entry.definition)
    expect(reverse.answer).toBe(entry.word)
  })

  it('creates a full-bank session without repeating target words',()=>{
    const session=createVocabularySession('word-to-definition',VOCABULARY_BANK.length,VOCABULARY_BANK,zero)
    expect(session).toHaveLength(VOCABULARY_BANK.length)
    expect(new Set(session.map(item=>item.entry.id)).size).toBe(VOCABULARY_BANK.length)
  })

  it('treats never-attempted vocabulary as new',()=>{
    const first=VOCABULARY_BANK[0]
    const settings={...DEFAULT_VOCABULARY_SETTINGS,history:'new' as const,sessionSize:'all' as const}
    const filtered=filterVocabularyBank(settings,[attempt(first.id,true,'2026-10-07T10:00:00Z')])
    expect(filtered.some(entry=>entry.id===first.id)).toBe(false)
    expect(filtered.length).toBe(VOCABULARY_BANK.length-1)
  })

  it('keeps failed vocabulary until two correct answers after the latest miss',()=>{
    const id=VOCABULARY_BANK[0].id
    const oneRecovery=[
      attempt(id,false,'2026-10-07T10:00:00Z'),
      attempt(id,true,'2026-10-07T10:01:00Z'),
    ]
    expect(vocabularyFailedIds(oneRecovery).has(id)).toBe(true)
    expect(vocabularyFailedIds([
      ...oneRecovery,
      attempt(id,true,'2026-10-07T10:02:00Z'),
    ]).has(id)).toBe(false)
  })
})
