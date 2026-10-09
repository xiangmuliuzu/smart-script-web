import request from '@/utils/pcRequest'

/**
 * PC 用户端聊天（A3 用户沟通，App 凭证域）。
 * 前缀 /api/v1/users/me/chat，走 pcRequest：响应为 { code, message, data }，成功直接返回 data。
 * 列表接口的 data 为分页载荷 { total, list }；发送消息返回单条消息 VO；未读统计返回 { chatUnread }。
 */
const PREFIX = '/api/v1/users/me/chat'

/** 创建或获取会话（幂等）：data = { businessType, businessId, businessName, targetAdminId? } */
export function createSession(data) {
  return request({ url: `${PREFIX}/sessions`, method: 'post', data })
}

/** 我的会话列表：params = { status? }，返回 { total, list } */
export function listSessions(params) {
  return request({ url: `${PREFIX}/sessions`, method: 'get', params })
}

/** 会话内历史消息（时间正序），返回 { total, list } */
export function listMessages(sessionId) {
  return request({ url: `${PREFIX}/sessions/${sessionId}/messages`, method: 'get' })
}

/** 发送文字消息：data = { content, msgType? }，返回消息 VO */
export function sendMessage(sessionId, data) {
  return request({ url: `${PREFIX}/sessions/${sessionId}/messages`, method: 'post', data })
}

/** 标记会话已读（清除本人一侧未读） */
export function markSessionRead(sessionId) {
  return request({ url: `${PREFIX}/sessions/${sessionId}/read`, method: 'put' })
}

/** 用户重新打开已结束的会话（action=reopen），返回 { sessionId, status } */
export function reopenSession(sessionId) {
  return request({ url: `${PREFIX}/sessions/${sessionId}/status`, method: 'put', params: { action: 'reopen' } })
}

/** 会话未读总数，返回 { chatUnread }；options 可带 { silent: true } 供角标轮询静默失败 */
export function getChatUnreadCount(options) {
  return request({ url: `${PREFIX}/unread-count`, method: 'get', ...options })
}
