import type {Attempt,SessionSummary,Settings} from '../types'

// A completed session consists only of submitted answers, not the originally
// configured number of questions. Unanswered questions are never failed.
export function completedPracticeSession(
  id:string,
  startedAt:string,
  attempts:Attempt[],
  settings:Settings,
  dailyQuestionGoal:number,
  endedAt=new Date().toISOString(),
):SessionSummary{
  return {
    id,startedAt,endedAt,
    mode:settings.mode,
    questionCount:attempts.length,
    attempts:[...attempts],
    dailyQuestionGoal,
    settings:{...settings},
  }
}
