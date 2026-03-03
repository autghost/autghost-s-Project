import { supabase } from './supabase'
import {
  db,
  cacheWords,
  getPendingOperations,
  clearPendingOperation,
  type LocalWord
} from './offlineDb'

let isOnline = navigator.onLine

export function initOnlineListener(onStatusChange?: (online: boolean) => void) {
  window.addEventListener('online', () => {
    isOnline = true
    onStatusChange?.(true)
    syncPendingOperations()
  })

  window.addEventListener('offline', () => {
    isOnline = false
    onStatusChange?.(false)
  })
}

export function getOnlineStatus(): boolean {
  return isOnline
}

export async function syncPendingOperations() {
  if (!isOnline) return

  const ops = await getPendingOperations()
  for (const op of ops) {
    try {
      const payload = JSON.parse(op.payload)

      switch (op.type) {
        case 'add_words': {
          const { error } = await supabase.from('words').insert(payload.words)
          if (!error) {
            for (const w of payload.words) {
              await db.words.update(w.id, { sync_status: 'synced' })
            }
          }
          break
        }

        case 'update_word': {
          const { error } = await supabase
            .from('words')
            .update(payload.updates)
            .eq('id', payload.id)
          if (!error) {
            await db.words.update(payload.id, { sync_status: 'synced' })
          }
          break
        }

        case 'delete_words': {
          const { error } = await supabase
            .from('words')
            .update({ deleted_at: payload.deleted_at })
            .in('id', payload.ids)
          if (!error) {
            for (const id of payload.ids) {
              await db.words.update(id, { sync_status: 'synced' })
            }
          }
          break
        }

        case 'restore_words': {
          const { error } = await supabase
            .from('words')
            .update({ deleted_at: null })
            .in('id', payload.ids)
          if (!error) {
            for (const id of payload.ids) {
              await db.words.update(id, { sync_status: 'synced' })
            }
          }
          break
        }

        case 'save_session': {
          const { error } = await supabase
            .from('dictation_sessions')
            .insert(payload.session)
          if (!error) {
            await db.sessions.update(payload.session.id, { sync_status: 'synced' })
          }
          break
        }
      }

      await clearPendingOperation(op.id!)
    } catch {
      // Will retry on next sync
      break
    }
  }
}

export async function pullLatestData(databaseId: string) {
  if (!isOnline) return

  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('database_id', databaseId)

  if (error || !data) return

  const localWords: LocalWord[] = data.map(w => ({
    ...w,
    sync_status: 'synced' as const,
    updated_at: new Date().toISOString()
  }))

  await cacheWords(localWords)
}
