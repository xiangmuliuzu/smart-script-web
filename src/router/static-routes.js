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
  // ---- PC 用户门户（01/02/03 共用） ----
  {
    path: '/pc/user',
    component: () => import('@/views/pc/PcUserLayout.vue'),
    redirect: '/pc/user/home',
    children: [
      { path: 'home', name: 'PcUserHome', component: () => import('@/views/pc/UserHome.vue'), meta: { title: '工作台首页' } },
      { path: 'works', redirect: '/pc/user/works/all' },
      ...[
        ['all', '全部作品'], ['draft', '草稿'], ['review', '审核中'],
        ['revision', '待修改'], ['listed', '已上架']
      ].map(([path, title]) => ({
        path: `works/${path}`,
        name: `PcUserWorks${path[0].toUpperCase()}${path.slice(1)}`,
        component: () => import('@/views/pc/UserWorks.vue'),
        meta: { title, workStatus: path }
      })),
      { path: 'works/:workId(\\d+)', name: 'PcUserWorkDetail', component: () => import('@/views/pc/WorkDetail.vue'), meta: { title: '作品详情' } },
      { path: 'messages', name: 'PcUserMessages', component: () => import('@/views/pc/UserMessages.vue'), meta: { title: '消息与沟通' } },
      { path: 'profile', name: 'PcUserProfile', component: () => import('@/views/pc/UserProfile.vue'), meta: { title: '个人资料' } },
      { path: 'session-check', name: 'PcUserSessionCheck', component: () => import('@/views/pc/SessionCheck.vue'), meta: { title: '身份确认' } },
      { path: 'orders', redirect: '/pc/user/home' }
    ]
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
