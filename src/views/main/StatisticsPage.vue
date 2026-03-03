<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js'
import { useAuthStore } from '@/stores/auth'
import { useWordsStore } from '@/stores/words'
import { getRecentSessions, getTotalSessionCount } from '@/services/dictationService'
import type { DictationSession } from '@/services/dictationService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const auth = useAuthStore()
const wordsStore = useWordsStore()

const sessions = ref<DictationSession[]>([])
const totalSessions = ref(0)
const loaded = ref(false)

onMounted(async () => {
  try {
    if (!auth.databaseId) { loaded.value = true; return }
    if (wordsStore.words.length === 0) {
      await wordsStore.loadWords(auth.databaseId)
    }
    sessions.value = await getRecentSessions(auth.databaseId)
    totalSessions.value = await getTotalSessionCount(auth.databaseId)
  } catch (e) {
    console.error('加载统计数据失败:', e)
  } finally {
    loaded.value = true
  }
})

const chartData = computed(() => {
  const last7Days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    last7Days.push(d.toISOString().split('T')[0])
  }

  const dailyAccuracy = last7Days.map(date => {
    const daySessions = sessions.value.filter(s => s.session_date === date)
    if (daySessions.length === 0) return null
    const total = daySessions.reduce((s, d) => s + d.total_words, 0)
    const correct = daySessions.reduce((s, d) => s + d.correct_words, 0)
    return total > 0 ? Math.round((correct / total) * 100) : null
  })

  return {
    labels: last7Days.map(d => d.slice(5)),
    datasets: [{
      data: dailyAccuracy,
      borderColor: '#4F6EF7',
      backgroundColor: 'rgba(79, 110, 247, 0.1)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#4F6EF7',
      pointRadius: 4,
      spanGaps: true
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { callback: (v: any) => v + '%', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.04)' }
    },
    x: {
      ticks: { font: { size: 11 } },
      grid: { display: false }
    }
  }
}

const dailyAverage = computed(() => {
  if (sessions.value.length === 0) return '0'
  const total = sessions.value.reduce((s, d) => s + 1, 0)
  return (total / 7).toFixed(1)
})

const errorRanking = computed(() => {
  return wordsStore.words
    .filter(w => w.total_dictation_count > w.correct_count)
    .map(w => ({
      content: w.content,
      errorCount: w.total_dictation_count - w.correct_count,
      lastDate: w.last_dictation_date
    }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10)
})

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
</script>

<template>
  <div class="stats-page page">
    <div class="page-header">
      <h1>学习统计</h1>
    </div>

    <div class="page-content" v-if="loaded">
      <div class="chart-card">
        <h3>近7天听写正确率</h3>
        <div class="chart-wrapper">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="freq-grid">
        <div class="freq-card">
          <span class="freq-num">{{ totalSessions }}</span>
          <span class="freq-label">累计听写总次数</span>
        </div>
        <div class="freq-card">
          <span class="freq-num">{{ dailyAverage }}</span>
          <span class="freq-label">日均(7天)听写次数</span>
        </div>
      </div>

      <div class="ranking-card">
        <h3>易错单词排行</h3>
        <div v-if="errorRanking.length === 0" class="ranking-empty">
          暂无数据
        </div>
        <div v-else class="ranking-list">
          <div v-for="(item, idx) in errorRanking" :key="item.content" class="ranking-item">
            <span
              :class="['rank-num', { medal: idx < 3 }]"
              :style="idx < 3 ? { background: medalColors[idx], color: '#fff' } : {}"
            >
              {{ idx + 1 }}
            </span>
            <span class="rank-word">{{ item.content }}</span>
            <span class="rank-error">错{{ item.errorCount }}次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
}

.chart-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.chart-wrapper {
  height: 200px;
}

.freq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.freq-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.freq-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.freq-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
}

.ranking-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
}

.ranking-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
}

.ranking-empty {
  font-size: 14px;
  color: var(--color-text-hint);
  text-align: center;
  padding: 20px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-input-bg);
  flex-shrink: 0;
}

.rank-num.medal {
  font-size: 11px;
}

.rank-word {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.rank-error {
  font-size: 13px;
  color: var(--color-error);
  font-weight: 500;
}
</style>
