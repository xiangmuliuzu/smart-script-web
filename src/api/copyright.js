import request from '@/utils/request'

/**
 * 版权与印章模块 API
 * 接口前缀: /api/v1/admin/copyright
 */

// 获取版权申请列表
export function getCopyrightList(params) {
  return request({
    url: '/copyright/list',
    method: 'get',
    params
  })
}

// 获取版权申请详情
export function getCopyrightDetail(id) {
  return request({
    url: `/copyright/detail/${id}`,
    method: 'get'
  })
}

// 审核版权申请
export function approveCopyright(id, data) {
  return request({
    url: `/copyright/approve/${id}`,
    method: 'post',
    data
  })
}

// 颁发版权证书
export function issueCertificate(id, data) {
  return request({
    url: `/copyright/certificate/${id}`,
    method: 'post',
    data
  })
}

// 获取印章列表
export function getSealList(params) {
  return request({
    url: '/copyright/seal/list',
    method: 'get',
    params
  })
}

// 创建印章
export function createSeal(data) {
  return request({
    url: '/copyright/seal/create',
    method: 'post',
    data
  })
}

// 更新印章
export function updateSeal(id, data) {
  return request({
    url: `/copyright/seal/update/${id}`,
    method: 'put',
    data
  })
}

// 删除印章
export function deleteSeal(id) {
  return request({
    url: `/copyright/seal/delete/${id}`,
    method: 'delete'
  })
}

// 获取版权统计
export function getCopyrightStatistics(params) {
  return request({
    url: '/copyright/statistics',
    method: 'get',
    params
  })
}
