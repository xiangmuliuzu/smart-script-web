<template>
  <PageContainer>
    <div class="chat-detail-layout">
      <!-- 左侧：聊天窗口 -->
      <div class="chat-main">
        <!-- 顶部信息栏 -->
        <div class="chat-header">
          <div class="chat-header-left">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回列表
            </el-button>
            <span class="chat-title">
              会话 #{{ sessionId }}
              <el-tag v-if="session" :type="statusType(session.status)" size="small" effect="light" style="margin-left: 8px">
                {{ statusLabel(session.status) }}
              </el-tag>
            </span>
          </div>
          <div v-if="session" class="chat-header-right">
            <span class="biz-info">
              <el-tag v-if="session.businessType" size="small" effect="plain">{{ bizLabel(session.businessType) }}</el-tag>
              {{ session.businessName || '' }}
            </span>
          </div>
        </div>

        <!-- 已结束提示 -->
        <div v-if="session && session.status === 2" class="closed-banner">
          会话已结束，无法发送消息
          <el-button size="small" type="primary" link @click="handleReopen">重新打开</el-button>
        </div>

        <!-- 消息列表 -->
        <div ref="messageListRef" class="message-list" @scroll="onMessageScroll">
          <div v-if="messagesLoading" class="messages-loading">
            <el-icon class="is-loading"><Loading /></el-icon> 加载中...
          </div>
          <div v-if="!messagesLoading && messages.length === 0" class="messages-empty">
            暂无消息记录
          </div>
          <div
            v-for="msg in messages"
            :key="msg.messageId"
            class="message-row"
            :class="{ 'is-mine': isMine(msg) }"
          >
            <div class="message-avatar">
              <el-avatar :size="36" :src="msg.senderAvatar || undefined">
                {{ (msg.senderName || '?').charAt(0) }}
              </el-avatar>
            </div>
            <div class="message-body">
              <div class="message-meta">
                <span class="sender-name">{{ msg.senderName || '未知' }}</span>
                <span class="send-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
              <div class="message-bubble">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div v-if="session && session.status !== 2" class="message-input">
          <el-input
            v-model="inputContent"
            type="textarea"
            :rows="3"
            maxlength="2000"
            placeholder="输入消息内容..."
            resize="none"
            @keydown.enter.ctrl="handleSend"
          />
          <div class="input-actions">
            <span class="input-hint">Ctrl + Enter 发送</span>
            <el-button type="primary" class="black-button" :loading="sending" :disabled="!inputContent.trim()" @click="handleSend">
              发送
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：信息面板 -->
      <div v-if="session" class="info-panel">
        <!-- 用户基本信息（任务 20） -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">用户信息</span>
          </template>
          <div class="user-info">
            <el-avatar :size="48" :src="session.user1Avatar || undefined">
              {{ (session.user1Name || '?').charAt(0) }}
            </el-avatar>
            <div class="user-detail">
              <div class="user-nick">{{ session.user1Name || '未知用户' }}</div>
              <div class="user-id">用户 ID: {{ session.user1Id }}</div>
            </div>
          </div>
        </el-card>

        <!-- 关联业务快捷入口（任务 21） -->
        <el-card v-if="session.businessType" class="info-card" shadow="never">
          <template #header>
            <span class="card-title">关联业务</span>
          </template>
          <div class="biz-links">
            <div class="biz-row">
              <span class="biz-label">类型</span>
              <el-tag size="small" effect="plain">{{ bizLabel(session.businessType) }}</el-tag>
            </div>
            <div v-if="session.businessName" class="biz-row">
              <span class="biz-label">名称</span>
              <span class="biz-value">{{ session.businessName }}</span>
            </div>
            <div v-if="session.businessId" class="biz-row">
              <span class="biz-label">ID</span>
              <span class="biz-value">{{ session.businessId }}</span>
            </div>
            <div class="biz-row">
              <el-button size="small" type="primary" link @click="goToBusiness">
                查看{{ bizLabel(session.businessType) }}详情
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 分配管理员（任务 22） -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">分配管理员</span>
          </template>
          <el-select
            v-model="assignAdminId"
            placeholder="选择管理员"
            style="width: 100%"
            filterable
            :loading="adminListLoading"
            @change="handleAssign"
          >
            <el-option
              v-for="admin in adminList"
              :key="admin.userId"
              :label="admin.nickName"
              :value="admin.userId"
            />
          </el-select>
          <div v-if="session.assignedAdminId" class="assigned-hint">
            当前：{{ getAssignedName() }}
          </div>
        </el-card>

        <!-- 状态操作（任务 23, 24） -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">会话操作</span>
          </template>
          <div class="status-actions">
            <div class="current-status">
              当前状态：<el-tag :type="statusType(session.status)" size="small" effect="light">{{ statusLabel(session.status) }}</el-tag>
            </div>
            <div class="action-buttons">
              <el-button v-if="session.status === 0" type="primary" size="small" class="black-button" @click="handleStatus('processing')">
                开始处理
              </el-button>
              <el-button v-if="session.status === 1" type="danger" size="small" plain @click="handleStatus('close')">
                结束会话
              </el-button>
              <el-button v-if="session.status === 2" type="success" size="small" plain @click="handleReopen">
                重新打开
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 会话元信息 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span class="card-title">会话信息</span>
          </template>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="会话 ID">{{ session.sessionId }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(session.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="最后消息">{{ formatTime(session.lastMessageTime) }}</el-descriptions-item>
            <el-descriptions-item label="处理管理员">{{ session.user2Name || '未分配' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import {
  adminSessionDetail,
  adminListMessages,
  adminSendMessage,
  adminMarkRead,
  adminAssignAdmin,
  adminChangeStatus
} from '@/api/adminChat'
import { listUser } from '@/api/system/user'

defineOptions({ name: 'ChatDetail' })

const route = useRoute()
const router = useRouter()
const sessionId = Number(route.query.sessionId)

// 会话 & 消息
const session = ref(null)
const messages = ref([])
const messagesLoading = ref(false)
const inputContent = ref('')
const sending = ref(false)
const messageListRef = ref(null)

// 管理员列表
const adminList = ref([])
const adminListLoading = ref(false)
const assignAdminId = ref(null)

// 轮询定时器
let pollTimer = null

function bizLabel(type) {
  const map = { WORK: '作品', ORDER: '订单', COPYRIGHT: '版权', SEAL: '印章', GENERAL: '通用' }
  return map[type] || type || '—'
}

function statusLabel(status) {
  return { 0: '待处理', 1: '处理中', 2: '已结束' }[status] ?? '未知'
}

function statusType(status) {
  return { 0: 'warning', 1: '', 2: 'info' }[status] ?? 'info'
}

function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isMine(msg) {
  if (!session.value) return false
  return msg.senderId === session.value.user2Id
}

function getAssignedName() {
  if (!session.value || !session.value.assignedAdminId) return '未分配'
  const found = adminList.value.find(a => a.userId === session.value.assignedAdminId)
  return found ? found.nickName : `管理员${session.value.assignedAdminId}`
}

// 加载会话详情
async function loadSession() {
  try {
    const res = await adminSessionDetail(sessionId)
    session.value = res
    assignAdminId.value = res.assignedAdminId || null
    // 标记已读
    if (res.user2Unread > 0) {
      adminMarkRead(sessionId).catch(() => {})
    }
  } catch {
    ElMessage.error('会话详情加载失败')
  }
}

// 加载消息列表
async function loadMessages() {
  messagesLoading.value = true
  try {
    const res = await adminListMessages(sessionId)
    const list = Array.isArray(res) ? res : (res?.data || res?.rows || [])
    messages.value = list
    await nextTick()
    scrollToBottom()
  } catch {
    // 静默处理
  } finally {
    messagesLoading.value = false
  }
}

// 加载管理员列表（用于分配下拉）
async function loadAdminList() {
  adminListLoading.value = true
  try {
    const res = await listUser({ pageNum: 1, pageSize: 100, user_type: '00' })
    adminList.value = res.rows || []
  } catch {
    adminList.value = []
  } finally {
    adminListLoading.value = false
  }
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function onMessageScroll() {
  // 预留：向上滚动加载更多历史消息
}

// 发送消息
async function handleSend() {
  const content = inputContent.value.trim()
  if (!content) return
  sending.value = true
  try {
    await adminSendMessage(sessionId, { content, msgType: 'TEXT' })
    inputContent.value = ''
    await Promise.all([loadMessages(), loadSession()])
  } catch {
    ElMessage.error('发送失败')
  } finally {
    sending.value = false
  }
}

// 分配管理员
async function handleAssign(adminId) {
  if (!adminId) return
  try {
    await adminAssignAdmin(sessionId, adminId)
    ElMessage.success('管理员分配成功')
    await loadSession()
  } catch {
    ElMessage.error('分配失败')
  }
}

// 变更状态
async function handleStatus(action) {
  const labels = { processing: '开始处理', close: '结束会话', reopen: '重新打开' }
  try {
    await ElMessageBox.confirm(`确定要「${labels[action] || action}」吗？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: action === 'close' ? 'warning' : 'info'
    })
  } catch {
    return
  }
  try {
    await adminChangeStatus(sessionId, action)
    ElMessage.success('状态已更新')
    await loadSession()
  } catch {
    ElMessage.error('状态更新失败')
  }
}

async function handleReopen() {
  try {
    await adminChangeStatus(sessionId, 'reopen')
    ElMessage.success('会话已重新打开')
    await loadSession()
  } catch {
    ElMessage.error('操作失败')
  }
}

// 关联业务跳转（任务 21）
function goToBusiness() {
  if (!session.value?.businessType) return
  const type = session.value.businessType
  // TODO: 根据业务类型跳转到对应详情页，待各模块详情页完成后接入
  const routeMap = {
    WORK: '/copyright/review',
    ORDER: '/trade/auth-orders',
    COPYRIGHT: '/copyright/assets',
    SEAL: '/copyright/review'
  }
  const target = routeMap[type]
  if (target) {
    router.push({ path: target, query: { businessId: session.value.businessId } })
  } else {
    ElMessage.info('该业务类型的详情页尚未接入')
  }
}

function goBack() {
  router.push('/chat/chat-sessions')
}

onMounted(() => {
  if (!sessionId) {
    ElMessage.error('缺少会话 ID')
    router.push('/chat/chat-sessions')
    return
  }
  loadSession()
  loadMessages()
  loadAdminList()
  // 30 秒轮询刷新消息
  pollTimer = setInterval(() => {
    loadMessages()
    loadSession()
  }, 30000)
})

onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<style scoped>
.chat-detail-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
  min-height: 500px;
}

/* 左侧聊天窗口 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.chat-header-right .biz-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #595959;
}

.closed-banner {
  padding: 10px 20px;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-loading,
.messages-empty {
  text-align: center;
  padding: 40px 0;
  color: #8c8c8c;
  font-size: 13px;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  max-width: 75%;
}

.message-row.is-mine {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.is-mine .message-body {
  align-items: flex-end;
}

.message-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.sender-name {
  font-weight: 500;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: #f5f5f5;
  font-size: 14px;
  line-height: 1.6;
  color: #262626;
  word-break: break-word;
  max-width: 100%;
}

.is-mine .message-bubble {
  background: #1f2329;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-row:not(.is-mine) .message-bubble {
  border-bottom-left-radius: 4px;
}

/* 输入区域 */
.message-input {
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-hint {
  font-size: 12px;
  color: #8c8c8c;
}

.black-button {
  background-color: #1f2329 !important;
  border-color: #1f2329 !important;
  color: #ffffff !important;
}

.black-button:hover {
  background-color: #000000 !important;
  border-color: #000000 !important;
}

/* 右侧信息面板 */
.info-panel {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-card :deep(.el-card__body) {
  padding: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-nick {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.user-id {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* 关联业务 */
.biz-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.biz-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.biz-label {
  font-size: 12px;
  color: #8c8c8c;
  min-width: 36px;
}

.biz-value {
  font-size: 13px;
  color: #262626;
}

/* 分配管理员 */
.assigned-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 状态操作 */
.status-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-status {
  font-size: 13px;
  color: #595959;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
