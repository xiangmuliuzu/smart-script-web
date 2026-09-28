import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getUserToken, removeUserToken, removeUserRefreshToken, removeAccountType } from '@/utils/auth'

/**
 * PC 用户端（App 凭证域）专用请求封装：
 *   - 携带 PcUser-Token（App access token），与若依管理端 request.js 互不复用；
 *   - 响应为 App 契约信封 { code, message, data }，成功时直接返回 data；
 *   - 401（令牌过期/无效）清理用户端会话后回登录页。
 * 不做 silent refresh：刷新令牌仅落盘备用，过期即要求重新登录，避免跨域凭据复杂化。
 */
const BASE_API = import.meta.env.VITE_APP_BASE_API || ''

const request = axios.create({
  baseURL: BASE_API,
  timeout: 15000
})

let redirectingToLogin = false

function toLogin(message) {
  if (message) {
    ElMessage.error(message)
  }
  if (redirectingToLogin) {
    return
  }
  redirectingToLogin = true
  removeUserToken()
  removeUserRefreshToken()
  removeAccountType()
  const current = window.location.pathname + window.location.search
  const target = current && !current.startsWith('/login')
    ? `/login?redirect=${encodeURIComponent(current)}`
    : '/login'
  window.location.href = target
}

request.interceptors.request.use(
  config => {
    const token = getUserToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res?.code === 401) {
      toLogin(res?.message || '登录状态已过期，请重新登录')
      return Promise.reject(new Error(res?.message || 'Unauthorized'))
    }
    if (res?.code !== undefined && res.code !== 200) {
      const message = res.message || '请求失败'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
    return res?.data
  },
  error => {
    const status = error.response?.status
    const msg = error.response?.data?.message || error.response?.data?.msg
    if (status === 401) {
      toLogin(msg || '未授权，请重新登录')
    } else if (status === 403) {
      ElMessage.error(msg || '权限不足')
    } else if (status === 404) {
      ElMessage.error(msg || '请求的资源不存在')
    } else {
      ElMessage.error(msg || error.message || '网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export function resetPcLoginRedirectFlag() {
  redirectingToLogin = false
}

export default request
