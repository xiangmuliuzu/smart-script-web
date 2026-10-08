<template>
  <div class="messages-page">
    <div class="page-heading">
      <div><h1>消息与沟通</h1><p>与管理员沟通或查看系统通知</p></div>
    </div>
    <el-tabs v-model="activeTab" class="messages-tabs">
      <!-- ==================== 标签 1：沟通会话 ==================== -->
      <el-tab-pane label="沟通会话" name="chat">
        <div class="chat-layout">
          <!-- 左侧：会话列表 -->
          <div class="chat-sidebar">
            <div v-loading="sessionsLoading" class="chat-session-list">
              <div
                v-for="s in sessions" :key="s.sessionId"
                class="session-item" :class="{ active: activeSessionId === s.sessionId }"
                @click="selectSession(s)"
              >
                <el-avatar :size="36" :src="s.peerAvatar || undefined">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <div class="session-info">
                  <div class="session-top">
                    <span class="session-name">{{ s.businessName || s.peerName || '会话' }}</span>
                    <el-badge v-if="s.unread > 0" :value="s.unread" class="session-badge" />
                  </div>
                  <div class="session-bottom">
                    <span class="session-last">{{ s.lastMessage || '暂无消息' }}</span>
                    <el-tag v-if="s.status === 2" size="small" type="info" class="session-status">已结束</el-tag>
                  </div>
                </div>
              </div>
              <el-empty v-if="!sessionsLoading && !sessions.length" description="暂无会话" :image-size="60" />
            </div>
          </div>
          <!-- 右侧：聊天窗口 -->
          <div class="chat-main">
            <template v-if="activeSession">
              <div class="chat-header">
                <span>{{ activeSession.businessName || activeSession.peerName || '会话' }}</span>
                <el-tag v-if="activeSession.status === 0" size="small" type="warning">待处理</el-tag>
                <el-tag v-else-if="activeSession.status === 1" size="small" type="primary">处理中</el-tag>
                <el-tag v-else-if="activeSession.status === 2" size="small" type="info">已结束</el-tag>
              </div>
              <div ref="messageListRef" v-loading="messagesLoading" class="chat-messages">
                <div
                  v-for="m in messages" :key="m.messageId"
                  class="chat-bubble" :class="{ mine: m.senderId === myUserId }"
                >
                  <el-avatar :size="28" :src="m.senderAvatar || undefined">
                    <el-icon><UserFilled /></el-icon>
                  </el-avatar>
                  <div class="bubble-body">
                    <div class="bubble-meta">{{ m.senderName }} · {{ formatTime(m.createdAt) }}</div>
                    <div class="bubble-text">{{ m.content }}</div>
                  </div>
                </div>
                <el-empty v-if="!messagesLoading && !messages.length" description="暂无消息" :image-size="50" />
              </div>
              <div v-if="activeSession.status !== 2" class="chat-input">
                <el-input
                  v-model="inputText" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"
                  placeholder="输入消息…" @keydown.enter.exact.prevent="handleSend"
                />
                <el-button type="primary" :loading="sending" :disabled="!inputText.trim()" @click="handleSend">发送</el-button>
              </div>
              <div v-else class="chat-input chat-input-closed">
                <el-text type="info">会话已结束，无法发送消息</el-text>
              </div>
            </template>
            <el-empty v-else description="选择一个会话开始聊天" :image-size="80" />
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== 标签 2：系统通知 ==================== -->
      <el-tab-pane label="系统通知" name="notify">
        <div class="messages-panel">
          <div class="message-filters">
            <el-radio-group v-model="filterType" @change="changeType">
              <el-radio-button v-for="item in types" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
            <el-button :loading="markingAll" @click="handleReadAll">全部标为已读</el-button>
          </div>
          <div v-loading="loading" class="message-list">
            <div v-if="loadError && !loading" class="message-error">
              <el-alert title="消息加载失败" type="error" :closable="false" show-icon />
              <el-button @click="loadNotify">重新加载</el-button>
            </div>
            <button v-for="item in notifyMessages" :key="item.messageId" class="message-row" type="button" @click="openMessage(item)">
              <span class="unread-dot" :class="{ hidden: item.read }" aria-hidden="true" />
              <div class="message-copy">
                <div class="message-title">
                  <strong>{{ item.title || '未命名消息' }}</strong>
                  <el-tag size="small" type="info">{{ typeLabel(item.type) }}</el-tag>
                </div>
                <p>{{ item.summary || '点击查看消息内容' }}</p>
              </div>
              <span class="message-time">{{ formatTime(item.createdAt) }}</span>
            </button>
            <el-empty v-if="!loading && !loadError && !notifyMessages.length" description="暂无通知" />
          </div>
          <div v-if="totalNotify > pageSize" class="pager">
            <el-pagination v-model:current-page="pageNum" background layout="total, prev, pager, next" :total="totalNotify" :page-size="pageSize" @current-change="loadNotify" />
          </div>
        </div>
        <el-dialog v-model="detailVisible" :title="detail?.title || '消息详情'" width="600px">
          <div v-loading="detailLoading" class="message-detail">
            <div class="detail-meta"><el-tag type="info">{{ typeLabel(detail?.type) }}</el-tag><span>{{ formatTime(detail?.createdAt) }}</span></div>
            <p>{{ detail?.content || '暂无内容' }}</p>
          </div>
          <template #footer><el-button @click="detailVisible = false">关闭</el-button></template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { listMessages as listNotify, getMessage, markMessageRead, markAllMessagesRead } from '@/api/pcUser'
