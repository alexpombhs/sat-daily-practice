export type NormalizedCrop={x:number;y:number;width:number;height:number}
export type QuestionVisualSpec={afterLine:number;crop:NormalizedCrop;exact?:boolean;kind?:'figure'|'choice-grid'}
export function expandNormalizedCrop(crop:NormalizedCrop,paddingX=.03,paddingY=.015):NormalizedCrop{
  const x=Math.max(0,crop.x-paddingX),y=Math.max(0,crop.y-paddingY)
  const right=Math.min(1,crop.x+crop.width+paddingX)
  const bottom=Math.min(1,crop.y+crop.height+paddingY)
  return{x,y,width:right-x,height:bottom-y}
}
// Canonical visual_specs are returned by loadSharedQuestionContent; no hardcoded visuals.
export function questionVisualSpecs(_questionId:string):QuestionVisualSpec[]{return[]}
export function questionVisualSpec(_questionId:string):QuestionVisualSpec|undefined{return undefined}
