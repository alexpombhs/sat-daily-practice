import {describe,expect,it} from 'vitest'
import {verifiedPracticeTest6Math2Content} from './verifiedPracticeTest6Math2'

describe('Practice Test 6 Math Module 2 verified repairs',()=>{
  it('provides reconstructed text and a graph for question 26',()=>{
    const content=verifiedPracticeTest6Math2Content(26)
    expect(content?.lines).toHaveLength(5)
    expect(content?.lines[0]).toContain('Data set $F
    const content=verifiedPracticeTest6Math2Content(25)
    expect(content).toBeTruthy()
    expect(content?.lines).toEqual([
      'In the $xy$-plane, a circle has center $C$ with coordinates $(h,k)$. Points $A$ and $B$ lie on the circle. Point $A$ has coordinates $(h+1,k+\\sqrt{102})$, and $\\angle ACB$ is a right angle. What is the length of $\\overline{AB}$?',
      'A) $\\sqrt{206}$',
      'B) $2\\sqrt{102}$',
      'C) $103\\sqrt{2}$',
      'D) $103\\sqrt{3}$',
    ])
  })
})
)
    expect(content?.lines[1]).toContain('$y=46.8+5.9x
    const content=verifiedPracticeTest6Math2Content(25)
    expect(content).toBeTruthy()
    expect(content?.lines).toEqual([
      'In the $xy$-plane, a circle has center $C$ with coordinates $(h,k)$. Points $A$ and $B$ lie on the circle. Point $A$ has coordinates $(h+1,k+\\sqrt{102})$, and $\\angle ACB$ is a right angle. What is the length of $\\overline{AB}$?',
      'A) $\\sqrt{206}$',
      'B) $2\\sqrt{102}$',
      'C) $103\\sqrt{2}$',
      'D) $103\\sqrt{3}$',
    ])
  })
})
)
    expect(content?.needsVisual).toBe(true)
  })

  it('preserves the exact geometry notation for question 25',()=>{
    const content=verifiedPracticeTest6Math2Content(25)
    expect(content).toBeTruthy()
    expect(content?.lines).toEqual([
      'In the $xy$-plane, a circle has center $C$ with coordinates $(h,k)$. Points $A$ and $B$ lie on the circle. Point $A$ has coordinates $(h+1,k+\\sqrt{102})$, and $\\angle ACB$ is a right angle. What is the length of $\\overline{AB}$?',
      'A) $\\sqrt{206}$',
      'B) $2\\sqrt{102}$',
      'C) $103\\sqrt{2}$',
      'D) $103\\sqrt{3}$',
    ])
  })
})
