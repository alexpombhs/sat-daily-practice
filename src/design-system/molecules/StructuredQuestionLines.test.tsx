import {render,screen,within} from '@testing-library/react'
import {describe,expect,it} from 'vitest'
import StructuredQuestionLines,{reflowProseLines} from './StructuredQuestionLines'

describe('reflowProseLines',()=>{
  it('reconstructs wrapped SAT prose while keeping split answer choices separate',()=>{
    const lines=[
      'Research conducted by planetary scientist Katarina',
      'Miljkovic suggests that the Moon’s surface may not',
      'accurately ________ early impact events. When the',
      'Moon was still forming, its surface was softer, and',
      'asteroid or meteoroid impacts would have left less',
      'of an impression; thus, evidence of early impacts',
      'may no longer be present.',
      'Which choice completes the text with the most',
      'logical and precise word or phrase?',
      'A)',
      'reflect',
      'B)',
      'receive',
      'C)',
      'evaluate',
      'D)',
      'mimic',
    ]

    expect(reflowProseLines(lines)).toEqual([
      'Research conducted by planetary scientist Katarina Miljkovic suggests that the Moon’s surface may not accurately ________ early impact events. When the Moon was still forming, its surface was softer, and asteroid or meteoroid impacts would have left less of an impression; thus, evidence of early impacts may no longer be present.',
      'Which choice completes the text with the most logical and precise word or phrase?',
      'A) reflect',
      'B) receive',
      'C) evaluate',
      'D) mimic',
    ])
  })

  it('keeps wrapped text inside each full answer choice until the next choice starts',()=>{
    expect(reflowProseLines([
      'Which choice best supports the claim?',
      'A) The first answer begins here and',
      'continues on the next extracted line.',
      'B) The second answer stays separate.',
      'C) Third answer.',
      'D) Fourth answer.',
    ])).toEqual([
      'Which choice best supports the claim?',
      'A) The first answer begins here and continues on the next extracted line.',
      'B) The second answer stays separate.',
      'C) Third answer.',
      'D) Fourth answer.',
    ])
  })
})

describe('StructuredQuestionLines rich text',()=>{
  it('keeps SAT currency amounts as literal text instead of treating the prose between dollar signs as math',()=>{
    const {container}=render(<StructuredQuestionLines lines={[
      'A customer spent $27 to purchase oranges at $3 per pound. How many pounds of oranges did the customer purchase?',
    ]}/>)
    expect(screen.getByText('A customer spent $27 to purchase oranges at $3 per pound. How many pounds of oranges did the customer purchase?')).toBeInTheDocument()
    expect(container.querySelector('.rich-math')).not.toBeInTheDocument()
  })

  it('still renders genuine inline math with KaTeX',()=>{
    const {container}=render(<StructuredQuestionLines lines={['If $x+3=7$, what is x?']}/>)
    expect(container.querySelector('.rich-math.inline')).toBeInTheDocument()
    expect(screen.getByText(/If/)).toBeInTheDocument()
  })

  it('keeps currency literal when the same sentence also contains real inline math',()=>{
    const {container}=render(<StructuredQuestionLines lines={['A ticket costs $5. If $x+1=3$, what is x?']}/>)
    expect(container.textContent).toContain('A ticket costs $5.')
    expect(container.querySelectorAll('.rich-math.inline')).toHaveLength(1)
  })

  it('keeps formatted currency amounts literal',()=>{
    const {container}=render(<StructuredQuestionLines lines={['The total was $1,200.50 and the fee was $3.']}/>)
    expect(container.textContent).toContain('$1,200.50')
    expect(container.textContent).toContain('$3')
    expect(container.querySelector('.rich-math')).not.toBeInTheDocument()
  })

  it('does not mistake numeric algebra for currency',()=>{
    const {container}=render(<StructuredQuestionLines lines={['Solve $3x+2=8$ for x.']}/>)
    expect(container.querySelectorAll('.rich-math.inline')).toHaveLength(1)
    expect(container.textContent).not.toContain('$3x+2=8$')
  })
})

describe('PT9 multiple-choice rendering',()=>{
  it('renders numeric answer choices as separate lines, not a data table',()=>{
    const {container}=render(<StructuredQuestionLines lines={[
      'What is the value of $a+b+c$?',
      'A) $-15$',
      'B) $-9$',
      'C) 11',
      'D) 15',
    ]}/>)
    expect(container.querySelector('table')).not.toBeInTheDocument()
    expect(container.querySelectorAll('p')).toHaveLength(5)
    expect(container.textContent).toContain('B)')
    expect(container.textContent).toContain('D) 15')
  })
})

describe('StructuredQuestionLines tables',()=>{
  it('renders a two-column function table as a real table',()=>{
    render(<StructuredQuestionLines lines={[
      'x f(x)',
      '0 29',
      '1 32',
      '2 35',
      'For the linear function f, which equation defines f(x)?',
    ]}/>)

    const table=screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2)
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(within(within(table).getAllByRole('row')[1]).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['0','29'])
  })

  it('renders compact verified answer-choice tables structurally',()=>{
    render(<StructuredQuestionLines lines={[
      'Which table gives the corresponding values?',
      'A) $x: 1,2,3$; $h(x): 4,5,6$',
      'B) $x: 1,2,3$; $h(x): -2,1,6$',
      'C) $x: 1,2,3$; $h(x): -1,1,3$',
      'D) $x: 1,2,3$; $h(x): -2,1,3$',
    ]}/>)

    const tables=screen.getAllByRole('table')
    expect(tables).toHaveLength(4)
    expect(tables[0]).toHaveAccessibleName('Choice A')
    expect(within(tables[0]).getAllByRole('row')).toHaveLength(2)
    expect(within(within(tables[0]).getAllByRole('row')[0]).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['1','2','3'])
    expect(within(within(tables[0]).getAllByRole('row')[1]).getAllByRole('cell').map(cell=>cell.textContent)).toEqual(['4','5','6'])
  })

  it('renders raw PDF answer-table extraction without flattening it',()=>{
    render(<StructuredQuestionLines lines={[
      'A) x 1 2 3',
      'h(x) 4 5 6',
      'B) x 1 2 3',
      'h(x) -2 1 6',
    ]}/>)

    const tables=screen.getAllByRole('table')
    expect(tables).toHaveLength(2)
    expect(tables[0]).toHaveAccessibleName('Choice A')
    expect(tables[1]).toHaveAccessibleName('Choice B')
  })

  it('does not turn ordinary two-token prose into a table',()=>{
    render(<StructuredQuestionLines lines={['Line t','passes through','the point']}/>)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
