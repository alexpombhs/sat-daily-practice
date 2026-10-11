import {useEffect,useState} from 'react'
import AlexButton from '../atoms/AlexButton'
import AlexStack from '../atoms/AlexStack'
import AlexText from '../atoms/AlexText'
import AlexTextField from '../atoms/AlexTextField'
import type {UserProfile} from '../../lib/supabase'

type Props={profile:UserProfile;busy:boolean;onSave:(profile:UserProfile)=>Promise<void>|void}

export default function UserProfileForm({profile,busy,onSave}:Props){
 const[name,setName]=useState(profile.displayName)
 useEffect(()=>setName(profile.displayName),[profile.displayName])
 return <AlexStack spacing={2}>
  <AlexText component="h3" sx={{fontSize:18,fontWeight:800,m:0}}>Profile</AlexText>
  <AlexText sx={{fontSize:13,color:'text.secondary'}}>A display name is optional. We do not require your school, grade, parent contact or a biography.</AlexText>
  <AlexTextField label="Display name (optional)" value={name} onChange={event=>setName(event.target.value)} placeholder="How you would like to be called"/>
  <AlexButton disabled={busy} onClick={()=>onSave({...profile,displayName:name,school:'',grade:'',parentGuardianName:'',parentGuardianEmail:'',about:''})} sx={{alignSelf:'flex-start'}}>Save profile</AlexButton>
 </AlexStack>
}
