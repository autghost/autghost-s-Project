<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Headphones } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
</script>

<template>
  <div class="welcome-page page-no-tab">
    <div class="welcome-content">
      <div class="logo-area">
        <div class="logo-circle">
          <Headphones :size="48" :stroke-width="1.5" />
        </div>
        <h1>听写助手</h1>
        <p>让英语背诵更高效</p>
      </div>
      <div class="action-area">
        <AppButton block size="lg" @click="router.push('/register')">
          新建账号
        </AppButton>
        <AppButton block size="lg" variant="outline" @click="router.push('/login')">
          登录
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #F8F9FD 0%, #EEF2FF 100%);
}

.welcome-content {
  width: 100%;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 64px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.6s ease-out;
}

.logo-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 8px 32px rgba(79, 110, 247, 0.3);
}

.logo-area h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.logo-area p {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.action-area {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeUp 0.6s ease-out 0.2s both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
