<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Volume2 } from 'lucide-vue-next'
import { speak } from '@/services/ttsService'
import { translate, getCachedTranslation } from '@/services/translateService'

const props = defineProps<{
  word: {
    id: string
    content: string
    is_phrase: boolean
    total_dictation_count: number
    correct_count: number
    last_dictation_date: string | null
    last_dictation_correct: boolean | null
  }
  selectable?: boolean
  selected?: boolean
  showStats?: boolean
}>()

const emit = defineEmits<{
  select: []
  play: []
}>()

const translation = ref('')

onMounted(() => {
  const cached = getCachedTranslation(props.word.content)
  if (cached) {
    translation.value = cached
  } else {
    translate(props.word.content).then(t => { translation.value = t })
  }
})

function playWord() {
  speak(props.word.content)
  emit('play')
}
</script>

<template>
  <div
    :class="['word-card', { 'word-card--phrase': word.is_phrase, 'word-card--selected': selected }]"
    @click="selectable ? emit('select') : undefined"
  >
    <div class="word-main">
      <div class="word-info">
        <span class="word-content">{{ word.content }}</span>
        <span v-if="translation" class="word-translation">{{ translation }}</span>
      </div>
      <button class="play-btn" @click.stop="playWord">
        <Volume2 :size="18" />
      </button>
    </div>
    <div v-if="showStats" class="word-stats">
      <template v-if="word.total_dictation_count > 0">
        <span>正确 {{ word.correct_count }}/{{ word.total_dictation_count }} 次</span>
        <span v-if="word.last_dictation_date">最近: {{ word.last_dictation_date }}</span>
      </template>
      <span v-else class="new-badge">未听写</span>
    </div>
  </div>
</template>

<style scoped>
.word-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.word-card--phrase {
  border-left-color: var(--color-primary);
}

.word-card--selected {
  background: var(--color-error-light);
  border-left-color: var(--color-error);
}

.word-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.word-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.word-content {
  font-size: 16px;
  font-weight: 500;
}

.word-translation {
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.8;
}

.word-card--selected .word-content {
  text-decoration: line-through;
  opacity: 0.5;
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
  transition: transform 0.15s;
  flex-shrink: 0;
}

.play-btn:active {
  transform: scale(0.9);
}

.word-stats {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.new-badge {
  color: var(--color-primary);
  font-weight: 500;
}
</style>
