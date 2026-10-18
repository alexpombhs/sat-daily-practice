import {PRACTICE_TEST_5_MATH1_VISUALS} from './practiceTest5Math1Layout'

export type NormalizedCrop={x:number;y:number;width:number;height:number}
export type QuestionVisualSpec={afterLine:number;crop:NormalizedCrop;exact?:boolean;kind?:'figure'|'choice-grid';sourcePage?:number;sourceCrop?:{x:number;y:number;width:number;height:number}}

// Crops are normalized within the already-verified question crop, not the full PDF page.
// Keep these deliberately a little generous so axes, labels, and geometry annotations are not clipped.
export const QUESTION_VISUALS:Record<string,QuestionVisualSpec>={
  'rw1-13':{afterLine:-1,crop:{x:.04,y:.050,width:.92,height:.385}},
  'rw2-13':{afterLine:-1,crop:{x:.02,y:.065,width:.46,height:.36}},
  'practice-test-6:rw1-14':{afterLine:-1,crop:{x:.04,y:.035,width:.40,height:.39},exact:true},
  'practice-test-6:rw1-15':{afterLine:-1,crop:{x:.10,y:.035,width:.88,height:.375},exact:true},
  'practice-test-6:rw2-13':{afterLine:-1,crop:{x:.02,y:.02,width:.46,height:.56},exact:true},
  'practice-test-6:math1-5':{afterLine:-1,crop:{x:.08,y:.03,width:.84,height:.42},exact:true,kind:'figure'},
  'practice-test-6:math1-14':{afterLine:-1,crop:{x:.10,y:.03,width:.82,height:.36},exact:true,kind:'figure'},
  'practice-test-6:math1-15':{afterLine:-1,crop:{x:.06,y:.07,width:.88,height:.43},exact:true,kind:'figure'},
  'practice-test-6:math1-21':{afterLine:-1,crop:{x:.05,y:.08,width:.90,height:.58},exact:true,kind:'figure'},
  'practice-test-6:math1-23':{afterLine:-1,crop:{x:.08,y:.02,width:.84,height:.24},exact:true,kind:'figure'},
  'practice-test-6:math1-24':{afterLine:-1,crop:{x:.08,y:.02,width:.84,height:.28},exact:true,kind:'figure'},
  'practice-test-6:math2-2':{afterLine:-1,crop:{x:.14,y:.04,width:.72,height:.29},exact:true,kind:'figure'},
  'practice-test-6:math2-4':{afterLine:0,crop:{x:.14,y:.19,width:.72,height:.47},exact:true,kind:'figure'},
  'practice-test-6:math2-5':{afterLine:-1,crop:{x:.12,y:.03,width:.76,height:.43},exact:true,kind:'figure'},
  'practice-test-6:math2-26':{afterLine:-1,crop:{x:.12,y:.03,width:.76,height:.38},exact:true},
  'practice-test-7:rw1-12':{afterLine:-1,crop:{x:.18,y:.03,width:.78,height:.37},exact:true,kind:'figure'},
  'practice-test-7:rw1-15':{afterLine:-1,crop:{x:.04,y:.03,width:.43,height:.46},exact:true,kind:'figure'},
  'practice-test-7:rw1-16':{afterLine:-1,crop:{x:.04,y:.03,width:.43,height:.43},exact:true,kind:'figure'},
  'practice-test-7:math1-1':{afterLine:0,crop:{x:.07,y:.19,width:.90,height:.39},exact:true,kind:'figure'},
  'practice-test-7:math1-5':{afterLine:0,crop:{x:.07,y:.17,width:.90,height:.37},exact:true,kind:'figure'},
  'practice-test-7:math1-8':{afterLine:-1,crop:{x:.04,y:.05,width:.93,height:.36},exact:true,kind:'figure'},
  'practice-test-7:math1-11':{afterLine:-1,crop:{x:.14,y:.045,width:.80,height:.29},exact:true,kind:'figure'},
  'practice-test-7:math1-20':{afterLine:0,crop:{x:.06,y:.26,width:.91,height:.44},exact:true,kind:'figure'},
  'practice-test-7:math2-3':{afterLine:-1,crop:{x:.20,y:.04,width:.72,height:.58},exact:true,kind:'figure'},
  'practice-test-7:math2-12':{afterLine:0,crop:{x:.15,y:.10,width:.76,height:.47},exact:true,kind:'figure'},
  'math1-1':{afterLine:-1,crop:{x:.08,y:.07,width:.84,height:.39}},
  'math1-9':{afterLine:0,crop:{x:.06,y:.09,width:.88,height:.29}},
  'math1-10':{afterLine:0,crop:{x:.08,y:.10,width:.84,height:.43}},
  'math1-12':{afterLine:-1,crop:{x:.10,y:.08,width:.80,height:.44}},
  'math2-1':{afterLine:0,crop:{x:.07,y:.10,width:.86,height:.43}},
  'math2-16':{afterLine:0,crop:{x:.07,y:.09,width:.86,height:.34}},
  'math2-22':{afterLine:-1,crop:{x:.08,y:.08,width:.84,height:.43}},
  'math2-24':{afterLine:0,crop:{x:.07,y:.11,width:.86,height:.35}},
}

// Multi-visual questions keep semantic text as text while preserving non-text artwork.
// `choice-grid` is the reusable case for answer choices whose meaning is graphical and cannot be reconstructed safely as prose.
const QUESTION_VISUAL_GROUPS:Record<string,QuestionVisualSpec[]>={
  'practice-test-5:math1-16':[
    {afterLine:-1,crop:{x:.08,y:.02,width:.42,height:.34},exact:true,kind:'figure'},
    {afterLine:0,crop:{x:.03,y:.49,width:.94,height:.50},exact:true,kind:'choice-grid'},
  ],
  'practice-test-6:math1-2':[
    {afterLine:0,crop:{x:.17,y:.09,width:.34,height:.27},exact:true,kind:'figure'},
    {afterLine:1,crop:{x:.02,y:.40,width:.96,height:.60},exact:true,kind:'choice-grid'},
  ],
}

/**
 * Give source visuals a small safety margin before rendering. PDF artwork often extends a
 * few pixels beyond the text-derived crop, especially labels on diagrams. Keeping the
 * expansion here (rather than in CSS) guarantees the actual raster contains the full visual.
 */
export function expandNormalizedCrop(crop:NormalizedCrop,paddingX=.03,paddingY=.015):NormalizedCrop{
  const x=Math.max(0,crop.x-paddingX)
  const y=Math.max(0,crop.y-paddingY)
  const right=Math.min(1,crop.x+crop.width+paddingX)
  const bottom=Math.min(1,crop.y+crop.height+paddingY)
  return{x,y,width:right-x,height:bottom-y}
}

export function questionVisualSpecs(questionId:string):QuestionVisualSpec[]{
  const grouped=QUESTION_VISUAL_GROUPS[questionId]
  if(grouped)return grouped
  const match=questionId.match(/^practice-test-5:math1-(\d+)$/)
  if(match){
    const spec=PRACTICE_TEST_5_MATH1_VISUALS[Number(match[1])]
    return spec?[spec]:[]
  }
  const spec=QUESTION_VISUALS[questionId]
  return spec?[spec]:[]
}

export function questionVisualSpec(questionId:string){
  return questionVisualSpecs(questionId)[0]
}
