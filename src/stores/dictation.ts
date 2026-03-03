import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Word } from '@/services/wordService'

export const useDictationStore = defineStore('dictation', () => {
  const candidateWords = ref<Word[]>([])
  const excludedIds = ref<Set<string>>(new Set())
  const wrongIds = ref<Set<string>>(new Set())
  const isFromErrorBook = ref(false)

  function setCandidates(words: Word[], fromErrorBook = false) {
    candidateWords.value = words
    excludedIds.value = new Set()
    wrongIds.value = new Set()
    isFromErrorBook.value = fromErrorBook
  }

  function toggleExclude(id: string) {
    if (excludedIds.value.has(id)) {
      excludedIds.value.delete(id)
    } else {
      excludedIds.value.add(id)
    }
    excludedIds.value = new Set(excludedIds.value)
  }

  function toggleWrong(id: string) {
    if (wrongIds.value.has(id)) {
      wrongIds.value.delete(id)
    } else {
      wrongIds.value.add(id)
    }
    wrongIds.value = new Set(wrongIds.value)
  }

  function getFinalWords(): Word[] {
    return candidateWords.value.filter(w => !excludedIds.value.has(w.id))
  }

  function getResults(): { id: string; correct: boolean }[] {
    return getFinalWords().map(w => ({
      id: w.id,
      correct: !wrongIds.value.has(w.id)
    }))
  }

  function reset() {
    candidateWords.value = []
    excludedIds.value = new Set()
    wrongIds.value = new Set()
    isFromErrorBook.value = false
  }

  return { candidateWords, excludedIds, wrongIds, isFromErrorBook, setCandidates, toggleExclude, toggleWrong, getFinalWords, getResults, reset }
})
