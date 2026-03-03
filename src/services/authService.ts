import { supabase } from './supabase'

function phoneToEmail(phone: string): string {
  return `${phone}@dictation-app.com`
}

export async function register(phone: string, password: string) {
  const email = phoneToEmail(phone)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { phone } }
  })
  if (error) throw error

  if (!data.session) {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (loginError) throw loginError
    return loginData
  }

  return data
}

export async function login(phone: string, password: string) {
  const email = phoneToEmail(phone)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  localStorage.removeItem('auth_token')
  localStorage.removeItem('current_database_id')
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}
