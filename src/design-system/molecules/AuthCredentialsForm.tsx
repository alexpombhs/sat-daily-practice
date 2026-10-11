import {useState,type FormEvent} from 'react'
import AlexButton from '../atoms/AlexButton'
import AlexStack from '../atoms/AlexStack'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'

type Props={
  mode:'signin'|'signup'
  busy?:boolean
  message?:string
  error?:string
  onSubmit:(email:string,password:string,birthDate?:string)=>Promise<void>
  onModeChange:(mode:'signin'|'signup')=>void
}

export default function AuthCredentialsForm({mode,busy=false,message,error,onSubmit,onModeChange}:Props){
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[birthDate,setBirthDate]=useState('')

  async function submit(event:FormEvent){
    event.preventDefault()
    await onSubmit(email,password,mode==='signup'?birthDate:undefined)
  }

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
    {mode==='signup'&&<>
      <AlexTextField label="Date of birth" type="date" value={birthDate} onChange={event=>setBirthDate(event.target.value)} required InputLabelProps={{shrink:true}} inputProps={{max:new Date().toISOString().slice(0,10)}} helperText="Used to check signup eligibility. You must enter your real date of birth." />
      <AlexText sx={{fontSize:12,color:'text.secondary'}}>Your date of birth is used for eligibility screening. Review the privacy information before public launch.</AlexText>
    </>}
    {error&&<AlexText role="alert" sx={{fontSize:13,color:'error.main'}}>{error}</AlexText>}
    {message&&<AlexText role="status" sx={{fontSize:13,color:'success.main'}}>{message}</AlexText>}
    <AlexStack direction="row" spacing={1.25} sx={{flexWrap:'wrap'}}>
      <AlexButton type="submit" disabled={busy}>{busy?'Please wait…':mode==='signup'?'Create account':'Sign in'}</AlexButton>
      <AlexButton type="button" tone="secondary" disabled={busy} onClick={()=>onModeChange(mode==='signup'?'signin':'signup')}>
        {mode==='signup'?'I already have an account':'Create account'}
      </AlexButton>
    </AlexStack>
  </AlexStack>
}
