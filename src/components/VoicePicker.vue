<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Volume2, Check } from 'lucide-vue-next'
import { getEnglishVoices, getSavedVoiceName, saveVoiceName, speak, stop } from '@/services/ttsService'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const voices = ref<SpeechSynthesisVoice[]>([])
const selectedName = ref<string>('')
const playingName = ref<string>('')

onMounted(() => {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
})

function loadVoices() {
  voices.value = getEnglishVoices()
  const saved = getSavedVoiceName()
  if (saved && voices.value.some(v => v.name === saved)) {
    selectedName.value = saved
  } else if (voices.value.length > 0) {
    selectedName.value = voices.value[0].name
  }
}

function preview(name: string) {
  playingName.value = name
  speak('Have a nice day', name)
  setTimeout(() => { playingName.value = '' }, 2000)
}

function select(name: string) {
  selectedName.value = name
  saveVoiceName(name)
}

function handleClose() {
  stop()
  emit('close')
}

function formatLabel(voice: SpeechSynthesisVoice): string {
  const tag = voice.localService ? '本地' : '在线'
  return `${voice.name} (${voice.lang}, ${tag})`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="picker-overlay" @click.self="handleClose">
        <div class="picker-panel">
          <div class="picker-header">
            <h3>选择发音语音</h3>
            <button class="close-btn" @click="handleClose">
              <X :size="20" />
            </button>
          </div>

          <p class="picker-hint">点击试听，点选确认偏好</p>

          <div class="voice-list">
            <div
              v-for="voice in voices"
              :key="voice.name"
              :class="['voice-item', { active: selectedName === voice.name }]"
              @click="select(voice.name)"
            >
              <div class="voice-info">
                <Check v-if="selectedName === voice.name" :size="16" class="check-icon" />
                <div v-else class="check-placeholder" />
                <span class="voice-name">{{ formatLabel(voice) }}</span>
              </div>
              <button
                class="preview-btn"
                :class="{ playing: playingName === voice.name }"
                @click.stop="preview(voice.name)"
              >
                <Volume2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.picker-panel {
  background: var(--color-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--safe-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 8px;
}

.picker-header h3 {
  font-size: 17px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.close-btn:active {
  background: var(--color-input-bg);
}

.picker-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 0 20px 12px;
}

.voice-list {
  overflow-y: auto;
  padding: 0 12px 16px;
}

.voice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.voice-item:active {
  background: var(--color-input-bg);
}

.voice-item.active {
  background: var(--color-primary-light);
}

.voice-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.check-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.check-placeholder {
  width: 16px;
  flex-shrink: 0;
}

.voice-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: var(--color-card);
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.preview-btn:active,
.preview-btn.playing {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
