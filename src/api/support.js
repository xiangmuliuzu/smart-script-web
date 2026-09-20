import request from '@/utils/request'

/**
 * 运营支撑模块 API
 * 接口前缀: /api/v1/admin/support
 */

// 获取公告列表
export function getAnnouncementList(params) {
  return request({
    url: '/support/announcement/list',
    method: 'get',
    params
  })
}

// 创建公告
export function createAnnouncement(data) {
  return request({
    url: '/support/announcement/create',
    method: 'post',
    data
  })
}

// 更新公告
export function updateAnnouncement(id, data) {
  return request({
    url: `/support/announcement/update/${id}`,
    method: 'put',
    data
  })
}

// 删除公告
export function deleteAnnouncement(id) {
  return request({
    url: `/support/announcement/delete/${id}`,
    method: 'delete'
  })
}

// 获取 APP 消息和系统公告列表
export function getMessageList(params) {
  return request({
    url: '/support/message/list',
    method: 'get',
    params
  })
}

// 发布消息或公告
export function publishMessage(data) {
  return request({
    url: '/support/message/publish',
    method: 'post',
    data
  })
}

// 获取反馈列表
export function getFeedbackList(params) {
  return request({
    url: '/support/feedback/list',
    method: 'get',
    params
  })
}

// 回复反馈
export function replyFeedback(id, data) {
  return request({
    url: `/support/feedback/reply/${id}`,
    method: 'post',
    data
  })
}

// 获取系统配置
export function getSystemConfig() {
  return request({
    url: '/support/config',
    method: 'get'
  })
}

// 更新系统配置
export function updateSystemConfig(data) {
  return request({
    url: '/support/config',
    method: 'put',
    data
  })
}

// 获取操作日志
export function getOperationLog(params) {
  return request({
    url: '/support/log/operation',
    method: 'get',
    params
  })
}

// 获取系统监控数据
export function getSystemMonitor() {
  return request({
    url: '/support/monitor',
    method: 'get'
  })
}
