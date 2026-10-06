import {describe,expect,it} from 'vitest'
import {editorTextToReadingLines,readingLinesToEditorText,READING_PARAGRAPH_BREAK} from './readingQuestionFormat'

describe('reading question editor formatting',()=>{
  it('shows internal paragraph markers as blank lines in the editor',()=>{
    expect(readingLinesToEditorText(['First paragraph',READING_PARAGRAPH_BREAK,'Second paragraph']))
      .toBe('First paragraph\n\nSecond paragraph')
  })

  it('restores blank paragraph breaks to the internal marker on save',()=>{
    expect(editorTextToReadingLines('First paragraph\n\nSecond paragraph'))
      .toEqual(['First paragraph',READING_PARAGRAPH_BREAK,'Second paragraph'])
  })

  it('normalizes a leaked paragraph marker instead of preserving it literally',()=>{
    expect(editorTextToReadingLines('First paragraph\n[[SAT_PARAGRAPH_BREAK]]\nSecond paragraph'))
      .toEqual(['First paragraph',READING_PARAGRAPH_BREAK,'Second paragraph'])
  })
})
