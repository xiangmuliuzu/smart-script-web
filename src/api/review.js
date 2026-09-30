import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 审核工作台产品业务 API（业务审核，非若依系统权限） */

export function getWorkbenchQueue(params) {
  return request({
    url: `${PRODUCT_PREFIX}/review/workbench`,
    method: 'get',
    params
  })
}

export function approveReviewItem(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/review/${id}/approve`,
    method: 'post',
    data
  })
}

export function rejectReviewItem(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/review/${id}/reject`,
    method: 'post',
    data
  })
}
