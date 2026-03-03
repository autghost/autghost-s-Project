<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import * as wordService from '@/services/wordService'
import type { Word } from '@/services/wordService'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const auth = useAuthStore()

const deletedWords = ref<Word[]>([])
const loading = ref(false)
const showPermanentDelete = ref(false)
const selectedIds = ref<Set<string>>(new Set())

onMounted(async () => {
  if (!auth.databaseId) return
  await wordService.cleanupRecycleBin(auth.databaseId)
  deletedWords.value = await wordService.getDeletedWords(auth.databaseId)
})

function daysLeft(deletedAt: string): number {
  const deleted = new Date(deletedAt)
  const expire = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000)
  const now = new Date()
  return Math.max(0, Math.ceil((expire.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
}

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

async function restoreSelected() {
  loading.value = true
  try {
    const ids = [...selectedIds.value]
    await wordService.restoreWords(ids)
    deletedWords.value = deletedWords.value.filter(w => !ids.includes(w.id))
    selectedIds.value = new Set()
  } finally {
    loading.value = false
  }
}

async function permanentDelete() {
  loading.value = true
  try {
    const ids = [...selectedIds.value]
    await wordService.permanentDeleteWords(ids)
    deletedWords.value = deletedWords.value.filter(w => !ids.includes(w.id))
    selectedIds.value = new Set()
    showPermanentDelete.value = false
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="recycle-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>回收站</h1>
    </div>

    <div class="page-content">
      <EmptyState
        v-if="deletedWords.length === 0"
        title="回收站是空的"
        description="被删除的单词将在这里保留7天"
      />

      <div v-else class="word-list">
        <div
          v-for="word in deletedWords"
          :key="word.id"
          :class="['recycle-item', { selected: selectedIds.has(word.id) }]"
          @click="toggleSelect(word.id)"
        >
          <div class="checkbox">
            <div :class="['check-inner', { checked: selectedIds.has(word.id) }]" />
          </div>
          <div class="item-info">
            <span class="item-content">{{ word.content }}</span>
            <span class="item-meta">剩余 {{ daysLeft(word.deleted_at!) }} 天自动清除</span>
          </div>
        </div>
      </div>

      <div v-if="selectedIds.size > 0" class="action-bar">
        <AppButton size="sm" :loading="loading" @click="restoreSelected">
          <RotateCcw :size="16" />
          恢复 ({{ selectedIds.size }})
        </AppButton>
        <AppButton variant="danger" size="sm" @click="showPermanentDelete = true">
          <Trash2 :size="16" />
          彻底删除
        </AppButton>
      </div>
    </div>

    <ConfirmDialog
      :visible="showPermanentDelete"
      title="彻底删除"
      message="删除后将无法恢复，确定要彻底删除吗？"
      confirm-text="彻底删除"
      :danger="true"
      @confirm="permanentDelete"
      @cancel="showPermanentDelete = false"
    />
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

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recycle-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-card);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.recycle-item.selected {
  background: var(--color-primary-light);
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

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-content {
  font-size: 15px;
  font-weight: 500;
}

.item-meta {
  font-size: 12px;
  color: var(--color-warning);
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  padding: 12px 20px calc(12px + var(--safe-bottom));
  display: flex;
  gap: 12px;
  justify-content: center;
  z-index: 50;
}
</style>
