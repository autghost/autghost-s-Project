import { supabase } from './supabase'
import type { Word } from './wordService'

export interface DictationSession {
  id: string
  database_id: string
  session_date: string
  total_words: number
  correct_words: number
  created_at: string
}

export function getDefaultDictationList(words: Word[]): Word[] {
  const today = new Date()
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return words.filter(w => {
    if (w.total_dictation_count === 0) return true
    if (w.last_dictation_correct === false) return true
    if (w.last_dictation_correct === true && w.last_dictation_date) {
      return new Date(w.last_dictation_date) < sevenDaysAgo
    }
    return false
  })
}

export async function saveDictationSession(
  databaseId: string,
  totalWords: number,
  correctWords: number
) {
  const { data, error } = await supabase
    .from('dictation_sessions')
    .insert({
      database_id: databaseId,
      session_date: new Date().toISOString().split('T')[0],
      total_words: totalWords,
      correct_words: correctWords
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentSessions(databaseId: string, days = 7): Promise<DictationSession[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('dictation_sessions')
    .select('*')
    .eq('database_id', databaseId)
    .gte('session_date', since)
    .order('session_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTotalSessionCount(databaseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('dictation_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('database_id', databaseId)

  if (error) throw error
  return count || 0
}
