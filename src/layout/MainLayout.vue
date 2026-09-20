<template>
  <div class="main-layout">
    <el-container>
      <!-- 侧边栏 -->
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
            <!-- 工作台（可折叠分组） -->
            <el-sub-menu index="workspace-group">
              <template #title>
                <span>工作台</span>
              </template>
              <el-menu-item index="/dashboard">
                <el-icon><DataAnalysis /></el-icon>
                <span>数据总览</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 内容与作品 -->
            <el-sub-menu index="content-group">
              <template #title>
                <span>内容与作品</span>
              </template>
              <el-menu-item index="/content/works">
                <el-icon><Document /></el-icon>
                <span>作品内容管理</span>
              </el-menu-item>
              <el-menu-item index="/content/categories">
                <el-icon><FolderOpened /></el-icon>
                <span>分类与标签</span>
              </el-menu-item>
              <el-menu-item index="/content/ranking">
                <el-icon><Trophy /></el-icon>
                <span>排行榜管理</span>
              </el-menu-item>
              <el-menu-item index="/content/external-video">
                <el-icon><VideoPlay /></el-icon>
                <span>外部漫剧发行</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 版权审核管理（可折叠分组） -->
            <el-sub-menu index="copyright-group">
              <template #title>
                <span>版权审核管理</span>
              </template>
              
              <!-- AI初审+人工复核（嵌套子菜单） -->
              <el-sub-menu index="copyright-review">
                <template #title>
                  <el-icon><Document /></el-icon>
                  <span>AI初审+人工复核</span>
                </template>
                <el-menu-item index="/copyright/review">作品审核工作台</el-menu-item>
                <el-menu-item index="/copyright/review-rules">AI审核规则配置</el-menu-item>
              </el-sub-menu>
              
              <el-menu-item index="/copyright/center">
                <el-icon><Link /></el-icon>
                <span>版权中心对接</span>
              </el-menu-item>
              
              <el-menu-item index="/copyright/assets">
                <el-icon><FolderOpened /></el-icon>
                <span>版权资产库管理</span>
              </el-menu-item>
              <el-menu-item index="/copyright/seals">
                <el-icon><Stamp /></el-icon>
                <span>印章审核</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 交易商务管理（可折叠分组） -->
            <el-sub-menu index="trade-group">
              <template #title>
                <span>交易商务管理</span>
              </template>
              <el-menu-item index="/trade/works">
                <el-icon><Document /></el-icon>
                <span>交易作品管理</span>
              </el-menu-item>
              <el-menu-item index="/trade/orders">
                <el-icon><DocumentCopy /></el-icon>
                <span>授权订单管理</span>
              </el-menu-item>
              <el-menu-item index="/trade/partners">
                <el-icon><User /></el-icon>
                <span>合作方管理</span>
              </el-menu-item>
              <el-menu-item index="/trade/inquiries">
                <el-icon><ChatLineSquare /></el-icon>
                <span>询盘与报价</span>
              </el-menu-item>
              <el-menu-item index="/trade/contracts">
                <el-icon><DocumentCopy /></el-icon>
                <span>合同与结算</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 平台运维管理（可折叠分组） -->
            <el-sub-menu index="operation-group">
              <template #title>
                <span>平台运维管理</span>
              </template>
              <el-menu-item index="/operation/ad-config">
                <el-icon><PictureFilled /></el-icon>
                <span>广告运营配置</span>
              </el-menu-item>
              <el-menu-item index="/user">
                <el-icon><UserFilled /></el-icon>
                <span>用户与创作者管理</span>
              </el-menu-item>
              <el-menu-item index="/risk">
                <el-icon><WarningFilled /></el-icon>
                <span>全局风控管理</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- AI 创作与福利 -->
            <el-sub-menu index="ai-group">
              <template #title>
                <span>AI 创作与福利</span>
              </template>
              <el-menu-item index="/ai/operations">
                <el-icon><Operation /></el-icon>
                <span>AI 创作与次数</span>
              </el-menu-item>
              <el-menu-item index="/support/welfare">
                <el-icon><Tools /></el-icon>
                <span>福利与积分配置</span>
              </el-menu-item>
              <el-menu-item index="/support/messages">
                <el-icon><Bell /></el-icon>
                <span>消息与公告</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 数据统计（可折叠分组） -->
            <el-sub-menu index="statistics-group">
              <template #title>
                <span>数据统计</span>
              </template>
              <el-menu-item index="/statistics/overview">
                <el-icon><TrendCharts /></el-icon>
                <span>运营数据总览</span>
              </el-menu-item>
              <el-menu-item index="/statistics/detail">
                <el-icon><Search /></el-icon>
                <span>明细数据查询</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 系统设置（可折叠分组） -->
            <el-sub-menu index="system-group">
              <template #title>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/system/permission">
                <el-icon><Lock /></el-icon>
                <span>权限管理</span>
              </el-menu-item>
              <el-menu-item index="/system/config">
                <el-icon><Tools /></el-icon>
                <span>系统配置</span>
              </el-menu-item>
              <el-menu-item index="/system/logs">
                <el-icon><Document /></el-icon>
                <span>操作日志</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>

        <!-- 底部管理员信息栏 -->
        <div class="sidebar-footer">
          <div class="admin-info">
            <el-avatar :size="36" class="admin-avatar">
              <el-icon><Avatar /></el-icon>
            </el-avatar>
            <div class="admin-details">
              <div class="admin-name">管理员</div>
              <div class="admin-role">超级管理员</div>
            </div>
            <el-icon class="logout-icon" @click="handleCommand('logout')">
              <Right />
            </el-icon>
          </div>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-icon><Avatar /></el-icon>
                  {{ userStore.username || '管理员' }}
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

        <!-- 内容区域 -->
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Files,
  DataAnalysis,
  Document,
  ChatLineSquare,
  Cpu,
  Link,
  FolderOpened,
  Stamp,
  Briefcase,
  DocumentCopy,
  User,
  Operation,
  VideoPlay,
  Trophy,
  Bell,
  PictureFilled,
  UserFilled,
  WarningFilled,
  TrendCharts,
  DataLine,
  Search,
  Setting,
  Lock,
  Tools,
  Notebook,
  Avatar,
  Right
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => route.meta.title || '')

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await userStore.logout()
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
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

