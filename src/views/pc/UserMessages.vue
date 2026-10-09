<template>
  <div class="messages-page">
    <div class="page-heading">
      <div><h1>消息与沟通</h1><p>查看平台发来的站内消息，并与平台管理员实时沟通</p></div>
    </div>

    <el-tabs v-model="activeTab" class="msg-tabs" @tab-change="onTabChange">
      <!-- ==================== 沟通会话 ==================== -->
      <el-tab-pane name="chat">
        <template #label>
          <span class="tab-label">沟通会话
            <el-badge v-if="chatUnreadTotal > 0" :value="chatUnreadTotal" :max="99" class="tab-badge" />
          </span>
        </template>

        <div class="chat-wrap">
          <!-- 左：会话列表 -->
          <div class="session-pane">
            <div class="session-head">
              <span>会话列表</span>
              <el-button size="small" text @click="openCreateDialog">发起咨询</el-button>
            </div>
            <el-scrollbar class="session-scroll">
              <div v-loading="sessionsLoading" class="session-list">
                <button
                  v-for="s in sessions"
                  :key="s.sessionId"
                  class="session-row"
                  :class="{ active: activeSession && activeSession.sessionId === s.sessionId }"
                  type="button"
                  @click="openSession(s)"
                >
                  <el-avatar :size="34" :src="avatarUrl(s.peerAvatar) || undefined"><el-icon><ChatDotRound /></el-icon></el-avatar>
                  <div class="session-copy">
                    <div class="session-title">
                      <strong>{{ s.peerName || '平台管理员' }}</strong>
                    </div>
                    <p>{{ s.lastMessage || (s.businessName ? '[' + businessTypeLabel(s.businessType) + '] ' + s.businessName : '暂无消息') }}</p>
                  </div>
                  <div class="session-side">
                    <el-badge v-if="s.unread > 0" :value="s.unread" :max="99" class="session-badge" />
                    <div class="session-box">
                      <el-tag size="small" effect="plain" type="info">{{ businessTypeLabel(s.businessType) }}</el-tag>
                      <em v-if="s.businessName" class="session-biz-name" :title="s.businessName">{{ s.businessName }}</em>
                    </div>
                    <div class="session-box">
                      <el-tag size="small" :type="chatStatusTag(s.status)" effect="plain">{{ chatStatusLabel(s.status) }}</el-tag>
                      <span class="session-time">{{ shortTime(s.lastMessageTime || s.createdAt) }}</span>
                    </div>
                  </div>
                </button>
                <el-empty v-if="!sessionsLoading && !sessions.length" description="暂无会话，点击「发起咨询」开始" :image-size="70" />
              </div>
            </el-scrollbar>
          </div>

          <!-- 右：聊天窗 -->
          <div class="conversation-pane">
            <template v-if="activeSession">
              <div class="conv-head">
                <strong>{{ activeSession.peerName || '平台管理员' }}</strong>
                <el-tag size="small" :type="chatStatusTag(activeSession.status)">{{ chatStatusLabel(activeSession.status) }}</el-tag>
                <span v-if="activeSession.businessName" class="conv-biz">{{ businessTypeLabel(activeSession.businessType) }} · <el-link v-if="canJumpBusiness(activeSession)" class="biz-link" :underline="false" @click="goBusiness(activeSession)">{{ activeSession.businessName }}</el-link><template v-else>{{ activeSession.businessName }}</template></span>
              </div>
              <el-scrollbar ref="convScrollRef" class="conv-scroll">
                <div v-loading="messagesLoading" class="conv-messages">
                  <div v-if="!chatMessages.length && !messagesLoading" class="conv-empty">暂无消息，发送第一条开始沟通</div>
                  <template v-for="m in chatMessages" :key="m.messageId">
                    <div v-if="m.msgType === 'SYSTEM'" class="msg-system">{{ m.content }}</div>
                    <div v-else class="msg-row" :class="{ mine: isMine(m) }">
                      <el-avatar :size="30" :src="avatarUrl(m.senderAvatar || (isMine(m) ? myAvatar : activeSession.peerAvatar)) || undefined">
                        <el-icon><UserFilled /></el-icon>
                      </el-avatar>
                      <div class="msg-body">
                        <div class="msg-meta"><span>{{ m.senderName || (isMine(m) ? '我' : '平台管理员') }}</span><span>{{ formatTime(m.createdAt) }}</span></div>
                        <div class="msg-bubble">{{ m.content }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </el-scrollbar>
              <div class="conv-input">
                <el-input
                  v-model="chatDraft"
                  type="textarea"
                  :rows="3"
                  maxlength="1000"
                  show-word-limit
                  resize="none"
                  :disabled="isSessionClosed"
                  :placeholder="isSessionClosed ? '会话已结束，无法发送消息' : '输入消息，Enter 发送，Shift+Enter 换行'"
                  @keydown.enter="handleKeydown"
                />
                <div class="conv-actions">
                  <span v-if="isSessionClosed" class="closed-tip">会话已结束</span>
                  <el-button v-if="isSessionClosed" :loading="reopening" @click="handleReopen">打开对话</el-button>
                  <el-button type="primary" class="send-btn" :loading="sending" :disabled="isSessionClosed" @click="handleSendMessage">发送</el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="选择左侧会话开始沟通" :image-size="90" class="conv-placeholder" />
          </div>
        </div>
      </el-tab-pane>

      <!-- ==================== 系统通知 ==================== -->
      <el-tab-pane name="notice">
        <template #label><span class="tab-label">系统通知<el-badge v-if="notificationUnread > 0" :value="notificationUnread" :max="99" class="tab-badge" /></span></template>
        <div class="messages-panel">
          <div class="message-filters">
            <el-radio-group v-model="filterType" @change="changeType">
              <el-radio-button v-for="item in types" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
            <div><el-button :disabled="loading" @click="loadMessages()">刷新通知</el-button><el-button class="read-all" :loading="markingAll" @click="handleReadAll">全部标为已读</el-button></div>
          </div>
          <div v-loading="loading" class="message-list">
            <div v-if="loadError && !loading" class="message-error"><el-alert title="消息加载失败" type="error" :closable="false" show-icon /><el-button @click="loadMessages">重新加载</el-button></div>
            <button v-for="item in messages" :key="`${item.source || 'NOTIFICATION'}:${item.messageId}`" class="message-row" type="button" @click="openMessage(item)">
              <span class="unread-dot" :class="{ hidden: item.read }" aria-hidden="true" />
              <div class="message-copy"><div class="message-title"><strong>{{ item.title || '未命名消息' }}</strong><el-tag size="small" type="info">{{ typeLabel(item.type) }}</el-tag></div><p>{{ item.summary || '点击查看消息内容' }}</p></div>
              <span class="message-time">{{ formatTime(item.createdAt) }}</span>
            </button>
            <el-empty v-if="!loading && !loadError && !messages.length" description="暂无消息" />
          </div>
          <div v-if="total > pageSize" class="pager"><el-pagination v-model:current-page="pageNum" background layout="total, prev, pager, next" :total="total" :page-size="pageSize" @current-change="loadMessages" /></div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="detailVisible" :title="detail?.title || '消息详情'" width="600px">
      <div v-loading="detailLoading" class="message-detail">
        <div class="detail-meta"><el-tag type="info">{{ typeLabel(detail?.type) }}</el-tag><span>{{ formatTime(detail?.createdAt) }}</span></div>
        <p>{{ detail?.content || '暂无内容' }}</p>
      </div>
      <template #footer><el-button @click="detailVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 发起咨询弹窗 -->
    <el-dialog v-model="createDialogVisible" title="发起咨询" width="480px" destroy-on-close @open="loadMyWorks">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="咨询类型">
          <el-select v-model="createForm.businessType" style="width: 100%" @change="handleCreateTypeChange">
            <el-option value="GENERAL" label="通用咨询" />
            <el-option value="WORK" label="作品相关" />
            <el-option value="COPYRIGHT" label="版权相关" />
            <el-option value="ORDER" label="订单相关" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="createForm.businessType === 'WORK'" label="选择作品">
          <el-select v-model="createForm.businessId" placeholder="选择你的作品" filterable :loading="worksLoading" style="width: 100%" @change="handleCreateWorkChange">
            <el-option v-for="w in myWorks" :key="w.workId" :label="w.title" :value="w.workId" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="createForm.businessType === 'WORK' && createForm.businessId" label="说明">
          <span style="color:#8a8f99;font-size:12px">将针对该作品发起与管理员的沟通会话</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" :disabled="createForm.businessType === 'WORK' && !createForm.businessId" @click="handleCreateSession">创建并进入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { userAnnouncements } from '@/api/announcements'
import { avatarUrl } from '@/utils/avatarUrl'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, UserFilled } from '@element-plus/icons-vue'
import { listMessages, getMessage, markMessageRead, markAllMessagesRead } from '@/api/pcUser'
import {
  listSessions as listChatSessions,
  listMessages as listChatMessages,
  sendMessage as sendChatMessage,
  markSessionRead,
  reopenSession,
  createSession as createChatSession
} from '@/api/chat'
import { listWorks } from '@/api/pcWork'
import { usePcUnreadStore } from '@/stores/pcUnread'
import { usePcUserStore } from '@/stores/pcUser'

