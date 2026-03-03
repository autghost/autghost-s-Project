import { lookupLocal, normalizeKey } from '@/dictionary/localDict'

export function getCachedTranslation(word: string): string | null {
  // 先查本地词典，不走网络
  const local = lookupLocal(word)
  return local
}

export async function translate(word: string): Promise<string> {
  const key = normalizeKey(word)
  if (!key) return ''
  const local = lookupLocal(key)
  return local ?? ''
}

export async function translateBatch(words: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const w of words) {
    const key = normalizeKey(w)
    if (!key) continue
    const local = lookupLocal(key)
    if (local) {
      result[key] = local
    }
  }
  return result
}

