import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userInfo: null,
    permissions: []
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    
    // 用户名
    username: (state) => state.userInfo?.username || '',
    
    // 用户角色
    roles: (state) => state.userInfo?.roles || []
  },

  actions: {
    // 登录
    async login(loginForm) {
      const data = await login(loginForm)
      const token = data?.token || data?.access_token || data?.accessToken
      if (!token) {
        throw new Error('登录接口未返回 Token')
      }
      this.token = token
      localStorage.setItem('admin_token', token)
      return data
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const data = await getUserInfo()
        this.userInfo = data
        this.permissions = data.permissions || []
        return data
      } catch (error) {
        throw error
      }
    },

    // 登出
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.token = ''
        this.userInfo = null
        this.permissions = []
        localStorage.removeItem('admin_token')
      }
    },

    // 检查权限
    hasPermission(permission) {
      return this.permissions.includes(permission)
    }
  }
})
