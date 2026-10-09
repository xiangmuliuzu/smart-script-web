import { getToken } from '@/utils/auth'

/**
 * 管理端带认证的 fetch：自动附加 Admin-Token（若依 Bearer 认证）。
 * 原生 fetch 不带 token 会被后端认证拒绝，导致页面无数据。
 */
export default function adminFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return fetch(url, { ...options, headers })
}
