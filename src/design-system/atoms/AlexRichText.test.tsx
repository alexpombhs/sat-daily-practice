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

  it('does not treat successive currency amounts as paired math delimiters',()=>{
    const {container}=render(<AlexRichText text={'A ticket costs $25 and parking costs $30.'}/>)
    expect(container.textContent).toBe('A ticket costs $25 and parking costs $30.')
    expect(container.querySelector('.katex')).toBeFalsy()
  })

  it('handles currency separated by whitespace or punctuation',()=>{
    const {container}=render(<AlexRichText text={'$15 $20, $1,250.50 and $3.75'}/>)
    expect(container.textContent).toBe('$15 $20, $1,250.50 and $3.75')
    expect(container.querySelector('.katex')).toBeFalsy()
  })

  it('renders a dollar-wrapped number as math when the closing dollar is adjacent',()=>{
    const {container}=render(<AlexRichText text={'$25$ and $xy$ are math expressions.'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(2)
    expect(container.textContent).not.toContain('
    const {container}=render(<AlexRichText text={'Value $x without a closing delimiter'}/>)
    expect(container.textContent).toContain('$x')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
})
)
  })

  it('keeps an unmatched dollar sign literal',()=>{
    const {container}=render(<AlexRichText text={'Value $x without a closing delimiter'}/>)
    expect(container.textContent).toContain('$x')
    expect(container.querySelector('.katex')).toBeFalsy()
  })
})
