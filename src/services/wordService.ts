import { supabase } from './supabase'

export interface Word {
  id: string
  database_id: string
  content: string
  is_phrase: boolean
  created_at: string
  total_dictation_count: number
  correct_count: number
  last_dictation_date: string | null
  last_dictation_correct: boolean | null
  deleted_at: string | null
}

export async function getWords(databaseId: string): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('database_id', databaseId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addWords(databaseId: string, items: { content: string; is_phrase: boolean }[]) {
  const rows = items.map(item => ({
    database_id: databaseId,
    content: item.content,
    is_phrase: item.is_phrase,
    total_dictation_count: 0,
    correct_count: 0,
    last_dictation_date: null,
    last_dictation_correct: null
  }))

  const { data, error } = await supabase.from('words').insert(rows).select()
  if (error) throw error
  return data
}

export async function updateWord(id: string, updates: Partial<Word>) {
  const { error } = await supabase.from('words').update(updates).eq('id', id)
  if (error) throw error
}

export async function softDeleteWords(ids: string[]) {
  const { error } = await supabase
    .from('words')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids)
  if (error) throw error
}

export async function getDeletedWords(databaseId: string): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('database_id', databaseId)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function restoreWords(ids: string[]) {
  const { error } = await supabase
    .from('words')
    .update({ deleted_at: null })
    .in('id', ids)
  if (error) throw error
}

export async function permanentDeleteWords(ids: string[]) {
  const { error } = await supabase.from('words').delete().in('id', ids)
  if (error) throw error
}

export async function cleanupRecycleBin(databaseId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('database_id', databaseId)
    .not('deleted_at', 'is', null)
    .lt('deleted_at', sevenDaysAgo)

  if (error) throw error
}

export async function updateDictationResults(
  results: { id: string; correct: boolean }[],
  date: string,
  localWords: Word[]
) {
  const updates = results.map(result => {
    const local = localWords.find(w => w.id === result.id)
    const prevCount = local?.total_dictation_count ?? 0
    const prevCorrect = local?.correct_count ?? 0

    return supabase.from('words').update({
      total_dictation_count: prevCount + 1,
      correct_count: result.correct ? prevCorrect + 1 : prevCorrect,
      last_dictation_date: date,
      last_dictation_correct: result.correct
    }).eq('id', result.id)
  })

  await Promise.all(updates)
}
