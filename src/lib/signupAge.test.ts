import {describe,it,expect} from 'vitest'
import {validateSignupBirthDate} from './signupAge'

describe('SAT signup age screening',()=>{
  const today=new Date(2026,9,11)
  it('accepts exactly 13 years old',()=>expect(validateSignupBirthDate('2013-10-11',today)).toBe('2013-10-11'))
  it('rejects an under-13 signup',()=>expect(()=>validateSignupBirthDate('2013-10-12',today)).toThrow(/not available/))
  it('rejects invalid calendar dates',()=>expect(()=>validateSignupBirthDate('2010-02-30',today)).toThrow(/valid/))
  it('rejects future dates',()=>expect(()=>validateSignupBirthDate('2030-01-01',today)).toThrow(/valid/))
  it('rejects missing dates',()=>expect(()=>validateSignupBirthDate('',today)).toThrow(/valid/))
})
