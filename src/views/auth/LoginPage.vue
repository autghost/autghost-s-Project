<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Phone, Lock } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'
import InputField from '@/components/InputField.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const phone = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!phone.value || !password.value) {
    error.value = '请填写手机号和密码'
    return
  }
  try {
    await auth.login(phone.value, password.value)
    router.replace(auth.hasDatabase ? '/home' : '/setup-database')
  } catch (e: any) {
    error.value = e.message === 'Invalid login credentials'
      ? '手机号或密码错误'
      : e.message || '登录失败'
  }
}
</script>

<template>
  <div class="login-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
    </div>
    <div class="page-content">
      <h1>欢迎回来</h1>
      <p class="subtitle">登录你的账号</p>

      <div class="form-area">
        <InputField
          v-model="phone"
          placeholder="手机号"
          :icon="Phone"
        />
        <InputField
          v-model="password"
          placeholder="密码"
          type="password"
          :icon="Lock"
        />
        <p v-if="error" class="form-error">{{ error }}</p>
        <AppButton block size="lg" :loading="auth.loading" @click="handleLogin">
          登录
        </AppButton>
      </div>

      <p class="switch-link">
        还没有账号？<router-link to="/register">立即注册 →</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: #fff;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;
}

.back-btn:active {
  background: var(--color-input-bg);
}

.page-content h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 15px;
  margin-bottom: 32px;
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-error {
  font-size: 13px;
  color: var(--color-error);
}

.switch-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
