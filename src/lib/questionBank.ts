import type {ModuleKey,PracticeQuestion,PracticeTestFilter,PracticeTestId,SubjectMode} from '../types'

// The application never ships a baked-in question bank. This empty legacy export
// can be removed after all local test fixtures have been migrated.
export const QUESTION_BANK:PracticeQuestion[]=[]

function practiceTestNumber(id:PracticeTestId){return Number(id.replace('practice-test-',''))}

export function availablePracticeTests(questions:PracticeQuestion[]=QUESTION_BANK){
  const ids=[...new Set(questions.map(question=>question.practiceTestId).filter((id):id is PracticeTestId=>Boolean(id)))]
  return ids.sort((a,b)=>practiceTestNumber(a)-practiceTestNumber(b))
}

export function practiceTestLabel(id:PracticeTestId){return `Practice Test ${practiceTestNumber(id)}`}
export function questionsForMode(mode:SubjectMode,questions:PracticeQuestion[]=QUESTION_BANK){
  return mode==='both'?questions:questions.filter(question=>question.subject===mode)
}
export function questionsForPractice(mode:SubjectMode,practiceTest:PracticeTestFilter='all',questions:PracticeQuestion[]=QUESTION_BANK){
  return questionsForMode(mode,questions).filter(question=>practiceTest==='all'||question.practiceTestId===practiceTest)
}
export function moduleLabel(module:ModuleKey){
  return module==='rw1'?'Reading & Writing · Module 1'
    :module==='rw2'?'Reading & Writing · Module 2'
      :module==='math1'?'Math · Module 1':'Math · Module 2'
}
