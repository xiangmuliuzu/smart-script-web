import request from '@/utils/request'

/**
 * 数据看板 API
 * 接口前缀: /api/v1/admin/dashboard
 */

// 获取总览数据
export function getDashboardOverview() {
  return request({
    url: '/dashboard/overview',
    method: 'get'
  })
}

// 获取用户增长趋势
export function getUserTrend(params) {
  return request({
    url: '/dashboard/user-trend',
    method: 'get',
    params
  })
}

// 获取内容统计
export function getContentStatistics() {
  return request({
    url: '/dashboard/content-statistics',
    method: 'get'
  })
}

// 获取交易统计
export function getTradeStatistics(params) {
  return request({
    url: '/dashboard/trade-statistics',
    method: 'get',
    params
  })
}

// 获取热门内容排行
export function getHotContentRank(params) {
  return request({
    url: '/dashboard/hot-content',
    method: 'get',
    params
  })
}

// 获取实时数据
export function getRealtimeData() {
  return request({
    url: '/dashboard/realtime',
    method: 'get'
  })
}