const pcUnreadStore = usePcUnreadStore()
const pcUserStore = usePcUserStore()
const router = useRouter()

const notificationUnread = computed(() => pcUnreadStore.notifyUnread + pcUnreadStore.announcementUnread)
const activeTab = ref('chat')
const myAvatar = computed(() => pcUserStore.user?.avatar || '')

/* ==================== 系统通知 ==================== */
const types = [
  { value: '', label: '全部消息' }, { value: 'SYSTEM', label: '系统消息' },
  { value: 'REVIEW', label: '审核消息' }, { value: 'TRANSACTION', label: '交易消息' },
  { value: 'BENEFIT', label: '权益消息' }
]
const filterType = ref('')
const messages = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const loadError = ref(false)
const markingAll = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
let noticeGeneration = 0

function typeLabel(type) { return types.find(item => item.value === type)?.label || type || '消息' }
function changeType() { pageNum.value = 1; loadMessages() }

async function loadMessages(silent = false) {
  silent = silent === true
  if (silent && loading.value) return
  const generation = ++noticeGeneration
  if (!silent) { loading.value = true; loadError.value = false }
  try {
    const data = await listMessages({ pageNum: pageNum.value, pageSize, type: filterType.value || undefined, includeAnnouncements: true }, { silent })
    if (generation !== noticeGeneration) return
    messages.value = Array.isArray(data?.list) ? data.list : []
    total.value = Number(data?.total || 0)
    loadError.value = false
  } catch {
    if (generation !== noticeGeneration || silent) return
    messages.value = []
    total.value = 0
    loadError.value = true
  } finally { if (generation === noticeGeneration) loading.value = false }
}

