import Dexie, { type Table } from 'dexie'

export interface LocalWord {
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
  sync_status: 'synced' | 'pending' | 'conflict'
  updated_at: string
}

export interface LocalDictationSession {
  id: string
  database_id: string
  session_date: string
  total_words: number
  correct_words: number
  created_at: string
  sync_status: 'synced' | 'pending'
}

export interface PendingOperation {
  id?: number
  type: 'add_words' | 'update_word' | 'delete_words' | 'save_session' | 'restore_words'
  payload: string
  created_at: string
}

class DictationDB extends Dexie {
  words!: Table<LocalWord, string>
  sessions!: Table<LocalDictationSession, string>
  pendingOps!: Table<PendingOperation, number>

  constructor() {
    super('dictation_helper')
    this.version(1).stores({
      words: 'id, database_id, sync_status, deleted_at',
      sessions: 'id, database_id, sync_status, session_date',
      pendingOps: '++id, type, created_at'
    })
  }
}

export const db = new DictationDB()

export async function cacheWords(words: LocalWord[]) {
  await db.words.bulkPut(words)
}

export async function getCachedWords(databaseId: string): Promise<LocalWord[]> {
  return db.words
    .where('database_id')
    .equals(databaseId)
    .filter(w => w.deleted_at === null)
    .toArray()
}

export async function addPendingOperation(op: Omit<PendingOperation, 'id'>) {
  await db.pendingOps.add(op)
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  return db.pendingOps.toArray()
}

export async function clearPendingOperation(id: number) {
  await db.pendingOps.delete(id)
}

export async function clearAllCachedData() {
  await db.words.clear()
  await db.sessions.clear()
  await db.pendingOps.clear()
}
