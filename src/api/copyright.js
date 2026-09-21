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
  return request({
    url: `${PRODUCT_PREFIX}/copyright/assets`,
    method: 'get',
    params
  })
}

export function getAiReviewRules(params) {
  return request({
    url: `${PRODUCT_PREFIX}/copyright/review-rules`,
    method: 'get',
    params
  })
}
