import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 数据看板产品业务 API */

export function getDashboardOverview() {
  return request({
    url: `${PRODUCT_PREFIX}/dashboard/overview`,
    method: 'get'
  })
}

export function getUserTrend(params) {
  return request({
    url: `${PRODUCT_PREFIX}/dashboard/user-trend`,
    method: 'get',
    params
  })
}

export function getContentStatistics() {
  return request({
    url: `${PRODUCT_PREFIX}/dashboard/content-statistics`,
    method: 'get'
  })
}

export function getOperationOverview(params) {
  return request({
    url: `${PRODUCT_PREFIX}/dashboard/operation-overview`,
    method: 'get',
    params
  })
}
