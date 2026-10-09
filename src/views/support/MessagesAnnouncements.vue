<template>
  <PageContainer>
    <PageHeader title="消息与公告" description="接收与回复用户沟通，管理平台公告" />
    <el-tabs v-if="canChat || canNotices" v-model="activeTab" @tab-change="refreshTab">
      <el-tab-pane v-if="canChat" label="用户沟通" name="chat" lazy><ChatSessions ref="chatSessions" embedded /></el-tab-pane>
      <el-tab-pane v-if="canNotices" label="公告管理" name="announcements" lazy><NoticeManager @changed="notifyAnnouncementChange" /></el-tab-pane>
    </el-tabs>
    <el-empty v-else description="暂无消息或公告查询权限，请联系管理员授权" />
  </PageContainer>
</template>
<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import NoticeManager from '@/components/messages/NoticeManager.vue'
import ChatSessions from '@/views/chat/ChatSessions.vue'
const userStore = useUserStore()
const route = useRoute()
const chatSessions = ref(null)
const canChat = computed(() => userStore.hasPermission('chat:session:list'))
const canNotices = computed(() => userStore.hasPermission('system:notice:list'))
const activeTab = ref(route.query.tab === 'announcements' && canNotices.value ? 'announcements' : canChat.value ? 'chat' : 'announcements')
function refreshTab(name) { if (name === 'chat') nextTick(() => chatSessions.value?.refresh()) }
watch(() => route.query.tab, tab => { if (tab === 'chat' && canChat.value) { activeTab.value = 'chat'; refreshTab('chat') } })
function notifyAnnouncementChange() { window.dispatchEvent(new Event('announcements-changed')) }
</script>
