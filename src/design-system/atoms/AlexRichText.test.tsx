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


describe('AlexRichText inline math delimiters',()=>{
  it('renders multi-letter variables inside paired dollar delimiters as LaTeX',()=>{
    const {container}=render(<AlexRichText text={'$xy$'}/>)
    expect(container.querySelector('.rich-math.inline .katex')).toBeTruthy()
    expect(container.textContent).not.toContain('$')
  })

  it('keeps currency text literal instead of treating it as LaTeX',()=>{
    const {container}=render(<AlexRichText text={'The price is $25.'}/>)
    expect(container.textContent).toContain('$25')
    expect(container.querySelector('.katex')).toBeFalsy()
  })

  it('keeps an unmatched dollar sign literal',()=>{
    const {container}=render(<AlexRichText text={'Value $x without a closing delimiter'}/>)
    expect(container.textContent).toContain('$x')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
})
