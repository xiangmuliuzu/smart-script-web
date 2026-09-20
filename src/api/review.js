import request from '@/utils/request'

/**
 * 审核与风控模块 API
 * 接口前缀: /api/v1/admin/review
 */

// 获取待审核列表
export function getReviewList(params) {
  return request({
    url: '/review/list',
    method: 'get',
    params
  })
}

// 获取审核详情
export function getReviewDetail(id) {
  return request({
    url: `/review/detail/${id}`,
    method: 'get'
  })
}

// 提交审核结果
export function submitReview(id, data) {
  return request({
    url: `/review/submit/${id}`,
    method: 'post',
    data
  })
}

// 批量审核
export function batchReview(data) {
  return request({
    url: '/review/batch',
    method: 'post',
    data
  })
}

// 获取风控规则列表
export function getRiskRuleList(params) {
  return request({
    url: '/review/risk-rule/list',
    method: 'get',
    params
  })
}

// 创建风控规则
export function createRiskRule(data) {
  return request({
    url: '/review/risk-rule/create',
    method: 'post',
    data
  })
}

// 更新风控规则
export function updateRiskRule(id, data) {
  return request({
    url: `/review/risk-rule/update/${id}`,
    method: 'put',
    data
  })
}

// 删除风控规则
export function deleteRiskRule(id) {
  return request({
    url: `/review/risk-rule/delete/${id}`,
    method: 'delete'
  })
}

// 获取审核统计
export function getReviewStatistics(params) {
  return request({
    url: '/review/statistics',
    method: 'get',
    params
  })
}
