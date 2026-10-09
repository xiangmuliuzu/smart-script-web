import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 运营支撑产品业务 API */

export function getWelfareRules(params) {
  return request({
    url: `${PRODUCT_PREFIX}/support/welfare`,
    method: 'get',
    params
  })
}

export function getSystemConfig(params) {
  return request({
    url: `${PRODUCT_PREFIX}/support/system-config`,
    method: 'get',
    params
  })
}
