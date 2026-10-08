import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getUserToken, removeUserToken, removeUserRefreshToken, removeAccountType } from '@/utils/auth'

/**
 * PC 用户端（App 凭证域）专用请求封装：
 *   - 携带 App 用户 Bearer Token，与若依管理端 request.js 互不复用；
 *   - 响应为 App 契约信封 { code, message, data }，成功时直接返回 data；
 *   - HTTP 401 或明确的认证失效业务码（40100，兼容历史 401）清理用户端
 *     会话后回登录页；账号停用业务码 40301 同样清理会话；
 *   - 并发失效只触发一次跳转与一次提示；普通业务错误不按令牌失效处理。
 * 不做 silent refresh：刷新令牌仅落盘备用，过期即要求重新登录，避免跨域凭据复杂化。
 */
const BASE_API = import.meta.env.VITE_APP_BASE_API || ''

const request = axios.create({
  baseURL: BASE_API,
  timeout: 15000
})

/** 认证失效业务码：AppAuthErrorCodes.UNAUTHORIZED */
const AUTH_BUSINESS_CODE = 40100
/** 历史信封把认证失效放在 code=401 */
const LEGACY_AUTH_CODE = 401
/** 账号停用业务码：AppAuthErrorCodes.ACCOUNT_DISABLED */
const ACCOUNT_DISABLED_CODE = 40301

let redirectingToLogin = false

function toLogin(message) {
  // 并发失效只提示一次、只跳转一次，避免循环请求与循环跳转
  if (redirectingToLogin) {
    return
  }
  redirectingToLogin = true
  if (message) {
    ElMessage.error(message)
  }
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
    if (res?.code === AUTH_BUSINESS_CODE || res?.code === LEGACY_AUTH_CODE) {
      toLogin(res?.message || '登录状态已过期，请重新登录')
      return Promise.reject(new Error(res?.message || 'Unauthorized'))
    }
    if (res?.code !== undefined && res.code !== 200) {
      const message = res.message || '请求失败'
      if (!response.config?.silent) {
        ElMessage.error(message)
      }
      // 携带业务码供调用方分流（如 40904 密码状态冲突刷新身份入口）
      const error = new Error(message)
      error.businessCode = res.code
      return Promise.reject(error)
    }
    return res?.data
  },
  error => {
    const status = error.response?.status
    const bodyCode = error.response?.data?.code
    const msg = error.response?.data?.message || error.response?.data?.msg
    // silent 请求（如角标轮询）静默失败：由调用方进入失败策略，不反复弹窗
    const quiet = error.config?.silent
    if (status === 401) {
      toLogin(msg || '未授权，请重新登录')
    } else if (status === 403 && bodyCode === ACCOUNT_DISABLED_CODE) {
      // 账号停用：清理用户会话后要求重新登录；不暴露资料内容
      toLogin(msg || '账号已停用，请联系管理员')
    } else if (quiet) {
      // 静默请求的其余失败不弹全局提示
    } else if (status === 403) {
      // 普通权限/业务禁用：保持会话，只提示
      ElMessage.error(msg || '没有权限执行该操作')
    } else if (status === 404) {
      ElMessage.error(msg || '请求的资源不存在')
    } else {
      // 网络超时、5xx、断网：保持会话，允许重试
      ElMessage.error(msg || error.message || '网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export function resetPcLoginRedirectFlag() {
  redirectingToLogin = false
}

export default request