import { listSessions, listMessages, sendMessage, markSessionRead } from '@/api/chat'
import { usePcUserStore } from '@/stores/pcUser'
import { usePcUnreadStore } from '@/stores/pcUnread'

const pcUserStore = usePcUserStore()
const pcUnreadStore = usePcUnreadStore()
const myUserId = computed(() => pcUserStore.user?.userId)

/* ========== 标签切换 ========== */
const activeTab = ref('chat')

/* ========== 沟通会话 ========== */
const sessions = ref([])
const sessionsLoading = ref(false)
const activeSessionId = ref(null)
const activeSession = computed(() => sessions.value.find(s => s.sessionId === activeSessionId.value) || null)
const messages = ref([])
const messagesLoading = ref(false)
const inputText = ref('')
const sending = ref(false)
const messageListRef = ref(null)
let chatPollTimer = null
const CHAT_POLL_MS = 30000

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const data = await listSessions()
    sessions.value = Array.isArray(data?.list) ? data.list : []
  } catch { sessions.value = [] }
  finally { sessionsLoading.value = false }
}

async function selectSession(s) {
  activeSessionId.value = s.sessionId
  await loadChatMessages(s.sessionId)
  if (s.unread > 0) {
    try {
      await markSessionRead(s.sessionId)
      s.unread = 0
      pcUnreadStore.refresh()
    } catch { /* 静默 */ }
  }
}

async function loadChatMessages(sessionId) {
  messagesLoading.value = true
  try {
    const data = await listMessages(sessionId)
    messages.value = Array.isArray(data?.list) ? data.list : []
    await nextTick()
    scrollToBottom()
  } catch { messages.value = [] }
  finally { messagesLoading.value = false }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || !activeSessionId.value) return
  sending.value = true
  try {
    const result = await sendMessage(activeSessionId.value, { content: text, msgType: 'TEXT' })
    messages.value.push(result?.data || result)
    inputText.value = ''
    if (activeSession.value) {
      activeSession.value.lastMessage = text
    }
    await nextTick()
    scrollToBottom()
  } catch { /* 服务端错误由拦截器展示 */ }
  finally { sending.value = false }
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function pollChat() {
  if (document.hidden) return
  loadSessions()
  if (activeSessionId.value) {
    loadChatMessages(activeSessionId.value)
  }
}

/* ========== 系统通知 ========== */
const types = [
  { value: '', label: '全部消息' }, { value: 'SYSTEM', label: '系统消息' },
  { value: 'REVIEW', label: '审核消息' }, { value: 'TRANSACTION', label: '交易消息' },
  { value: 'BENEFIT', label: '权益消息' }
]
const filterType = ref('')
const notifyMessages = ref([])
const totalNotify = ref(0)
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const loadError = ref(false)
const markingAll = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

function typeLabel(type) { return types.find(item => item.value === type)?.label || type || '消息' }
function formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 16) : '—' }
function changeType() { pageNum.value = 1; loadNotify() }

async function loadNotify() {
  loading.value = true
  loadError.value = false
  try {
    const data = await listNotify({ pageNum: pageNum.value, pageSize, type: filterType.value || undefined })
    notifyMessages.value = Array.isArray(data?.list) ? data.list : []
    totalNotify.value = Number(data?.total || 0)
  } catch {
    notifyMessages.value = []
    totalNotify.value = 0
    loadError.value = true
  } finally { loading.value = false }
}

async function openMessage(item) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = { ...item, content: '' }
  try {
    detail.value = await getMessage(item.messageId)
    if (!item.read) {
      await markMessageRead(item.messageId)
      item.read = true
      pcUnreadStore.refresh()
    }
  } catch { detailVisible.value = false }
  finally { detailLoading.value = false }
}

