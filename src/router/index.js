import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { constantRoutes } from '@/router/static-routes'
import { getToken, getUserToken, getAccountType, removeAccountType } from '@/utils/auth'
import { isUserType, isUserPortalPath, homePathFor, USER_PORTAL_HOME } from '@/utils/account'
import { useUserStore } from '@/stores/user'
import { usePcUserStore } from '@/stores/pcUser'
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

/** 全量清理两类会话与动态路由（切换账号 / 会话不一致兜底） */
function resetAllSessions(userStore, pcUserStore, permissionStore) {
  userStore.resetSession()
  pcUserStore.resetSession()
  permissionStore.resetRoutes()
}

router.beforeEach(async (to, from, next) => {
  const adminToken = getToken()
  const userToken = getUserToken()
  const accountType = getAccountType()
  const userStore = useUserStore()
  const pcUserStore = usePcUserStore()
  const permissionStore = usePermissionStore()

  document.title = to.meta?.title ? `${to.meta.title} - 剧云策` : '剧云策'

  if (to.path === '/login') {
    if (adminToken || userToken) {
      // 已有会话再进登录页：按已确认的账号类型回到对应首页
      next(homePathFor(accountType))
    } else {
      if (accountType) {
        removeAccountType()
      }
      next()
    }
    return
  }

  if (!adminToken && !userToken) {
    // 无会话：清理残留的账号类型与动态路由后再去登录页
    resetAllSessions(userStore, pcUserStore, permissionStore)
    const redirect = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    next(`/login${redirect}`)
    return
  }

  // 会话与账号类型不一致（旧版本登录 / 存储异常 / 切换未完成）：全量清理，要求重新登录
  const sessionMatchesType = isUserType(accountType) ? !!userToken : accountType === '00' && !!adminToken
  if (!sessionMatchesType) {
    resetAllSessions(userStore, pcUserStore, permissionStore)
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    return
  }

  // ---- PC 用户端会话（01/02/03）：只允许访问 /pc/** 门户 ----
  if (isUserType(accountType)) {
    if (!isUserPortalPath(to.path)) {
      next('/pc/user')
      return
    }
    // 首次进入（含刷新后 store 重建）：用 /auth/me 校验令牌有效性。
    // 认证失效与账号停用已由 pcRequest 清理会话并跳登录页；
    // 临时网络/服务故障（超时、5xx）不得清空有效凭证：
    // 转身份确认页提供重试，确认前不展示受保护内容。
    if (to.path === '/pc/user/session-check' && !pcUserStore.infoLoaded) {
      next()
      return
    }
    if (!pcUserStore.infoLoaded) {
      try {
        await pcUserStore.fetchMe()
      } catch (error) {
        next({ path: '/pc/user/session-check', query: { redirect: to.fullPath } })
        return
      }
    }
    // 作品路由按作者能力拦截：判断唯一来源是 /auth/me 的 authorCapability，
    // 身份未确认（infoLoaded=false）时不放行；后端作品接口仍独立校验归属
    if (to.path.startsWith(`${USER_PORTAL_HOME}/works`) && !pcUserStore.authorCapability) {
      ElMessage.warning('尚未开通创作者功能')
      next('/pc/user/home')
      return
    }
    next()
    return
  }

  // ---- 管理员会话（00）：禁止访问用户门户，维持原有动态路由初始化流程 ----
  if (isUserPortalPath(to.path)) {
    next('/')
    return
  }

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