async function openMessage(item) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = { ...item, content: '' }
  try {
    const isAnnouncement = item.source === 'ANNOUNCEMENT'
    if (isAnnouncement) {
      const result = await userAnnouncements.detail(item.messageId)
      detail.value = { ...item, content: result.noticeContent }
    } else detail.value = await getMessage(item.messageId)
    if (!item.read) {
      await (isAnnouncement ? userAnnouncements.read(item.messageId) : markMessageRead(item.messageId))
      item.read = true
      pcUnreadStore.refresh()
    }
  } catch {
    detailVisible.value = false
  } finally { detailLoading.value = false }
}

async function handleReadAll() {
  markingAll.value = true
  try {
    await markAllMessagesRead({ includeAnnouncements: true })
    messages.value.forEach(item => { item.read = true })
    pcUnreadStore.refresh()
    ElMessage.success('已全部标为已读')
  } catch {
    // 请求封装统一展示服务端错误
  } finally { markingAll.value = false }
}

/* ==================== 沟通会话 ==================== */
const sessions = ref([])
const sessionsLoading = ref(false)
const activeSession = ref(null)
const chatMessages = ref([])
const messagesLoading = ref(false)
const chatDraft = ref('')
const sending = ref(false)
const creating = ref(false)
const convScrollRef = ref()

