<template>
  <div class="portal-layout">
    <aside class="portal-sidebar">
      <router-link class="portal-brand" to="/pc/user/home"><el-icon :size="21"><Files /></el-icon><span>剧云策</span></router-link>
      <div class="portal-caption">个人工作台</div>
      <el-scrollbar class="portal-menu-scroll">
        <el-menu class="portal-menu" :default-active="route.path" :default-openeds="['works']" router>
          <el-menu-item index="/pc/user/home"><el-icon><House /></el-icon><span>工作台首页</span></el-menu-item>
          <!-- 作品管理入口只在 authorCapability === true 时显示（/auth/me 唯一判断来源） -->
          <el-sub-menu v-if="pcUserStore.authorCapability" index="works">
            <template #title><el-icon><Document /></el-icon><span>我的作品</span></template>
            <el-menu-item v-for="item in workItems" :key="item.path" :index="item.path">{{ item.title }}</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/pc/user/messages">
            <el-icon><ChatLineSquare /></el-icon><span>消息与沟通</span>
            <!-- 通知、会话、公告三个来源均成功时显示数字合计，任一失败降级为圆点 -->
            <el-badge v-if="unreadBadge" :value="unreadBadge" class="menu-badge" />
            <el-badge v-else-if="pcUnreadStore.showPartialDot" is-dot class="menu-badge" title="有未读消息" />
          </el-menu-item>
          <el-menu-item index="/pc/user/profile"><el-icon><User /></el-icon><span>个人资料</span></el-menu-item>
        </el-menu>
      </el-scrollbar>
      <div class="portal-account">
        <el-avatar :size="34" :src="avatarUrl(pcUserStore.user?.avatar) || undefined"><el-icon><UserFilled /></el-icon></el-avatar>
        <div class="account-copy"><strong>{{ pcUserStore.displayName }}</strong><small>{{ userTypeLabel }}</small></div>
        <el-button text class="logout-button" title="退出登录" aria-label="退出登录" @click="handleLogout"><el-icon><Right /></el-icon></el-button>
      </div>
    </aside>
    <div class="portal-main">
      <header class="portal-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/pc/user/home' }">个人工作台</el-breadcrumb-item>
          <el-breadcrumb-item v-if="route.path !== '/pc/user/home'">{{ route.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <router-link class="header-user" to="/pc/user/profile"><el-icon><Avatar /></el-icon>{{ pcUserStore.displayName }}</router-link>
      </header>
      <main class="portal-content"><router-view /></main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Files, House, Document, ChatLineSquare, User, UserFilled, Right, Avatar } from '@element-plus/icons-vue'
import { usePcUserStore } from '@/stores/pcUser'
import { avatarUrl } from '@/utils/avatarUrl'
import { usePcUnreadStore } from '@/stores/pcUnread'
import { userTypeLabel as userTypeText } from '@/utils/pcFormat'

const route = useRoute()
const router = useRouter()
const pcUserStore = usePcUserStore()
const pcUnreadStore = usePcUnreadStore()
const workItems = [
  { path: '/pc/user/works/all', title: '全部作品' },
  { path: '/pc/user/works/draft', title: '草稿' },
  { path: '/pc/user/works/review', title: '审核中' },
  { path: '/pc/user/works/revision', title: '待修改' },
  { path: '/pc/user/works/listed', title: '已上架' }
]
const userTypeLabel = computed(() => userTypeText(pcUserStore.userType))
const unreadBadge = computed(() => pcUnreadStore.badgeText || '')
// ---- 公共未读角标轮询：初始立即查询，30 秒周期，标签隐藏暂停，卸载/退出停止 ----
const UNREAD_INTERVAL_MS = 30000
let unreadTimer = null

function pollUnread() {
  if (!document.hidden) {
    pcUnreadStore.refresh()
  }
}

function onVisibilityChange() {
  if (!document.hidden) {
    pcUnreadStore.refresh()
  }
}

onMounted(() => {
  pcUnreadStore.refresh()
  unreadTimer = setInterval(pollUnread, UNREAD_INTERVAL_MS)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (unreadTimer) {
    clearInterval(unreadTimer)
    unreadTimer = null
  }
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

async function handleLogout() {
  // 退出失败也清理本地会话（pcUserStore.logout 内部兜底），进入登录页
  await pcUserStore.logout()
  ElMessage.success('已退出登录')
  router.replace('/login')
}
</script>

<style scoped>
.portal-layout{display:flex;min-height:100vh;background:#f5f6f8}
.portal-sidebar{position:sticky;top:0;align-self:flex-start;width:240px;min-width:240px;height:100vh;height:100dvh;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;background:#1f2329;color:#fff}
.portal-brand{height:64px;flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 24px;color:#fff;text-decoration:none;font-size:18px;font-weight:600;letter-spacing:2px}
.portal-caption{height:40px;flex-shrink:0;display:flex;align-items:center;margin:8px 8px 4px;padding:0 17px;border-left:3px solid #4a4d52;background:rgba(255,255,255,.03);font-size:11px;font-weight:700;letter-spacing:1.5px;color:#909399}
.portal-menu-scroll{flex:1;min-height:0}.portal-menu{border:0;background:transparent}
.portal-menu :deep(.el-menu-item),.portal-menu :deep(.el-sub-menu__title){color:#c0c4cc;background:transparent;height:40px;line-height:40px;margin:2px 8px;border-radius:4px}
.portal-menu :deep(.el-sub-menu .el-menu){background:#1f2329}
.portal-menu :deep(.el-menu-item:hover),.portal-menu :deep(.el-sub-menu__title:hover){background:rgba(255,255,255,.05);color:#fff}
.portal-menu :deep(.el-menu-item.is-active){background:rgba(255,255,255,.08);color:#fff;position:relative}
.portal-menu :deep(.el-menu-item.is-active::before){content:'';position:absolute;left:0;top:6px;bottom:6px;width:3px;background:#fff;border-radius:0 2px 2px 0}
.portal-menu :deep(.el-sub-menu .el-menu-item){padding-left:48px!important;height:38px;line-height:38px;min-width:0}
.menu-badge{margin-left:auto}
.menu-badge :deep(.el-badge__content){background-color:#f56c6c;border:0}
.portal-account{display:flex;flex-shrink:0;align-items:center;gap:10px;padding:16px 14px;background:#1a1d23;border-top:1px solid #30343c}
.account-copy{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.account-copy strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.account-copy small{color:#8a8f99}
.logout-button{color:#a8abb2}.portal-main{flex:1;min-width:0;min-height:100vh;display:flex;flex-direction:column}
.portal-header{height:60px;padding:0 28px;background:#fff;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between}
.header-user{display:flex;align-items:center;gap:7px;color:#606266;text-decoration:none}.portal-content{flex:1;padding:28px;min-width:0}
@media(max-width:760px){.portal-layout{display:block}.portal-sidebar{position:static;width:100%;min-width:0;height:auto}.portal-main{min-height:0}.portal-brand{height:52px}.portal-caption,.portal-account{display:none}.portal-menu-scroll{overflow-x:auto}.portal-menu{display:flex;width:max-content}.portal-menu :deep(.el-menu-item),.portal-menu :deep(.el-sub-menu__title){padding:0 14px!important}.portal-menu :deep(.el-sub-menu .el-menu-item){padding:0 14px!important}.portal-header{padding:0 16px}.portal-content{padding:16px}}
</style>
