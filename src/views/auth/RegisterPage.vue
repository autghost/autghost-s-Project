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
const confirmPassword = ref('')
const error = ref('')

function validatePassword(pw: string): boolean {
  if (pw.length < 6 || pw.length > 16) return false
  return /[a-zA-Z]/.test(pw) && /\d/.test(pw)
}

async function handleRegister() {
  error.value = ''
  if (!phone.value) {
    error.value = '请填写手机号'
    return
  }
  if (!/^1\d{10}$/.test(phone.value)) {
    error.value = '请输入正确的手机号'
    return
  }
  if (!validatePassword(password.value)) {
    error.value = '密码需6-16位，包含数字与字母'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码输入不一致'
    return
  }
  try {
    await auth.register(phone.value, password.value)
    router.replace('/setup-database')
  } catch (e: any) {
    error.value = e.message || '注册失败'
  }
}
</script>

<template>
  <div class="register-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
    </div>
    <div class="page-content">
      <h1>创建账号</h1>
      <p class="subtitle">开始使用听写助手</p>

      <div class="form-area">
        <InputField
          v-model="phone"
          placeholder="手机号"
          :icon="Phone"
        />
        <div>
          <InputField
            v-model="password"
            placeholder="密码"
            type="password"
            :icon="Lock"
          />
          <p class="hint">6-16位，需包含数字与字母</p>
        </div>
        <InputField
          v-model="confirmPassword"
          placeholder="确认密码"
          type="password"
          :icon="Lock"
        />
        <p v-if="error" class="form-error">{{ error }}</p>
        <AppButton block size="lg" :loading="auth.loading" @click="handleRegister">
          注册
        </AppButton>
      </div>

      <p class="switch-link">
        已有账号？<router-link to="/login">去登录 →</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
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

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-hint);
  padding-left: 4px;
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
