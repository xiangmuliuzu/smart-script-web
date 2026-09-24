import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { usePermissionStore } from '@/stores/permission'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    user: null,
    roles: [],
    permissions: [],
    infoLoaded: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.user?.nickName || state.user?.userName || '',
    userId: (state) => state.user?.userId || null
  },

  actions: {
    async login(loginForm) {
      const payload = {
        username: loginForm.username,
        password: loginForm.password
      }
      if (loginForm.code !== undefined && loginForm.code !== null && loginForm.code !== '') {
        payload.code = loginForm.code
      }
      if (loginForm.uuid) {
        payload.uuid = loginForm.uuid
      }
      const data = await loginApi(payload)
      const token = data?.token
      if (!token) {
        throw new Error('登录接口未返回 Token')
      }
      this.token = token
      setToken(token)
      return data
    },

    async fetchUserInfo() {
      const data = await getInfo()
      const user = data?.user || null
      this.user = user
      this.roles = Array.isArray(data?.roles) ? [...data.roles] : []
      const perms = data?.permissions
      this.permissions = Array.isArray(perms)
        ? [...perms]
        : perms && typeof perms === 'object'
          ? [...perms]
          : []
      this.infoLoaded = true
      return data
    },

    async logout({ callServer = true } = {}) {
      if (callServer && this.token) {
        try {
          await logoutApi()
        } catch (error) {
          console.error('退出接口失败，仍清理本地会话:', error?.message || error)
        }
      }
      this.resetSession()
    },

    resetSession() {
      this.token = ''
      this.user = null
      this.roles = []
      this.permissions = []
      this.infoLoaded = false
      removeToken()
      try {
        usePermissionStore().resetRoutes()
      } catch (e) {
        // store may not be active during early failures
      }
    },

    hasPermission(permission) {
      if (!permission) return true
      if (this.permissions.includes('*:*:*')) return true
      return this.permissions.includes(permission)
    }
  }
})
