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

// 提现审核API
export function getWithdrawList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/pc/copyright/withdraw/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getWithdrawDetail(withdrawId) {
  return request({
    url: `/pc/copyright/withdraw/${withdrawId}`,
    method: 'get'
  })
}

export function approveWithdraw(withdrawId) {
  return request({
    url: `/pc/copyright/withdraw/${withdrawId}/approve`,
    method: 'post'
  })
}

export function rejectWithdraw(withdrawId, opinion) {
  return request({
    url: `/pc/copyright/withdraw/${withdrawId}/reject`,
    method: 'post',
    data: { opinion }
  })
}

export function freezeWithdraw(withdrawId) {
  return request({
    url: `/pc/copyright/withdraw/${withdrawId}/freeze`,
    method: 'post'
  })
}

export function unfreezeWithdraw(withdrawId) {
  return request({
    url: `/pc/copyright/withdraw/${withdrawId}/unfreeze`,
    method: 'post'
  })
}

export function exportWithdrawRecords(params) {
  return request({
    url: '/pc/copyright/withdraw/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 合同管理API
export function getContractList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/pc/copyright/contract/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getAvailableContractOrders() {
  return request({
    url: '/pc/copyright/contract/available-orders',
    method: 'get'
  })
}

export function getContractDetail(contractId) {
  return request({
    url: `/pc/copyright/contract/${contractId}`,
    method: 'get'
  })
}

export function generateContract(data) {
  return request({
    url: '/pc/copyright/contract/generate',
    method: 'post',
    data
  })
}

export function previewContract(contractId) {
  return request({
    url: `/pc/copyright/contract/${contractId}/preview`,
    method: 'get'
  })
}

export function archiveContract(contractId) {
  return request({
    url: `/pc/copyright/contract/${contractId}/archive`,
    method: 'post'
  })
}

export function cancelContract(contractId) {
  return request({
    url: `/pc/copyright/contract/${contractId}/cancel`,
    method: 'post'
  })
}

export function signContract(contractId, party) {
  return request({
    url: `/pc/copyright/contract/${contractId}/sign`,
    method: 'post',
    data: { party }
  })
}

export function downloadContract(contractId) {
  return request({
    url: `/pc/copyright/contract/${contractId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

// 结算管理API
export function getSettlementList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/pc/copyright/settlement/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getSettlementDetail(settlementId) {
  return request({
    url: `/pc/copyright/settlement/${settlementId}`,
    method: 'get'
  })
}

export function batchCalculateSettlement(data) {
  return request({
    url: '/pc/copyright/settlement/calculate',
    method: 'post',
    data
  })
}

export function handleSettlementAbnormal(settlementId, data) {
  return request({
    url: `/pc/copyright/settlement/${settlementId}/handle`,
    method: 'post',
    data
  })
}

export function confirmSettlement(settlementId) {
  return request({
    url: `/pc/copyright/settlement/${settlementId}/settle`,
    method: 'post'
  })
}

// 财务异常API
export function getFinanceAbnormalList(params) {
  const { pageNo, type, ...filters } = params || {}
  return request({
    url: `/pc/copyright/finance-abnormal/${type}/list`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getFinanceAbnormalDetail(type, recordId) {
  return request({
    url: `/pc/copyright/finance-abnormal/${type}/${recordId}`,
    method: 'get'
  })
}

export function handleFinanceAbnormal(type, recordId, data) {
  return request({
    url: `/pc/copyright/finance-abnormal/${type}/${recordId}/handle`,
    method: 'post',
    data
  })
}

// 电子证书管理API
export function getCopyrightCertList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/pc/copyright/cert/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightCertDetail(certId) {
  return request({
    url: `/pc/copyright/cert/${certId}`,
    method: 'get'
  })
}

export function downloadCopyrightCert(certId) {
  return request({
    url: `/pc/copyright/cert/${certId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

// 印章管理API - 统一使用 getCopyrightSealList
export { getCopyrightSealList as getPersonalSealList }

