import request from '@/utils/request'

// 2026-10-09 菜单精简后 system/user 管理页面已下线，此文件仅保留
// 聊天模块（ChatDetail 分配管理员）所需的管理员列表查询接口。
export function listUser(query) {
  return request({ url: '/system/user/list', method: 'get', params: query })
}
