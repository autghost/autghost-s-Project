<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, BookOpen } from 'lucide-vue-next'
import { useDictationStore } from '@/stores/dictation'
import { useWordsStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { getDefaultDictationList } from '@/services/dictationService'
import TopBanner from '@/components/TopBanner.vue'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const dictation = useDictationStore()
const wordsStore = useWordsStore()
const auth = useAuthStore()
const loading = ref(false)

onMounted(async () => {
  if (dictation.candidateWords.length > 0) return

  loading.value = true
  try {
    if (auth.databaseId && wordsStore.words.length === 0) {
      await wordsStore.loadWords(auth.databaseId)
    }
    const list = getDefaultDictationList(wordsStore.words)
    dictation.setCandidates(list)
  } finally {
    loading.value = false
  }
})

const isEmpty = computed(() => dictation.candidateWords.length === 0 && !loading.value)

const includedCount = computed(() =>
  dictation.candidateWords.length - dictation.excludedIds.size
)
const excludedCount = computed(() => dictation.excludedIds.size)

function startDictation() {
  if (includedCount.value === 0) return
  router.push('/dictation/run')
}

function goPickWords() {
  router.push('/words?pick=1')
}
</script>

<template>
  <div class="filter-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>去听写</h1>
    </div>

    <div class="page-content">
      <!-- 待听写为空 -->
      <template v-if="isEmpty">
        <EmptyState
          title="暂无待听写单词"
          description="所有单词都已掌握，或者还没有录入单词"
        />
        <div class="pick-action">
          <AppButton block size="lg" variant="outline" @click="goPickWords">
            <BookOpen :size="18" />
            自主划词听写
          </AppButton>
          <p class="pick-hint">从词库中手动勾选想要听写的单词</p>
        </div>
      </template>

      <!-- 有待听写单词 -->
      <template v-else>
        <TopBanner
          type="info"
          message="如有需要排除的请点亮，如无排除直接开始听写"
        />

        <p class="meta">待听写 {{ dictation.candidateWords.length }} 个</p>

        <div class="word-list">
          <div
            v-for="word in dictation.candidateWords"
            :key="word.id"
            :class="['filter-item', { excluded: dictation.excludedIds.has(word.id) }]"
            @click="dictation.toggleExclude(word.id)"
          >
            <div :class="['indicator', { active: dictation.excludedIds.has(word.id) }]" />
            <span
              :class="['item-text', { strikethrough: dictation.excludedIds.has(word.id) }]"
            >
              {{ word.content }}
            </span>
          </div>
        </div>

        <div class="bottom-area">
          <p class="status-text">
            已选 {{ includedCount }} 个<template v-if="excludedCount > 0">，已排除 {{ excludedCount }} 个</template>
          </p>
          <AppButton
            block
            size="lg"
            :disabled="includedCount === 0"
            @click="startDictation"
          >
            开始听写
          </AppButton>
          <AppButton
            block
            size="md"
            variant="outline"
            style="margin-top: 12px;"
            @click="goPickWords"
          >
            自主划词听写
          </AppButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;
}

.meta {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 16px 0 12px;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-card);
  cursor: pointer;
  transition: background 0.15s;
}

.filter-item.excluded {
  background: #FFF8F8;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  transition: all 0.15s;
}

.indicator.active {
  border-color: var(--color-error);
  background: var(--color-error);
}

.item-text {
  font-size: 15px;
  transition: all 0.15s;
}

.item-text.strikethrough {
  text-decoration: line-through;
  opacity: 0.4;
}

.pick-action {
  padding: 0 20px;
  text-align: center;
}

.pick-hint {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 10px;
}

.bottom-area {
  padding-bottom: 20px;
}

.status-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: 12px;
}
</style>
