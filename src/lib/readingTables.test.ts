import {describe,expect,it} from 'vitest'
import {readingTableSpec,stripEmbeddedReadingTableLines} from './readingTables'
describe('Supabase-owned reading tables',()=>{
  it('does not keep question-specific tables in JavaScript',()=>{
    expect(readingTableSpec('any-question')).toBeUndefined()
  })
  it('preserves canonical table rows instead of applying an overlay',()=>{
    const lines=['Test data','Color\tCount','Red\t2','A) Option']
    expect(stripEmbeddedReadingTableLines('some-id',lines)).toEqual(lines)
  })
})
