<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WifiOff } from 'lucide-vue-next'

const isOffline = ref(!navigator.onLine)

function handleOnline() { isOffline.value = false }
function handleOffline() { isOffline.value = true }

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<template>
  <Transition name="slide-down">
    <div v-if="isOffline" class="offline-banner">
      <WifiOff :size="14" />
      <span>当前离线，数据将在联网后同步</span>
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: var(--color-warning);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  z-index: 200;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateX(-50%) translateY(-100%);
}
</style>
