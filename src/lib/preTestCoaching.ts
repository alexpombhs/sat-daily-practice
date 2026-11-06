import type {PsatDomainId} from './psatDomains'
import {supabase} from './supabase'

export type PreTestCoachExample={questionId:string;note:string}
export type PreTestCoachFocus={
  title:string
  observation:string
  strategy:string
  examples:PreTestCoachExample[]
}
export type PreTestCoachDomain={
  summary:string
  strength:string
  focus:PreTestCoachFocus[]
}
export type PreTestCoachAnalysis={
  schemaVersion:number
  authoring:string
  headline:string
  domains:Partial<Record<PsatDomainId,PreTestCoachDomain>>
  concepts?:Record<string,PreTestCoachDomain>
}
export type PreTestCoachingSnapshot={
  analysis:PreTestCoachAnalysis
  basedOnAttemptAt:string|null
  reviewedAt:string
}

// This is a reviewed, individual coaching snapshot, not a text-generating rule.
// Owners can SELECT only their report (Supabase RLS); writing is admin-only.
// The live domain statistics are separately calculated from current attempts.
export async function loadPreTestCoaching():Promise<PreTestCoachingSnapshot|null>{
  const {data:session,error:authError}=await supabase.auth.getSession()
  if(authError)throw authError
  const userId=session.session?.user.id
  if(!userId)return null
  const {data,error}=await supabase.from('sat_pretest_coaching')
    .select('analysis,based_on_attempt_at,reviewed_at')
    .eq('user_id',userId)
    .maybeSingle()
  if(error)throw error
  if(!data?.analysis||typeof data.analysis!=='object'||!('domains' in data.analysis))return null
  return {
    analysis:data.analysis as PreTestCoachAnalysis,
    basedOnAttemptAt:data.based_on_attempt_at as string|null,
    reviewedAt:data.reviewed_at as string,
  }
}
