import request from '@/utils/request'

/**
 * B 模块（内容与作品）PC 后台 API
 * 依据：smartscript-content 模块 SysCategoryController / SysTagController
 * 统一前缀 /api/v1/admin/content，鉴权走若依 RBAC（Bearer Token）
 */

const ADMIN_PREFIX = '/api/v1/admin/content'

// ---------------- 剧本分类 ----------------

/** 分类分页列表（categoryName 模糊、categoryType/status 精确） */
export function listCategory(query) {
  return request({
    url: `${ADMIN_PREFIX}/category/list`,
    method: 'get',
    params: query
  })
}

/** 分类详情 */
export function getCategory(categoryId) {
  return request({
    url: `${ADMIN_PREFIX}/category/${categoryId}`,
    method: 'get'
  })
}

/** 新增分类 */
export function addCategory(data) {
  return request({
    url: `${ADMIN_PREFIX}/category`,
    method: 'post',
    data
  })
}

/** 编辑分类 */
export function updateCategory(data) {
  return request({
    url: `${ADMIN_PREFIX}/category`,
    method: 'put',
    data
  })
}

/** 启用/停用分类（单一职责：仅改 status） */
export function changeCategoryStatus(data) {
  return request({
    url: `${ADMIN_PREFIX}/category/changeStatus`,
    method: 'put',
    data
  })
}

/** 调整分类排序（单一职责：仅改 sort） */
export function changeCategorySort(data) {
  return request({
    url: `${ADMIN_PREFIX}/category/changeSort`,
    method: 'put',
    data
  })
}

// ---------------- 标签 ----------------

/** 标签分页列表（tagName 模糊、tagType/status 精确） */
export function listTag(query) {
  return request({
    url: `${ADMIN_PREFIX}/tag/list`,
    method: 'get',
    params: query
  })
}

/** 标签详情 */
export function getTag(tagId) {
  return request({
    url: `${ADMIN_PREFIX}/tag/${tagId}`,
    method: 'get'
  })
}

/** 新增标签 */
export function addTag(data) {
  return request({
    url: `${ADMIN_PREFIX}/tag`,
    method: 'post',
    data
  })
}

/** 编辑标签 */
export function updateTag(data) {
  return request({
    url: `${ADMIN_PREFIX}/tag`,
    method: 'put',
    data
  })
}

/** 删除标签（支持批量，tagIds 传逗号拼接字符串或单个 id，物理删除） */
export function delTag(tagIds) {
  return request({
    url: `${ADMIN_PREFIX}/tag/${tagIds}`,
    method: 'delete'
  })
}
