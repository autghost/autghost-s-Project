<script setup lang="ts">
import { Volume2, AlertTriangle } from 'lucide-vue-next'

defineProps<{
  type?: 'info' | 'warning' | 'offline'
  message: string
}>()
</script>

<template>
  <div :class="['top-banner', `top-banner--${type || 'info'}`]">
    <AlertTriangle v-if="type === 'warning' || type === 'offline'" :size="16" />
    <Volume2 v-else :size="16" />
    <span>{{ message }}</span>
  </div>
</template>

<style scoped>
.top-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.4;
}

.top-banner--info {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.top-banner--warning {
  background: var(--color-warning-light);
  color: #E67E22;
}

.top-banner--offline {
  background: var(--color-warning-light);
  color: #E67E22;
  border-radius: 0;
}
</style>
