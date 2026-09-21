import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** AI 模块产品业务 API（认证不在此文件） */

export function getAiOperations(params) {
  return request({
    url: `${PRODUCT_PREFIX}/ai/operations`,
    method: 'get',
    params
  })
}

export function createAiOperationRule(data) {
  return request({
    url: `${PRODUCT_PREFIX}/ai/operations`,
    method: 'post',
    data
  })
}

export function updateAiOperationRule(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/ai/operations/${id}`,
    method: 'put',
    data
  })
}
