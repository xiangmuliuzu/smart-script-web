import request from '@/utils/pcRequest'

/** PC 用户端复用 App 凭证域接口（/api/v1/auth、/api/v1/users），不访问若依管理端接口 */

export function getMe() {
  return request({
    url: '/api/v1/auth/me',
    method: 'get'
  })
}

export function appLogout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'post'
  })
}

export function getProfile() {
  return request({ url: '/api/v1/users/me/profile', method: 'get' })
}

export function updateProfile(data) {
  return request({ url: '/api/v1/users/me/profile', method: 'put', data })
}

export function uploadAvatar(file) {
  const data = new FormData()
  data.append('file', file)
  return request({ url: '/api/v1/users/me/avatar', method: 'post', data })
}

/** 修改密码（已有密码账号）；成功后服务端吊销该用户全部会话 */
export function changePassword(data) {
  return request({ url: '/api/v1/auth/password/change', method: 'post', data })
}

/** 首次设置密码（无密码账号）；成功后保留当前会话并吊销其他会话 */
export function setPassword(data) {
  return request({ url: '/api/v1/auth/password/set', method: 'post', data })
}

/** 系统通知未读统计（A3 统一统计接口交付前，会话未读来源由角标适配层处理） */
export function getUnreadCount(options) {
  return request({ url: '/api/v1/messages/unread-count', method: 'get', ...options })
}

export function listMessages(params, options) {
  return request({ url: '/api/v1/messages', method: 'get', params, ...options })
}

export function getMessage(messageId) {
  return request({ url: `/api/v1/messages/${messageId}`, method: 'get' })
}

export function markMessageRead(messageId) {
  return request({ url: `/api/v1/messages/${messageId}/read`, method: 'put' })
}

export function markAllMessagesRead(params) {
  return request({ url: '/api/v1/messages/read-all', method: 'put', params })
}
