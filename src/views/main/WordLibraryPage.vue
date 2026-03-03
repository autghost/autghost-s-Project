<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Plus, Trash2, CheckSquare, PenLine } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWordsStore } from '@/stores/words'
import { useDictationStore } from '@/stores/dictation'
import WordCard from '@/components/WordCard.vue'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const wordsStore = useWordsStore()
const dictationStore = useDictationStore()

const searchQuery = ref('')
const selectMode = ref(false)
const pickMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const showDeleteConfirm = ref(false)

onMounted(async () => {
  if (auth.databaseId && wordsStore.words.length === 0) {
    await wordsStore.loadWords(auth.databaseId)
  }
  if (route.query.pick === '1') {
    pickMode.value = true
    selectMode.value = true
  }
})

function startPickDictation() {
  const ids = [...selectedIds.value]
  const picked = wordsStore.words.filter(w => ids.includes(w.id))
  if (picked.length === 0) return
  dictationStore.setCandidates(picked)
  router.push('/dictation/filter')
}

const filteredWords = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return wordsStore.words
  return wordsStore.words.filter(w => w.content.toLowerCase().includes(q))
})

const groupedWords = computed(() => {
  const groups: Record<string, typeof filteredWords.value> = {}
  for (const w of filteredWords.value) {
    const date = w.created_at.split('T')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(w)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

function selectAll() {
  if (selectedIds.value.size === filteredWords.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredWords.value.map(w => w.id))
  }
}

async function confirmDelete() {
  const ids = [...selectedIds.value]
  await wordsStore.deleteWords(ids)
  selectedIds.value = new Set()
  selectMode.value = false
  showDeleteConfirm.value = false
}

function exitSelectMode() {
  selectMode.value = false
  selectedIds.value = new Set()
}
</script>

<template>
  <div class="words-page page">
    <div class="page-header">
      <h1>{{ pickMode ? '选择听写单词' : '单词库' }}</h1>
      <div class="header-actions">
        <button v-if="!pickMode" class="icon-btn" @click="selectMode ? exitSelectMode() : (selectMode = true)">
          <CheckSquare :size="20" />
        </button>
      </div>
    </div>

    <div class="page-content">
      <div class="search-bar">
        <Search :size="18" class="search-icon" />
        <input
          v-model="searchQuery"
          placeholder="搜索单词..."
          class="search-input"
        />
      </div>

      <div class="word-meta">
        <span>共 {{ filteredWords.length }} 个</span>
        <button v-if="selectMode" class="select-all-btn" @click="selectAll">
          {{ selectedIds.size === filteredWords.length ? '取消全选' : '全选' }}
        </button>
      </div>

      <div v-if="filteredWords.length === 0">
        <EmptyState
          title="还没有单词"
          description="点击下方按钮开始添加单词吧"
        />
      </div>

      <div v-else class="word-list">
        <div v-for="[date, words] in groupedWords" :key="date" class="word-group">
          <div class="group-header">{{ date }} ({{ words.length }}个)</div>
          <div class="group-list">
            <div
              v-for="word in words"
              :key="word.id"
              :class="['word-item', { selected: selectedIds.has(word.id) }]"
              @click="selectMode ? toggleSelect(word.id) : undefined"
            >
              <div v-if="selectMode" class="checkbox">
                <div :class="['check-inner', { checked: selectedIds.has(word.id) }]" />
              </div>
              <WordCard :word="word" :show-stats="!selectMode" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectMode && selectedIds.size > 0" class="batch-bar">
      <span>已选 {{ selectedIds.size }} 个</span>
      <div class="batch-actions">
        <AppButton v-if="pickMode" size="sm" @click="startPickDictation">
          <PenLine :size="16" />
          开始听写
        </AppButton>
        <AppButton v-if="!pickMode" variant="danger" size="sm" @click="showDeleteConfirm = true">
          <Trash2 :size="16" />
          删除
        </AppButton>
      </div>
    </div>

    <button v-if="!selectMode" class="fab" @click="router.push('/words/add')">
      <Plus :size="22" />
      <span>添加单词</span>
    </button>

    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="确认删除"
      :message="`确定删除选中的 ${selectedIds.size} 个条目吗？删除后可在回收站恢复。`"
      confirm-text="删除"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.header-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.icon-btn:active {
  background: var(--color-input-bg);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 44px;
  background: var(--color-input-bg);
  border-radius: var(--radius-pill);
  margin-bottom: 16px;
}

.search-icon {
  color: var(--color-text-hint);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  color: var(--color-text);
}

.search-input::placeholder {
  color: var(--color-text-hint);
}

.word-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.select-all-btn {
  color: var(--color-primary);
  font-size: 13px;
  cursor: pointer;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 80px;
}

.group-header {
  font-size: 13px;
  color: var(--color-text-hint);
  margin-bottom: 8px;
  padding-left: 4px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-item .word-card {
  flex: 1;
}

.checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-inner {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  transition: background 0.15s;
}

.check-inner.checked {
  background: var(--color-primary);
}

.batch-bar {
  position: fixed;
  bottom: calc(var(--tab-height) + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.fab {
  position: fixed;
  bottom: calc(var(--tab-height) + var(--safe-bottom) + 16px);
  right: calc(50% - 230px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.35);
  cursor: pointer;
  z-index: 50;
  transition: transform 0.15s;
}

.fab:active {
  transform: scale(0.95);
}

@media (max-width: 500px) {
  .fab {
    right: 20px;
  }
}
</style>
