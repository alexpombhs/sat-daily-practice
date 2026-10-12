import type {NormalizedCrop} from './questionVisuals'
export type ReadingTableSpec={title:string;headers:string[];rows:string[][];sourceCrop:NormalizedCrop}
// All table content is stored as tab-delimited canonical question_lines in Supabase.
export function readingTableSpec(_id:string):ReadingTableSpec|undefined{return undefined}
export function stripEmbeddedReadingTableLines(_questionId:string,lines:string[]):string[]{return lines}
