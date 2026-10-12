import type {ModuleKey,PracticeTestId} from '../types'
export type QuestionCrop={x:number;y:number;width:number;height:number}
// Source crop rectangles are canonical sat_question_bank.source_crop records in Supabase.
export const QUESTION_CROPS:Record<ModuleKey,Record<number,QuestionCrop>>={rw1:{},rw2:{},math1:{},math2:{}}
export function questionCropForParts(_practiceTestId:PracticeTestId,_module:ModuleKey,_questionNumber:number):QuestionCrop|undefined{return undefined}
