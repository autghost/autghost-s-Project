<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Volume2, Settings2 } from 'lucide-vue-next'
import { useDictationStore } from '@/stores/dictation'
import { useWordsStore } from '@/stores/words'
import { useAuthStore } from '@/stores/auth'
import { updateDictationResults } from '@/services/wordService'
import { saveDictationSession } from '@/services/dictationService'
import { speak } from '@/services/ttsService'
import { translate, getCachedTranslation } from '@/services/translateService'
import TopBanner from '@/components/TopBanner.vue'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VoicePicker from '@/components/VoicePicker.vue'

const router = useRouter()
const dictation = useDictationStore()
const wordsStore = useWordsStore()
const auth = useAuthStore()

const translations = reactive<Record<string, string>>({})

const finalWords = computed(() => dictation.getFinalWords())

onMounted(() => {
  for (const word of finalWords.value) {
    const cached = getCachedTranslation(word.content)
    if (cached) {
      translations[word.id] = cached
    } else {
      translate(word.content).then(t => { translations[word.id] = t })
    }
  }
})
const wrongCount = computed(() => dictation.wrongIds.size)
const showExitConfirm = ref(false)
const showVoicePicker = ref(false)
const saving = ref(false)

function playWord(content: string) {
  speak(content)
}

async function handleComplete() {
  saving.value = true
  try {
    const results = dictation.getResults()
    const today = new Date().toISOString().split('T')[0]

    await updateDictationResults(results, today, wordsStore.words)

    const total = results.length
    const correct = results.filter(r => r.correct).length
    if (auth.databaseId) {
      await saveDictationSession(auth.databaseId, total, correct)
    }

    wordsStore.updateLocalDictationResults(results)
    dictation.reset()
    router.replace('/home')
  } catch (e: any) {
    console.error('保存听写结果失败:', e)
    wordsStore.updateLocalDictationResults(dictation.getResults())
    dictation.reset()
    router.replace('/home')
  } finally {
    saving.value = false
  }
}

function handleExit() {
  showExitConfirm.value = true
}

function confirmExit() {
  dictation.reset()
  showExitConfirm.value = false
  router.replace('/home')
}
</script>

<template>
  <div class="dictation-page page-no-tab">
    <div class="page-header">
      <h1>听写进行中</h1>
      <div class="header-right">
        <span class="wrong-count" v-if="wrongCount > 0">{{ wrongCount }}/{{ finalWords.length }} 已标记</span>
        <button class="voice-setting-btn" @click="showVoicePicker = true" title="语音设置">
          <Settings2 :size="20" />
        </button>
      </div>
    </div>

    <div class="page-content">
      <TopBanner type="info" message="写错的点亮，写对的无需操作" />

      <div class="word-list">
        <div
          v-for="(word, idx) in finalWords"
          :key="word.id"
          :class="['dictation-item', { wrong: dictation.wrongIds.has(word.id) }]"
          @click="dictation.toggleWrong(word.id)"
        >
          <span class="item-index">{{ idx + 1 }}.</span>
          <div class="item-info">
            <span class="item-text">{{ word.content }}</span>
            <span v-if="translations[word.id]" class="item-translation">{{ translations[word.id] }}</span>
          </div>
          <button class="play-btn" @click.stop="playWord(word.content)">
            <Volume2 :size="18" />
          </button>
        </div>
      </div>

      <div class="action-bar">
        <AppButton variant="outline" size="md" @click="handleExit" style="flex: 1;">
          退出
        </AppButton>
        <AppButton size="md" :loading="saving" @click="handleComplete" style="flex: 1;">
          完成
        </AppButton>
      </div>
    </div>

    <ConfirmDialog
      :visible="showExitConfirm"
      title="提示"
      message="本次听写记录将不被保存，是否确认退出？"
      confirm-text="确认退出"
      cancel-text="取消"
      :danger="true"
      @confirm="confirmExit"
      @cancel="showExitConfirm = false"
    />

    <VoicePicker
      :visible="showVoicePicker"
      @close="showVoicePicker = false"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wrong-count {
  font-size: 13px;
  color: var(--color-error);
  font-weight: 500;
}

.voice-setting-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.voice-setting-btn:active {
  background: var(--color-input-bg);
  color: var(--color-primary);
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
}

.dictation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-card);
  border-radius: var(--radius-md);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.dictation-item.wrong {
  background: var(--color-error-light);
  border-left-color: var(--color-error);
}

.item-index {
  font-size: 14px;
  color: var(--color-text-secondary);
  min-width: 28px;
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
  transition: transform 0.15s;
}

.play-btn:active {
  transform: scale(0.9);
}

.action-bar {
  display: flex;
  gap: 12px;
  padding: 16px 0 32px;
}
</style>
