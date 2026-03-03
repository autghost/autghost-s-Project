<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'
import TopBanner from '@/components/TopBanner.vue'
import { useAuthStore } from '@/stores/auth'
import { useWordsStore } from '@/stores/words'

const router = useRouter()
const auth = useAuthStore()
const wordsStore = useWordsStore()

interface WordItem {
  text: string
  isPhrase: boolean
  groupId: number | null
}

const items = ref<WordItem[]>([])
const loading = ref(false)
const selectionStart = ref<number | null>(null)
const selectionEnd = ref<number | null>(null)
const tapStart = ref<number | null>(null)
let nextGroupId = 1

const phraseColors = ['#4F6EF7', '#51CF66', '#FFA94D', '#E64980', '#845EF7', '#20C997']

onMounted(() => {
  const raw = sessionStorage.getItem('pending_words_raw')
  if (!raw) {
    router.replace('/words/add')
    return
  }
  const lines: string[] = JSON.parse(raw)
  const allTokens: string[] = []
  for (const line of lines) {
    const tokens = line.split(/\s+/).filter(Boolean)
    allTokens.push(...tokens)
  }
  items.value = allTokens.map(t => ({ text: t, isPhrase: false, groupId: null }))
})

function getGroupColor(groupId: number | null): string {
  if (groupId === null) return ''
  return phraseColors[(groupId - 1) % phraseColors.length]
}

function getChipIndexFromPoint(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  const chip = el.closest('[data-chip-index]') as HTMLElement | null
  if (!chip) return null
  const idx = parseInt(chip.dataset.chipIndex!, 10)
  return isNaN(idx) ? null : idx
}

function handleTouchStart(index: number) {
  if (items.value[index].groupId !== null) return
  selectionStart.value = index
  selectionEnd.value = index
}

function handleTouchMoveEvent(e: TouchEvent) {
  if (selectionStart.value === null) return
  const touch = e.touches[0]
  if (!touch) return
  const idx = getChipIndexFromPoint(touch.clientX, touch.clientY)
  if (idx === null) return
  if (items.value[idx].groupId !== null) return
  selectionEnd.value = idx
}

function handleMouseMove(index: number) {
  if (selectionStart.value === null) return
  if (items.value[index].groupId !== null) return
  selectionEnd.value = index
}

function handleChipClick(index: number) {
  const clicked = items.value[index]

  // 如果已经是短语的一部分：再次点击任意一个单词，整段短语取消
  if (clicked.groupId !== null) {
    const gid = clicked.groupId
    for (const item of items.value) {
      if (item.groupId === gid) {
        item.groupId = null
        item.isPhrase = false
      }
    }
    tapStart.value = null
    selectionStart.value = null
    selectionEnd.value = null
    return
  }

  // 第一次点击：作为起点，高亮并显示水波纹
  if (tapStart.value === null) {
    tapStart.value = index
    selectionStart.value = index
    selectionEnd.value = index
    return
  }

  const start = Math.min(tapStart.value, index)
  const end = Math.max(tapStart.value, index)

  if (start !== end) {
    const canMerge = items.value.slice(start, end + 1).every(i => i.groupId === null)
    if (canMerge) {
      const gid = nextGroupId++
      for (let i = start; i <= end; i++) {
        items.value[i].groupId = gid
        items.value[i].isPhrase = true
      }
    }
  }

  tapStart.value = null
  selectionStart.value = null
  selectionEnd.value = null
}

function handleTouchEnd() {
  if (selectionStart.value === null || selectionEnd.value === null) return
  const start = Math.min(selectionStart.value, selectionEnd.value)
  const end = Math.max(selectionStart.value, selectionEnd.value)

  if (start !== end) {
    const canMerge = items.value.slice(start, end + 1).every(i => i.groupId === null)
    if (canMerge) {
      const gid = nextGroupId++
      for (let i = start; i <= end; i++) {
        items.value[i].groupId = gid
        items.value[i].isPhrase = true
      }
    }
  }
  selectionStart.value = null
  selectionEnd.value = null
}

function isInSelection(index: number): boolean {
  if (selectionStart.value === null || selectionEnd.value === null) return false
  const start = Math.min(selectionStart.value, selectionEnd.value)
  const end = Math.max(selectionStart.value, selectionEnd.value)
  return index >= start && index <= end
}

const finalItems = computed(() => {
  const result: { content: string; is_phrase: boolean }[] = []
  const processedGroups = new Set<number>()

  for (const item of items.value) {
    if (item.groupId !== null) {
      if (processedGroups.has(item.groupId)) continue
      processedGroups.add(item.groupId)
      const groupItems = items.value.filter(i => i.groupId === item.groupId)
      result.push({
        content: groupItems.map(i => i.text).join(' '),
        is_phrase: true
      })
    } else {
      result.push({ content: item.text, is_phrase: false })
    }
  }
  return result
})

const phraseCount = computed(() => finalItems.value.filter(i => i.is_phrase).length)
const wordCount = computed(() => finalItems.value.filter(i => !i.is_phrase).length)

async function confirmAdd() {
  if (!auth.databaseId) return
  loading.value = true
  try {
    await wordsStore.addWords(auth.databaseId, finalItems.value)
    sessionStorage.removeItem('pending_words_raw')
    router.replace('/words')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="group-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>分组设置</h1>
    </div>

    <div class="page-content">
      <TopBanner type="info" message="点击首尾词选定短语" />

      <div
        class="chips-container"
        @touchmove.prevent="handleTouchMoveEvent"
        @touchend="handleTouchEnd"
        @mouseup="handleTouchEnd"
      >
        <span
          v-for="(item, idx) in items"
          :key="idx"
          :data-chip-index="idx"
          :class="[
            'chip',
            {
              selecting: isInSelection(idx),
              grouped: item.groupId !== null,
              'tap-start': tapStart === idx
            }
          ]"
          :style="item.groupId !== null ? { background: getGroupColor(item.groupId), color: '#fff' } : {}"
          @touchstart.prevent="handleTouchStart(idx)"
          @mousedown="handleTouchStart(idx)"
          @mouseover="handleMouseMove(idx)"
          @click="handleChipClick(idx)"
        >
          {{ item.text }}
        </span>
      </div>

      <p class="summary">
        共 {{ finalItems.length }} 个条目（{{ wordCount }} 单词 + {{ phraseCount }} 短语）
      </p>

      <AppButton block size="lg" :loading="loading" @click="confirmAdd">
        确认添加到词库 ✓
      </AppButton>
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

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px 0;
  user-select: none;
  -webkit-user-select: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 15px;
  font-family: var(--font-sans);
  background: var(--color-input-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}

.chip.selecting {
  background: var(--color-primary-light);
  outline: 2px solid var(--color-primary);
}

.chip.grouped {
  font-weight: 500;
}

.chip.tap-start::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    120deg,
    rgba(79, 110, 247, 0.2),
    rgba(81, 207, 102, 0.25),
    rgba(132, 94, 247, 0.25),
    rgba(79, 110, 247, 0.2)
  );
  background-size: 200% 200%;
  animation: chip-gradient 1.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes chip-gradient {
  0% {
    opacity: 0.9;
    background-position: 0% 50%;
  }
  100% {
    opacity: 0;
    background-position: 100% 50%;
  }
}

.summary {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}
</style>
