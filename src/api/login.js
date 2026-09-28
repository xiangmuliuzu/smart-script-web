import request from '@/utils/request'

/** 若依原生认证接口，不使用 /api/v1/admin 自建路径 */

export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get',
    headers: { isToken: false },
    timeout: 20000
  })
}

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    headers: { isToken: false },
    data
  })
}

/**
 * A 模块统一登录：管理员与 App 用户共用同一登录页，由服务端按 sys_user.user_type 分流。
 * 返回 { accountType, token }（00，若依管理端令牌）或 { accountType, session }（01/02/03，App 凭证域令牌）。
 */
export function unifiedLogin(data) {
  return request({
    url: '/api/v1/pc-auth/login',
    method: 'post',
    headers: { isToken: false },
    data
  })
}

export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
