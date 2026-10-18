import {describe,expect,it} from 'vitest'
import {canonicalPathname,pathForView,viewFromPathname} from './appRoutes'

describe('appRoutes',()=>{
  it('uses readable route names for shareable navigation',()=>{
    expect(pathForView('study')).toBe('/sat-daily-practice/dashboard')
    expect(pathForView('home')).toBe('/sat-daily-practice/practice')
    expect(pathForView('settings')).toBe('/sat-daily-practice/practice')
    expect(pathForView('question-bank')).toBe('/sat-daily-practice/question-bank')
    expect(pathForView('stats')).toBe('/sat-daily-practice/performance')
  })

  it('restores app views from copied URLs and redirects legacy practice routes',()=>{
    expect(viewFromPathname('/sat-daily-practice/dashboard')).toBe('study')
    expect(viewFromPathname('/sat-daily-practice/parsing-issues')).toBe('parsing-issues')
    expect(viewFromPathname('/sat-daily-practice/resources')).toBe('sources')
    expect(viewFromPathname('/sat-daily-practice/account')).toBe('account')
    expect(viewFromPathname('/sat-daily-practice/practice-tests')).toBe('home')
    expect(viewFromPathname('/sat-daily-practice/practice-setup')).toBe('home')
  })

  it('canonicalizes the project root to the dashboard',()=>{
    expect(canonicalPathname('/sat-daily-practice/')).toBe('/sat-daily-practice/dashboard')
  })
})
