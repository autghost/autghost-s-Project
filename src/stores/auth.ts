import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'
import * as dbService from '@/services/databaseService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const databaseId = ref<string | null>(localStorage.getItem('current_database_id'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const hasDatabase = computed(() => !!databaseId.value)
  const phone = computed(() => user.value?.user_metadata?.phone || '')

  async function init() {
    const currentUser = await authService.getCurrentUser()
    if (currentUser) {
      user.value = currentUser
      localStorage.setItem('auth_token', 'true')
      if (!databaseId.value) {
        const dbId = await dbService.getUserDatabase(currentUser.id)
        if (dbId) {
          databaseId.value = dbId
          localStorage.setItem('current_database_id', dbId)
        }
      }
    }
  }

  async function register(phone: string, password: string) {
    loading.value = true
    try {
      const data = await authService.register(phone, password)
      user.value = data.user
      localStorage.setItem('auth_token', 'true')
      return data
    } finally {
      loading.value = false
    }
  }

  async function login(phone: string, password: string) {
    loading.value = true
    try {
      const data = await authService.login(phone, password)
      user.value = data.user
      localStorage.setItem('auth_token', 'true')
      const dbId = await dbService.getUserDatabase(data.user!.id)
      if (dbId) {
        databaseId.value = dbId
        localStorage.setItem('current_database_id', dbId)
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authService.logout()
    user.value = null
    databaseId.value = null
  }

  function setDatabaseId(id: string) {
    databaseId.value = id
    localStorage.setItem('current_database_id', id)
  }

  return { user, databaseId, loading, isLoggedIn, hasDatabase, phone, init, register, login, logout, setDatabaseId }
})
