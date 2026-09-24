import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import { unwrapRuoYiResponse } from '@/utils/ruoyi-response'

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
  removeToken()
  const current = window.location.pathname + window.location.search
  const target = current && !current.startsWith('/login')
    ? `/login?redirect=${encodeURIComponent(current)}`
    : '/login'
  window.location.href = target
}

request.interceptors.request.use(
  config => {
    const isToken = config.headers?.isToken !== false
    const token = getToken()
    if (token && isToken) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return res
    }

    const code = res?.code
    if (code === 401) {
      toLogin(res?.msg || '登录状态已过期，请重新登录')
      return Promise.reject(new Error(res?.msg || 'Unauthorized'))
    }
    if (code !== undefined && code !== 200 && code !== 0) {
      const message = res.msg || res.message || '请求失败'
      if (code === 403) {
        ElMessage.error(message || '权限不足')
      } else {
        ElMessage.error(message)
      }
      return Promise.reject(new Error(message))
    }

    // 与 utils/ruoyi-response.js 同一契约：保留顶层 postIds/roleIds/checkedKeys 等
    return unwrapRuoYiResponse(res)
  },
  error => {
    const status = error.response?.status
    const msg = error.response?.data?.msg || error.response?.data?.message
    if (status === 401) {
      toLogin(msg || '未授权，请重新登录')
    } else if (status === 403) {
      ElMessage.error(msg || '权限不足')
    } else if (status === 404) {
      ElMessage.error(msg || '请求的资源不存在')
    } else if (status === 500) {
      ElMessage.error(msg || '服务器错误')
    } else {
      ElMessage.error(msg || error.message || '网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export function resetLoginRedirectFlag() {
  redirectingToLogin = false
}

export default request
