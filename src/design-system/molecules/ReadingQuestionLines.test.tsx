import {render,screen,within} from '@testing-library/react'
import {describe,expect,it} from 'vitest'
import ReadingQuestionLines,{hasCompleteReadingChoices,parseReadingQuestion} from './ReadingQuestionLines'
import {READING_PARAGRAPH_BREAK} from '../../lib/readingQuestionFormat'

describe('ReadingQuestionLines',()=>{
  it('keeps source attribution outside the quoted poem and preserves verse lines',()=>{
    const lines=[
      'The following text is from Walt Whitman’s 1860',
      'poem “Calamus 24.”',
      READING_PARAGRAPH_BREAK,
      'I HEAR it is charged against me that I seek to',
      'destroy institutions;',
      'But really I am neither for nor against institutions',
      '(What indeed have I in common with them?—',
      'Or what with the destruction of them?),',
      READING_PARAGRAPH_BREAK,
      'Which choice best describes the overall structure of',
      'the text?',
      READING_PARAGRAPH_BREAK,
      'A) The speaker questions an attitude, then summarizes his worldview.',
      'B) The speaker regrets his isolation from others.',
      'C) The speaker concedes his personal shortcomings.',
      'D) The speaker addresses a criticism, then announces an ambition.',
    ]
    const parsed=parseReadingQuestion(lines)
    expect(parsed.intro.join(' ')).toContain('Walt Whitman')
    expect(parsed.stimulusBlocks[0][0]).toMatch(/^I HEAR/)
    expect(parsed.isVerse).toBe(true)
    render(<ReadingQuestionLines lines={lines}/>)
    expect(screen.getByText(/The following text is from Walt Whitman/).closest('blockquote')).toBeNull()
    const quote=screen.getByRole('blockquote')
    expect(within(quote).getByText(/I HEAR/)).toBeInTheDocument()
    expect(within(quote).getByText('destroy institutions;')).toBeInTheDocument()
  })

  it('keeps explanatory context with the intro for a poem',()=>{
    const lines=[
      'The following text is from the 1923 poem “Black Finger” by Angelina Weld Grimké, a Black American',
      'writer. A cypress is a type of evergreen tree.',
      READING_PARAGRAPH_BREAK,
      'I have just seen a most beautiful thing,',
      'Slim and still,',
      'Against a gold, gold sky,',
      READING_PARAGRAPH_BREAK,
      'Which choice best describes the overall structure of the text?',
      'A) First','B) Second','C) Third','D) Fourth',
    ]
    const parsed=parseReadingQuestion(lines)
    expect(parsed.intro.join(' ')).toContain('A cypress is a type of evergreen tree.')
    expect(parsed.stimulusBlocks[0][0]).toBe('I have just seen a most beautiful thing,')
  })

  it('accepts PDF choices extracted with or without closing punctuation after the label',()=>{
    const lines=[
      'It is by no means _______ to recognize the influence of Dutch painter Hieronymus Bosch.',
      READING_PARAGRAPH_BREAK,
      'Which choice completes the text with the most logical and precise word or phrase?',
      READING_PARAGRAPH_BREAK,
      'A substantial','B) satisfying','C. unimportant','D appropriate',
    ]
    expect(hasCompleteReadingChoices(lines)).toBe(true)
    expect(parseReadingQuestion(lines).choices.map(choice=>choice.text)).toEqual(['substantial','satisfying','unimportant','appropriate'])
  })





  it('renders Text 1 and Text 2 as separately labeled quote blocks',()=>{
    const lines=[
      'Text 1',
      'Conventional wisdom long held that human social systems evolved in stages, beginning with',
      'hunter-gatherers forming small bands of members with roughly equal status.',
      READING_PARAGRAPH_BREAK,
      'Text 2',
      'In a 2021 book, anthropologist David Graeber and archaeologist David Wengrow maintain that humans',
      'have always been socially flexible, alternately forming systems based on hierarchy and collective ones.',
      READING_PARAGRAPH_BREAK,
      'Based on the texts, how would Graeber and Wengrow (Text 2) most likely respond to the',
      '“conventional wisdom” presented in Text 1?',
      READING_PARAGRAPH_BREAK,
      'A) By conceding the importance of hierarchical systems.',
      'B) By disputing the idea that developments followed a linear progression.',
      'C) By acknowledging that hierarchy was absent before agriculture.',
      'D) By challenging the assumption that hunter-gatherers were early social groups.',
    ]
    render(<ReadingQuestionLines lines={lines}/>)
    expect(screen.getByText('Text 1')).toBeInTheDocument()
    expect(screen.getByText('Text 2')).toBeInTheDocument()
    const quotes=screen.getAllByRole('blockquote')
    expect(quotes).toHaveLength(2)
    expect(within(quotes[0]).getByText(/Conventional wisdom long held/)).toBeInTheDocument()
    expect(within(quotes[1]).getByText(/In a 2021 book/)).toBeInTheDocument()
    expect(screen.getByText(/Based on the texts, how would Graeber and Wengrow/).closest('blockquote')).toBeNull()
  })

  it('does not mistake poem lines beginning with A for answer choices',()=>{
    const lines=[
      'The following text is from the 1923 poem “Black Finger” by Angelina Weld Grimké, a Black American',
      'writer. A cypress is a type of evergreen tree.',
      READING_PARAGRAPH_BREAK,
      'I have just seen a most beautiful thing,',
      'Slim and still,',
      'Against a gold, gold sky,',
      'A straight black cypress,',
      'Sensitive,',
      'Exquisite,',
      'A black finger',
      'Pointing upwards.',
      'Why, beautiful still finger, are you black?',
      'And why are you pointing upwards?',
      READING_PARAGRAPH_BREAK,
      'Which choice best describes the overall structure of',
      'the text?',
      READING_PARAGRAPH_BREAK,
      'A) The speaker assesses a natural phenomenon, then questions the accuracy of her assessment.',
      'B) The speaker describes a distinctive sight in nature, then ponders what meaning to attribute to that sight.',
      'C) The speaker presents an outdoor scene, then considers a human behavior occurring within that scene.',
      'D) The speaker examines her surroundings, then speculates about their influence on her emotional state.',
    ]
    const parsed=parseReadingQuestion(lines)
    expect(parsed.stem).toBe('Which choice best describes the overall structure of the text?')
    expect(parsed.choices.map(choice=>choice.label)).toEqual(['A','B','C','D'])
    expect(parsed.stimulusBlocks.flat()).toContain('A straight black cypress,')
    expect(parsed.stimulusBlocks.flat()).toContain('A black finger')
    render(<ReadingQuestionLines lines={lines}/>)
    const quote=screen.getByRole('blockquote')
    expect(within(quote).getByText('A straight black cypress,')).toBeInTheDocument()
    expect(within(quote).getByText('A black finger')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders structured tables solely from supplied canonical question lines',()=>{
    const lines=[
      'Researchers compared two synthetic samples.',
      'Which result is larger?',
      'A) Sample A','B) Sample B','C) Equal','D) Cannot determine',
      'Sample measurements',
      'Sample\tValue',
      'A\t12',
      'B\t8',
    ]
    render(<ReadingQuestionLines lines={lines} questionId="synthetic-question"/>)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Sample measurements')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('Researchers compared two synthetic samples.')).toBeInTheDocument()
  })

  it('keeps wrapped choice text attached to its answer label',()=>{
    const lines=[
      'Biologist Valentina Gómez-Bahamón and her team have investigated two subspecies.',
      READING_PARAGRAPH_BREAK,
      'Which finding, if true, would most directly support',
      'Gómez-Bahamón and her team’s hypothesis?',
      READING_PARAGRAPH_BREAK,
      'A) The feathers located on the wings of the migratory fork-tailed flycatchers have a narrower',
      'shape than those of the nonmigratory birds,',
      'which allows them to fly long distances.',
      READING_PARAGRAPH_BREAK,
      'B) Over several generations, the sound made by the feathers changes.',
      'C) Fork-tailed flycatchers communicate different messages.',
      'D) The breeding habits remained generally the same.',
    ]
    const parsed=parseReadingQuestion(lines)
    expect(parsed.choices).toHaveLength(4)
    expect(parsed.choices[0].text).toContain('which allows them to fly long distances.')
    render(<ReadingQuestionLines lines={lines}/>)
    expect(screen.getByText(/which allows them to fly long distances/).closest('[role="listitem"]')).not.toBeNull()
  })

  it('renders inline research-note bullets as separate list items',()=>{
    const lines=[
      'While researching a topic, a student has taken the following notes: • The ancient Arab dhow was a sailing vessel distinguishable by its triangular sails and stitched hull construction. • Dhows were used primarily for trade along the coasts of Arab, South Asian, and East African countries. • Contemporary shipbuilders in Oman use a mix of modern and traditional materials to build replicas of ancient dhows. • Most of the materials used are traditional. • Replica hulls are stitched together using the same traditional coconut palm fiber rope used on the hulls of ancient dhows. The student wants to make a generalization about the materials used in dhow replicas.',
      'Which choice most effectively uses relevant information from the notes to accomplish this goal?',
      'A) A traditional material that was used to stitch together the hulls of ancient dhows, coconut palm fiber rope is still used by shipbuilders.',
      'B) The ancient Arab dhow was a sailing vessel used primarily for trade and distinguishable by its triangular sails.',
      'C) Although most materials used in dhow replicas are traditional, some modern materials are used.',
      'D) Contemporary shipbuilders in Oman build replicas of the dhow, which was an ancient sailing vessel with a stitched hull construction.',
    ]
    render(<ReadingQuestionLines lines={lines}/>)
    const items=screen.getAllByRole('listitem')
    expect(items).toHaveLength(9)
    expect(items[0]).toHaveTextContent('The ancient Arab dhow was a sailing vessel')
    expect(items[4]).toHaveTextContent('Replica hulls are stitched together')
    expect(screen.getByText(/The student wants to make a generalization/)).toBeInTheDocument()
  })


  it('reflows prose paragraphs but keeps answer choices as separate rows',()=>{
    const lines=[
      'As a young historian in Australia in the 1950s, Jill Roe became dismayed',
      'that women were mostly ignored in works about Australian history.',
      READING_PARAGRAPH_BREAK,
      'Roe helped establish the field of Australian women’s history.',
      READING_PARAGRAPH_BREAK,
      'According to the text, what prompted Roe to study women’s history?',
      READING_PARAGRAPH_BREAK,
      'A) Her desire to read about famous women who lived in Australia in the 1950s',
      'B) Her disappointment with the lack of scholarly attention paid to Australian women',
      'C) Her interest in the role of women’s groups in Australian politics',
      'D) Her plan to complete a biography of an Australian woman',
    ]
    render(<ReadingQuestionLines lines={lines}/>)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText(/Her disappointment with the lack of scholarly attention/)).toBeInTheDocument()
  })
})
