/**
 * A4 用户中心展示层纯函数（单测覆盖：tests/pc-user-center.test.js）。
 *
 * 只做展示口径转换，不做业务判断；身份能力判断唯一来源是
 * Store 中的 authorCapability（/api/v1/auth/me 返回值）。
 */

/** 账号类型文案（sys_user.user_type；userType 只用于文案，不是创作者能力判断） */
const USER_TYPE_LABELS = { '01': '普通用户', '02': '创作者', '03': '甲方' }

/** 实名状态文案；未知值显示「状态未知」，不错误显示已认证 */
const REAL_NAME_LABELS = { APPROVED: '已认证', PENDING: '审核中', REJECTED: '未通过', NOT_SUBMITTED: '未认证' }

/** 账号状态文案（sys_user.status：0 正常 / 1 停用；未知值不能兜底为正常） */
const ACCOUNT_STATUS_LABELS = { 0: '正常', 1: '停用' }

export function userTypeLabel(code) {
  return USER_TYPE_LABELS[code] || '用户'
}

export function realNameStatusLabel(code) {
  return REAL_NAME_LABELS[code] || '状态未知'
}

export function realNameTagType(code) {
  return { APPROVED: 'success', PENDING: 'warning', REJECTED: 'danger' }[code] || 'info'
}

export function accountStatusLabel(code) {
  if (code === null || code === undefined || code === '') {
    return '状态未知'
  }
  return ACCOUNT_STATUS_LABELS[code] ?? '状态未知'
}

/**
 * 注册时间转换：ISO 8601 带时区字符串 → Asia/Hong_Kong 的 YYYY-MM-DD HH:mm:ss。
 * null/undefined 显示「—」（历史缺失值）；无法解析的值同样显示「—」，
 * 不显示 Invalid Date。
 */
export function formatRegisteredTime(iso) {
  if (typeof iso !== 'string' || !iso.trim()) {
    return '—'
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`
}

/** 与后端 MAX_PASSWORD_BYTES 一致：BCrypt 输入上限，超限无法编码（F08） */
export const MAX_PASSWORD_BYTES = 72

/**
 * 密码策略（与后端 validatePasswordPolicy 同一口径，F07/F08 修复后）：
 *   - 8–64 个字符（按 UTF-16 代码单元计，两端 String.length / String.length 一致）；
 *   - 至少包含字母和数字：字母 = Unicode 字母类 \p{L}（含汉字），数字 = 十进制数字类
 *     \p{Nd}（含全角数字），按完整码点匹配，与后端 codePointAt + isLetter/isDigit(int) 一致；
 *   - UTF-8 编码不超过 72 字节（BCrypt 输入上限，超限时后端无法编码，两端同口径拒绝）。
 * 返回错误文案，null 表示通过。
 */
export function passwordPolicyError(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 64) {
    return '新密码长度需为 8–64 个字符'
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return '新密码过长（UTF-8 编码超过 72 字节），请缩短'
  }
  if (!/\p{L}/u.test(password) || !/\p{Nd}/u.test(password)) {
    return '新密码需同时包含字母和数字'
  }
  return null
}

/**
 * 未读角标文案：0 显示无角标，1–99 显示数字，超过 99 显示 99+。
 * 负数、NaN、非数值按无效处理返回 null（由调用方进入失败策略，
 * 不展示错误数字）。
 */
export function unreadBadgeText(count) {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
    return null
  }
  if (count === 0) {
    return ''
  }
  return count > 99 ? '99+' : String(count)
}
