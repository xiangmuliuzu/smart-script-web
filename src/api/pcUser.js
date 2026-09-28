import request from '@/utils/pcRequest'

/** PC 用户端复用 App 凭证域接口（/api/v1/auth、/api/v1/users），不访问若依管理端接口 */

export function getMe() {
  return request({
    url: '/api/v1/auth/me',
    method: 'get'
  })
}

export function appLogout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'post'
  })
}
