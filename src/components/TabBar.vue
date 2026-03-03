<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, BookOpen, PenLine, CircleX, BarChart3 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'home', label: '首页', icon: Home },
  { name: 'words', label: '词库', icon: BookOpen },
  { name: 'dictationFilter', label: '听写', icon: PenLine },
  { name: 'errors', label: '错题', icon: CircleX },
  { name: 'stats', label: '统计', icon: BarChart3 }
]

const activeTab = computed(() => route.name as string)

function navigate(name: string) {
  router.push({ name })
}
</script>

<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab-item', { active: activeTab === tab.name }]"
      @click="navigate(tab.name)"
    >
      <component :is="tab.icon" :size="22" :stroke-width="activeTab === tab.name ? 2.5 : 1.8" />
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  height: calc(var(--tab-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s;
  min-width: 56px;
}

.tab-item span {
  font-size: 11px;
}

.tab-item.active {
  color: var(--color-primary);
}
</style>
