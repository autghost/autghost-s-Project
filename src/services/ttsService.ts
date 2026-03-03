const VOICE_PREF_KEY = 'preferred_voice_name'

let cachedVoices: SpeechSynthesisVoice[] = []

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  const all = window.speechSynthesis.getVoices()
  cachedVoices = all
  return all.filter(v => v.lang.startsWith('en'))
}

export function getSavedVoiceName(): string | null {
  return localStorage.getItem(VOICE_PREF_KEY)
}

export function saveVoiceName(name: string) {
  localStorage.setItem(VOICE_PREF_KEY, name)
}

function getPreferredVoice(): SpeechSynthesisVoice | undefined {
  const savedName = getSavedVoiceName()
  const voices = window.speechSynthesis.getVoices()
  if (savedName) {
    const match = voices.find(v => v.name === savedName)
    if (match) return match
  }
  return voices.find(v => v.lang.startsWith('en'))
}

export function speak(text: string, voiceName?: string) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.85
  utterance.pitch = 1

  if (voiceName) {
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.name === voiceName)
    if (match) utterance.voice = match
  } else {
    const preferred = getPreferredVoice()
    if (preferred) utterance.voice = preferred
  }

  window.speechSynthesis.speak(utterance)
}

export function stop() {
  window.speechSynthesis.cancel()
}

export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length) {
      cachedVoices = voices
      resolve(voices)
      return
    }
    window.speechSynthesis.onvoiceschanged = () => {
      const v = window.speechSynthesis.getVoices()
      cachedVoices = v
      resolve(v)
    }
  })
}