const chatUnreadTotal = computed(() => sessions.value.reduce((sum, s) => sum + (Number(s.unread) || 0), 0))
const isSessionClosed = computed(() => Number(activeSession.value?.status) === 2)

function chatStatusLabel(status) {
  const s = Number(status)
  if (s === 0 || s === 1) return '进行中'
  if (s === 2) return '已结束'
  return '未知'
}
function chatStatusTag(status) {
  const s = Number(status)
  if (s === 0 || s === 1) return 'primary'
  return 'info'
}
function businessTypeLabel(type) {
  const map = { WORK: '作品', SEAL: '印章', COPYRIGHT: '版权', ORDER: '订单', GENERAL: '通用咨询' }
  return map[type] || (type || '通用咨询')
}
// 任务 16：关联作品跳转——用户门户目前仅有作品详情页，WORK 类型且带 businessId 时可点击
function canJumpBusiness(s) {
  return s.businessType === 'WORK' && Number(s.businessId) > 0
}
function goBusiness(s) {
  router.push(`/pc/user/works/${s.businessId}`)
}
function formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 16) : '—' }
function shortTime(value) {
  if (!value) return ''
  const s = String(value).replace('T', ' ')
  return s.slice(5, 16)
}
// 默认靠左；仅当前登录账号自己发出的消息靠右（以发送者身份判定，免疫移交后多管理员场景）
const myUserId = computed(() => pcUserStore.user?.userId)
function isMine(m) { return String(m.senderId) === String(myUserId.value) }

async function scrollConvToBottom() {
  await nextTick()
  const wrap = convScrollRef.value?.wrapRef
  if (wrap) wrap.scrollTop = wrap.scrollHeight
}

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const data = await listChatSessions()
    sessions.value = Array.isArray(data?.list) ? data.list : []
    // 保持当前选中会话的最新状态
    if (activeSession.value) {
      const hit = sessions.value.find(s => s.sessionId === activeSession.value.sessionId)
      if (hit) activeSession.value = hit
    }
  } catch {
    sessions.value = []
  } finally { sessionsLoading.value = false }
}

async function loadChatMessages() {
  if (!activeSession.value) return
  messagesLoading.value = true
  try {
    const data = await listChatMessages(activeSession.value.sessionId)
    chatMessages.value = Array.isArray(data?.list) ? data.list : []
    await scrollConvToBottom()
  } catch {
    chatMessages.value = []
  } finally { messagesLoading.value = false }
}

async function openSession(s) {
  activeSession.value = s
  chatDraft.value = ''
  await loadChatMessages()
  if (Number(s.unread) > 0) {
    try {
      await markSessionRead(s.sessionId)
      s.unread = 0
      pcUnreadStore.refresh()
    } catch {
      // ignore
    }
  }
}

async function handleSendMessage() {
  const content = chatDraft.value.trim()
  if (!content) { ElMessage.warning('请输入消息内容'); return }
  if (isSessionClosed.value) { ElMessage.warning('会话已结束，无法发送消息'); return }
  sending.value = true
  try {
    await sendChatMessage(activeSession.value.sessionId, { content, msgType: 'TEXT' })
    chatDraft.value = ''
    await Promise.all([loadChatMessages(), loadSessions()])
  } catch {
    // 请求封装统一提示服务端错误
  } finally { sending.value = false }
}

