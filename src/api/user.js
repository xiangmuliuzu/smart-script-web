import request from '@/utils/request'

/**
 * 产品侧用户业务 API（非若依认证）。
 * 认证职责已迁至 @/api/login；此处不得再提供 login/logout/getInfo。
 * 业务路径在无后端前保持 /api/v1/admin 前缀，与认证 baseURL 解耦。
 */

const PRODUCT_PREFIX = '/api/v1/admin'

export function getUserList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/user/list`,
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: `${PRODUCT_PREFIX}/user/create`,
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/user/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `${PRODUCT_PREFIX}/user/delete/${id}`,
    method: 'delete'
  })
}

export function batchDeleteUser(ids) {
  return request({
    url: `${PRODUCT_PREFIX}/user/batch-delete`,
    method: 'post',
    data: { ids }
  })
}

export function updateUserStatus(id, status) {
  return request({
    url: `${PRODUCT_PREFIX}/user/status/${id}`,
    method: 'put',
    data: { status }
  })
}
