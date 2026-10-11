import {useCallback,useState,type FormEvent} from 'react'
import AlexButton from '../atoms/AlexButton'
import AlexStack from '../atoms/AlexStack'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import TurnstileChallenge from './TurnstileChallenge'
import {validateSignupBirthDate} from '../../lib/signupAge'

type Props={
  mode:'signin'|'signup'
  busy?:boolean
  message?:string
  error?:string
  onSubmit:(email:string,password:string,birthDate?:string,captchaToken?:string)=>Promise<void>
  onModeChange:(mode:'signin'|'signup')=>void
}

export default function AuthCredentialsForm({mode,busy=false,message,error,onSubmit,onModeChange}:Props){
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[birthDate,setBirthDate]=useState('')
  const[captchaToken,setCaptchaToken]=useState('')
  const[ageApproved,setAgeApproved]=useState(false)
  const[ageError,setAgeError]=useState('')
  const onCaptchaToken=useCallback((token:string)=>setCaptchaToken(token),[])

  async function submit(event:FormEvent){
    event.preventDefault()
    await onSubmit(email,password,mode==='signup'?birthDate:undefined,mode==='signup'?captchaToken:undefined)
  }

  function checkAge(){
    try{validateSignupBirthDate(birthDate);setAgeApproved(true);setAgeError('')}
    catch(nextError){setAgeApproved(false);setAgeError(nextError instanceof Error?nextError.message:'Unable to verify eligibility.')}
  }

  if(mode==='signup'&&!ageApproved)return <AlexStack spacing={2}>
    <AlexText sx={{fontWeight:700}}>You must be 13 or older to create an account.</AlexText>
    <AlexText sx={{fontSize:14,color:'text.secondary'}}>Confirm your age before entering an email or password. Your date of birth stays in this browser until you submit registration.</AlexText>
    <AlexTextField label="Date of birth" type="date" value={birthDate} onChange={event=>{setBirthDate(event.target.value);setAgeError('')}} InputLabelProps={{shrink:true}} inputProps={{max:new Date().toISOString().slice(0,10)}}/>
    {ageError&&<AlexText role="alert" sx={{fontSize:13,color:'error.main'}}>{ageError}</AlexText>}
    <AlexStack direction="row" spacing={1.25}>
      <AlexButton disabled={!birthDate||busy} onClick={checkAge}>Continue</AlexButton>
      <AlexButton tone="secondary" onClick={()=>onModeChange('signin')}>I already have an account</AlexButton>
    </AlexStack>
  </AlexStack>

  return <AlexStack component="form" spacing={2} onSubmit={submit}>
    <AlexTextField
      label="Email"
      type="email"
      autoComplete="email"
      value={email}
      onChange={event=>setEmail(event.target.value)}
      required
    />
    <AlexTextField
      label="Password"
      type="password"
      autoComplete={mode==='signup'?'new-password':'current-password'}
      value={password}
      onChange={event=>setPassword(event.target.value)}
      required
      inputProps={{minLength:6}}
      helperText={mode==='signup'?'Use at least 6 characters.':undefined}
    />
    {mode==='signup'&&<AlexStack spacing={1}>
      <AlexText sx={{fontSize:13,color:'text.secondary'}}>Age eligibility confirmed (13+).</AlexText>
      <AlexButton type="button" tone="secondary" onClick={()=>{setAgeApproved(false);setCaptchaToken('');setEmail('');setPassword('')}} sx={{alignSelf:'flex-start'}}>Change date of birth</AlexButton>
    </AlexStack>}
    {mode==='signup'&&<TurnstileChallenge onToken={onCaptchaToken}/>}
    {error&&<AlexText role="alert" sx={{fontSize:13,color:'error.main'}}>{error}</AlexText>}
    {message&&<AlexText role="status" sx={{fontSize:13,color:'success.main'}}>{message}</AlexText>}
    <AlexStack direction="row" spacing={1.25} sx={{flexWrap:'wrap'}}>
      <AlexButton type="submit" disabled={busy||(mode==='signup'&&!captchaToken)}>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'}</AlexButton>
      <AlexButton type="button" tone="secondary" disabled={busy} onClick={()=>onModeChange(mode==='signup'?'signin':'signup')}>
        {mode==='signup'?'I already have an account':'Create account'}
      </AlexButton>
    </AlexStack>
  </AlexStack>
}
