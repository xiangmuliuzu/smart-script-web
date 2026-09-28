/**
 * 公共路由：登录、错误页与 PC 用户门户（01/02/03 共用）。
 * 管理端业务路由一律由 /getRouters 动态注册；用户门户为静态路由，登录后即时可用。
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
  },
  // ---- PC 用户门户（01/02/03 共用，本阶段未开发的功能用占位页） ----
  {
    path: '/pc/user',
    name: 'PcUserHome',
    component: () => import('@/views/pc/UserHome.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/pc/user/works',
    name: 'PcUserWorks',
    component: () => import('@/views/pc/DevPlaceholder.vue'),
    meta: { title: '我的作品' }
  },
  {
    path: '/pc/user/orders',
    name: 'PcUserOrders',
    component: () => import('@/views/pc/DevPlaceholder.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/pc/user/profile',
    name: 'PcUserProfile',
    component: () => import('@/views/pc/DevPlaceholder.vue'),
    meta: { title: '账号资料' }
  },
  // catch-all：管理员动态路由注册前后未知路径都落 404（动态路由优先级高于通配，注册后不受影响）
  {
    path: '/:pathMatch(.*)*',
    name: 'Page404CatchAll',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '未找到' }
  }
]

export default constantRoutes
