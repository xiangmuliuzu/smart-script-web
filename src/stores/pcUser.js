import { defineStore } from 'pinia'
import { getMe, appLogout } from '@/api/pcUser'
import { usePcUnreadStore } from '@/stores/pcUnread'
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
    userType: (state) => state.user?.userType || '',
    /**
     * 创作者能力唯一判断来源：/auth/me 的 authorCapability === true。
     * 角色、实名状态、userType 都不能替代；字段缺失视为无能力，
     * 信息未加载（user 为 null）时不显示作品管理入口。
     */
    authorCapability: (state) => state.user?.authorCapability === true,
    /** 是否已设置密码：决定账号安全区显示「修改密码」还是「设置密码」 */
    hasPassword: (state) => state.user?.hasPassword === true
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
      // 未读统计属当前用户：会话清理时一并清空，避免串到下一个登录用户
      usePcUnreadStore().reset()
    }
  }
})

export default usePcUserStore
