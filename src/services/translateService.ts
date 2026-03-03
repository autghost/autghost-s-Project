const CACHE_KEY = 'word_translations'
const PENDING = new Map<string, Promise<string>>()

function getCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function setCache(cache: Record<string, string>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export function getCachedTranslation(word: string): string | null {
  const cache = getCache()
  return cache[word.toLowerCase().trim()] ?? null
}

async function fetchTranslation(word: string): Promise<string> {
  const key = word.toLowerCase().trim()
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(key)}&langpair=en|zh-CN`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation API error')
  const data = await res.json()
  const text: string = data.responseData?.translatedText || ''
  return text
}

export async function translate(word: string): Promise<string> {
  const key = word.toLowerCase().trim()
  if (!key) return ''

  const cached = getCachedTranslation(key)
  if (cached) return cached

  if (PENDING.has(key)) {
    return PENDING.get(key)!
  }

  const promise = fetchTranslation(key).then(result => {
    const cache = getCache()
    cache[key] = result
    setCache(cache)
    PENDING.delete(key)
    return result
  }).catch(() => {
    PENDING.delete(key)
    return ''
  })

  PENDING.set(key, promise)
  return promise
}

export async function translateBatch(words: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const toFetch: string[] = []

  for (const w of words) {
    const key = w.toLowerCase().trim()
    const cached = getCachedTranslation(key)
    if (cached) {
      result[key] = cached
    } else {
      toFetch.push(key)
    }
  }

  const batchSize = 5
  for (let i = 0; i < toFetch.length; i += batchSize) {
    const batch = toFetch.slice(i, i + batchSize)
    const translations = await Promise.all(batch.map(w => translate(w)))
    batch.forEach((w, idx) => {
      result[w] = translations[idx]
    })
  }

  return result
}
