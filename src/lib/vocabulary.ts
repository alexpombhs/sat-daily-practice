export type VocabularyDirection='word-to-definition'|'definition-to-word'

export type VocabularyEntry={
  id:string
  word:string
  definition:string
  sourceQuestionId:string
}

export const VOCABULARY_BANK:VocabularyEntry[]=[
  {id:'collected',word:'collected',definition:'gathered or brought together',sourceQuestionId:'rw1-1'},
  {id:'reflect',word:'reflect',definition:'show or represent something accurately',sourceQuestionId:'rw1-2'},
  {id:'recognizable',word:'recognizable',definition:'easy to identify or know again',sourceQuestionId:'rw1-3'},
  {id:'unimportant',word:'unimportant',definition:'having little significance or effect',sourceQuestionId:'rw1-4'},
  {id:'fragile',word:'fragile',definition:'easily broken, damaged, or harmed',sourceQuestionId:'practice-test-5:rw1-2'},
  {id:'impending',word:'impending',definition:'about to happen very soon',sourceQuestionId:'practice-test-5:rw1-3'},
  {id:'exploited',word:'exploited',definition:'used something to gain an advantage',sourceQuestionId:'practice-test-5:rw1-4'},
  {id:'ameliorate',word:'ameliorate',definition:'make a bad condition better',sourceQuestionId:'practice-test-5:rw1-5'},
  {id:'obtain',word:'obtain',definition:'get or acquire something',sourceQuestionId:'practice-test-5:rw2-2'},
  {id:'reduced',word:'reduced',definition:'made smaller or less in amount',sourceQuestionId:'practice-test-5:rw2-3'},
  {id:'tenuous',word:'tenuous',definition:'weak, slight, or not firmly established',sourceQuestionId:'practice-test-5:rw2-4'},
  {id:'defend',word:'defend',definition:'support a claim with reasons or evidence',sourceQuestionId:'practice-test-5:rw2-5'},
  {id:'similarities',word:'similarities',definition:'qualities or features that are alike',sourceQuestionId:'practice-test-6:rw1-1'},
  {id:'overtly',word:'overtly',definition:'openly and clearly rather than secretly',sourceQuestionId:'practice-test-6:rw1-2'},
  {id:'redressing',word:'redressing',definition:'correcting or remedying an unfair situation',sourceQuestionId:'practice-test-6:rw1-3'},
  {id:'inconsequential',word:'inconsequential',definition:'having little or no important effect',sourceQuestionId:'practice-test-6:rw1-5'},
  {id:'featured',word:'featured',definition:'displayed or presented prominently',sourceQuestionId:'practice-test-6:rw2-1'},
  {id:'inspired',word:'inspired',definition:'influenced or motivated by something',sourceQuestionId:'practice-test-6:rw2-2'},
  {id:'accidental',word:'accidental',definition:'happening by chance rather than intentionally',sourceQuestionId:'practice-test-6:rw2-3'},
  {id:'manifest',word:'manifest',definition:'clearly shown or evident',sourceQuestionId:'practice-test-6:rw2-4'},
  {id:'tentative',word:'tentative',definition:'uncertain or not firmly established',sourceQuestionId:'practice-test-6:rw2-5'},
  {id:'successful',word:'successful',definition:'achieving the intended result',sourceQuestionId:'practice-test-7:rw2-3'},
]

export type VocabularyPrompt={
  entry:VocabularyEntry
  prompt:string
  answer:string
  options:string[]
}

export function shuffleVocabulary<T>(items:T[],rng:()=>number=Math.random){
  const result=[...items]
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1))
    ;[result[i],result[j]]=[result[j],result[i]]
  }
  return result
}

export function buildVocabularyOptions(
  entry:VocabularyEntry,
  direction:VocabularyDirection,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
){
  const correct=direction==='word-to-definition'?entry.definition:entry.word
  const distractors=shuffleVocabulary(
    bank.filter(item=>item.id!==entry.id).map(item=>direction==='word-to-definition'?item.definition:item.word),
    rng,
  ).slice(0,3)
  return shuffleVocabulary([correct,...distractors],rng)
}

export function buildVocabularyPrompt(
  entry:VocabularyEntry,
  direction:VocabularyDirection,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
):VocabularyPrompt{
  return direction==='word-to-definition'
    ?{entry,prompt:entry.word,answer:entry.definition,options:buildVocabularyOptions(entry,direction,bank,rng)}
    :{entry,prompt:entry.definition,answer:entry.word,options:buildVocabularyOptions(entry,direction,bank,rng)}
}

export function createVocabularySession(
  direction:VocabularyDirection,
  count=10,
  bank:VocabularyEntry[]=VOCABULARY_BANK,
  rng:()=>number=Math.random,
){
  return shuffleVocabulary(bank,rng)
    .slice(0,Math.min(Math.max(1,count),bank.length))
    .map(entry=>buildVocabularyPrompt(entry,direction,bank,rng))
}
