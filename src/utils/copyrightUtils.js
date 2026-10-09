/**
 * 版权管理相关工具函数
 */

// 审核状态常量
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 印章状态常量
export const SEAL_STATUS = {
  DISABLED: 'disabled',
  ENABLED: 'enabled',
  ABNORMAL: 'abnormal'
}

// 证书状态常量
export const CERT_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  EXPIRED: 'expired'
}

// 印章操作类型常量
export const SEAL_OPERATION = {
  SUBMIT: 'submit',
  REVIEW_APPROVE: 'review_approve',
  REVIEW_REJECT: 'review_reject',
  ENABLE: 'enable',
  DISABLE: 'disable',
  RESOLVE_ABNORMAL: 'resolve_abnormal'
}

/**
 * 获取审核状态标签
 * @param {string} status - 审核状态
 * @returns {string} 状态标签文本
 */
export function reviewStatusLabel(status) {
  const map = {
    [REVIEW_STATUS.PENDING]: '待审核',
    [REVIEW_STATUS.APPROVED]: '已通过',
    [REVIEW_STATUS.REJECTED]: '已驳回'
  }
  return map[status] || status
}

/**
 * 获取审核状态标签类型
 * @param {string} status - 审核状态
 * @returns {string} ElementUI Tag类型
 */
export function reviewStatusType(status) {
  const map = {
    [REVIEW_STATUS.PENDING]: 'warning',
    [REVIEW_STATUS.APPROVED]: 'success',
    [REVIEW_STATUS.REJECTED]: 'danger'
  }
  return map[status] || 'info'
}

/**
 * 获取印章状态标签
 * @param {string} status - 印章状态
 * @returns {string} 状态标签文本
 */
export function sealStatusLabel(status) {
  const map = {
    [SEAL_STATUS.ENABLED]: '已启用',
    [SEAL_STATUS.DISABLED]: '已停用',
    [SEAL_STATUS.ABNORMAL]: '异常',
    // 兼容审核状态（用于日志显示）
    [REVIEW_STATUS.PENDING]: '待审核',
    [REVIEW_STATUS.APPROVED]: '已通过',
    [REVIEW_STATUS.REJECTED]: '已驳回'
  }
  return map[status] || status
}

/**
 * 获取印章状态标签类型
 * @param {string} status - 印章状态
 * @returns {string} ElementUI Tag类型
 */
export function sealStatusType(status) {
  const map = {
    [SEAL_STATUS.ENABLED]: 'success',
    [SEAL_STATUS.DISABLED]: 'info',
    [SEAL_STATUS.ABNORMAL]: 'danger',
    // 兼容审核状态
    [REVIEW_STATUS.PENDING]: 'warning',
    [REVIEW_STATUS.APPROVED]: 'success',
    [REVIEW_STATUS.REJECTED]: 'danger'
  }
  return map[status] || 'info'
}

/**
 * 获取证书状态标签
 * @param {string} status - 证书状态
 * @returns {string} 状态标签文本
 */
export function certStatusLabel(status) {
  const map = {
    [CERT_STATUS.PENDING]: '申请中',
    [CERT_STATUS.ISSUED]: '已签发',
    [CERT_STATUS.EXPIRED]: '已失效'
  }
  return map[status] || status
}

/**
 * 获取证书状态标签类型
 * @param {string} status - 证书状态
 * @returns {string} ElementUI Tag类型
 */
export function certStatusType(status) {
  const map = {
    [CERT_STATUS.PENDING]: 'warning',
    [CERT_STATUS.ISSUED]: 'success',
    [CERT_STATUS.EXPIRED]: 'info'
  }
  return map[status] || 'info'
}

/**
 * 获取印章操作类型标签
 * @param {string} operationType - 操作类型
 * @returns {string} 操作标签文本
 */
export function sealOperationLabel(operationType) {
  const map = {
    [SEAL_OPERATION.SUBMIT]: '提交审核',
    [SEAL_OPERATION.REVIEW_APPROVE]: '审核通过',
    [SEAL_OPERATION.REVIEW_REJECT]: '审核驳回',
    [SEAL_OPERATION.ENABLE]: '启用',
    [SEAL_OPERATION.DISABLE]: '停用',
    [SEAL_OPERATION.RESOLVE_ABNORMAL]: '异常处理'
  }
  return map[operationType] || operationType
}

/**
 * 获取印章操作类型标签类型
 * @param {string} operationType - 操作类型
 * @returns {string} ElementUI Tag类型
 */
export function sealOperationType(operationType) {
  const map = {
    [SEAL_OPERATION.SUBMIT]: 'primary',
    [SEAL_OPERATION.REVIEW_APPROVE]: 'success',
    [SEAL_OPERATION.REVIEW_REJECT]: 'danger',
    [SEAL_OPERATION.ENABLE]: 'success',
    [SEAL_OPERATION.DISABLE]: 'warning',
    [SEAL_OPERATION.RESOLVE_ABNORMAL]: 'info'
  }
  return map[operationType] || 'primary'
}

/**
 * 解析材料URLs
 * @param {string} materialUrls - 材料URLs字符串（JSON数组或逗号分隔）
 * @returns {Array<string>} URL数组
 */
export function parseMaterialUrls(materialUrls) {
  if (!materialUrls) return []
  try {
    // 如果是JSON格式
    if (materialUrls.startsWith('[')) {
      return JSON.parse(materialUrls)
    }
    // 如果是逗号分隔的字符串
    return materialUrls.split(',').filter(url => url.trim())
  } catch {
    return []
  }
}
