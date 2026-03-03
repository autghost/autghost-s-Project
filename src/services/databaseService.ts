import { supabase } from './supabase'

async function getAuthUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    throw new Error('用户未登录，请重新登录')
  }
  return session.user.id
}

export async function createWordDatabase(userId?: string) {
  const uid = userId || await getAuthUserId()

  const { data, error } = await supabase
    .from('word_databases')
    .insert({ created_by: uid })
    .select()
    .single()
  if (error) throw error

  const { error: memberError } = await supabase
    .from('database_members')
    .insert({ database_id: data.id, user_id: uid })
  if (memberError) throw memberError

  return data
}

export async function generateInviteCode(databaseId: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('word_databases')
    .update({ invite_code: code, invite_code_expires: expiresAt })
    .eq('id', databaseId)

  if (error) throw error
  return code
}

export async function joinByInviteCode(userId: string, code: string) {
  const { data: db, error: findError } = await supabase
    .from('word_databases')
    .select('id, invite_code_expires')
    .eq('invite_code', code)
    .single()

  if (findError || !db) throw new Error('邀请码无效')

  if (new Date(db.invite_code_expires) < new Date()) {
    throw new Error('邀请码已过期')
  }

  const { count } = await supabase
    .from('database_members')
    .select('*', { count: 'exact', head: true })
    .eq('database_id', db.id)

  if (count !== null && count >= 3) {
    throw new Error('账号绑定不可超过3个')
  }

  const { error: joinError } = await supabase
    .from('database_members')
    .insert({ database_id: db.id, user_id: userId })

  if (joinError) throw joinError
  return db.id
}

export async function getUserDatabase(userId: string) {
  const { data, error } = await supabase
    .from('database_members')
    .select('database_id')
    .eq('user_id', userId)
    .limit(1)
    .single()

  if (error) return null
  return data.database_id
}
