<template>
  <PageContainer>
    <PageHeader title="用户沟通" description="管理端查看全部用户会话，可筛选、进入详情回复、分配处理管理员与流转状态">
      <template #actions>
        <el-button type="primary" @click="createVisible = true">发起对话</el-button>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.businessType" placeholder="全部业务类型" style="width: 150px" clearable>
          <el-option v-for="opt in businessTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="用户昵称 / 业务名称"
          style="width: 200px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNum"
      v-model:pageSize="query.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无会话"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="sessionId" label="会话ID" width="80" />
      <el-table-column label="用户" min-width="140">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="28" :src="row.user1Avatar || undefined"><el-icon><UserFilled /></el-icon></el-avatar>
            <span>{{ row.user1Name || ('用户#' + row.user1Id) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="业务" min-width="150">
        <template #default="{ row }">
          <el-tag size="small" type="info" effect="plain">{{ businessTypeLabel(row.businessType) }}</el-tag>
          <span class="biz-name">{{ row.businessName || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastMessage" label="最后消息" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.lastMessage || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户未读" width="90" align="center">
        <template #default="{ row }">
          <el-badge v-if="row.user1Unread > 0" :value="row.user1Unread" class="unread-badge" />
          <span v-else class="muted">0</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastMessageTime" label="最后消息时间" width="170">
        <template #default="{ row }">{{ formatTime(row.lastMessageTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDetail(row)">进入详情</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 发起对话弹窗 -->
    <el-dialog v-model="createVisible" title="发起对话" width="520px" destroy-on-close @open="searchUsers()">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="目标用户" required>
          <el-select
            v-model="createForm.targetUserId"
            placeholder="搜索用户昵称或ID"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option v-for="u in userOptions" :key="u.userId" :label="(u.nickName || u.userName) + '（#' + u.userId + '）'" :value="u.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="createForm.businessType" placeholder="选择业务类型" style="width: 100%" @change="handleTypeChange">
            <el-option v-for="opt in businessTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="createForm.businessType && createForm.businessType !== 'GENERAL'" label="关联业务">
          <el-select
            v-model="createForm.businessId"
            :placeholder="'选择' + businessTypeLabel(createForm.businessType)"
            filterable
            :loading="bizLoading"
            style="width: 100%"
            @change="handleBizChange"
          >
            <el-option v-for="b in bizOptions" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" :disabled="!createForm.targetUserId" @click="handleCreate">创建并进入</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { listSessions, createSession } from '@/api/adminChat'
import { listAppUsers } from '@/api/user/appUser'
import { listWork } from '@/api/content'
import { getCopyrightSealList, getCopyrightAssets } from '@/api/copyright'
import { getOrderList } from '@/api/trade'

defineOptions({ name: 'ChatSessions' })

const router = useRouter()

// 会话状态（ChatService：0=待处理 1=处理中 2=已结束）
const statusOptions = [
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已结束' }
]
// 业务类型（ChatSessionCreateRequest：WORK / SEAL / COPYRIGHT / ORDER / GENERAL）
const businessTypeOptions = [
  { value: 'WORK', label: '作品' },
  { value: 'SEAL', label: '印章' },
  { value: 'COPYRIGHT', label: '版权' },
  { value: 'ORDER', label: '订单' },
  { value: 'GENERAL', label: '通用' }
]

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNum: 1, pageSize: 10, status: '', businessType: '', keyword: '' })

// 发起对话
const createVisible = ref(false)
const creating = ref(false)
const createForm = ref({ targetUserId: null, businessType: '', businessId: null, businessName: '' })
const userOptions = ref([])
const userSearchLoading = ref(false)
const bizLoading = ref(false)
const bizOptions = ref([])

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
  return businessTypeOptions.find(o => o.value === type)?.label || (type || '通用')
}
function formatTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 19) : '—'
}

async function loadList() {
  loading.value = true
  try {
    const params = {
      pageNum: query.value.pageNum,
      pageSize: query.value.pageSize,
      status: query.value.status === '' ? undefined : query.value.status,
      businessType: query.value.businessType || undefined,
      keyword: query.value.keyword || undefined
    }
    const res = await listSessions(params)
    list.value = res.rows || []
    total.value = res.total || 0
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
  router.push({ path: '/appuser/chat-detail', query: { sessionId: row.sessionId } })
}

// ---- 发起对话逻辑 ----
async function searchUsers(keyword) {
  userSearchLoading.value = true
  try {
    const res = await listAppUsers({ keyword: keyword || undefined, pageNum: 1, pageSize: 20 })
    userOptions.value = res.rows || []
  } catch {
    userOptions.value = []
  } finally {
    userSearchLoading.value = false
  }
}

function handleTypeChange() {
  createForm.value.businessId = null
  createForm.value.businessName = ''
  bizOptions.value = []
  if (!createForm.value.businessType || createForm.value.businessType === 'GENERAL') return
  loadBizOptions(createForm.value.businessType)
}

async function loadBizOptions(type) {
  bizLoading.value = true
  try {
    let items = []
    if (type === 'WORK') {
      const res = await listWork({ pageNum: 1, pageSize: 50 })
      items = (res.rows || []).map(w => ({ id: w.workId, name: w.title || `作品#${w.workId}` }))
    } else if (type === 'SEAL') {
      const res = await getCopyrightSealList({ pageNo: 1, pageSize: 50 })
      items = (res.rows || []).map(s => ({ id: s.sealId, name: s.sealName || `印章#${s.sealId}` }))
    } else if (type === 'COPYRIGHT') {
      const res = await getCopyrightAssets({ pageNum: 1, pageSize: 50 })
      items = (res.rows || []).map(c => ({ id: c.workId, name: c.workName || c.title || `版权#${c.workId}` }))
    } else if (type === 'ORDER') {
      const res = await getOrderList({ pageNum: 1, pageSize: 50 })
      items = (res.rows || []).map(o => ({ id: o.orderId, name: o.workTitle || o.orderNo || `订单#${o.orderId}` }))
    }
    bizOptions.value = items
  } catch {
    bizOptions.value = []
  } finally {
    bizLoading.value = false
  }
}

function handleBizChange(id) {
  const hit = bizOptions.value.find(b => b.id === id)
  createForm.value.businessName = hit ? hit.name : ''
}

async function handleCreate() {
  if (!createForm.value.targetUserId) {
    ElMessage.warning('请选择目标用户')
    return
  }
  creating.value = true
  try {
    const res = await createSession({
      targetUserId: createForm.value.targetUserId,
      businessType: createForm.value.businessType || 'GENERAL',
      businessId: createForm.value.businessId || null,
      businessName: createForm.value.businessName || null
    })
    if (res?.sessionId) {
      createVisible.value = false
      router.push({ path: '/appuser/chat-detail', query: { sessionId: res.sessionId } })
    }
  } catch {
    ElMessage.error('创建会话失败')
  } finally {
    creating.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
.user-cell { display: flex; align-items: center; gap: 8px; }
.biz-name { margin-left: 8px; color: #606266; }
.muted { color: #a8abb2; }
.unread-badge :deep(.el-badge__content) { background-color: #f56c6c; border: 0; }
</style>
