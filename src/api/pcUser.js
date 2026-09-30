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

export function listMessages(params) {
  return request({ url: '/api/v1/messages', method: 'get', params })
}

export function getMessage(messageId) {
  return request({ url: `/api/v1/messages/${messageId}`, method: 'get' })
}

export function markMessageRead(messageId) {
  return request({ url: `/api/v1/messages/${messageId}/read`, method: 'put' })
}

export function markAllMessagesRead() {
  return request({ url: '/api/v1/messages/read-all', method: 'put' })
}
