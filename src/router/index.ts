import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: () => import('@/views/auth/WelcomePage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterPage.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/setup-database',
      name: 'setupDatabase',
      component: () => import('@/views/auth/DatabaseSetupPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/main/HomePage.vue'),
      meta: { requiresAuth: true, showTab: true }
    },
    {
      path: '/words',
      name: 'words',
      component: () => import('@/views/main/WordLibraryPage.vue'),
      meta: { requiresAuth: true, showTab: true }
    },
    {
      path: '/words/add',
      name: 'addWords',
      component: () => import('@/views/main/AddWordsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/words/group',
      name: 'groupWords',
      component: () => import('@/views/main/GroupingPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dictation/filter',
      name: 'dictationFilter',
      component: () => import('@/views/main/DictationFilterPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dictation/run',
      name: 'dictationRun',
      component: () => import('@/views/main/DictationPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/errors',
      name: 'errors',
      component: () => import('@/views/main/ErrorBookPage.vue'),
      meta: { requiresAuth: true, showTab: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/main/StatisticsPage.vue'),
      meta: { requiresAuth: true, showTab: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/main/SettingsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/recycle',
      name: 'recycleBin',
      component: () => import('@/views/main/RecycleBinPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings/add-to-home',
      name: 'addToHome',
      component: () => import('@/views/main/AddToHomePage.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')
  const hasDb = localStorage.getItem('current_database_id')

  if (to.meta.requiresAuth && !token) {
    return { name: 'welcome' }
  }

  if (token && !hasDb && to.name !== 'setupDatabase' && to.meta.requiresAuth) {
    return { name: 'setupDatabase' }
  }

  if (token && hasDb && (to.name === 'welcome' || to.name === 'login' || to.name === 'register')) {
    return { name: 'home' }
  }
})

export default router
