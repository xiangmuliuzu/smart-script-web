import request from '@/utils/request'

/**
 * 交易与财务模块 API
 * 接口前缀: /api/v1/admin/trade
 */

// 获取交易订单列表
export function getOrderList(params) {
  return request({
    url: '/trade/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/trade/order/detail/${id}`,
    method: 'get'
  })
}

// 获取询盘列表
export function getInquiryList(params) {
  return request({
    url: '/trade/inquiry/list',
    method: 'get',
    params
  })
}

// 获取询盘详情
export function getInquiryDetail(id) {
  return request({
    url: `/trade/inquiry/detail/${id}`,
    method: 'get'
  })
}

// 记录商务跟进或线下谈判结果
export function recordInquiryFollowUp(id, data) {
  return request({
    url: `/trade/inquiry/follow-up/${id}`,
    method: 'post',
    data
  })
}

// 将已达成询盘转为授权订单
export function convertInquiryToOrder(id, data) {
  return request({
    url: `/trade/inquiry/convert-order/${id}`,
    method: 'post',
    data
  })
}

// 退款
export function refundOrder(id, data) {
  return request({
    url: `/trade/order/refund/${id}`,
    method: 'post',
    data
  })
}

// 获取提现申请列表
export function getWithdrawList(params) {
  return request({
    url: '/trade/withdraw/list',
    method: 'get',
    params
  })
}

// 审核提现申请
export function approveWithdraw(id, data) {
  return request({
    url: `/trade/withdraw/approve/${id}`,
    method: 'post',
    data
  })
}

// 获取财务统计
export function getFinanceStatistics(params) {
  return request({
    url: '/trade/statistics',
    method: 'get',
    params
  })
}

// 导出财务报表
export function exportFinanceReport(params) {
  return request({
    url: '/trade/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取收益明细
export function getIncomeDetail(params) {
  return request({
    url: '/trade/income/detail',
    method: 'get',
    params
  })
}
