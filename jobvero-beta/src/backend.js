import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url && key)
export const client = configured ? createClient(url, key) : null

export async function session(){
  if(!client) return null
  const {data,error}=await client.auth.getSession()
  if(error) throw error
  return data.session
}

export async function signup(email,password){
  if(!client) throw new Error('Backend not configured')
  const {data,error}=await client.auth.signUp({email,password})
  if(error) throw error
  return data
}

export async function login(email,password){
  if(!client) throw new Error('Backend not configured')
  const {data,error}=await client.auth.signInWithPassword({email,password})
  if(error) throw error
  return data
}

export async function currentUser(){
  if(!client) return null
  const {data,error}=await client.auth.getUser()
  if(error) throw error
  return data.user
}
