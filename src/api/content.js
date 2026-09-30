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

// ---------------- 作品管理 ----------------

/** 作品分页列表（title 模糊，authorId/genreId/status/workType/tradeType 精确） */
export function listWork(query) {
  return request({
    url: `${ADMIN_PREFIX}/work/list`,
    method: 'get',
    params: query
  })
}

/** 作品详情 */
export function getWork(workId) {
  return request({
    url: `${ADMIN_PREFIX}/work/${workId}`,
    method: 'get'
  })
}

/** 作品章节分页列表 */
export function listWorkChapters(workId, query) {
  return request({
    url: `${ADMIN_PREFIX}/work/${workId}/chapters`,
    method: 'get',
    params: query
  })
}

// ---------------- 书城作品管理 ----------------

/** 书城作品分页列表（title 模糊，recommendStatus/status/tradeEnabled 精确） */
export function listBookstore(query) {
  return request({
    url: `${ADMIN_PREFIX}/bookstore/list`,
    method: 'get',
    params: query
  })
}

/** 书城作品详情 */
export function getBookstore(workId) {
  return request({
    url: `${ADMIN_PREFIX}/bookstore/${workId}`,
    method: 'get'
  })
}

/** 上架/下架书城作品（单一职责：仅改 status） */
export function changeBookstoreStatus(data) {
  return request({
    url: `${ADMIN_PREFIX}/bookstore/changeStatus`,
    method: 'put',
    data
  })
}

/** 开启/关闭交易（单一职责：仅改 tradeEnabled） */
export function changeBookstoreTrade(data) {
  return request({
    url: `${ADMIN_PREFIX}/bookstore/changeTrade`,
    method: 'put',
    data
  })
}

/** 更新书城扩展信息（extJson 由前端构建为 JSON 字符串） */
export function updateBookstoreExt(data) {
  return request({
    url: `${ADMIN_PREFIX}/bookstore/updateExt`,
    method: 'put',
    data
  })
}

// ---------------- 排行榜管理 ----------------

/** 排行榜分页列表（rankingType/periodStart/periodEnd/status 过滤） */
export function listRanking(query) {
  return request({
    url: `${ADMIN_PREFIX}/ranking/list`,
    method: 'get',
    params: query
  })
}

/** 排行榜条目详情 */
export function getRanking(rankingId) {
  return request({
    url: `${ADMIN_PREFIX}/ranking/${rankingId}`,
    method: 'get'
  })
}

/** 调整榜单排名（单一职责：仅改 rankNo） */
export function changeRankNo(data) {
  return request({
    url: `${ADMIN_PREFIX}/ranking/changeRankNo`,
    method: 'put',
    data
  })
}

/** 重算榜单（按 metric 与时间窗口；返回 newSnapshotCount/oldInvalidatedCount） */
export function recomputeRanking(params) {
  return request({
    url: `${ADMIN_PREFIX}/ranking/recompute`,
    method: 'post',
    params
  })
}

// ---------------- Banner管理 ----------------

/** Banner 分页列表（title 模糊，position/status 精确） */
export function listBanner(query) {
  return request({
    url: `${ADMIN_PREFIX}/banner/list`,
    method: 'get',
    params: query
  })
}

/** Banner 详情 */
export function getBanner(bannerId) {
  return request({
    url: `${ADMIN_PREFIX}/banner/${bannerId}`,
    method: 'get'
  })
}

/** 新增 Banner */
export function addBanner(data) {
  return request({
    url: `${ADMIN_PREFIX}/banner`,
    method: 'post',
    data
  })
}

/** 编辑 Banner */
export function updateBanner(data) {
  return request({
    url: `${ADMIN_PREFIX}/banner`,
    method: 'put',
    data
  })
}

/** 上架/下架 Banner（单一职责：仅改 status） */
export function changeBannerStatus(data) {
  return request({
    url: `${ADMIN_PREFIX}/banner/changeStatus`,
    method: 'put',
    data
  })
}

/** 调整 Banner 排序（单一职责：仅改 sortOrder） */
export function changeBannerSort(data) {
  return request({
    url: `${ADMIN_PREFIX}/banner/changeSort`,
    method: 'put',
    data
  })
}

// ---------------- 作品上传资料 ----------------
export function listWorkFile(query) { return request({ url: `${ADMIN_PREFIX}/workfile/list`, method: 'get', params: query }) }
export function getWorkFile(fileId) { return request({ url: `${ADMIN_PREFIX}/workfile/${fileId}`, method: 'get' }) }
export function listWorkVersions(query) { return request({ url: `${ADMIN_PREFIX}/workfile/versions`, method: 'get', params: query }) }
export function getWorkVersion(versionId) { return request({ url: `${ADMIN_PREFIX}/workfile/version/${versionId}`, method: 'get' }) }

// ---------------- 外部视频-渠道管理 ----------------
export function listDramaChannel(query) { return request({ url: `${ADMIN_PREFIX}/dramaChannel/list`, method: 'get', params: query }) }
export function getDramaChannel(channelId) { return request({ url: `${ADMIN_PREFIX}/dramaChannel/${channelId}`, method: 'get' }) }
export function addDramaChannel(data) { return request({ url: `${ADMIN_PREFIX}/dramaChannel`, method: 'post', data }) }
export function updateDramaChannel(data) { return request({ url: `${ADMIN_PREFIX}/dramaChannel`, method: 'put', data }) }
export function changeDramaChannelStatus(data) { return request({ url: `${ADMIN_PREFIX}/dramaChannel/changeStatus`, method: 'put', data }) }

// ---------------- 外部视频-内容管理 ----------------
export function listDrama(query) { return request({ url: `${ADMIN_PREFIX}/drama/list`, method: 'get', params: query }) }
export function getDrama(dramaId) { return request({ url: `${ADMIN_PREFIX}/drama/${dramaId}`, method: 'get' }) }
export function addDrama(data) { return request({ url: `${ADMIN_PREFIX}/drama`, method: 'post', data }) }
export function updateDrama(data) { return request({ url: `${ADMIN_PREFIX}/drama`, method: 'put', data }) }

// ---------------- 外部视频-关联剧本 ----------------
export function listDramaBind(query) { return request({ url: `${ADMIN_PREFIX}/dramaBind/list`, method: 'get', params: query }) }
export function getDramaBind(dramaId) { return request({ url: `${ADMIN_PREFIX}/dramaBind/${dramaId}`, method: 'get' }) }
export function bindDrama(data) { return request({ url: `${ADMIN_PREFIX}/dramaBind/bind`, method: 'put', data }) }
export function unbindDrama(data) { return request({ url: `${ADMIN_PREFIX}/dramaBind/unbind`, method: 'put', data }) }

// ---------------- 外部视频-上下架管理 ----------------
export function listDramaStatus(query) { return request({ url: `${ADMIN_PREFIX}/dramaStatus/list`, method: 'get', params: query }) }
export function changeDramaStatus(data) { return request({ url: `${ADMIN_PREFIX}/dramaStatus/changeStatus`, method: 'put', data }) }
export function syncDrama(data) { return request({ url: `${ADMIN_PREFIX}/dramaStatus/sync`, method: 'put', data }) }

// ---------------- 外部视频-播放数据 ----------------
export function listDramaStats(query) { return request({ url: `${ADMIN_PREFIX}/dramaStats/list`, method: 'get', params: query }) }
export function getDramaStats(workId) { return request({ url: `${ADMIN_PREFIX}/dramaStats/${workId}`, method: 'get' }) }
export function listDramaHistory(query) { return request({ url: `${ADMIN_PREFIX}/dramaStats/history`, method: 'get', params: query }) }
