<template>
  <div class="main-layout">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <el-icon class="logo-icon"><Files /></el-icon>
          <h2>剧云策</h2>
        </div>

        <el-scrollbar class="menu-scrollbar">
          <el-menu
            :default-active="activeMenu"
            :unique-opened="false"
            router
            background-color="#1f2329"
            text-color="#8a8f99"
            active-text-color="#ffffff"
            class="sidebar-menu"
          >
            <template v-for="group in menuTree" :key="group.path">
              <el-sub-menu v-if="group.children && group.children.length" :index="group.path">
                <template #title>
                  <span>{{ group.meta?.title || group.path }}</span>
                </template>
                <el-menu-item
                  v-for="item in group.children"
                  :key="item.path"
                  :index="item.path"
                >
                  <span>{{ item.meta?.title || item.path }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="group.path">
                <span>{{ group.meta?.title || group.path }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </el-scrollbar>

        <div class="sidebar-footer">
          <div class="admin-info">
            <el-avatar :size="36" class="admin-avatar">
              <el-icon><Avatar /></el-icon>
            </el-avatar>
            <div class="admin-details">
              <div class="admin-name">{{ userStore.username || '未登录' }}</div>
              <div class="admin-role">{{ roleLabel }}</div>
            </div>
            <el-icon class="logout-icon" @click="handleCommand('logout')">
              <Right />
            </el-icon>
          </div>
        </div>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-icon><Avatar /></el-icon>
                  {{ userStore.username || '未登录' }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Files, Avatar, Right } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')
const roleLabel = computed(() => {
  const roles = userStore.roles || []
  return roles.length ? roles.join(' / ') : '—'
})

/** 服务端菜单树（permission store），无硬编码生产菜单回退 */
const menuTree = computed(() => {
  return (permissionStore.sidebarRoutes || [])
    .filter((item) => !item.hidden)
    .map((group) => {
      const children = (group.children || []).filter((c) => !c.hidden)
      return { ...group, children }
    })
    .filter((group) => group.children.length || (!group.children.length && group.path))
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
      permissionStore.resetRoutes()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.main-layout { height: 100vh; overflow: hidden; }
.el-container { height: 100%; }
.sidebar {
  background-color: #1f2329;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #1a1d23;
  color: #fff;
  border-bottom: 1px solid #2a2e35;
  flex-shrink: 0;
}
.logo-icon { font-size: 22px; color: #909399; }
.logo h2 { font-size: 18px; font-weight: 600; margin: 0; letter-spacing: 1px; }
.menu-scrollbar { flex: 1; overflow-y: auto; }
.sidebar-menu { border-right: none; }
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  padding-left: 20px !important;
  margin: 2px 8px;
  border-radius: 4px;
}
.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title) {
  background-color: rgba(255, 255, 255, 0.03);
  border-left: 3px solid #4a4d52;
  margin: 8px 8px 4px 8px;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 30px !important;
}
.sidebar-footer {
  flex-shrink: 0;
  background-color: #1a1d23;
  border-top: 1px solid #2a2e35;
  padding: 12px;
}
.admin-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 6px;
}
.admin-info:hover { background-color: rgba(255, 255, 255, 0.05); }
.admin-avatar { background-color: #606266; width: 32px; height: 32px; }
.admin-details { flex: 1; min-width: 0; }
.admin-name { font-size: 13px; color: #fff; font-weight: 500; margin-bottom: 2px; }
.admin-role { font-size: 11px; color: #8a8f99; }
.logout-icon { font-size: 14px; color: #8a8f99; }
.header {
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
}
.header-content { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.breadcrumb { flex: 1; }
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  color: #606266;
  font-size: 12px;
}
.main-content { background-color: #f5f6f8; overflow-y: auto; padding: 0; }
</style>
