import request from '@/utils/request'

/**
 * AI 创作模块 API
 * 接口前缀: /api/v1/admin/ai
 */

// 获取 AI 创作任务列表
export function getAiTaskList(params) {
  return request({
    url: '/ai/task/list',
    method: 'get',
    params
  })
}

// 获取 AI 创作任务详情
export function getAiTaskDetail(id) {
  return request({
    url: `/ai/task/detail/${id}`,
    method: 'get'
  })
}

// 创建 AI 创作任务
export function createAiTask(data) {
  return request({
    url: '/ai/task/create',
    method: 'post',
    data
  })
}

// 停止 AI 创作任务
export function stopAiTask(id) {
  return request({
    url: `/ai/task/stop/${id}`,
    method: 'post'
  })
}

// 获取 AI 模型列表
export function getAiModelList(params) {
  return request({
    url: '/ai/model/list',
    method: 'get',
    params
  })
}

// 更新 AI 模型配置
export function updateAiModelConfig(id, data) {
  return request({
    url: `/ai/model/config/${id}`,
    method: 'put',
    data
  })
}

// 获取 AI 创作统计
export function getAiStatistics(params) {
  return request({
    url: '/ai/statistics',
    method: 'get',
    params
  })
}

// 获取 AI 次数、积分兑换和广告奖励规则
export function getAiQuotaRules(params) {
  return request({
    url: '/ai/quota/rule/list',
    method: 'get',
    params
  })
}

// 更新 AI 次数规则
export function updateAiQuotaRule(id, data) {
  return request({
    url: `/ai/quota/rule/update/${id}`,
    method: 'put',
    data
  })
}
