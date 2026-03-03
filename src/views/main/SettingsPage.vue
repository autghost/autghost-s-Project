<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, User, Database, Key, Trash2, Smartphone, LogOut, ChevronRight, Copy, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import * as dbService from '@/services/databaseService'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const auth = useAuthStore()

const showLogoutConfirm = ref(false)
const showInviteCode = ref(false)
const inviteCode = ref('')
const codeLoading = ref(false)
const codeCopied = ref(false)

async function generateCode() {
  if (!auth.databaseId) return
  codeLoading.value = true
  try {
    inviteCode.value = await dbService.generateInviteCode(auth.databaseId)
    showInviteCode.value = true
  } finally {
    codeLoading.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(inviteCode.value)
  codeCopied.value = true
  setTimeout(() => { codeCopied.value = false }, 2000)
}

async function handleLogout() {
  await auth.logout()
  showLogoutConfirm.value = false
  router.replace('/')
}

const menuItems = ref([
  { icon: User, label: '账号信息', desc: '', action: () => {} },
  { icon: Database, label: '数据库管理', desc: '', action: () => {} },
  { icon: Key, label: '生成邀请码', desc: '邀请他人共享单词库', action: generateCode },
  { icon: Trash2, label: '数据回收站', desc: '', action: () => router.push('/settings/recycle') },
  { icon: Smartphone, label: '添加到桌面教程', desc: '获得类原生App体验', action: () => router.push('/settings/add-to-home') }
])

onMounted(() => {
  const phoneMasked = auth.phone
    ? auth.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
    : ''
  menuItems.value[0].desc = phoneMasked
})
</script>

<template>
  <div class="settings-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>设置</h1>
    </div>

    <div class="page-content">
      <div class="menu-list">
        <button
          v-for="item in menuItems"
          :key="item.label"
          class="menu-item"
          @click="item.action"
        >
          <component :is="item.icon" :size="20" class="menu-icon" />
          <div class="menu-info">
            <span class="menu-label">{{ item.label }}</span>
            <span v-if="item.desc" class="menu-desc">{{ item.desc }}</span>
          </div>
          <ChevronRight :size="18" class="menu-arrow" />
        </button>
      </div>

      <AppButton
        variant="danger"
        block
        @click="showLogoutConfirm = true"
        style="margin-top: 32px;"
      >
        <LogOut :size="18" />
        退出登录
      </AppButton>
    </div>

    <!-- Invite Code Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showInviteCode" class="modal-overlay" @click.self="showInviteCode = false">
          <div class="modal-card">
            <h3>邀请码</h3>
            <p class="modal-hint">分享给他人，有效期24小时</p>
            <div class="code-display">{{ inviteCode }}</div>
            <AppButton block @click="copyCode">
              <component :is="codeCopied ? Check : Copy" :size="16" />
              {{ codeCopied ? '已复制' : '复制邀请码' }}
            </AppButton>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmDialog
      :visible="showLogoutConfirm"
      message="确定要退出登录吗？"
      confirm-text="退出"
      :danger="true"
      @confirm="handleLogout"
      @cancel="showLogoutConfirm = false"
    />
  </div>
</template>

<style scoped>
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

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--color-card);
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
}

.menu-item:active {
  background: var(--color-input-bg);
}

.menu-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.menu-label {
  font-size: 15px;
  font-weight: 500;
}

.menu-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.menu-arrow {
  color: var(--color-text-hint);
  flex-shrink: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  width: 100%;
  max-width: 300px;
  text-align: center;
}

.modal-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.modal-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.code-display {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 8px;
  color: var(--color-primary);
  padding: 16px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-family: var(--font-mono);
}
</style>
