<script setup lang="ts">
defineProps<{
  visible: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="dialog-overlay" @click.self="emit('cancel')">
        <div class="dialog-card">
          <h3 v-if="title" class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn--cancel" @click="emit('cancel')">
              {{ cancelText || '取消' }}
            </button>
            <button
              :class="['dialog-btn', danger ? 'dialog-btn--danger' : 'dialog-btn--confirm']"
              @click="emit('confirm')"
            >
              {{ confirmText || '确认' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialog-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: var(--shadow-lg);
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}

.dialog-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 20px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.dialog-btn {
  flex: 1;
  height: 42px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.dialog-btn:active {
  opacity: 0.8;
}

.dialog-btn--cancel {
  background: var(--color-input-bg);
  color: var(--color-text-secondary);
}

.dialog-btn--confirm {
  background: var(--color-primary);
  color: #fff;
}

.dialog-btn--danger {
  background: var(--color-error);
  color: #fff;
}
</style>
