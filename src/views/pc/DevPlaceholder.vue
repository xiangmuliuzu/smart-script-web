<template>
  <div class="dev-placeholder">
    <header class="topbar">
      <router-link class="back-link" to="/pc/user">
        <el-icon><ArrowLeft /></el-icon>
        返回工作台
      </router-link>
      <span class="page-title">{{ pageTitle }}</span>
      <el-button text type="danger" @click="handleLogout">退出登录</el-button>
    </header>

    <main class="content">
      <el-empty description="功能开发中，敬请期待">
        <template #image>
          <el-icon :size="72" color="#c0c4cc"><Tools /></el-icon>
        </template>
        <el-button type="primary" @click="router.replace('/pc/user')">返回工作台</el-button>
      </el-empty>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Tools } from '@element-plus/icons-vue'
import { usePcUserStore } from '@/stores/pcUser'

const route = useRoute()
const router = useRouter()
const pcUserStore = usePcUserStore()

const pageTitle = computed(() => route.meta?.title || '功能开发中')

async function handleLogout() {
  await pcUserStore.logout()
  ElMessage.success('已退出登录')
  router.replace('/login')
}
</script>

<style scoped>
.dev-placeholder {
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #1f2329;
  text-decoration: none;
}

.back-link:hover {
  color: #000000;
  text-decoration: underline;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 80px 24px;
}
</style>