const reopening = ref(false)
async function handleReopen() {
  if (!activeSession.value) return
  reopening.value = true
  try {
    await reopenSession(activeSession.value.sessionId)
    activeSession.value.status = 1
    ElMessage.success('会话已重新打开')
    await Promise.all([loadSessions(), loadChatMessages()])
  } catch {
    // 请求封装统一提示服务端错误
  } finally { reopening.value = false }
}

function handleKeydown(e) {
  // Enter 发送；Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

async function handleCreateGeneral() {
  creating.value = true
  try {
    const session = await createChatSession({ businessType: 'GENERAL', businessName: '通用咨询' })
    await loadSessions()
    if (session?.sessionId) {
      const hit = sessions.value.find(s => s.sessionId === session.sessionId) || session
      await openSession(hit)
    }
  } catch {
    // ignore
  } finally { creating.value = false }
}

// ---- 发起咨询弹窗 ----
const createDialogVisible = ref(false)
const createForm = ref({ businessType: 'GENERAL', businessId: null, businessName: '' })
const myWorks = ref([])
const worksLoading = ref(false)

function openCreateDialog() {
  createForm.value = { businessType: 'GENERAL', businessId: null, businessName: '' }
  createDialogVisible.value = true
}

async function loadMyWorks() {
  worksLoading.value = true
  try {
    const data = await listWorks('all')
    myWorks.value = Array.isArray(data) ? data : (data?.list || [])
  } catch {
    myWorks.value = []
  } finally {
    worksLoading.value = false
  }
}

function handleCreateTypeChange() {
  createForm.value.businessId = null
  createForm.value.businessName = ''
}

function handleCreateWorkChange(workId) {
  const hit = myWorks.value.find(w => w.workId === workId)
  createForm.value.businessName = hit ? hit.title : ''
}

async function handleCreateSession() {
  creating.value = true
  try {
    const payload = { businessType: createForm.value.businessType }
    if (createForm.value.businessId) {
      payload.businessId = createForm.value.businessId
      payload.businessName = createForm.value.businessName
    } else if (createForm.value.businessType === 'GENERAL') {
      payload.businessName = '通用咨询'
    }
    const session = await createChatSession(payload)
    createDialogVisible.value = false
    await loadSessions()
    if (session?.sessionId) {
      const hit = sessions.value.find(s => s.sessionId === session.sessionId) || session
      await openSession(hit)
    }
  } catch {
    // ignore
  } finally { creating.value = false }
}

function onTabChange(name) {
  if (name === 'notice') { loadMessages(); pcUnreadStore.refresh() }
}

/* ==================== 轮询与生命周期 ==================== */
const POLL_INTERVAL_MS = 5000
let timer = null
function poll() {
  if (document.hidden) return
  if (activeTab.value === 'chat') {
    loadSessions()
    if (activeSession.value && !isSessionClosed.value) loadChatMessages()
  }
  if (activeTab.value === 'notice') loadMessages(true)
  pcUnreadStore.refresh()
}

onMounted(async () => {
  await loadSessions()
  pcUnreadStore.refresh()
  timer = setInterval(poll, POLL_INTERVAL_MS)
  document.addEventListener('visibilitychange', poll)
})

onUnmounted(() => {
  noticeGeneration++
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', poll)
})
</script>

<style scoped>
.messages-page{--el-color-primary:#303133;--el-color-primary-light-3:#606266;--el-color-primary-light-7:#a8abb2}
.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}
.tab-label{display:inline-flex;align-items:center;gap:6px}.tab-badge :deep(.el-badge__content){background-color:#f56c6c;border:0}
/* 沟通会话 */
.chat-wrap{display:flex;gap:16px;height:560px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;overflow:hidden}
.session-pane{width:300px;min-width:300px;border-right:1px solid #edf0f2;display:flex;flex-direction:column}
.session-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #edf0f2;font-size:13px;font-weight:600;color:#1f2329}
.session-scroll{flex:1;min-height:0}
.session-list{display:flex;flex-direction:column}
.session-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border:0;border-bottom:1px solid #f4f5f7;background:#fff;text-align:left;cursor:pointer;width:100%}
.session-row:hover{background:#fafbfc}.session-row.active{background:#f2f3f5}
.session-copy{flex:1;min-width:0}.session-title{display:flex;align-items:center}.session-title strong{font-size:14px;color:#303133;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.session-side{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;max-width:45%}.session-box{display:flex;align-items:center;gap:6px;min-width:0}.session-time{color:#a0a5ac;font-size:11px;white-space:nowrap}
.session-biz-name{font-style:normal;color:#8a8f99;font-size:12px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.session-badge :deep(.el-badge__content){background-color:#f56c6c;border:0}
.session-copy p{margin-top:6px;color:#8a8f99;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.conversation-pane{flex:1;min-width:0;display:flex;flex-direction:column}
.conv-head{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #edf0f2}.conv-head strong{font-size:15px;color:#1f2329}.conv-biz{margin-left:auto;color:#8a8f99;font-size:12px}
.biz-link{font-size:12px;vertical-align:baseline}.biz-link :deep(.el-link__inner){color:#409eff;font-size:12px}
.conv-scroll{flex:1;min-height:0;background:#fafbfc}
.conv-messages{padding:18px;display:flex;flex-direction:column;gap:16px;min-height:100%}
.conv-empty,.conv-placeholder{color:#a8abb2}
.conv-placeholder{margin:auto}
.msg-row{display:flex;gap:10px;align-items:flex-start}.msg-row.mine{flex-direction:row-reverse}
.msg-system{text-align:center;color:#a0a5ac;font-size:12px;padding:2px 0}
.msg-body{max-width:70%}.msg-meta{display:flex;gap:8px;align-items:center;font-size:12px;color:#a0a5ac;margin-bottom:4px}.msg-row.mine .msg-meta{flex-direction:row-reverse}
.msg-bubble{padding:9px 13px;border-radius:8px;background:#fff;border:1px solid #edf0f2;color:#303133;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
.msg-row.mine .msg-bubble{background:#1f2329;color:#fff;border-color:#1f2329}
.conv-input{border-top:1px solid #edf0f2;padding:12px 16px}
.conv-actions{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:10px}
.closed-tip{color:#f56c6c;font-size:12px;margin-right:auto}
.send-btn{background-color:#1f2329!important;border-color:#1f2329!important;color:#fff!important}
/* 系统通知 */
.messages-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;min-height:420px}.message-filters{padding:18px 22px;border-bottom:1px solid #edf0f2;display:flex;align-items:center;justify-content:space-between;gap:12px}.read-all{flex-shrink:0}
.message-row{width:100%;display:flex;align-items:flex-start;gap:14px;padding:20px 24px;border:0;border-bottom:1px solid #f0f1f3;background:#fff;text-align:left;cursor:pointer}.message-row:hover{background:#fafbfc}
.unread-dot{width:7px;height:7px;margin-top:8px;background:#f56c6c;border-radius:50%;flex-shrink:0}.unread-dot.hidden{visibility:hidden}
.message-copy{flex:1;min-width:0}.message-title{display:flex;align-items:center;gap:10px}.message-title strong{font-size:14px;color:#303133}.message-copy p{margin-top:8px;color:#8a8f99;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.message-time{color:#a0a5ac;font-size:12px;white-space:nowrap}.pager{display:flex;justify-content:flex-end;padding:12px 20px}
.message-detail{min-height:100px}.detail-meta{display:flex;align-items:center;gap:12px;color:#909399}.message-detail p{margin-top:20px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
.message-error{display:flex;align-items:center;gap:16px;padding:24px}
@media(max-width:700px){.page-heading{align-items:flex-start;flex-direction:column}.chat-wrap{flex-direction:column;height:auto}.session-pane{width:100%;min-width:0;border-right:0;border-bottom:1px solid #edf0f2}.session-scroll{max-height:240px}.conv-scroll{height:320px}.message-row{padding:16px}.message-time{display:none}.message-filters{overflow-x:auto}}
</style>
