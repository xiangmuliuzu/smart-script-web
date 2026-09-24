import request from '@/utils/request'

const PRODUCT_PREFIX = '/api/v1/admin'

/** 内容模块产品业务 API */

export function getContentList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/content/list`,
    method: 'get',
    params
  })
}

export function getContentDetail(id) {
  return request({
    url: `${PRODUCT_PREFIX}/content/detail/${id}`,
    method: 'get'
  })
}

export function createContent(data) {
  return request({
    url: `${PRODUCT_PREFIX}/content/create`,
    method: 'post',
    data
  })
}

export function updateContent(id, data) {
  return request({
    url: `${PRODUCT_PREFIX}/content/update/${id}`,
    method: 'put',
    data
  })
}

export function deleteContent(id) {
  return request({
    url: `${PRODUCT_PREFIX}/content/delete/${id}`,
    method: 'delete'
  })
}

export function getCategoryList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/content/categories`,
    method: 'get',
    params
  })
}

export function getRankingList(params) {
  return request({
    url: `${PRODUCT_PREFIX}/content/rankings`,
    method: 'get',
    params
  })
}
