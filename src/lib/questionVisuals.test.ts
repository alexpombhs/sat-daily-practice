import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe,expect,it} from 'vitest'
import {expandNormalizedCrop,questionVisualSpecs} from './questionVisuals'

describe('question source visuals',()=>{
  it('contains no bundled question-specific crop definitions',()=>{
    expect(questionVisualSpecs('synthetic-id')).toEqual([])
  })
  it('adds a safe margin without ever extending outside the question crop',()=>{
    const expanded=expandNormalizedCrop({x:.06,y:.09,width:.88,height:.29})
    expect(expanded.x).toBeCloseTo(.03)
    expect(expanded.y).toBeCloseTo(.075)
    expect(expanded.x+expanded.width).toBeCloseTo(.97)
    expect(expanded.y+expanded.height).toBeCloseTo(.395)

    expect(expandNormalizedCrop({x:.01,y:.01,width:.98,height:.98})).toEqual({x:0,y:0,width:1,height:1})
  })

  it('renders source visuals responsively instead of clipping them to a fixed height',()=>{
    const css=readFileSync(resolve(process.cwd(),'src','structured.css'),'utf8')
    expect(css).toMatch(/\.question-visual-slice img\{[^}]*width:100%;[^}]*height:auto;[^}]*max-width:720px;[^}]*max-height:none;/)
    expect(css).toMatch(/\.question-bank-pane \.question-visual-slice img\{[^}]*width:100%;[^}]*max-width:100%;[^}]*max-height:none/)
  })
})
