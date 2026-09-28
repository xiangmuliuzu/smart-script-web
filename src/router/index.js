import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from '@/router/static-routes'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

function safeRedirect(query) {
  const raw = query?.redirect
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  // 默认首页走根路由 '/'，由 MainShell.redirect 解析到真实首页，避免硬编码未注册的 '/dashboard'。
  return '/'
}

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  document.title = to.meta?.title ? `${to.meta.title} - 剧云策管理后台` : '剧云策管理后台'

  if (to.path === '/login') {
    if (token) {
      next(safeRedirect(to.query))
    } else {
      next()
    }
    return
  }

  if (!token) {
    const redirect = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    next(`/login${redirect}`)
    return
  }

  // 有 Token：先 getInfo，再 getRouters，再 replace 原目标
  if (!userStore.infoLoaded || !permissionStore.initialized) {
    try {
      if (!userStore.infoLoaded) {
        await userStore.fetchUserInfo()
      }
      if (!permissionStore.initialized) {
        await permissionStore.generateRoutes()
      }
      return next({ path: to.path, query: to.query, hash: to.hash, replace: true })
    } catch (error) {
      console.error('[router] init failed', error?.message || error)
      userStore.resetSession()
      permissionStore.resetRoutes()
      return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }

  next()
})

export default router
