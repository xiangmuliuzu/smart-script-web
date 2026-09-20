import request from '@/utils/request'

/**
 * 内容模块 API
 * 接口前缀: /api/v1/admin/content
 */

// 获取内容列表
export function getContentList(params) {
  return request({
    url: '/content/list',
    method: 'get',
    params
  })
}

// 获取内容详情
export function getContentDetail(id) {
  return request({
    url: `/content/detail/${id}`,
    method: 'get'
  })
}

// 创建内容
export function createContent(data) {
  return request({
    url: '/content/create',
    method: 'post',
    data
  })
}

// 更新内容
export function updateContent(id, data) {
  return request({
    url: `/content/update/${id}`,
    method: 'put',
    data
  })
}

// 删除内容
export function deleteContent(id) {
  return request({
    url: `/content/delete/${id}`,
    method: 'delete'
  })
}

// 获取分类列表
export function getCategoryList(params) {
  return request({
    url: '/content/category/list',
    method: 'get',
    params
  })
}

// 创建分类
export function createCategory(data) {
  return request({
    url: '/content/category/create',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/content/category/update/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/content/category/delete/${id}`,
    method: 'delete'
  })
}

// 获取书城排行榜配置
export function getRankingList(params) {
  return request({
    url: '/content/ranking/list',
    method: 'get',
    params
  })
}

// 新增或更新排行榜配置
export function saveRanking(data) {
  return request({
    url: '/content/ranking/save',
    method: 'post',
    data
  })
}

// 获取外部漫剧接口内容
export function getExternalVideoList(params) {
  return request({
    url: '/content/external-video/list',
    method: 'get',
    params
  })
}

// 触发外部漫剧接口同步
export function syncExternalVideo(data) {
  return request({
    url: '/content/external-video/sync',
    method: 'post',
    data
  })
}
