import {useEffect,useRef} from 'react'

declare global {
 interface Window {
  turnstile?:{
   render:(element:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;'expired-callback':()=>void;'error-callback':()=>void})=>string
   remove:(id:string)=>void
  }
 }
}
type Props={onToken:(token:string)=>void}
export default function TurnstileChallenge({onToken}:Props){
 const host=useRef<HTMLDivElement>(null)
 const sitekey=import.meta.env.VITE_TURNSTILE_SITE_KEY as string|undefined
 useEffect(()=>{
  if(!sitekey||!host.current)return
  let cancelled=false
  let widgetId:string|undefined
  const mount=()=>{
   if(cancelled||!host.current||!window.turnstile||widgetId)return
   widgetId=window.turnstile.render(host.current,{
    sitekey,callback:onToken,'expired-callback':()=>onToken(''),'error-callback':()=>onToken(''),
   })
  }
  const existing=document.querySelector('script[data-sat-turnstile]')
  if(!existing){
   const script=document.createElement('script')
   script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
   script.async=true;script.defer=true;script.dataset.satTurnstile='true'
   script.onload=mount
   document.head.appendChild(script)
  }else if(window.turnstile)mount()
  else existing.addEventListener('load',mount)
  return()=>{
   cancelled=true
   if(widgetId&&window.turnstile)window.turnstile.remove(widgetId)
   existing?.removeEventListener('load',mount)
  }
 },[sitekey,onToken])
 if(!sitekey)return null // CAPTCHA is an optional deployment configuration; backend protections remain authoritative.
 return <div ref={host} aria-label="Security verification"/>
}
