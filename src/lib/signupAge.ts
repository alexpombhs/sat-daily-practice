/** The date is self-reported; server-side Auth hook must independently validate. */
export function validateSignupBirthDate(value:string,now=new Date()):string {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Enter a valid date of birth.')
  const [year,month,day]=value.split('-').map(Number)
  const birth=new Date(Date.UTC(year,month-1,day))
  if(birth.getUTCFullYear()!==year||birth.getUTCMonth()!==month-1||birth.getUTCDate()!==day)
    throw new Error('Enter a valid date of birth.')
  const today=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))
  if(birth>today)throw new Error('Enter a valid date of birth.')
  const threshold=new Date(Date.UTC(today.getUTCFullYear()-13,today.getUTCMonth(),today.getUTCDate()))
  if(birth>threshold)throw new Error('Registration is not available for this date of birth.')
  if(year<1900)throw new Error('Enter a valid date of birth.')
  return value
}
