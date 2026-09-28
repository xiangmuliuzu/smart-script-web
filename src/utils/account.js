/**
 * A 模块账号域常量与分流规则（纯函数，供路由守卫 / 登录页 / 单测共用）。
 *
 * 取值与后端 AppAdminConstants 保持一致：sys_user.user_type
 *   00 = PC 管理员；01 App 普通用户 / 02 创作者 / 03 甲方 → 共用 PC 用户端。
 * 分流只依据服务端认证成功后返回的 accountType，不做用户名/手机号格式推断。
 */
export const ADMIN_ACCOUNT_TYPE = '00'
export const USER_ACCOUNT_TYPES = ['01', '02', '03']

/** PC 用户端独立首页与路由前缀 */
export const USER_PORTAL_PREFIX = '/pc/'
export const USER_PORTAL_HOME = '/pc/user'

export function isAdminType(accountType) {
  return accountType === ADMIN_ACCOUNT_TYPE
}

export function isUserType(accountType) {
  return USER_ACCOUNT_TYPES.includes(accountType)
}

export function isKnownAccountType(accountType) {
  return isAdminType(accountType) || isUserType(accountType)
}

/** 各账号类型的登录后首页：用户端走独立门户，管理员走现有管理端根路由 */
export function homePathFor(accountType) {
  return isUserType(accountType) ? USER_PORTAL_HOME : '/'
}

export function isUserPortalPath(path) {
  return typeof path === 'string' && path.startsWith(USER_PORTAL_PREFIX)
}

/**
 * 登录后的重定向白名单：只接受站内路径，且不得跨账号域
 * （管理员不被重定向到 /pc/**，用户端账号不被重定向到管理端路径）。
 */
export function safePortalRedirect(raw, accountType) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return homePathFor(accountType)
  }
  if (isUserType(accountType) && !isUserPortalPath(raw)) {
    return USER_PORTAL_HOME
  }
  if (isAdminType(accountType) && isUserPortalPath(raw)) {
    return '/'
  }
  return raw
}
