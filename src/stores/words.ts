import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as wordService from '@/services/wordService'
import type { Word } from '@/services/wordService'

export const useWordsStore = defineStore('words', () => {
  const words = ref<Word[]>([])
  const loading = ref(false)

  const totalCount = computed(() => words.value.length)
  const errorWords = computed(() =>
    words.value.filter(w => w.last_dictation_correct === false)
  )

  async function loadWords(databaseId: string) {
    loading.value = true
    try {
      words.value = await wordService.getWords(databaseId)
    } finally {
      loading.value = false
    }
  }

  async function addWords(databaseId: string, items: { content: string; is_phrase: boolean }[]) {
    const newWords = await wordService.addWords(databaseId, items)
    if (newWords) {
      words.value = [...newWords, ...words.value]
    }
  }

  async function deleteWords(ids: string[]) {
    await wordService.softDeleteWords(ids)
    words.value = words.value.filter(w => !ids.includes(w.id))
  }

  async function updateWord(id: string, updates: Partial<Word>) {
    await wordService.updateWord(id, updates)
    const idx = words.value.findIndex(w => w.id === id)
    if (idx !== -1) {
      words.value[idx] = { ...words.value[idx], ...updates }
    }
  }

  function updateLocalDictationResults(results: { id: string; correct: boolean }[]) {
    const today = new Date().toISOString().split('T')[0]
    for (const r of results) {
      const idx = words.value.findIndex(w => w.id === r.id)
      if (idx !== -1) {
        const w = words.value[idx]
        words.value[idx] = {
          ...w,
          total_dictation_count: w.total_dictation_count + 1,
          correct_count: r.correct ? w.correct_count + 1 : w.correct_count,
          last_dictation_date: today,
          last_dictation_correct: r.correct
        }
      }
    }
  }

  return { words, loading, totalCount, errorWords, loadWords, addWords, deleteWords, updateWord, updateLocalDictationResults }
})
