<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Smartphone } from 'lucide-vue-next'

const router = useRouter()

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const activeTab = ref<'ios' | 'android'>(isIOS ? 'ios' : 'android')
</script>

<template>
  <div class="add-home-page page-no-tab">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <h1>添加到桌面</h1>
    </div>

    <div class="page-content">
      <div class="intro">
        <Smartphone :size="32" class="intro-icon" />
        <p>将听写助手添加到手机桌面，获得类似原生App的全屏体验</p>
      </div>

      <div class="tab-switch">
        <button
          :class="['tab-btn', { active: activeTab === 'ios' }]"
          @click="activeTab = 'ios'"
        >
          iOS Safari
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'android' }]"
          @click="activeTab = 'android'"
        >
          Android Chrome
        </button>
      </div>

      <div v-if="activeTab === 'ios'" class="steps">
        <div class="step">
          <span class="step-num">1</span>
          <div class="step-content">
            <h4>用 Safari 浏览器打开本页面</h4>
            <p>其他浏览器（如微信内置）不支持添加到桌面</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <div class="step-content">
            <h4>点击底部分享按钮</h4>
            <p>Safari 底部工具栏中间的方形带箭头图标</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <div class="step-content">
            <h4>选择「添加到主屏幕」</h4>
            <p>在弹出的菜单中向下滚动找到此选项</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <div class="step-content">
            <h4>点击右上角「添加」</h4>
            <p>确认名称后点击添加，图标即出现在桌面</p>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'android'" class="steps">
        <div class="step">
          <span class="step-num">1</span>
          <div class="step-content">
            <h4>用 Chrome 浏览器打开本页面</h4>
            <p>华为/小米自带浏览器通常也支持</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <div class="step-content">
            <h4>点击右上角菜单 ⋮</h4>
            <p>Chrome 地址栏右侧的三点图标</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <div class="step-content">
            <h4>选择「添加到主屏幕」或「安装应用」</h4>
            <p>不同浏览器文字可能略有不同</p>
          </div>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <div class="step-content">
            <h4>确认安装</h4>
            <p>点击确认后图标将出现在桌面</p>
          </div>
        </div>
      </div>
    </div>
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

.intro {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--color-primary-light);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.intro-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.intro p {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.tab-switch {
  display: flex;
  background: var(--color-input-bg);
  border-radius: var(--radius-pill);
  padding: 3px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.step-content p {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
</style>
