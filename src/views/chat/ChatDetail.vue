<template>
  <PageContainer>
    <PageHeader title="会话详情" description="查看用户会话上下文、回复消息、分配处理管理员并流转会话状态">
      <template #actions>
        <el-button @click="goBack">返回列表</el-button>
      </template>
    </PageHeader>

    <div v-loading="loading" class="chat-detail">
      <!-- 左：消息窗口 -->
      <el-card class="chat-main" shadow="never">
        <template #header>
          <div class="chat-head">
            <div class="chat-head-user">
              <el-avatar :size="32" :src="session.user1Avatar || undefined"><el-icon><UserFilled /></el-icon></el-avatar>
              <div>
                <strong>{{ session.user1Name || ('用户#' + (session.user1Id || '')) }}</strong>
                <small>{{ businessTypeLabel(session.businessType) }}<template v-if="session.businessName"> · {{ session.businessName }}</template></small>
              </div>
            </div>
            <el-tag :type="statusTagType(session.status)">{{ statusLabel(session.status) }}</el-tag>
          </div>
        </template>

        <el-scrollbar ref="scrollRef" class="chat-scroll">
          <div class="chat-messages">
            <div v-if="!messages.length" class="chat-empty">暂无消息</div>
            <template v-for="m in messages" :key="m.messageId">
              <div v-if="m.msgType === 'SYSTEM'" class="msg-system">{{ m.content }}</div>
              <div
                v-else
                class="msg-row"
                :class="{ mine: isMine(m) }"
              >
                <el-avatar :size="30" :src="m.senderAvatar || undefined">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <div class="msg-body">
                  <div class="msg-meta">
                    <span>{{ m.senderName || (isMine(m) ? '我' : '管理员') }}</span>
                    <span class="msg-time">{{ formatTime(m.createdAt) }}</span>
                  </div>
                  <div class="msg-bubble">{{ m.content }}</div>
                </div>
              </div>
            </template>
          </div>
        </el-scrollbar>

        <div class="chat-input">
          <el-input
            v-model="draft"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
            resize="none"
            :disabled="isClosed || !isHandler"
            :placeholder="isClosed ? '会话已结束，无法发送消息' : (isHandler ? '输入回复内容，Enter 发送，Shift+Enter 换行' : '会话已分配给其他管理员处理')"
            @keydown.enter="handleKeydown"
          />
          <div class="chat-input-actions">
            <span v-if="isClosed" class="closed-tip">会话已结束</span>
            <span v-else-if="!isHandler" class="closed-tip">已分配给 {{ assignedAdminLabel }} 处理，你无法参与回复</span>
            <el-button type="primary" class="black-button" :loading="sending" :disabled="isClosed || !isHandler" @click="handleSend">发送</el-button>
          </div>
        </div>
      </el-card>

      <!-- 右：会话信息与操作 -->
      <el-card class="chat-side" shadow="never">
        <div class="side-block">
          <div class="side-title">用户信息</div>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="用户ID">{{ session.user1Id || '—' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ session.user1Name || '—' }}</el-descriptions-item>
            <el-descriptions-item label="业务类型">{{ businessTypeLabel(session.businessType) }}</el-descriptions-item>
            <el-descriptions-item label="业务ID">{{ session.businessId || '—' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(session.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="side-block">
          <div class="side-title">关联业务</div>
          <div class="biz-summary">
            <span>{{ businessTypeLabel(session.businessType) }}<template v-if="session.businessName"> · {{ session.businessName }}</template></span>
            <el-button
              v-if="businessRoute"
              link
              type="primary"
              @click="goBusiness"
            >查看{{ businessTypeLabel(session.businessType) }}详情</el-button>
          </div>
        </div>

        <div class="side-block">
          <div class="side-title">分配处理管理员</div>
          <div class="assign-row">
            <el-select v-model="assignAdminId" placeholder="选择管理员" filterable style="flex: 1" :loading="adminLoading">
              <el-option
                v-for="a in adminOptions"
                :key="a.userId"
                :label="(a.nickName || a.userName) + '（#' + a.userId + '）'"
                :value="a.userId"
              />
            </el-select>
            <el-button :loading="assigning" :disabled="!assignAdminId" @click="handleAssign">分配</el-button>
          </div>
          <div class="assign-current">当前：{{ assignedAdminLabel }}</div>
        </div>

        <div class="side-block">
          <div class="side-title">会话状态流转</div>
          <div class="status-actions">
            <el-button v-if="Number(session.status) !== 1" :loading="acting" :disabled="!isHandler" @click="handleChangeStatus('processing')">标记处理中</el-button>
            <el-button v-if="Number(session.status) !== 2" type="danger" class="close-btn" :loading="acting" :disabled="!isHandler" @click="handleChangeStatus('close')">结束会话</el-button>
            <el-button v-if="Number(session.status) === 2" :loading="acting" :disabled="!isHandler" @click="handleChangeStatus('reopen')">重新打开</el-button>
            <el-button :loading="markingRead" @click="handleMarkRead">标记已读</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import { getSession, listMessages, sendMessage, markSessionRead, assignAdmin, changeStatus, listAdmins } from '@/api/adminChat'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'ChatDetail' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const sessionId = route.query.sessionId

const loading = ref(false)
const sending = ref(false)
const acting = ref(false)
const assigning = ref(false)
const markingRead = ref(false)
const adminLoading = ref(false)

const session = ref({})
const messages = ref([])
const draft = ref('')
const scrollRef = ref()
const adminOptions = ref([])
const assignAdminId = ref(null)

const isClosed = computed(() => Number(session.value.status) === 2)
// 分配保护：会话已分配给其他管理员时，当前管理员只读（仍可转派/标记已读）；未分配时任何管理员可参与
const isHandler = computed(() => !session.value.assignedAdminId || Number(session.value.assignedAdminId) === Number(userStore.userId))
const assignedAdminLabel = computed(() => {
  const id = session.value.assignedAdminId
  if (!id) return '未分配'
  const hit = adminOptions.value.find(a => a.userId === id)
  return hit ? `${hit.nickName || hit.userName}（#${id}）` : `管理员#${id}`
})

const statusOptions = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已结束' }
]
function statusLabel(status) {
  return statusOptions.find(o => o.value === Number(status))?.label || '未知'
}
function statusTagType(status) {
  const s = Number(status)
  if (s === 0) return 'warning'
  if (s === 1) return 'primary'
  return 'info'
}
function businessTypeLabel(type) {
  const map = { WORK: '作品', SEAL: '印章', COPYRIGHT: '版权', ORDER: '订单', GENERAL: '通用' }
  return map[type] || (type || '通用')
}
// 任务 21：关联业务跳转——业务类型对应管理端页面；GENERAL 或无路由时不出按钮
const businessRouteMap = {
  WORK: '/copyright/ai-review/review',
  COPYRIGHT: '/copyright/assets',
  ORDER: '/trade/orders',
  SEAL: '/copyright/seals'
}
const businessRoute = computed(() => {
  const path = businessRouteMap[session.value.businessType]
  return path && Number(session.value.businessId) > 0 ? path : null
})
function goBusiness() {
  router.push({ path: businessRoute.value, query: { businessId: session.value.businessId } })
}
function formatTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '—'
}
// 默认靠左；仅当前管理员自己发出的消息靠右（以发送者身份判定，免疫移交后多管理员场景）
const isMine = (m) => String(m.senderId) === String(userStore.userId)

async function scrollToBottom() {
  await nextTick()
  const wrap = scrollRef.value?.wrapRef
  if (wrap) wrap.scrollTop = wrap.scrollHeight
}

async function loadSession() {
  const detail = await getSession(sessionId)
  session.value = detail || {}
  assignAdminId.value = session.value.assignedAdminId || null
}

async function loadMessages() {
  const data = await listMessages(sessionId)
  messages.value = Array.isArray(data?.list) ? data.list : []
  await scrollToBottom()
}

async function loadAll() {
  if (!sessionId) {
    ElMessage.error('缺少会话ID')
    return
  }
  loading.value = true
  try {
    await Promise.all([loadSession(), loadMessages()])
  } catch {
    ElMessage.error('加载会话详情失败')
  } finally {
    loading.value = false
  }
}

async function loadAdmins() {
  adminLoading.value = true
  try {
    const res = await listAdmins()
    adminOptions.value = Array.isArray(res) ? res : []
  } catch {
    adminOptions.value = []
  } finally {
    adminLoading.value = false
  }
}

function handleKeydown(e) {
  // Enter 发送；Shift+Enter 换行
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

async function handleSend() {
  const content = draft.value.trim()
  if (!content) {
    ElMessage.warning('请输入回复内容')
    return
  }
  if (isClosed.value) {
    ElMessage.warning('会话已结束，无法发送消息')
    return
  }
  sending.value = true
  try {
    await sendMessage(sessionId, { content, msgType: 'TEXT' })
    draft.value = ''
    await Promise.all([loadSession(), loadMessages()])
  } catch {
    // 请求封装统一提示服务端错误
  } finally {
    sending.value = false
  }
}

async function handleAssign() {
  if (!assignAdminId.value) return
  assigning.value = true
  try {
    await assignAdmin(sessionId, assignAdminId.value)
    ElMessage.success('已分配处理管理员')
    // 处理人变更会在服务端写入系统提示，立即刷新会话与消息流让提示马上可见
    await Promise.all([loadSession(), loadMessages()])
  } catch {
    // ignore
  } finally {
    assigning.value = false
  }
}

async function handleChangeStatus(action) {
  acting.value = true
  try {
    await changeStatus(sessionId, action)
    ElMessage.success('状态已更新')
    await loadSession()
  } catch {
    // ignore
  } finally {
    acting.value = false
  }
}

async function handleMarkRead() {
  markingRead.value = true
  try {
    await markSessionRead(sessionId)
    ElMessage.success('已标记已读')
    await loadSession()
  } catch {
    // ignore
  } finally {
    markingRead.value = false
  }
}

function goBack() {
  router.push({ path: '/appuser/chat-sessions' })
}

// 30s 轮询刷新消息（管理端多坐席，非实时推送）
const POLL_INTERVAL_MS = 30000
let timer = null
function poll() {
  if (!document.hidden && sessionId && !isClosed.value) {
    loadMessages()
  }
}

onMounted(async () => {
  await Promise.all([loadAll(), loadAdmins()])
  timer = setInterval(poll, POLL_INTERVAL_MS)
  document.addEventListener('visibilitychange', poll)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', poll)
})
</script>

<style scoped>
.chat-detail { display: flex; gap: 20px; align-items: flex-start; }
.chat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.chat-main :deep(.el-card__body) { padding: 0; display: flex; flex-direction: column; }
.chat-head { display: flex; align-items: center; justify-content: space-between; }
.chat-head-user { display: flex; align-items: center; gap: 10px; }
.chat-head-user strong { display: block; font-size: 14px; color: #1f2329; }
.chat-head-user small { color: #8a8f99; font-size: 12px; }
.chat-scroll { height: 460px; }
.chat-messages { padding: 18px; display: flex; flex-direction: column; gap: 16px; }
.chat-empty { text-align: center; color: #a8abb2; padding: 40px 0; }
.msg-row { display: flex; gap: 10px; align-items: flex-start; }
.msg-system { text-align: center; color: #a0a5ac; font-size: 12px; padding: 2px 0; }
.msg-row.mine { flex-direction: row-reverse; }
.msg-body { max-width: 70%; }
.msg-meta { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #a0a5ac; margin-bottom: 4px; }
.msg-row.mine .msg-meta { flex-direction: row-reverse; }
.msg-bubble { padding: 9px 13px; border-radius: 8px; background: #f2f3f5; color: #303133; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
.msg-row.mine .msg-bubble { background: #1f2329; color: #fff; }
.chat-input { border-top: 1px solid #f0f0f0; padding: 12px 16px; }
.chat-input-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; }
.closed-tip { color: #f56c6c; font-size: 12px; margin-right: auto; }
.black-button { background-color: #1f2329 !important; border-color: #1f2329 !important; color: #fff !important; }
.close-btn { color: #fff !important; }
.close-btn:hover { color: #000 !important; }
.chat-side { width: 320px; min-width: 320px; }
.side-block { padding: 4px 0 18px; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
.side-block:last-child { border-bottom: 0; margin-bottom: 0; }
.side-title { font-size: 13px; font-weight: 600; color: #1f2329; margin-bottom: 12px; }
.biz-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; color: #303133; }
.assign-row { display: flex; gap: 8px; align-items: center; }
.assign-current { margin-top: 8px; font-size: 12px; color: #8a8f99; }
.status-actions { display: flex; flex-wrap: wrap; gap: 8px; }
@media (max-width: 900px) { .chat-detail { flex-direction: column; } .chat-side { width: 100%; min-width: 0; } }
</style>
