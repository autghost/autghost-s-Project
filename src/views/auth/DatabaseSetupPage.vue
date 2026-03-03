<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Link2 } from 'lucide-vue-next'
import AppButton from '@/components/AppButton.vue'
import InputField from '@/components/InputField.vue'
import { useAuthStore } from '@/stores/auth'
import * as dbService from '@/services/databaseService'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'create' | 'join' | null>(null)
const inviteCode = ref('')
const loading = ref(false)
const error = ref('')

async function handleConfirm() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'create') {
      const db = await dbService.createWordDatabase(auth.user.id)
      auth.setDatabaseId(db.id)
    } else if (mode.value === 'join') {
      if (!/^\d{6}$/.test(inviteCode.value)) {
        error.value = '请输入6位数字邀请码'
        loading.value = false
        return
      }
      const dbId = await dbService.joinByInviteCode(auth.user.id, inviteCode.value)
      auth.setDatabaseId(dbId)
    }
    router.replace('/home')
  } catch (e: any) {
    error.value = e.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="setup-page page-no-tab">
    <div class="page-content">
      <div class="header-area">
        <h1>账号创建成功！</h1>
        <p class="subtitle">请选择数据库方式</p>
      </div>

      <div class="options">
        <div
          :class="['option-card', { active: mode === 'create' }]"
          @click="mode = 'create'"
        >
          <Package :size="28" class="option-icon" />
          <div>
            <h3>创建全新数据库</h3>
            <p>创建属于你的单词库，开始录入和管理单词</p>
          </div>
        </div>

        <div
          :class="['option-card', { active: mode === 'join' }]"
          @click="mode = 'join'"
        >
          <Link2 :size="28" class="option-icon" />
          <div>
            <h3>绑定已有数据库</h3>
            <p>输入邀请码加入已有单词库</p>
          </div>
          <div v-if="mode === 'join'" class="invite-input" @click.stop>
            <InputField
              v-model="inviteCode"
              placeholder="请输入6位邀请码"
            />
          </div>
        </div>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <AppButton
        block
        size="lg"
        :loading="loading"
        :disabled="!mode"
        @click="handleConfirm"
      >
        确认
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  background: var(--color-bg);
  display: flex;
  align-items: center;
}

.page-content {
  padding: 32px 20px;
  width: 100%;
}

.header-area {
  margin-bottom: 32px;
}

.header-area h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 15px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 2px solid transparent;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.option-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.option-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.option-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.option-card p {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.invite-input {
  width: 100%;
}

.form-error {
  font-size: 13px;
  color: var(--color-error);
  margin-bottom: 12px;
}
</style>
