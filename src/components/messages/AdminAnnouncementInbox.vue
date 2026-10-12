<template>
  <el-badge :value="unread" :max="99" :hidden="unread === 0"><el-button text aria-label="阅读后台公告" @click="visible = true"><el-icon :size="19"><Bell /></el-icon><span>公告</span></el-button></el-badge>
  <el-drawer v-model="visible" title="后台公告" size="min(620px, 95vw)"><AnnouncementReader v-if="visible" ref="reader" :api="adminAnnouncements" @changed="refreshCount" /></el-drawer>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import AnnouncementReader from '@/components/messages/AnnouncementReader.vue'
import { adminAnnouncements } from '@/api/announcements'
const unread = ref(0), visible = ref(false), reader = ref(null)
let timer, generation = 0, inFlight = false
async function refreshCount() {
  if (inFlight || document.hidden) return
  const current = generation
  inFlight = true
  try { const result = await adminAnnouncements.unreadCount({ silent: true }); if (current === generation && Number.isInteger(result?.total) && result.total >= 0) unread.value = result.total }
  catch { /* 轮询失败保留上次值，下次恢复。 */ }
  finally { if (current === generation) inFlight = false }
}
function changed() { refreshCount(); if (visible.value) reader.value?.refresh() }
onMounted(() => { refreshCount(); timer = setInterval(refreshCount, 30000); document.addEventListener('visibilitychange', refreshCount); window.addEventListener('announcements-changed', changed) })
onBeforeUnmount(() => { generation++; clearInterval(timer); document.removeEventListener('visibilitychange', refreshCount); window.removeEventListener('announcements-changed', changed) })
</script>
