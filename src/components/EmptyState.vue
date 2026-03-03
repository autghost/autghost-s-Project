<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

defineProps<{
  icon?: any
  title: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <component :is="icon || Inbox" :size="56" :stroke-width="1.2" class="empty-icon" />
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  color: var(--color-text-hint);
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}

.empty-state p {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 260px;
}
</style>
