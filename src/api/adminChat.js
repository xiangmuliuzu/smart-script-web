import request from '@/utils/request'

/** A3 管理端聊天 API（若依 Token 鉴权） */

/** 全部会话列表（分页 + 筛选） */
export function adminListSessions(params) {
  return request({ url: '/api/v1/admin/chat/sessions', method: 'get', params })
}

/** 会话详情（含用户信息） */
export function adminSessionDetail(sessionId) {
  return request({ url: `/api/v1/admin/chat/sessions/${sessionId}`, method: 'get' })
}

/** 会话内历史消息 */
export function adminListMessages(sessionId) {
  return request({ url: `/api/v1/admin/chat/sessions/${sessionId}/messages`, method: 'get' })
}

/** 管理员创建/获取会话（从管理端发起） */
export function adminCreateSession(data) {
  return request({ url: '/api/v1/admin/chat/sessions', method: 'post', data })
}

/** 管理员回复消息 */
export function adminSendMessage(sessionId, data) {
  return request({ url: `/api/v1/admin/chat/sessions/${sessionId}/messages`, method: 'post', data })
}

/** 管理员标记会话已读 */
export function adminMarkRead(sessionId) {
  return request({ url: `/api/v1/admin/chat/sessions/${sessionId}/read`, method: 'put' })
}

/** 分配处理管理员 */
export function adminAssignAdmin(sessionId, adminId) {
  return request({
    url: `/api/v1/admin/chat/sessions/${sessionId}/assign`,
    method: 'put',
    params: { adminId }
  })
}

/** 变更会话状态（processing / close / reopen） */
export function adminChangeStatus(sessionId, action) {
  return request({
    url: `/api/v1/admin/chat/sessions/${sessionId}/status`,
    method: 'put',
    params: { action }
  })
}
