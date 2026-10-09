<template>
  <PageContainer><PageHeader title="用户消息" description="发送站内消息并查看收件人的阅读情况" /><UserMessageManager v-if="canList" /><el-empty v-else description="暂无用户消息查询权限" /></PageContainer>
</template>
<script setup>
import { computed } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import UserMessageManager from '@/components/messages/UserMessageManager.vue'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const canList = computed(() => userStore.hasPermission('user:message:list'))
</script>
