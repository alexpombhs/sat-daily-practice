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
  it('recognizes comma-containing closed math even when it starts with numbers',()=>{
    const {container}=render(<AlexRichText text={'Coordinates $(4,5)$ and $1,000$ and $x,y$'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(3)
    expect(container.textContent).not.toContain('$')
  })
  it('keeps spaced comma-separated prices as currency',()=>{
    const {container}=render(<AlexRichText text={'Items cost $1,250 $2,400 and $3,500.'}/>)
    expect(container.textContent).toBe('Items cost $1,250 $2,400 and $3,500.')
    expect(container.querySelector('.katex')).toBeFalsy()
  })

  it('treats a currency amount as complete without a closing dollar before math',()=>{
    const {container}=render(<AlexRichText text={'Pay $1,235 $x^2$ for the quantity.'}/>)
    expect(container.textContent).toContain('$1,235')
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(1)
  })
  it('supports two currency amounts each followed by independent math',()=>{
    const {container}=render(<AlexRichText text={String.raw`$1,235 $x^2$; then $2,400 $\frac{a}{b}import {render,screen} from '@testing-library/react'
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
  it('recognizes comma-containing closed math even when it starts with numbers',()=>{
    const {container}=render(<AlexRichText text={'Coordinates $(4,5)$ and $1,000$ and $x,y$'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(3)
    expect(container.textContent).not.toContain('$')
  })
  it('keeps spaced comma-separated prices as currency',()=>{
    const {container}=render(<AlexRichText text={'Items cost $1,250 $2,400 and $3,500.'}/>)
    expect(container.textContent).toBe('Items cost $1,250 $2,400 and $3,500.')
    expect(container.querySelector('.katex')).toBeFalsy()
  })

  it('treats a currency amount as complete without a closing dollar before math',()=>{
    const {container}=render(<AlexRichText text={'Pay $1,235 $x^2$ for the quantity.'}/>)
    expect(container.textContent).toContain('$1,235')
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(1)
  })
  it('supports two currency amounts each followed by independent math',()=>{
    const {container}=render(<AlexRichText }/>)
    expect(container.textContent).toContain('$1,235')
    expect(container.textContent).toContain('$2,400')
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(2)
  })
  it('treats a closed comma expression as math, not currency',()=>{
    const {container}=render(<AlexRichText text={'$1,235$ and $(2,3)$'}/>)
    expect(container.querySelectorAll('.rich-math.inline .katex')).toHaveLength(2)
  })

})
