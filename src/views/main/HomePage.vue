<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PenLine, BookOpen, Settings } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWordsStore } from '@/stores/words'
import { useDictationStore } from '@/stores/dictation'
import { getDefaultDictationList } from '@/services/dictationService'

const router = useRouter()
const auth = useAuthStore()
const wordsStore = useWordsStore()
const dictationStore = useDictationStore()

const loaded = ref(false)

onMounted(async () => {
  await auth.init()
  if (auth.databaseId) {
    await wordsStore.loadWords(auth.databaseId)
  }
  loaded.value = true
})

const pendingWords = computed(() =>
  getDefaultDictationList(wordsStore.words)
)

const errorCount = computed(() => wordsStore.errorWords.length)

const accuracy = computed(() => {
  const total = wordsStore.words.reduce((s, w) => s + w.total_dictation_count, 0)
  const correct = wordsStore.words.reduce((s, w) => s + w.correct_count, 0)
  if (total === 0) return '--'
  return Math.round((correct / total) * 100) + '%'
})

function startDictation() {
  const list = pendingWords.value
  if (list.length === 0) return
  dictationStore.setCandidates(list)
  router.push('/dictation/filter')
}
</script>

<template>
  <div class="home-page page">
    <div class="greeting">
      <h2>你好 👋</h2>
      <p>今天也要加油哦！</p>
    </div>

    <div class="page-content" v-if="loaded">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-num">{{ pendingWords.length }}</span>
          <span class="stat-label">待听写</span>
        </div>
        <div class="stat-card">
          <span class="stat-num error-num">{{ errorCount }}</span>
          <span class="stat-label">错题</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ wordsStore.totalCount }}</span>
          <span class="stat-label">总词量</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ accuracy }}</span>
          <span class="stat-label">正确率</span>
        </div>
      </div>

      <button class="action-card" @click="startDictation">
        <div class="action-left">
          <PenLine :size="22" />
          <div>
            <h3>快速听写</h3>
            <p v-if="pendingWords.length > 0">有 {{ pendingWords.length }} 个单词等待听写</p>
            <p v-else>暂无待听写单词</p>
          </div>
        </div>
        <span class="arrow">→</span>
      </button>

      <div class="quick-links">
        <button class="quick-link" @click="router.push('/words/add')">
          <BookOpen :size="18" />
          <span>添加单词</span>
        </button>
        <button class="quick-link" @click="router.push('/settings')">
          <Settings :size="18" />
          <span>设置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.greeting {
  padding: 24px 20px 16px;
}

.greeting h2 {
  font-size: 24px;
  font-weight: 700;
}

.greeting p {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.error-num {
  color: var(--color-error);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.action-card {
  width: 100%;
  background: linear-gradient(135deg, #4F6EF7, #6C8CFF);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.15s;
}

.action-card:active {
  transform: scale(0.98);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-left h3 {
  font-size: 17px;
  font-weight: 600;
}

.action-left p {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
}

.arrow {
  font-size: 20px;
  opacity: 0.8;
}

.quick-links {
  display: flex;
  gap: 12px;
}

.quick-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: var(--color-card);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s;
}

.quick-link:active {
  transform: scale(0.97);
}
</style>
