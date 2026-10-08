import request from '@/utils/pcRequest'

/** A3 聊天 API（用户端，走 App 凭证域） */

/** 创建或获取会话（幂等） */
export function createSession(data) {
  return request({ url: '/api/v1/users/me/chat/sessions', method: 'post', data })
}

/** 我的会话列表 */
export function listSessions(params) {
  return request({ url: '/api/v1/users/me/chat/sessions', method: 'get', params })
}

/** 会话内历史消息 */
export function listMessages(sessionId) {
  return request({ url: `/api/v1/users/me/chat/sessions/${sessionId}/messages`, method: 'get' })
}

/** 发送文字消息 */
export function sendMessage(sessionId, data) {
  return request({ url: `/api/v1/users/me/chat/sessions/${sessionId}/messages`, method: 'post', data })
}

/** 标记会话已读 */
export function markSessionRead(sessionId) {
  return request({ url: `/api/v1/users/me/chat/sessions/${sessionId}/read`, method: 'put' })
}

/** 会话未读总数 */
export function getChatUnreadCount() {
  return request({ url: '/api/v1/users/me/chat/unread-count', method: 'get' })
}
