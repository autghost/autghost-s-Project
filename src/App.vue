<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'
import OfflineBanner from './components/OfflineBanner.vue'
import { initOnlineListener, syncPendingOperations } from './services/syncService'
import { preloadVoices } from './services/ttsService'

const route = useRoute()
const showTabBar = computed(() => route.meta.showTab === true)

onMounted(() => {
  initOnlineListener()
  syncPendingOperations()
  preloadVoices()
})
</script>

<template>
  <div class="app-container">
    <OfflineBanner />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="showTabBar" />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}
</style>
