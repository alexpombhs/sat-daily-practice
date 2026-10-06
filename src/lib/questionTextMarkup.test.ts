import {describe,expect,it} from 'vitest'
import {hasUnderlineMarkup,preserveUnderlineMarkup,refersToUnderlinedText,underlineSelection} from './questionTextMarkup'

describe('questionTextMarkup',()=>{
  it('wraps a selected phrase with underline markup',()=>{
    const source='The wax is a surfactant (a chemical compound usable as a detergent).'
    const phrase='(a chemical compound usable as a detergent)'
    const start=source.indexOf(phrase)
    const result=underlineSelection(source,start,start+phrase.length)
    expect(result?.value).toBe('The wax is a surfactant <u>(a chemical compound usable as a detergent)</u>.')
  })

  it('wraps each selected line independently so line-based rendering stays valid',()=>{
    const source='first line\nsecond line'
    const result=underlineSelection(source,0,source.length)
    expect(result?.value).toBe('<u>first line</u>\n<u>second line</u>')
  })

  it('detects underline references and stored markup',()=>{
    expect(refersToUnderlinedText('Which choice describes the underlined portion?')).toBe(true)
    expect(hasUnderlineMarkup('plain <u>important</u> text')).toBe(true)
    expect(hasUnderlineMarkup('plain text')).toBe(false)
  })

  it('preserves known underline markup when source text is re-extracted',()=>{
    const previous='The text has <u>important wording</u> in it.'
    const extracted='The text has important wording in it.'
    expect(preserveUnderlineMarkup(previous,extracted)).toBe(previous)
  })
})
