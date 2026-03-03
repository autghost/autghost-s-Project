<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'outline' | 'text' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    :class="[
      'app-btn',
      `app-btn--${variant || 'primary'}`,
      `app-btn--${size || 'md'}`,
      { 'app-btn--block': block, 'app-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.app-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.app-btn--sm {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
}

.app-btn--md {
  height: 48px;
  padding: 0 24px;
  font-size: 15px;
}

.app-btn--lg {
  height: 52px;
  padding: 0 28px;
  font-size: 16px;
}

.app-btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.app-btn--primary:active:not(:disabled) {
  background: var(--color-primary-dark);
}

.app-btn--outline {
  background: transparent;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
}

.app-btn--text {
  background: transparent;
  color: var(--color-primary);
}

.app-btn--danger {
  background: transparent;
  color: var(--color-error);
}

.app-btn--block {
  width: 100%;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.app-btn--outline .spinner {
  border-color: rgba(79, 110, 247, 0.3);
  border-top-color: var(--color-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
