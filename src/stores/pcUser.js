import { defineStore } from 'pinia'
import { getMe, appLogout } from '@/api/pcUser'
import {
  getUserToken, setUserToken, removeUserToken,
  getUserRefreshToken, setUserRefreshToken, removeUserRefreshToken,
  setAccountType, removeAccountType
} from '@/utils/auth'

/**
 * PC 用户端会话（01/02/03 共用）：持有 App 凭证域 access/refresh 令牌，
 * 与管理员 user store 完全隔离，两类令牌互不混用。
 */
export const usePcUserStore = defineStore('pcUser', {
  state: () => ({
    token: getUserToken(),
    refreshToken: getUserRefreshToken(),
    user: null,
    infoLoaded: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    displayName: (state) => state.user?.nickname || state.user?.userName || '用户',
    userType: (state) => state.user?.userType || ''
  },

  actions: {
    /** 统一登录成功后写入会话；accountType 为服务端确认的 01/02/03 */
    setSession(session, accountType) {
      this.token = session?.accessToken || ''
      this.refreshToken = session?.refreshToken || ''
      this.user = session?.user || null
      this.infoLoaded = !!this.token
      setUserToken(this.token)
      if (this.refreshToken) {
        setUserRefreshToken(this.refreshToken)
      }
      setAccountType(accountType)
    },

    /** 拉取/刷新当前用户信息（/api/v1/auth/me） */
    async fetchMe() {
      const me = await getMe()
      if (me) {
        this.user = { ...(this.user || {}), ...me }
      }
      this.infoLoaded = true
      return me
    },

    async logout() {
      if (this.token) {
        try {
          await appLogout()
        } catch (error) {
          // 服务端吊销失败不影响本地退出
          console.error('用户端退出接口失败，仍清理本地会话:', error?.message || error)
        }
      }
      this.resetSession()
    },

    resetSession() {
      this.token = ''
      this.refreshToken = ''
      this.user = null
      this.infoLoaded = false
      removeUserToken()
      removeUserRefreshToken()
      removeAccountType()
    }
  }
})

export default usePcUserStore