/* ==================== 侧边栏样式 ==================== */
.sidebar {
  background-color: #1f2329;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

/* Logo 区域 */
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

.logo-icon {
  font-size: 22px;
  color: #909399;
}

.logo h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
}

/* 菜单滚动区域 */
.menu-scrollbar {
  flex: 1;
  overflow-y: auto;
}

.menu-scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.menu-scrollbar :deep(.el-scrollbar__view) {
  padding-bottom: 20px;
}

/* 菜单容器 */
.sidebar-menu {
  border-right: none;
}

/* 菜单分组标题 */
.menu-group-title {
  padding: 16px 20px 6px;
  font-size: 11px;
  color: #6b7075;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 一级菜单项 */
.sidebar-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  padding-left: 20px !important;
  margin: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 17px;
  margin-right: 10px;
  vertical-align: middle;
}

.sidebar-menu :deep(.el-menu-item span) {
  vertical-align: middle;
  font-size: 14px;
}

/* 一级分组标题样式（不带图标的 el-sub-menu） */
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  padding-left: 20px !important;
  margin: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* 分组标题（只有文字的）- 特殊样式区分 */
.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title) {
  background-color: rgba(255, 255, 255, 0.03);
  border-left: 3px solid #4a4d52;
  margin: 8px 8px 4px 8px;
  padding-left: 17px !important;
}

.sidebar-menu :deep(.el-sub-menu__title > span:only-child) {
  font-size: 11px;
  color: #909399;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: "Arial", "Helvetica Neue", sans-serif;
  opacity: 0.85;
}

/* 带图标的子菜单标题（如AI初审+人工复核） */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu__title) {
  padding-left: 30px !important;
  background-color: transparent;
  border-left: none;
  margin: 2px 8px;
}

.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  font-size: 17px;
  margin-right: 10px;
}

/* 悬停效果 - 柔和 */
.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu .el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #c0c4cc !important;
}

/* 分组标题悬停时有轻微变化 */
.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #c0c4cc !important;
  border-left-color: #606266;
  cursor: pointer;
}

/* 选中态 - 灰色背景 */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  position: relative;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background-color: #ffffff;
  border-radius: 0 2px 2px 0;
}

/* 一级分组下的子菜单项 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 30px !important;
  min-width: auto;
  height: 38px;
  line-height: 38px;
  margin: 1px 8px;
}

/* 二级嵌套（AI初审下的子项） */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 60px !important;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item .el-icon) {
  font-size: 15px;
  margin-right: 8px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item span) {
  font-size: 13px;
}

/* 子菜单展开箭头 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  font-size: 12px;
  margin-right: 6px;
  color: #c0c4cc;
  font-weight: bold;
}

/* 一级分组标题的箭头更明显 */
.sidebar-menu :deep(.el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  font-size: 13px;
  color: #909399;
  font-weight: bold;
}

/* 菜单角标（红色数字提示） */
.menu-badge {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.menu-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  font-size: 11px;
  border-radius: 9px;
  font-weight: 500;
}

/* ==================== 底部管理员信息栏 ==================== */
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
  transition: all 0.2s ease;
  padding: 8px 10px;
  border-radius: 6px;
}

.admin-info:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.admin-avatar {
  background-color: #606266;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.admin-details {
  flex: 1;
  min-width: 0;
}

.admin-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-role {
  font-size: 11px;
  color: #8a8f99;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon {
  font-size: 14px;
  color: #8a8f99;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.admin-info:hover .logout-icon {
  color: #c0c4cc;
  transform: translateX(2px);
}

/* ==================== 顶部导航栏 ==================== */
.header {
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #606266;
  font-size: 12px;
}

.user-info:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.user-info .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* ==================== 主内容区 ==================== */
.main-content {
  background-color: #f5f6f8;
  overflow-y: auto;
  padding: 0;
}
</style>
