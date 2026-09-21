import request from '@/utils/request'

export function listUser(query) {
  return request({ url: '/system/user/list', method: 'get', params: query })
}
export function getUser(userId) {
  return request({ url: `/system/user/${userId ?? ''}`, method: 'get' })
}
export function addUser(data) {
  return request({ url: '/system/user', method: 'post', data })
}
export function updateUser(data) {
  return request({ url: '/system/user', method: 'put', data })
}
export function delUser(userId) {
  return request({ url: `/system/user/${userId}`, method: 'delete' })
}
export function resetUserPwd(userId, password) {
  return request({ url: `/system/user/resetPwd`, method: 'put', data: { userId, password } })
}
export function changeUserStatus(userId, status) {
  return request({ url: `/system/user/changeStatus`, method: 'put', data: { userId, status } })
}
export function getUserAuthRole(userId) {
  return request({ url: `/system/user/authRole/${userId}`, method: 'get' })
}
