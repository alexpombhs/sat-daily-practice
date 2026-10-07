import {createClient,type User} from '@supabase/supabase-js'
import type {ActivePracticeSession,Attempt,SessionSummary,Settings} from '../types'
import type {VocabularyAttempt} from './vocabulary'

const DEFAULT_SUPABASE_URL='https://gnhmfhvvirpgawijsrej.supabase.co'
const DEFAULT_SUPABASE_PUBLISHABLE_KEY='sb_publishable_TiLvsCcbJ6zdAvDcPuEZ6g_A0UrArMy'

const url=(import.meta.env.VITE_SUPABASE_URL as string|undefined)||DEFAULT_SUPABASE_URL
const publishableKey=((import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY??import.meta.env.VITE_SUPABASE_ANON_KEY) as string|undefined)||DEFAULT_SUPABASE_PUBLISHABLE_KEY

export const supabase=createClient(url,publishableKey)
export const isSupabaseConfigured=true

export type AuthUser={id:string;email:string|null}
export type UserProfile={
  displayName:string
  school:string
  grade:string
  parentGuardianName:string
  parentGuardianEmail:string
  about:string
}

export const EMPTY_USER_PROFILE:UserProfile={displayName:'',school:'',grade:'',parentGuardianName:'',parentGuardianEmail:'',about:''}

const toAuthUser=(user:User|null):AuthUser|null=>user?{id:user.id,email:user.email??null}:null

export async function getCurrentAuthUser():Promise<AuthUser|null>{
  if(!supabase)return null
  const {data,error}=await supabase.auth.getUser()
  if(error){
    if(error.name==='AuthSessionMissingError')return null
    throw error
  }
  return toAuthUser(data.user)
}

export function subscribeToAuth(callback:(user:AuthUser|null)=>void){
  if(!supabase)return()=>{}
  const {data}=supabase.auth.onAuthStateChange((_event,session)=>callback(toAuthUser(session?.user??null)))
  return()=>data.subscription.unsubscribe()
}

export async function signUpWithPassword(email:string,password:string){
  if(!supabase)throw new Error('Supabase is not configured.')
  const {data,error}=await supabase.auth.signUp({
    email:email.trim(),
    password,
    options:{emailRedirectTo:window.location.origin},
  })
  if(error)throw error
  return {user:toAuthUser(data.user),needsEmailConfirmation:!data.session}
}

export async function signInWithPassword(email:string,password:string){
  if(!supabase)throw new Error('Supabase is not configured.')
  const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
  if(error)throw error
  return toAuthUser(data.user)
}

export async function signOut(){
  if(!supabase)return
  const {error}=await supabase.auth.signOut()
  if(error)throw error
}

async function currentUserId(){
  // The browser SDK already keeps the authenticated session locally. Using
  // getSession() here avoids a network /auth/v1/user request before every
  // database read or write; RLS still validates the JWT on Supabase.
  const {data,error}=await supabase.auth.getSession()
  if(error)throw error
  return data.session?.user.id??null
}

export async function loadUserSettings():Promise<Partial<Settings>|null>{
  if(!supabase)return null
  const userId=await currentUserId()
  if(!userId)return null
  const {data,error}=await supabase.from('sat_user_settings')
    .select('settings')
    .eq('user_id',userId)
    .maybeSingle()
  if(error)throw error
  return data?.settings?data.settings as Partial<Settings>:null
}

export async function saveUserSettings(settings:Settings){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const {error}=await supabase.from('sat_user_settings').upsert({
    user_id:userId,
    settings,
    updated_at:new Date().toISOString(),
  },{onConflict:'user_id'})
  if(error)throw error
  return true
}

export async function loadUserProfile():Promise<UserProfile|null>{
  if(!supabase)return null
  const userId=await currentUserId()
  if(!userId)return null
  const {data,error}=await supabase.from('sat_user_profiles')
    .select('display_name,school,grade,parent_guardian_name,parent_guardian_email,about')
    .eq('user_id',userId)
    .maybeSingle()
  if(error)throw error
  if(!data)return {...EMPTY_USER_PROFILE}
  return {
    displayName:data.display_name??'',
    school:data.school??'',
    grade:data.grade??'',
    parentGuardianName:data.parent_guardian_name??'',
    parentGuardianEmail:data.parent_guardian_email??'',
    about:data.about??'',
  }
}

export async function saveUserProfile(profile:UserProfile):Promise<UserProfile>{
  if(!supabase)throw new Error('Supabase is not configured.')
  const userId=await currentUserId()
  if(!userId)throw new Error('Sign in before saving your profile.')
  const row={
    user_id:userId,
    display_name:profile.displayName.trim()||null,
    school:profile.school.trim()||null,
    grade:profile.grade.trim()||null,
    parent_guardian_name:profile.parentGuardianName.trim()||null,
    parent_guardian_email:profile.parentGuardianEmail.trim()||null,
    about:profile.about.trim()||null,
    updated_at:new Date().toISOString(),
  }
  const {error}=await supabase.from('sat_user_profiles').upsert(row,{onConflict:'user_id'})
  if(error)throw error
  return {
    displayName:row.display_name??'',school:row.school??'',grade:row.grade??'',
    parentGuardianName:row.parent_guardian_name??'',parentGuardianEmail:row.parent_guardian_email??'',about:row.about??'',
  }
}

