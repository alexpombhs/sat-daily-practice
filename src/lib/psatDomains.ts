import type {PracticeQuestion,Subject} from '../types'

// College Board PSAT/SAT content domains. These are not the broader concept clusters
// used for the existing pre-test review feature.
export const PSAT_DOMAINS=[
  {id:'craft-structure',label:'Craft and Structure',subject:'english'},
  {id:'information-ideas',label:'Information and Ideas',subject:'english'},
  {id:'expression-ideas',label:'Expression of Ideas',subject:'english'},
  {id:'standard-conventions',label:'Standard English Conventions',subject:'english'},
  {id:'algebra',label:'Algebra',subject:'math'},
  {id:'advanced-math',label:'Advanced Math',subject:'math'},
  {id:'problem-solving-data',label:'Problem-Solving and Data Analysis',subject:'math'},
  {id:'geometry-trigonometry',label:'Geometry and Trigonometry',subject:'math'},
] as const satisfies ReadonlyArray<{id:string;label:string;subject:Subject}>

export type PsatDomainId=(typeof PSAT_DOMAINS)[number]['id']
export type PsatDomainFilter=PsatDomainId|'all'|'uncategorized'
export type PsatDomainBand=Partial<Record<PsatDomainId,string>>
export interface PsatScoreReport {
  year:number
  readingWriting:number|null
  math:number|null
  percentile:number|null
  bands:PsatDomainBand
}

export function domainForId(id:PsatDomainId){
  return PSAT_DOMAINS.find(domain=>domain.id===id)!
}

export function isPsatDomainId(value:unknown):value is PsatDomainId{
  return typeof value==='string'&&PSAT_DOMAINS.some(domain=>domain.id===value)
}

// An official SAT content area is an audited, stored per-question field.
// Never assign a category based on unreviewed concept keywords during practice.
export function questionPsatDomain(question:PracticeQuestion):PsatDomainId|null{
  if(isPsatDomainId(question.psatDomain)&&domainForId(question.psatDomain).subject===question.subject)return question.psatDomain
  return null
}

export function matchesPsatDomain(question:PracticeQuestion,filter:PsatDomainFilter|undefined){
  if(!filter||filter==='all')return true
  const domain=questionPsatDomain(question)
  return filter==='uncategorized'?domain===null:domain===filter
}
