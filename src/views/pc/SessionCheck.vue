<template>
  <div class="session-check-page">
    <el-result icon="warning" title="暂时无法确认登录状态" sub-title="网络或服务波动导致身份确认失败，你的登录凭证已保留">
      <template #extra>
        <el-button type="primary" :loading="retrying" @click="retry">重新确认</el-button>
        <el-button @click="relogin">重新登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePcUserStore } from '@/stores/pcUser'
import { safePortalRedirect } from '@/utils/account'

const route = useRoute()
const router = useRouter()
const pcUserStore = usePcUserStore()
const retrying = ref(false)

async function confirm() {
  await pcUserStore.fetchMe()
  router.replace(safePortalRedirect(route.query.redirect, '01'))
}

async function retry() {
  retrying.value = true
  try {
    await confirm()
  } catch {
    // 仍无法确认：保留凭证，停留在本页可继续重试
  } finally {
    retrying.value = false
  }
}

function relogin() {
  pcUserStore.resetSession()
  router.replace('/login')
}

onMounted(() => {
  // 进入重试页即自动确认一次，成功直接回到目标页
  confirm().catch(() => {})
})
</script>

<style scoped>
.session-check-page{display:flex;align-items:center;justify-content:center;min-height:60vh}
</style>
