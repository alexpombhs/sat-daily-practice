import type {Attempt,PracticeQuestion} from '../types'

export type ConceptPriority={
  concept:string
  attempts:number
  correct:number
  incorrect:number
  accuracy:number
  recentAccuracy:number
  unresolved:number
  questionIds:string[]
  priority:number
}

// Rank by persistent difficulty, but count unique questions rather than
// letting repeated attempts on the same item dominate a concept.
export function rankReviewConcepts(questions:PracticeQuestion[],attempts:Attempt[]):ConceptPriority[]{
  const questionMap=new Map(questions.map(q=>[q.id,q]))
  const grouped=new Map<string,Map<string,Attempt[]>>()
  for(const a of attempts){
    const tags=questionMap.get(a.questionId)?.concepts??[]
    for(const raw of new Set(tags)){
      const tag=raw.trim()
      if(!tag)continue
      if(!grouped.has(tag))grouped.set(tag,new Map())
      const questionsForConcept=grouped.get(tag)!
      questionsForConcept.set(a.questionId,[...(questionsForConcept.get(a.questionId)??[]),a])
    }
  }
  return [...grouped].map(([concept,byQuestion])=>{
    let total=0,correct=0,recentTotal=0,recentCorrect=0,unresolved=0
    const questionIds:string[]=[]
    for(const [id,rows] of byQuestion){
      const ordered=[...rows].sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
      total+=ordered.length
      correct+=ordered.filter(a=>a.correct).length
      recentTotal++
      const latest=ordered[ordered.length-1]
      if(latest.correct)recentCorrect++
      // A failed question still needs retrieval when it has not been
      // answered correctly since the most recent miss.
      if(!latest.correct)unresolved++
      questionIds.push(id)
    }
    const accuracy=total?100*correct/total:100
    const recentAccuracy=recentTotal?100*recentCorrect/recentTotal:100
    const failures=total-correct
    // Accuracy is primary; persistent failures and unresolved errors raise
    // priority. A tiny one-off sample gets a modest reliability discount.
    const reliability=Math.min(1,Math.sqrt(byQuestion.size/3))
    const priority=reliability*(.55*(100-recentAccuracy)+.30*(100-accuracy)+.15*Math.min(100,failures*15))
      +Math.min(15,unresolved*4)
    return {concept,attempts:total,correct,incorrect:failures,accuracy:Math.round(accuracy),recentAccuracy:Math.round(recentAccuracy),unresolved,questionIds,priority:Math.round(priority*10)/10}
  }).filter(item=>item.incorrect>0)
    .sort((a,b)=>b.priority-a.priority||b.incorrect-a.incorrect||a.concept.localeCompare(b.concept))
}
