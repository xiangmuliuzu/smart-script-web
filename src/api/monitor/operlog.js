import request from '@/utils/request'

export function listOperlog(query) {
  return request({ url: '/monitor/operlog/list', method: 'get', params: query })
}
export function delOperlog(operId) {
  return request({ url: `/monitor/operlog/${operId}`, method: 'delete' })
}
export function cleanOperlog() {
  return request({ url: '/monitor/operlog/clean', method: 'delete' })
}
export function exportOperlog(query) {
  return request({ url: '/monitor/operlog/export', method: 'post', params: query, responseType: 'blob' })
}
