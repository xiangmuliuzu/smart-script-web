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