async function handleReadAll() {
  markingAll.value = true
  try {
    await markAllMessagesRead()
    notifyMessages.value.forEach(item => { item.read = true })
    pcUnreadStore.refresh()
    ElMessage.success('已全部标为已读')
  } catch { /* 请求封装统一展示服务端错误 */ }
  finally { markingAll.value = false }
}

/* ========== 生命周期 ========== */
onMounted(() => {
  loadSessions()
  loadNotify()
  chatPollTimer = setInterval(pollChat, CHAT_POLL_MS)
})

onUnmounted(() => {
  if (chatPollTimer) {
    clearInterval(chatPollTimer)
    chatPollTimer = null
  }
})
</script>

<style scoped>
.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}
.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}
.page-heading p{font-size:13px;color:#8a8f99}
.messages-tabs :deep(.el-tabs__header){margin-bottom:0}
.messages-tabs :deep(.el-tabs__content){padding:0}

/* ========== 沟通会话布局 ========== */
.chat-layout{display:flex;height:calc(100vh - 200px);min-height:480px;background:#fff;border:1px solid #e7e9ec;border-radius:0 0 8px 8px}
.chat-sidebar{width:300px;min-width:260px;border-right:1px solid #edf0f2;display:flex;flex-direction:column}
.chat-session-list{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.12) transparent}
.chat-session-list::-webkit-scrollbar{width:4px}
.chat-session-list::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:4px}

.session-item{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;cursor:pointer;border-bottom:1px solid #f5f5f5;transition:background .15s}
.session-item:hover{background:#f8f9fa}
.session-item.active{background:#f0f2f5}
.session-info{flex:1;min-width:0}
.session-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.session-name{font-size:14px;font-weight:500;color:#303133;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.session-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px}
.session-last{font-size:12px;color:#a0a5ac;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.session-status{flex-shrink:0}

/* ========== 聊天窗口 ========== */
.chat-main{flex:1;display:flex;flex-direction:column;min-width:0}
.chat-header{height:52px;padding:0 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #edf0f2;font-size:15px;font-weight:500}
.chat-messages{flex:1;overflow-y:auto;padding:20px;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.1) transparent}
.chat-messages::-webkit-scrollbar{width:4px}
.chat-messages::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:4px}

.chat-bubble{display:flex;gap:10px;margin-bottom:16px;max-width:80%}
.chat-bubble.mine{flex-direction:row-reverse;margin-left:auto}
.bubble-body{min-width:0}
.bubble-meta{font-size:11px;color:#a0a5ac;margin-bottom:4px}
.chat-bubble.mine .bubble-meta{text-align:right}
.bubble-text{padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;background:#f0f2f5;color:#303133}
.chat-bubble.mine .bubble-text{background:#1f2329;color:#fff}

.chat-input{padding:12px 20px;border-top:1px solid #edf0f2;display:flex;gap:10px;align-items:flex-end}
.chat-input :deep(.el-textarea__inner){border-radius:8px;resize:none}
.chat-input-closed{justify-content:center;padding:16px}

/* ========== 系统通知 ========== */
.messages-panel{background:#fff;border:1px solid #e7e9ec;border-radius:0 0 8px 8px;min-height:420px}
.message-filters{padding:18px 22px;border-bottom:1px solid #edf0f2;display:flex;align-items:center;justify-content:space-between}
.message-row{width:100%;display:flex;align-items:flex-start;gap:14px;padding:20px 24px;border:0;border-bottom:1px solid #f0f1f3;background:#fff;text-align:left;cursor:pointer}
.message-row:hover{background:#fafbfc}
.unread-dot{width:7px;height:7px;margin-top:8px;background:#f56c6c;border-radius:50%;flex-shrink:0}
.unread-dot.hidden{visibility:hidden}
.message-copy{flex:1;min-width:0}
.message-title{display:flex;align-items:center;gap:10px}
.message-title strong{font-size:14px;color:#303133}
.message-copy p{margin-top:8px;color:#8a8f99;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.message-time{color:#a0a5ac;font-size:12px;white-space:nowrap}
.pager{display:flex;justify-content:flex-end;padding:12px 20px}
.message-detail{min-height:100px}
.detail-meta{display:flex;align-items:center;gap:12px;color:#909399}
.message-detail p{margin-top:20px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
.message-error{display:flex;align-items:center;gap:16px;padding:24px}
.messages-page{--el-color-primary:#303133;--el-color-primary-light-3:#606266;--el-color-primary-light-7:#a8abb2}

@media(max-width:700px){
  .chat-layout{flex-direction:column;height:auto}
  .chat-sidebar{width:100%;min-width:0;max-height:240px;border-right:0;border-bottom:1px solid #edf0f2}
  .message-row{padding:16px}
  .message-time{display:none}
  .message-filters{flex-direction:column;gap:12px}
}
</style>
