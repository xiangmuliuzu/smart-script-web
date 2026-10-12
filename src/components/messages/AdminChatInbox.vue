<template>
  <el-badge v-if="canRead" :value="unread" :max="99" :hidden="unread === 0"><el-button text aria-label="查看用户消息" @click="open"><el-icon :size="19"><ChatDotRound /></el-icon><span>用户消息</span></el-button></el-badge>
</template>
<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getChatUnreadCount } from '@/api/adminChat'
const userStore = useUserStore(), permissionStore = usePermissionStore(), router = useRouter()
const canRead = computed(() => userStore.hasPermission('chat:session:list'))
const unread = ref(0)
let timer, inFlight = false, generation = 0
async function refresh() {
  if (!canRead.value || inFlight || document.hidden) return
  const current = generation; inFlight = true
  try { const result = await getChatUnreadCount({ silent: true }); if (current === generation && Number.isInteger(result?.chatUnread) && result.chatUnread >= 0) unread.value = result.chatUnread }
  catch { /* 保留上次成功值，待下一次刷新恢复。 */ }
  finally { if (current === generation) inFlight = false }
}
function open() {
  const hasMessages = permissionStore.sidebarRoutes.some(item => contains(item, '/support/messages'))
  router.push(hasMessages ? { path: '/support/messages', query: { tab: 'chat' } } : { path: '/appuser/chat-sessions' })
}
function contains(item, path) { return item.path === path || (item.children || []).some(child => contains(child, path)) }
onMounted(() => { refresh(); timer = setInterval(refresh, 5000); document.addEventListener('visibilitychange', refresh); window.addEventListener('admin-chat-changed', refresh) })
onBeforeUnmount(() => { generation++; clearInterval(timer); document.removeEventListener('visibilitychange', refresh); window.removeEventListener('admin-chat-changed', refresh) })
</script>
