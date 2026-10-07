import type {Attempt} from '../types'

export type QuestionMasteryState={
  questionId:string
  attempted:boolean
  mastered:boolean
  failed:boolean
  correctAfterFailure:number
  latestAttempt:Attempt
}

export function buildQuestionMastery(attempts:Attempt[],requiredCorrectAfterFailure=2){
  const states=new Map<string,QuestionMasteryState>()
  const ordered=attempts.map((attempt,index)=>({attempt,index}))
    .sort((a,b)=>a.attempt.createdAt.localeCompare(b.attempt.createdAt)||a.index-b.index)

  ordered.forEach(({attempt})=>{
    const current=states.get(attempt.questionId)??{
      questionId:attempt.questionId,
      attempted:false,
      mastered:false,
      failed:false,
      correctAfterFailure:0,
      latestAttempt:attempt,
    }
    current.attempted=true
    current.latestAttempt=attempt
    if(!attempt.correct){
      current.failed=true
      current.mastered=false
      current.correctAfterFailure=0
    }else if(current.failed){
      current.correctAfterFailure++
      if(current.correctAfterFailure>=Math.max(1,requiredCorrectAfterFailure)){
        current.failed=false
        current.mastered=true
      }
    }else{
      current.mastered=true
    }
    states.set(attempt.questionId,current)
  })

  return states
}

export function failedQuestionIds(attempts:Attempt[],requiredCorrectAfterFailure=2){
  const states=buildQuestionMastery(attempts,requiredCorrectAfterFailure)
  return new Set([...states.values()].filter(state=>state.failed).map(state=>state.questionId))
}
