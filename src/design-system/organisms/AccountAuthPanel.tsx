import {useCallback,useEffect,useState} from 'react'
import AlexButton from '../atoms/AlexButton'
import AlexStack from '../atoms/AlexStack'
import AlexSurface from '../atoms/AlexSurface'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import AuthCredentialsForm from '../molecules/AuthCredentialsForm'
import TurnstileChallenge from '../molecules/TurnstileChallenge'
import UserProfileForm from '../molecules/UserProfileForm'
import {validateSignupBirthDate} from '../../lib/signupAge'
import {deleteCurrentAccount,hasPlusAccess,openOneTimeCheckout,plusExpiresAt,EMPTY_USER_PROFILE,isRegistrationFull,joinLaunchWaitlist,isSupabaseConfigured,loadUserProfile,saveUserProfile,signInWithPassword,signOut,signUpWithPassword,type UserProfile} from '../../lib/supabase'

type Props={
  email:string|null
}

const messageFromError=(error:unknown)=>error instanceof Error?error.message:'Something went wrong. Please try again.'

export default function AccountAuthPanel({email}:Props){
  const[mode,setMode]=useState<'signin'|'signup'>('signin')
  const[busy,setBusy]=useState(false)
  const[message,setMessage]=useState('')
  const[error,setError]=useState('')
  const[registrationFull,setRegistrationFull]=useState(false)
  const[waitlistEmail,setWaitlistEmail]=useState('')
  const[waitlistBirthDate,setWaitlistBirthDate]=useState('')
  const[waitlistAgeApproved,setWaitlistAgeApproved]=useState(false)
  const[captchaToken,setCaptchaToken]=useState('')
  const handleCaptchaToken=useCallback((token:string)=>setCaptchaToken(token),[])
  const[deleteText,setDeleteText]=useState('')
  const[plusActive,setPlusActive]=useState(false)
  const[plusExpiration,setPlusExpiration]=useState<string|null>(null)
  const checkoutOpen=import.meta.env.VITE_CHECKOUT_AVAILABLE==='true'
  const[profile,setProfile]=useState<UserProfile>(EMPTY_USER_PROFILE)

  useEffect(()=>{if(!email)void isRegistrationFull().then(setRegistrationFull).catch(()=>{ /* Signup server remains authoritative */ })},[email])

  useEffect(()=>{
    if(!email){setPlusActive(false);setPlusExpiration(null);return}
    let active=true
    void Promise.all([hasPlusAccess(),plusExpiresAt()]).then(([value,expires])=>{
      if(active){setPlusActive(value);setPlusExpiration(expires)}
    }).catch(()=>{if(active){setPlusActive(false);setPlusExpiration(null)}})
    return()=>{active=false}
  },[email])

  useEffect(()=>{
    if(!email){setProfile(EMPTY_USER_PROFILE);return}
    let cancelled=false
    void loadUserProfile().then(nextProfile=>{
      if(!cancelled)setProfile(nextProfile??EMPTY_USER_PROFILE)
    }).catch(nextError=>{
      if(!cancelled)setError(messageFromError(nextError))
    })
    return()=>{cancelled=true}
  },[email])

  async function submit(nextEmail:string,password:string,birthDate?:string,captchaToken?:string){
    setBusy(true)
    setError('')
    setMessage('')
    try{
      if(mode==='signup'){
        const validDate=validateSignupBirthDate(birthDate??'')
        const result=await signUpWithPassword(nextEmail,password,validDate,captchaToken??'')
        setMessage(result.needsEmailConfirmation?'Check your email to confirm your account, then return here to sign in.':'Account created and signed in.')
      }else{
        await signInWithPassword(nextEmail,password)
        setMessage('Signed in. Your practice history will sync automatically.')
      }
    }catch(nextError){
      setError(messageFromError(nextError))
    }finally{
      setBusy(false)
    }
  }

  async function joinWaitlist(){
    setBusy(true);setError('');setMessage('')
    try{
      await joinLaunchWaitlist(waitlistEmail,validateSignupBirthDate(waitlistBirthDate),captchaToken)
      setMessage('Please check your inbox and confirm your email address to join the waitlist.')
    }catch(nextError){setError(messageFromError(nextError))}
    finally{setBusy(false)}
  }

  async function saveProfile(nextProfile:UserProfile){
    setBusy(true)
    setError('')
    setMessage('')
    try{
      const saved=await saveUserProfile(nextProfile)
      setProfile(saved)
      window.dispatchEvent(new Event('sat-profile-updated'))
      setMessage('Profile saved.')
    }catch(nextError){
      setError(messageFromError(nextError))
    }finally{
      setBusy(false)
    }
  }

  async function deleteAccount(){
    if(deleteText!=='DELETE MY ACCOUNT')return
    setBusy(true);setError('');setMessage('')
    try{
      await deleteCurrentAccount()
      setProfile(EMPTY_USER_PROFILE)
      setDeleteText('')
      setMessage('Account deleted.')
    }catch(nextError){setError(messageFromError(nextError))}
    finally{setBusy(false)}
  }

  async function logout(){
    setBusy(true)
    setError('')
    setMessage('')
    try{
      await signOut()
      setProfile(EMPTY_USER_PROFILE)
      setMessage('Signed out. Your local practice data remains on this device.')
    }catch(nextError){
      setError(messageFromError(nextError))
    }finally{
      setBusy(false)
    }
  }

  return <AlexSurface sx={{p:{xs:2.25,md:3},border:'1px solid',borderColor:'divider',borderRadius:3}}>
    <AlexStack spacing={2.25}>
      <AlexStack spacing={.5}>
        <AlexText component="p" sx={{fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'text.secondary',m:0}}>Account & sync</AlexText>
        <AlexText component="h2" sx={{fontSize:24,fontWeight:850,m:0}}>{email?'Your account':'Keep your SAT history across devices'}</AlexText>
        <AlexText sx={{fontSize:14,color:'text.secondary'}}>{email?'Manage your profile and account details.':'Sign in with the same account on each device to back up and restore completed practice sessions.'}</AlexText>
      </AlexStack>

      {!isSupabaseConfigured?<AlexText role="alert" sx={{color:'error.main'}}>Supabase is not configured for this build.</AlexText>:email?<AlexStack spacing={2.25}>
        <AlexSurface variant="outlined" sx={{p:2,borderRadius:2}}>
          <AlexText sx={{fontSize:12,color:'text.secondary',mb:.25}}>Signed in as</AlexText>
          <AlexText sx={{fontWeight:750}}>{email}</AlexText>
        </AlexSurface>
        <AlexSurface variant="outlined" sx={{p:2,borderRadius:2}}>
          <AlexStack spacing={1}>
            <AlexText sx={{fontWeight:750}}>90-day Plus access</AlexText>
            <AlexText sx={{fontSize:13,color:'text.secondary'}}>{plusActive?`Your Plus access is active${plusExpiration?` through ${new Date(plusExpiration).toLocaleDateString()}`:""}.`:'Get unlimited sessions, personalized configuration, study planning and progress insights for $10 once. No subscription or automatic renewal.'}</AlexText>
            {!plusActive&&<AlexButton disabled={busy||!checkoutOpen} onClick={()=>{setError('');void openOneTimeCheckout().catch(nextError=>setError(messageFromError(nextError)))}} sx={{alignSelf:'flex-start'}}>{checkoutOpen?'Get 90 days for $10':'Early adopter passes coming soon'}</AlexButton>}
          </AlexStack>
        </AlexSurface>
        <UserProfileForm profile={profile} busy={busy} onSave={saveProfile}/>
        {error&&<AlexText role="alert" sx={{fontSize:13,color:'error.main'}}>{error}</AlexText>}
        {message&&<AlexText role="status" sx={{fontSize:13,color:'success.main'}}>{message}</AlexText>}
        <AlexButton tone="secondary" disabled={busy} onClick={logout} sx={{alignSelf:'flex-start'}}>Sign out</AlexButton>
        <AlexSurface variant="outlined" sx={{p:2,borderRadius:2,borderColor:'error.light'}}>
          <AlexStack spacing={1.25}>
            <AlexText sx={{fontWeight:750}}>Delete account</AlexText>
            <AlexText sx={{fontSize:13,color:'text.secondary'}}>Permanently deletes your account and linked practice records. This cannot be undone. Type DELETE MY ACCOUNT to confirm.</AlexText>
            <AlexTextField label="Confirmation" value={deleteText} onChange={event=>setDeleteText(event.target.value)}/>
            <AlexButton disabled={busy||deleteText!=='DELETE MY ACCOUNT'} onClick={()=>void deleteAccount()} sx={{alignSelf:'flex-start'}}>Permanently delete my account</AlexButton>
          </AlexStack>
        </AlexSurface>
      </AlexStack>:registrationFull?<AlexStack spacing={2}>
        <AlexText sx={{fontWeight:700}}>The first 100 account places are filled.</AlexText>
        <AlexText sx={{fontSize:14,fontWeight:700}}>You must be 13 or older to join the waitlist.</AlexText>
        <AlexText sx={{fontSize:14,color:'text.secondary'}}>Enter your email to request a registration invitation. An invitation does not reserve a place. Your email will be used for waitlist updates; contact support to request removal.</AlexText>
        <AlexTextField label="Date of birth" type="date" value={waitlistBirthDate} onChange={event=>{setWaitlistBirthDate(event.target.value);setWaitlistAgeApproved(false);setError('')}} InputLabelProps={{shrink:true}} />
        {!waitlistAgeApproved?<AlexButton disabled={!waitlistBirthDate} onClick={()=>{try{validateSignupBirthDate(waitlistBirthDate);setError('');setWaitlistAgeApproved(true)}catch(nextError){setError(messageFromError(nextError))}}}>Continue</AlexButton>:<AlexButton tone="secondary" onClick={()=>{setWaitlistAgeApproved(false);setWaitlistEmail('');setCaptchaToken('')}}>Change date of birth</AlexButton>}
        {waitlistAgeApproved&&<AlexTextField label="Email for waitlist" type="email" value={waitlistEmail} onChange={event=>setWaitlistEmail(event.target.value)} />}
        {waitlistAgeApproved&&<TurnstileChallenge onToken={handleCaptchaToken}/>}
        {error&&<AlexText role="alert" sx={{color:'error.main'}}>{error}</AlexText>}
        {message&&<AlexText role="status" sx={{color:'success.main'}}>{message}</AlexText>}
        {waitlistAgeApproved&&<AlexButton disabled={busy||!waitlistEmail.includes('@')||!waitlistBirthDate||!captchaToken} onClick={()=>void joinWaitlist()}>Join waitlist</AlexButton>}
        <AlexButton tone="secondary" onClick={()=>setRegistrationFull(false)}>I already have an account — sign in</AlexButton>
      </AlexStack>:<AuthCredentialsForm
        mode={mode}
        busy={busy}
        message={message}
        error={error}
        onSubmit={submit}
        onModeChange={nextMode=>{setMode(nextMode);setError('');setMessage('')}}
      />}
    </AlexStack>
  </AlexSurface>
}
