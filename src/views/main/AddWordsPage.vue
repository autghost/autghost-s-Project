<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()

const inputText = ref('')

function normalizeLine(line: string): string {
  // 1) 非字母和空格全部替换成空格
  // 2) 多个空格压缩成一个
  return line
    .replace(/[^A-Za-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const parsedCount = computed(() => {
  if (!inputText.value.trim()) return 0
  return inputText.value
    .trim()
    .split(/[\n]+/)
    .map(l => normalizeLine(l))
    .filter(line => line)
    .length
})

function goToGroup() {
  if (parsedCount.value === 0) return
  const lines = inputText.value
    .trim()
    .split(/[\n]+/)
    .map(l => normalizeLine(l))
    .filter(Boolean)
  sessionStorage.setItem('pending_words_raw', JSON.stringify(lines))
  router.push('/words/group')
}
</script>

<template>
  <div class="add-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>添加单词</h1>
    </div>

    <div class="page-content">
      <p class="hint-text">请输入单词或短语，每行一个，也可直接粘贴整段内容</p>

      <textarea
        v-model="inputText"
        class="word-textarea"
        placeholder="apple&#10;good morning&#10;banana&#10;how are you&#10;teacher"
      />

      <p class="count-text" v-if="parsedCount > 0">
        已识别 <strong>{{ parsedCount }}</strong> 个条目
      </p>

      <AppButton
        block
        size="lg"
        :disabled="parsedCount === 0"
        @click="goToGroup"
      >
        下一步：分组 →
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

.hint-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.word-textarea {
  width: 100%;
  min-height: 45vh;
  padding: 16px;
  font-size: 16px;
  font-family: var(--font-sans);
  line-height: 1.8;
  background: var(--color-input-bg);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  resize: none;
  color: var(--color-text);
  transition: border-color 0.2s;
}

.word-textarea:focus {
  border-color: var(--color-primary);
  background: #fff;
}

.word-textarea::placeholder {
  color: var(--color-text-hint);
}

.count-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 12px 0 20px;
}

.count-text strong {
  color: var(--color-primary);
}
</style>
