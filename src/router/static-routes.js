/**
 * 公共路由：登录与错误页。业务路由一律由 /getRouters 动态注册。
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/401',
    name: 'Page401',
    component: () => import('@/views/error/401.vue'),
    meta: { title: '未授权' }
  },
  {
    path: '/403',
    name: 'Page403',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限' }
  },
  {
    path: '/404',
    name: 'Page404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '未找到' }
  }
]

export default constantRoutes
