import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 版权审核产品业务 API */

export function getReviewList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/review/list`,
    method: 'get',
    params
  })
}

export function getReviewDetail(id) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/review/${id}`,
    method: 'get'
  })
}

export function submitReviewResult(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/review/${id}/result`,
    method: 'post',
    data
  })
}

export function getCopyrightAssets(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: `${PRODUCT_PREFIX}/copyright/assets`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightAssetDetail(workId) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/assets/${workId}`,
    method: 'get'
  })
}

export function updateCopyrightAssetStatus(workId, status) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/assets/${workId}/status`,
    method: 'put',
    data: { status }
  })
}

export function getCopyrightAuthorizationHistory(workId, params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: `${PRODUCT_PREFIX}/copyright/assets/${workId}/authorization-history`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightSealList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightSealDetail(sealId) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}`,
    method: 'get'
  })
}

export function getCopyrightSealLogs(sealId) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/logs`,
    method: 'get'
  })
}

export function reviewCopyrightSeal(sealId, data) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/review`,
    method: 'post',
    data
  })
}

export function resolveAbnormalCopyrightSeal(sealId, reason) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/resolve-abnormal`,
    method: 'post',
    data: { reason }
  })
}

export function updateCopyrightSealStatus(sealId, status) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/status`,
    method: 'put',
    data: { status }
  })
}

export function getAiReviewRules(params) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/review-rules`,
    method: 'get',
    params
  })
}
