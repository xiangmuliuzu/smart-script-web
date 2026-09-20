import request from '@/utils/request'

/**
 * 用户模块 API
 * 接口前缀: /api/v1/admin/user
 */

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 用户登出
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/user/update/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export function batchDeleteUser(ids) {
  return request({
    url: '/user/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 修改用户状态
export function updateUserStatus(id, status) {
  return request({
    url: `/user/status/${id}`,
    method: 'put',
    data: { status }
  })
}
