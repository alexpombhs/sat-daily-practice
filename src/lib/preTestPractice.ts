import type {PracticeQuestion,Settings} from '../types'

// Pre-test "Practice" is a regular session with a one-question selection.
// The explanation-only "Review" action remains unscored.
export function singlePreTestQuestionSelection(question:PracticeQuestion){
  return {
    mode:question.subject,
    practiceTest:question.practiceTestId,
    questionIds:[question.id],
    overrides:{
      psatDomain:'all',
      failedOnly:false,
      failedEverOnly:false,
    } satisfies Partial<Settings>,
  }
}
