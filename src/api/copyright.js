import request, { adminV1Request } from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 版权审核产品业务 API */

export function getReviewList(params) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/review/list`,
    method: 'get',
    params
  })
}

export function getReviewDetail(id) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/review/${id}`,
    method: 'get'
  })
}

export function submitReviewResult(id, data) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/review/${id}/result`,
    method: 'post',
    data
  })
}

export function getCopyrightAssets(params) {
  const { pageNo, ...filters } = params || {}
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/assets`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightAssetDetail(workId) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/assets/${workId}`,
    method: 'get'
  })
}

export function updateCopyrightAssetStatus(workId, status) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/assets/${workId}/status`,
    method: 'put',
    data: { status }
  })
}

export function getCopyrightAuthorizationHistory(workId, params) {
  const { pageNo, ...filters } = params || {}
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/assets/${workId}/authorization-history`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightSealList(params) {
  const { pageNo, ...filters } = params || {}
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals`,
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightSealDetail(sealId) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}`,
    method: 'get'
  })
}

export function getCopyrightSealLogs(sealId) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/logs`,
    method: 'get'
  })
}

export function reviewCopyrightSeal(sealId, data) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/review`,
    method: 'post',
    data
  })
}

export function resolveAbnormalCopyrightSeal(sealId, reason) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/resolve-abnormal`,
    method: 'post',
    data: { reason }
  })
}

export function updateCopyrightSealStatus(sealId, status) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/seals/${sealId}/status`,
    method: 'put',
    data: { status }
  })
}

export function getAiReviewRules(params) {
  return adminV1Request({ url: `${PRODUCT_PREFIX}/copyright/review-rules`,
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

// 版权申请管理API
export function getCopyrightApplicationList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/content/copyright/application/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightApplicationDetail(applyId) {
  return request({
    url: `/content/copyright/application/${applyId}`,
    method: 'get'
  })
}

export function addCopyrightApplication(data) {
  return request({
    url: '/content/copyright/application',
    method: 'post',
    data
  })
}

export function updateCopyrightApplication(data) {
  return request({
    url: '/content/copyright/application',
    method: 'put',
    data
  })
}

export function deleteCopyrightApplication(applyIds) {
  return request({
    url: `/content/copyright/application/${applyIds}`,
    method: 'delete'
  })
}

export function syncCopyrightApplication(applyId) {
  return request({
    url: `/content/copyright/application/queryStatus/${applyId}`,
    method: 'get'
  })
}

export function submitCopyrightApplicationToCenter(applyId, configId) {
  return request({
    url: `/content/copyright/application/submit/${applyId}/to/${configId}`,
    method: 'post'
  })
}

// 从配置页提交到第三方API
export function submitApplicationToThirdParty(applyId) {
  return request({
    url: `/content/copyright/application/submitToApi/${applyId}`,
    method: 'post'
  })
}

export function batchSubmitCopyrightApplicationToCenter(applyIds) {
  return request({
    url: '/content/copyright/application/batch/submit',
    method: 'post',
    data: applyIds
  })
}

export function exportCopyrightApplication(params) {
  return request({
    url: '/content/copyright/application/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 版权中心配置API
export function getCopyrightCenterConfigList(params) {
  const { pageNo, ...filters } = params || {}
  return request({
    url: '/content/copyright/config/list',
    method: 'get',
    params: { ...filters, pageNum: pageNo }
  })
}

export function getCopyrightCenterConfigDetail(configId) {
  return request({
    url: `/content/copyright/config/${configId}`,
    method: 'get'
  })
}

export function addCopyrightCenterConfig(data) {
  return request({
    url: '/content/copyright/config',
    method: 'post',
    data
  })
}

export function updateCopyrightCenterConfig(data) {
  return request({
    url: '/content/copyright/config',
    method: 'put',
    data
  })
}

export function deleteCopyrightCenterConfig(configIds) {
  return request({
    url: `/content/copyright/config/${configIds}`,
    method: 'delete'
  })
}

export function exportCopyrightCenterConfig(params) {
  return request({
    url: '/content/copyright/config/export',
    method: 'post',
    params,
    responseType: 'blob'
  })
}

// 测试版权中心连接
export function testCopyrightCenterConnection(configId) {
  return request({
    url: `/content/copyright/config/testConnection/${configId}`,
    method: 'get'
  })
}

// 修改版权中心状态
export function changeCopyrightCenterStatus(data) {
  return request({
    url: '/content/copyright/config/changeStatus',
    method: 'put',
    data
  })
}

// 获取可用的版权中心列表
export function getAvailableCopyrightCenters() {
  return request({
    url: '/content/copyright/config/active',
    method: 'get'
  })
}

// 批量同步版权申请状态
export function batchSyncCopyrightStatus(applyIds) {
  return request({
    url: '/content/copyright/application/batch/sync',
    method: 'post',
    data: applyIds
  })
}

// 同步单个申请状态
export function syncCopyrightApplicationStatus(applyId) {
  return request({
    url: `/content/copyright/application/queryStatus/${applyId}`,
    method: 'get'
  })
}

// 审核版权申请
export function reviewCopyrightApplication(applyId, data) {
  // data格式: { action: 'approve'|'reject', rejectReason: string }
  // 转换为后端需要的格式: { status: 'approved'|'rejected', rejectReason: string }
  const reviewData = {
    status: data.action === 'approve' ? 'approved' : 'rejected',
    rejectReason: data.rejectReason || ''
  }
  return request({
    url: `/content/copyright/application/${applyId}/review`,
    method: 'post',
    data: reviewData
  })
}

