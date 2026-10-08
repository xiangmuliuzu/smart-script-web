<template>
  <PageContainer>
    <PageHeader title="用户沟通" description="查看和管理用户沟通会话，分配处理管理员，跟踪会话状态" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option label="待处理" :value="0" />
          <el-option label="处理中" :value="1" />
          <el-option label="已结束" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.businessType" placeholder="全部业务类型" style="width: 160px" clearable>
          <el-option label="作品" value="WORK" />
          <el-option label="订单" value="ORDER" />
          <el-option label="版权" value="COPYRIGHT" />
          <el-option label="印章" value="SEAL" />
          <el-option label="通用" value="GENERAL" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" placeholder="搜索用户/业务名称" style="width: 200px" clearable @keyup.enter="handleQuery" />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNum"
      v-model:pageSize="query.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="sessionId" label="会话 ID" width="90" />
      <el-table-column label="用户" width="140">
        <template #default="{ row }">
          <span class="user-name">{{ row.user1Name || `用户${row.user1Id}` }}</span>
        </template>
      </el-table-column>
      <el-table-column label="处理管理员" width="140">
        <template #default="{ row }">
          {{ row.user2Name || `管理员${row.user2Id}` }}
        </template>
      </el-table-column>
      <el-table-column label="业务类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.businessType" size="small" effect="plain">{{ bizLabel(row.businessType) }}</el-tag>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="关联业务" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.businessName || '—' }}</template>
      </el-table-column>
      <el-table-column label="最后消息" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.lastMessage || '暂无消息' }}</template>
      </el-table-column>
      <el-table-column label="最后活跃" width="160">
        <template #default="{ row }">{{ formatTime(row.lastMessageTime) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small" effect="light">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="未读" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.user2Unread > 0" class="unread-badge">{{ row.user2Unread }}</span>
          <span v-else class="read-text">0</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="openDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </TableCard>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { adminListSessions } from '@/api/adminChat'

defineOptions({ name: 'ChatSessions' })

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNum: 1, pageSize: 10, status: '', businessType: '', keyword: '' })

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

async function loadList() {
  loading.value = true
  try {
    const params = { ...query.value }
    if (params.status === '') delete params.status
    if (!params.businessType) delete params.businessType
    if (!params.keyword) delete params.keyword
    const res = await adminListSessions(params)
    list.value = res.rows || []
    total.value = Number(res.total || 0)
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载会话列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNum = 1
  loadList()
}

function handleReset() {
  query.value = { pageNum: 1, pageSize: 10, status: '', businessType: '', keyword: '' }
  loadList()
}

function openDetail(row) {
  router.push({ path: '/chat/chat-detail', query: { sessionId: row.sessionId } })
}

onMounted(loadList)
</script>

<style scoped>
.user-name {
  font-weight: 500;
  color: #1f2329;
}

.unread-badge {
  display: inline-block;
  min-width: 20px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.read-text {
  color: #c0c4cc;
  font-size: 12px;
}
</style>
