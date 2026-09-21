import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 交易商务产品业务 API */

export function getOrderList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/trade/order/list`,
    method: 'get',
    params
  })
}

export function getOrderDetail(id) {
  return request({
    url: `${PRODUCT_PREFIX}/trade/order/detail/${id}`,
    method: 'get'
  })
}

export function getInquiryList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/trade/inquiry/list`,
    method: 'get',
    params
  })
}

export function getPartnerList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/trade/partner/list`,
    method: 'get',
    params
  })
}

export function getTradeWorks(params) {
  return request({
    url: `${PRODUCT_PREFIX}/trade/works`,
    method: 'get',
    params
  })
}
