<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Volume2 } from 'lucide-vue-next'
import { useWordsStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { useDictationStore } from '@/stores/dictation'
import { speak } from '@/services/ttsService'
import { translate, getCachedTranslation } from '@/services/translateService'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const auth = useAuthStore()
const wordsStore = useWordsStore()
const dictation = useDictationStore()

const translations = reactive<Record<string, string>>({})

onMounted(async () => {
  if (auth.databaseId && wordsStore.words.length === 0) {
    await wordsStore.loadWords(auth.databaseId)
  }
  loadTranslations()
})

function loadTranslations() {
  for (const word of wordsStore.errorWords) {
    const cached = getCachedTranslation(word.content)
    if (cached) {
      translations[word.id] = cached
    } else {
      translate(word.content).then(t => { translations[word.id] = t })
    }
  }
}

const errorWords = computed(() => wordsStore.errorWords)

function playWord(content: string) {
  speak(content)
}

function errorTimes(word: any): number {
  return word.total_dictation_count - word.correct_count
}

function startErrorDictation() {
  if (errorWords.value.length === 0) return
  dictation.setCandidates([...errorWords.value], true)
  router.push('/dictation/filter')
}
</script>

<template>
  <div class="error-page page">
    <div class="page-header">
      <h1>错题本</h1>
    </div>

    <div class="page-content">
      <div v-if="errorWords.length > 0" class="error-summary">
        共 {{ errorWords.length }} 个错题待复习
      </div>

      <EmptyState
        v-if="errorWords.length === 0"
        title="暂无错题"
        description="听写全对，继续保持！"
      />

      <div v-else class="word-list">
        <div
          v-for="word in errorWords"
          :key="word.id"
          class="error-item"
        >
          <div class="error-bar" />
          <div class="item-main">
            <div class="item-row">
              <div class="item-info">
                <span class="item-text">{{ word.content }}</span>
                <span v-if="translations[word.id]" class="item-translation">{{ translations[word.id] }}</span>
              </div>
              <button class="play-btn" @click="playWord(word.content)">
                <Volume2 :size="18" />
              </button>
            </div>
            <div class="item-meta">
              <span>错误 {{ errorTimes(word) }} 次</span>
              <span v-if="word.last_dictation_date">最近: {{ word.last_dictation_date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorWords.length > 0" class="bottom-action">
      <AppButton block size="lg" @click="startErrorDictation">
        选取听写
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.error-summary {
  font-size: 14px;
  color: var(--color-error);
  font-weight: 500;
  padding: 12px 16px;
  background: var(--color-error-light);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 80px;
}

.error-item {
  display: flex;
  background: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.error-bar {
  width: 4px;
  background: var(--color-error);
  flex-shrink: 0;
}

.item-main {
  flex: 1;
  padding: 14px 16px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.item-text {
  font-size: 16px;
  font-weight: 500;
}

.item-translation {
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.8;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: var(--color-primary-light);
  cursor: pointer;
  flex-shrink: 0;
}

.play-btn:active {
  transform: scale(0.9);
}

.item-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.bottom-action {
  position: fixed;
  bottom: calc(var(--tab-height) + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  padding: 12px 20px;
  background: var(--color-bg);
  z-index: 50;
}
</style>
