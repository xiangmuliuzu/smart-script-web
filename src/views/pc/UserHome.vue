<template>
  <div class="pc-user-home">
    <header class="topbar">
      <div class="brand-row">
        <div class="logo-icon">
          <el-icon :size="20"><Document /></el-icon>
        </div>
        <span class="brand-name">剧云策</span>
        <span class="brand-tag">PC 用户端</span>
      </div>
      <div class="topbar-right">
        <span class="user-name">{{ pcUserStore.displayName }}</span>
        <el-button text type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="content">
      <section class="welcome-card">
        <div class="welcome-text">
          <h1>{{ greeting }}，{{ pcUserStore.displayName }}</h1>
          <p>欢迎使用剧云策智能剧本创作平台，开始你的创作之旅。</p>
        </div>
        <div class="welcome-meta">
          <el-tag v-if="userTypeLabel" type="primary" effect="light">{{ userTypeLabel }}</el-tag>
          <el-tag v-if="pcUserStore.user?.phoneMasked" type="info" effect="plain">
            {{ pcUserStore.user.phoneMasked }}
          </el-tag>
          <el-tag v-if="realNameLabel" :type="realNameTagType" effect="plain">实名：{{ realNameLabel }}</el-tag>
        </div>
      </section>

      <section class="entry-grid">
        <router-link v-for="entry in entries" :key="entry.path" class="entry-card" :to="entry.path">
          <div class="entry-icon">
            <el-icon :size="24"><component :is="entry.icon" /></el-icon>
          </div>
          <div class="entry-body">
            <h3>{{ entry.title }}</h3>
            <p>{{ entry.desc }}</p>
          </div>
          <el-tag v-if="entry.developing" size="small" type="warning" effect="plain">开发中</el-tag>
        </router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, EditPen, Tickets, UserFilled } from '@element-plus/icons-vue'
import { usePcUserStore } from '@/stores/pcUser'

const router = useRouter()
const pcUserStore = usePcUserStore()

// 本阶段 01/02/03 共用同一门户，不区分普通用户/创作者/甲方的专属页面
const USER_TYPE_LABELS = { '01': '普通用户', '02': '创作者', '03': '甲方' }
const REAL_NAME_LABELS = {
  APPROVED: { label: '已通过', type: 'success' },
  PENDING: { label: '审核中', type: 'warning' },
  REJECTED: { label: '未通过', type: 'danger' }
}

const entries = [
  { path: '/pc/user/works', title: '我的作品', desc: '剧本创作与管理', icon: EditPen, developing: true },
  { path: '/pc/user/orders', title: '我的订单', desc: '剧本交易与合同', icon: Tickets, developing: true },
  { path: '/pc/user/profile', title: '账号资料', desc: '资料与账号安全', icon: UserFilled, developing: true }
]

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const userTypeLabel = computed(() => USER_TYPE_LABELS[pcUserStore.userType] || '')

const realNameLabel = computed(() => REAL_NAME_LABELS[pcUserStore.user?.realNameStatus]?.label || '')

const realNameTagType = computed(() => REAL_NAME_LABELS[pcUserStore.user?.realNameStatus]?.type || 'info')

onMounted(async () => {
  if (!pcUserStore.isLoggedIn) {
    router.replace('/login')
    return
  }
  // 刷新后重取 /auth/me，保证资料与令牌有效性即时校验
  try {
    await pcUserStore.fetchMe()
  } catch (error) {
    // 401 已由 pcRequest 统一处理并跳转登录页
  }
})

async function handleLogout() {
  await pcUserStore.logout()
  ElMessage.success('已退出登录')
  router.replace('/login')
}
</script>

<style scoped>
.pc-user-home {
  min-height: 100vh;
  background-color: #f5f6f8;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 32px;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(31, 35, 41, 0.08);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #1f2329 0%, #3a3f47 100%);
  border-radius: 8px;
  color: #ffffff;
}

.brand-name {
  font-size: 17px;
  font-weight: 600;
  color: #1f2329;
  letter-spacing: 2px;
}

.brand-tag {
  font-size: 12px;
  color: #8c8c8c;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 1px 8px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: #262626;
}

.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.welcome-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding: 28px 32px;
  background: linear-gradient(135deg, #2b3038 0%, #1f2329 60%, #12151a 100%);
  border-radius: 14px;
  color: #ffffff;
}

.welcome-text h1 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.welcome-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(31, 35, 41, 0.06);
  text-decoration: none;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.entry-card:hover {
  box-shadow: 0 4px 14px rgba(31, 35, 41, 0.12);
  transform: translateY(-2px);
}

.entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: #f0f2f5;
  color: #1f2329;
  flex-shrink: 0;
}

.entry-body {
  flex: 1;
  min-width: 0;
}

.entry-body h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.entry-body p {
  margin: 0;
  font-size: 13px;
  color: #8c8c8c;
}
</style>
