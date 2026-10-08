import request from '@/utils/pcRequest'

/**
 * PC 用户端「作品详情与审核流程」（A2）接口封装。
 * 复用 App 凭证域（/api/v1/users/me/works），自动携带用户 Bearer Token。
 * 响应为 App 契约信封，pcRequest 成功时已解包为 data。
 */

/** 我的作品列表（支持状态过滤：all/draft/reviewing/revision/rejected/published） */
export function listWorks(status = 'all') {
  return request({ url: `/api/v1/users/me/works`, method: 'get', params: { status } })
}

/** 作品详情（含章节目录、最近审核意见） */
export function getWorkDetail(workId) {
  return request({ url: `/api/v1/users/me/works/${workId}`, method: 'get' })
}

/** 修改作品基本信息（标题/简介/分类） */
export function updateWork(workId, data) {
  return request({ url: `/api/v1/users/me/works/${workId}`, method: 'put', data })
}

/** 提交审核 */
export function submitWork(workId) {
  return request({ url: `/api/v1/users/me/works/${workId}/submit`, method: 'post' })
}

/** 章节目录（含内容全文） */
export function getChapters(workId) {
  return request({ url: `/api/v1/users/me/works/${workId}/chapters`, method: 'get' })
}

/** 新增章节 */
export function addChapter(workId, data) {
  return request({ url: `/api/v1/users/me/works/${workId}/chapters`, method: 'post', data })
}

/** 修改章节 */
export function updateChapter(workId, chapterId, data) {
  return request({ url: `/api/v1/users/me/works/${workId}/chapters/${chapterId}`, method: 'put', data })
}

/** 删除章节 */
export function deleteChapter(workId, chapterId) {
  return request({ url: `/api/v1/users/me/works/${workId}/chapters/${chapterId}`, method: 'delete' })
}

/** 审核记录（审核历史 + 管理员意见） */
export function getReviewRecords(workId) {
  return request({ url: `/api/v1/users/me/works/${workId}/review-records`, method: 'get' })
}
