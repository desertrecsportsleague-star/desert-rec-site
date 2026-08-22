import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const isConfigured = Boolean(url && key)
export const supabase = isConfigured ? createClient(url, key) : null

export async function getSession(){
  if(!supabase) return null
  const {data} = await supabase.auth.getSession()
  return data.session
}

export async function signUp(email,password){
  if(!supabase) throw new Error('Supabase is not configured yet.')
  const {data,error}=await supabase.auth.signUp({email,password})
  if(error) throw error
  return data
}

export async function signIn(email,password){
  if(!supabase) throw new Error('Supabase is not configured yet.')
  const {data,error}=await supabase.auth.signInWithPassword({email,password})
  if(error) throw error
  return data
}

export async function signOut(){ if(supabase) await supabase.auth.signOut() }

export async function saveBusiness(payload){
  if(!supabase) return {id:'demo-business'}
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) throw new Error('Please sign in first.')
  const row={owner_id:user.id,...payload}
  const {data,error}=await supabase.from('businesses').upsert(row,{onConflict:'owner_id'}).select().single()
  if(error) throw error
  return data
}

export async function saveEstimate(payload){
  if(!supabase) return {id:'demo-estimate'}
  const {data,error}=await supabase.from('estimates').insert(payload).select().single()
  if(error) throw error
  return data
}

export async function saveActual(payload){
  if(!supabase) return {id:'demo-actual'}
  const {data,error}=await supabase.from('job_actuals').upsert(payload,{onConflict:'estimate_id'}).select().single()
  if(error) throw error
  return data
}

export async function saveFeedback(payload){
  if(!supabase) return {id:'demo-feedback'}
  const {data,error}=await supabase.from('tester_feedback').insert(payload).select().single()
  if(error) throw error
  return data
}

export async function loadTesterSummary(){
  if(!supabase) return null
  const {data,error}=await supabase.from('tester_admin_summary').select('*').order('created_at',{ascending:false})
  if(error) throw error
  return data
}
