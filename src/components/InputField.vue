<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  type?: string
  icon?: any
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)
const showPassword = ref(false)

const isPassword = props.type === 'password'

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="input-wrapper">
    <div :class="['input-field', { focused, error: !!error }]">
      <component v-if="icon" :is="icon" :size="20" class="input-icon" />
      <input
        :type="isPassword && !showPassword ? 'password' : 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button
        v-if="isPassword"
        type="button"
        class="toggle-pw"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" :size="18" />
      </button>
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
}

.input-field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 16px;
  background: var(--color-input-bg);
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}

.input-field.focused {
  border-color: var(--color-primary);
  background: #fff;
}

.input-field.error {
  border-color: var(--color-error);
}

.input-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.input-field input {
  flex: 1;
  height: 100%;
  color: var(--color-text);
  font-size: 15px;
}

.input-field input::placeholder {
  color: var(--color-text-hint);
}

.toggle-pw {
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.error-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-error);
  padding-left: 4px;
}
</style>