function attemptRow(a:Attempt,userId:string){
  return {
    id:a.id,
    user_id:userId,
    session_id:a.sessionId,
    question_id:a.questionId,
    practice_test_id:a.practiceTestId??'practice-test-4',
    subject:a.subject,
    module:a.module,
    question_number:a.questionNumber,
    selected_answer:a.selectedAnswer,
    correct_answer:a.correctAnswer,
    correct:a.correct,
    self_graded:a.selfGraded??false,
    elapsed_ms:a.elapsedMs,
    created_at:a.createdAt,
  }
}

function attemptFromRow(row:any):Attempt{
  return {
    id:row.id,
    sessionId:row.session_id,
    questionId:row.question_id,
    practiceTestId:row.practice_test_id??'practice-test-4',
    subject:row.subject as Attempt['subject'],
    module:row.module as Attempt['module'],
    questionNumber:row.question_number,
    selectedAnswer:row.selected_answer,
    correctAnswer:row.correct_answer,
    correct:row.correct,
    selfGraded:row.self_graded,
    elapsedMs:row.elapsed_ms,
    createdAt:row.created_at,
  }
}

function sessionRow(s:SessionSummary,userId:string){
  return {
    id:s.id,
    user_id:userId,
    started_at:s.startedAt,
    ended_at:s.endedAt,
    mode:s.mode,
    question_count:s.questionCount,
    session_settings:s.dailyQuestionGoal?{dailyQuestionGoal:s.dailyQuestionGoal}:null,
    status:'completed',
    last_activity_at:s.endedAt,
    updated_at:new Date().toISOString(),
  }
}

export async function createActiveSession(session:ActivePracticeSession){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const {error}=await supabase.from('sat_sessions').insert({
    id:session.id,
    user_id:userId,
    started_at:session.startedAt,
    ended_at:null,
    mode:session.mode,
    question_count:session.questionCount,
    status:'active',
    question_ids:session.questionIds,
    current_index:session.currentIndex,
    draft_answer:session.draftAnswer,
    session_settings:session.settings,
    last_activity_at:session.lastActivityAt,
    updated_at:session.lastActivityAt,
  })
  if(error)throw error
  return true
}

function isMissingResumableSessionSchema(error:unknown){
  const value=error as {message?:string;details?:string;hint?:string;code?:string}|null
  const text=`${value?.message??''} ${value?.details??''} ${value?.hint??''}`.toLowerCase()
  const resumableColumns=['status','question_ids','current_index','draft_answer','session_settings','last_activity_at','updated_at']
  return resumableColumns.some(column=>text.includes(column))
    &&(text.includes('column')||text.includes('schema cache')||text.includes('does not exist')||value?.code==='42703'||value?.code==='PGRST204')
}

export async function loadActiveSession():Promise<ActivePracticeSession|null>{
  if(!supabase)return null
  const userId=await currentUserId()
  if(!userId)return null
  const {data,error}=await supabase.from('sat_sessions')
    .select('id,started_at,mode,question_count,question_ids,current_index,draft_answer,session_settings,last_activity_at')
    .eq('user_id',userId)
    .eq('status','active')
    .order('last_activity_at',{ascending:false})
    .limit(1)
    .maybeSingle()
  if(error){
    if(isMissingResumableSessionSchema(error))return null
    throw error
  }
  if(!data)return null
  const {data:attemptRows,error:attemptError}=await supabase.from('sat_attempts')
    .select('id,session_id,question_id,practice_test_id,subject,module,question_number,selected_answer,correct_answer,correct,self_graded,elapsed_ms,created_at')
    .eq('user_id',userId)
    .eq('session_id',data.id)
    .order('created_at',{ascending:true})
  if(attemptError)throw attemptError
  return {
    id:data.id,
    startedAt:data.started_at,
    mode:data.mode as ActivePracticeSession['mode'],
    questionCount:data.question_count,
    questionIds:Array.isArray(data.question_ids)?data.question_ids as string[]:[],
    currentIndex:data.current_index??0,
    draftAnswer:data.draft_answer??'',
    settings:(data.session_settings??{}) as Settings,
    lastActivityAt:data.last_activity_at??data.started_at,
    attempts:(attemptRows??[]).map(attemptFromRow),
  }
}

export async function saveActiveSessionProgress(sessionId:string,currentIndex:number,draftAnswer:string){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const now=new Date().toISOString()
  const {error}=await supabase.from('sat_sessions').update({
    current_index:Math.max(0,currentIndex),
    draft_answer:draftAnswer,
    last_activity_at:now,
    updated_at:now,
  }).eq('id',sessionId).eq('user_id',userId).eq('status','active')
  if(error)throw error
  return true
}

