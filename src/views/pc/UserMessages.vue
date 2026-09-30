<template>
  <div class="messages-page">
    <div class="page-heading"><div><h1>消息与沟通</h1><p>查看平台发来的站内消息</p></div><el-button :loading="markingAll" @click="handleReadAll">全部标为已读</el-button></div>
    <div class="messages-panel">
      <div class="message-filters">
        <el-radio-group v-model="filterType" @change="changeType">
          <el-radio-button v-for="item in types" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button>
        </el-radio-group>
      </div>
      <div v-loading="loading" class="message-list">
        <div v-if="loadError && !loading" class="message-error"><el-alert title="消息加载失败" type="error" :closable="false" show-icon /><el-button @click="loadMessages">重新加载</el-button></div>
        <button v-for="item in messages" :key="item.messageId" class="message-row" type="button" @click="openMessage(item)">
          <span class="unread-dot" :class="{ hidden: item.read }" aria-hidden="true" />
          <div class="message-copy"><div class="message-title"><strong>{{ item.title || '未命名消息' }}</strong><el-tag size="small" type="info">{{ typeLabel(item.type) }}</el-tag></div><p>{{ item.summary || '点击查看消息内容' }}</p></div>
          <span class="message-time">{{ formatTime(item.createdAt) }}</span>
        </button>
        <el-empty v-if="!loading && !loadError && !messages.length" description="暂无消息" />
      </div>
      <div v-if="total > pageSize" class="pager"><el-pagination v-model:current-page="pageNum" background layout="total, prev, pager, next" :total="total" :page-size="pageSize" @current-change="loadMessages" /></div>
    </div>
    <el-dialog v-model="detailVisible" :title="detail?.title || '消息详情'" width="600px">
      <div v-loading="detailLoading" class="message-detail">
        <div class="detail-meta"><el-tag type="info">{{ typeLabel(detail?.type) }}</el-tag><span>{{ formatTime(detail?.createdAt) }}</span></div>
        <p>{{ detail?.content || '暂无内容' }}</p>
      </div>
      <template #footer><el-button @click="detailVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listMessages, getMessage, markMessageRead, markAllMessagesRead } from '@/api/pcUser'

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

function typeLabel(type) { return types.find(item => item.value === type)?.label || type || '消息' }
function formatTime(value) { return value ? String(value).replace('T', ' ').slice(0, 16) : '—' }
function changeType() { pageNum.value = 1; loadMessages() }

async function loadMessages() {
  loading.value = true
  loadError.value = false
  try {
    const data = await listMessages({ pageNum: pageNum.value, pageSize, type: filterType.value || undefined })
    messages.value = Array.isArray(data?.list) ? data.list : []
    total.value = Number(data?.total || 0)
  } catch {
    messages.value = []
    total.value = 0
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
    }
  } catch {
    detailVisible.value = false
  } finally { detailLoading.value = false }
}

async function handleReadAll() {
  markingAll.value = true
  try {
    await markAllMessagesRead()
    messages.value.forEach(item => { item.read = true })
    ElMessage.success('已全部标为已读')
  } catch {
    // 请求封装统一展示服务端错误
  } finally { markingAll.value = false }
}

onMounted(loadMessages)
</script>

<style scoped>
.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}.messages-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;min-height:420px}.message-filters{padding:18px 22px;border-bottom:1px solid #edf0f2}.message-row{width:100%;display:flex;align-items:flex-start;gap:14px;padding:20px 24px;border:0;border-bottom:1px solid #f0f1f3;background:#fff;text-align:left;cursor:pointer}.message-row:hover{background:#fafbfc}.unread-dot{width:7px;height:7px;margin-top:8px;background:#f56c6c;border-radius:50%;flex-shrink:0}.unread-dot.hidden{visibility:hidden}.message-copy{flex:1;min-width:0}.message-title{display:flex;align-items:center;gap:10px}.message-title strong{font-size:14px;color:#303133}.message-copy p{margin-top:8px;color:#8a8f99;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.message-time{color:#a0a5ac;font-size:12px;white-space:nowrap}.pager{display:flex;justify-content:flex-end;padding:12px 20px}.message-detail{min-height:100px}.detail-meta{display:flex;align-items:center;gap:12px;color:#909399}.message-detail p{margin-top:20px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
.messages-page{--el-color-primary:#303133;--el-color-primary-light-3:#606266;--el-color-primary-light-7:#a8abb2}.message-error{display:flex;align-items:center;gap:16px;padding:24px}
@media(max-width:700px){.page-heading{align-items:flex-start;flex-direction:column}.message-row{padding:16px}.message-time{display:none}.message-filters{overflow-x:auto}}
</style>
