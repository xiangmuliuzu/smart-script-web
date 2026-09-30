import request from '@/utils/request'

/** 若依动态路由：/getRouters 是生产菜单与受限页面路由的唯一运行时来源 */
export function getRouters() {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}