export async function syncActiveAttempt(attempt:Attempt){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const {error}=await supabase.from('sat_attempts').upsert(attemptRow(attempt,userId))
  if(error)throw error
  const now=new Date().toISOString()
  const {error:sessionError}=await supabase.from('sat_sessions').update({
    last_activity_at:now,
    updated_at:now,
  }).eq('id',attempt.sessionId).eq('user_id',userId).eq('status','active')
  if(sessionError)throw sessionError
  return true
}

export async function abandonActiveSession(sessionId:string){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const now=new Date().toISOString()
  const {error}=await supabase.from('sat_sessions').update({
    status:'abandoned',
    ended_at:now,
    draft_answer:'',
    last_activity_at:now,
    updated_at:now,
  }).eq('id',sessionId).eq('user_id',userId).eq('status','active')
  if(error)throw error
  return true
}

export async function syncSession(s:SessionSummary){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const {data:existing,error:lookupError}=await supabase.from('sat_sessions')
    .select('id')
    .eq('id',s.id)
    .eq('user_id',userId)
    .maybeSingle()
  if(lookupError)throw lookupError
  const row=sessionRow(s,userId)
  const sessionResult=existing
    ?await supabase.from('sat_sessions').update(row).eq('id',s.id).eq('user_id',userId)
    :await supabase.from('sat_sessions').insert(row)
  if(sessionResult.error)throw sessionResult.error
  if(s.attempts.length){
    const {error:attemptError}=await supabase.from('sat_attempts').upsert(s.attempts.map(a=>attemptRow(a,userId)))
    if(attemptError)throw attemptError
  }
  return true
}

export async function loadCloudHistory():Promise<{attempts:Attempt[];sessions:SessionSummary[]}|null>{
  const userId=await currentUserId()
  if(!userId)return null

  let sessionResult=await supabase.from('sat_sessions')
    .select('id,started_at,ended_at,mode,question_count,status,session_settings')
    .eq('user_id',userId)
    .eq('status','completed')
    .not('ended_at','is',null)
    .order('started_at',{ascending:true})

  if(sessionResult.error&&isMissingResumableSessionSchema(sessionResult.error)){
    sessionResult=await supabase.from('sat_sessions')
      .select('id,started_at,ended_at,mode,question_count,session_settings')
      .eq('user_id',userId)
      .not('ended_at','is',null)
      .order('started_at',{ascending:true}) as typeof sessionResult
  }

  const attemptResult=await supabase.from('sat_attempts')
    .select('id,session_id,question_id,practice_test_id,subject,module,question_number,selected_answer,correct_answer,correct,self_graded,elapsed_ms,created_at')
    .eq('user_id',userId)
    .order('created_at',{ascending:true})

  if(sessionResult.error)throw sessionResult.error
  if(attemptResult.error)throw attemptResult.error
  const attempts:Attempt[]=(attemptResult.data??[]).map(attemptFromRow)
  const bySession=new Map<string,Attempt[]>()
  attempts.forEach(attempt=>bySession.set(attempt.sessionId,[...(bySession.get(attempt.sessionId)??[]),attempt]))
  const sessions:SessionSummary[]=(sessionResult.data??[]).map(row=>({
    id:row.id,
    startedAt:row.started_at,
    endedAt:row.ended_at??row.started_at,
    mode:row.mode as SessionSummary['mode'],
    questionCount:row.question_count,
    attempts:bySession.get(row.id)??[],
    dailyQuestionGoal:typeof row.session_settings?.dailyQuestionGoal==='number'?row.session_settings.dailyQuestionGoal:undefined,
  }))
  return {attempts,sessions}
}

export async function clearCloudHistory(){
  if(!supabase)return false
  const userId=await currentUserId()
  if(!userId)return false
  const {error}=await supabase.from('sat_sessions').delete().eq('user_id',userId)
  if(error)throw error
  return true
}


export async function loadVocabularyAttempts():Promise<VocabularyAttempt[]>{
  const userId=await currentUserId()
  if(!userId)return []
  const {data,error}=await supabase.from('sat_vocabulary_attempts')
    .select('id,vocabulary_id,direction,selected_answer,correct_answer,correct,created_at')
    .eq('user_id',userId)
    .order('created_at',{ascending:true})
  if(error)throw error
  return (data??[]).map(row=>({
    id:row.id,
    vocabularyId:row.vocabulary_id,
    direction:row.direction as VocabularyAttempt['direction'],
    selectedAnswer:row.selected_answer,
    correctAnswer:row.correct_answer,
    correct:row.correct,
    createdAt:row.created_at,
  }))
}

export async function saveVocabularyAttempt(attempt:VocabularyAttempt){
  const userId=await currentUserId()
  if(!userId)throw new Error('Sign in before saving vocabulary progress.')
  const {error}=await supabase.from('sat_vocabulary_attempts').insert({
    id:attempt.id,
    user_id:userId,
    vocabulary_id:attempt.vocabularyId,
    direction:attempt.direction,
    selected_answer:attempt.selectedAnswer,
    correct_answer:attempt.correctAnswer,
    correct:attempt.correct,
    created_at:attempt.createdAt,
  })
  if(error)throw error
  return true
}
