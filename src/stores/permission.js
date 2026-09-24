import { defineStore } from 'pinia'
import router from '@/router'
import { getRouters } from '@/api/menu'
import { adaptRuoYiRoutes } from '@/router/route-adapter'
import { constantRoutes } from '@/router/static-routes'

let initPromise = null
const addedRouteNames = new Set()

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    sidebarRoutes: [],
    initialized: false,
    rejectedRoutes: []
  }),

  actions: {
    /**
     * 消费 /getRouters，动态 addRoute。并发调用共享同一 Promise。
     */
    async generateRoutes({ force = false } = {}) {
      if (this.initialized && !force) {
        return this.routes
      }
      if (initPromise && !force) {
        return initPromise
      }
      initPromise = this._loadRoutes()
        .finally(() => {
          initPromise = null
        })
      return initPromise
    },

    async _loadRoutes() {
      const serverMenus = await getRouters()
      const list = Array.isArray(serverMenus) ? serverMenus : []
      const { routes, rejected, sidebar } = adaptRuoYiRoutes(list)

      // 先移除旧 MainShell，再注册，避免 name/path 冲突
      if (router.hasRoute('MainShell')) {
        router.removeRoute('MainShell')
        addedRouteNames.delete('MainShell')
      }
      for (const route of routes) {
        const key = route.name || route.path
        if (addedRouteNames.has(key) || router.hasRoute(key)) {
          try { router.removeRoute(key) } catch (e) { /* ignore */ }
          addedRouteNames.delete(key)
        }
        try {
          router.addRoute(route)
          addedRouteNames.add(key)
        } catch (error) {
          console.error('[permission] addRoute failed', route.path, error?.message || error)
          rejected.push({ path: route.path, reason: 'addRoute-failed' })
        }
      }

      if (!router.hasRoute('Page404CatchAll')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'Page404CatchAll',
          component: () => import('@/views/error/404.vue'),
          meta: { title: '未找到' }
        })
        addedRouteNames.add('Page404CatchAll')
      }

      this.routes = constantRoutes.concat(routes)
      this.sidebarRoutes = sidebar
      this.rejectedRoutes = rejected
      this.initialized = true
      console.info('[permission] dynamic routes ready', {
        leaves: routes[0]?.children?.length || 0,
        rejected: rejected.length,
        firstRedirect: routes[0]?.redirect
      })
      return routes
    },

    resetRoutes() {
      for (const name of [...addedRouteNames]) {
        try {
          router.removeRoute(name)
        } catch (e) {
          // ignore
        }
        addedRouteNames.delete(name)
      }
      this.routes = []
      this.sidebarRoutes = []
      this.rejectedRoutes = []
      this.initialized = false
      initPromise = null
    }
  }
})

export default usePermissionStore
