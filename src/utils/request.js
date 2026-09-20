import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api/v1/admin', // 管理端统一前缀
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 兼容若依 AjaxResult：成功码通常为 200，提示字段为 msg。
    const message = res.msg || res.message || '请求失败'
    if (res.code !== 200 && res.code !== 0) {
      ElMessage.error(message)
      
      // 401 未授权，跳转登录
      if (res.code === 401) {
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(message))
    }
    
    // 若依分页接口会直接返回 rows、total，不一定存在 data。
    // 普通接口仍返回 data，业务页不需要关心具体响应包装。
    return res.data ?? res
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('admin_token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.msg || error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request
