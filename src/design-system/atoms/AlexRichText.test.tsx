import {render,screen} from '@testing-library/react'
import {describe,expect,it} from 'vitest'
import AlexRichText from './AlexRichText'

describe('AlexRichText underline markup',()=>{
  it('renders stored underline markup as semantic underlined text',()=>{
    render(<AlexRichText text="A <u>marked phrase</u> follows."/>)
    const marked=screen.getByText('marked phrase')
    expect(marked.tagName).toBe('U')
    expect(marked).toHaveClass('rich-underline')
  })

  it('keeps math rendering inside an underlined span',()=>{
    const {container}=render(<AlexRichText text={'<u>$x^2$</u>'}/>)
    expect(container.querySelector('u.rich-underline .katex')).toBeTruthy()
  })
})


describe('AlexRichText inline math and currency',()=>{
  it('renders paired dollar-delimited expressions',()=>{
    const {container}=render(<AlexRichText text={'$xy$ and $x+2$'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(2)
    expect(container.textContent).not.toContain('$')
  })
  it('keeps separate dollar amounts as currency',()=>{
    const {container}=render(<AlexRichText text={'A ticket costs $25 and parking costs $30.'}/>)
    expect(container.textContent).toBe('A ticket costs $25 and parking costs $30.')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
  it('preserves currency with commas, decimals and repeated prices',()=>{
    const {container}=render(<AlexRichText text={'$15 $20, $1,250.50 and $3.75'}/>)
    expect(container.textContent).toBe('$15 $20, $1,250.50 and $3.75')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
  it('renders explicitly closed numeric math',()=>{
    const {container}=render(<AlexRichText text={'$25$ and $xy$'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(2)
  })
  it('preserves unmatched delimiters',()=>{
    const {container}=render(<AlexRichText text={'Value $x without a closing delimiter'}/>)
    expect(container.textContent).toContain('$x')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
})
