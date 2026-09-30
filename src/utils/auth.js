const TOKEN_KEY = 'Admin-Token'
const USER_TOKEN_KEY = 'PcUser-Token'
const USER_REFRESH_TOKEN_KEY = 'PcUser-Refresh-Token'
const ACCOUNT_TYPE_KEY = 'Account-Type'

// ---------- 管理员会话（若依管理端令牌） ----------

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ---------- PC 用户端会话（App 凭证域令牌，与 App 端同一套 JWT） ----------

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY) || ''
}

export function setUserToken(token) {
  localStorage.setItem(USER_TOKEN_KEY, token)
}

export function removeUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY)
}

export function getUserRefreshToken() {
  return localStorage.getItem(USER_REFRESH_TOKEN_KEY) || ''
}

export function setUserRefreshToken(token) {
  localStorage.setItem(USER_REFRESH_TOKEN_KEY, token)
}

export function removeUserRefreshToken() {
  localStorage.removeItem(USER_REFRESH_TOKEN_KEY)
}

// ---------- 账号类型（登录成功后由服务端返回值落盘，刷新后仍可分流） ----------

export function getAccountType() {
  return localStorage.getItem(ACCOUNT_TYPE_KEY) || ''
}

export function setAccountType(accountType) {
  localStorage.setItem(ACCOUNT_TYPE_KEY, accountType)
}

export function removeAccountType() {
  localStorage.removeItem(ACCOUNT_TYPE_KEY)
}

/** 清空两类会话的全部本地痕迹（切换账号 / 会话不一致兜底时使用） */
export function clearAllSessions() {
  removeToken()
  removeUserToken()
  removeUserRefreshToken()
  removeAccountType()
}
