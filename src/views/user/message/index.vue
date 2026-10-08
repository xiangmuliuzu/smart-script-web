<template>
  <div class="a4-page">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 140px" clearable>
            <el-option label="全部类型" value="" />
            <el-option label="系统" value="SYSTEM" />
            <el-option label="审核" value="REVIEW" />
            <el-option label="交易" value="TRANSACTION" />
            <el-option label="权益" value="BENEFIT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filterForm.createdBy" placeholder="创建人" style="width: 160px" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-permission="['user:message:add']"
            type="primary"
            class="black-button"
            @click="openCreate"
          >创建消息</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="rows" style="width: 100%" v-loading="loading">
        <el-table-column prop="notificationId" label="消息 ID" width="100" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="正文" min-width="220" show-overflow-tooltip />
        <el-table-column label="业务引用" width="170">
          <template #default="{ row }">
            <span v-if="row.businessType || row.businessId">
              {{ row.businessType || '—' }} / {{ row.businessId || '—' }}
            </span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="receiverCount" label="收件人数" width="100" />
        <el-table-column prop="createdBy" label="创建人" width="110" />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['user:message:query']"
              size="small"
              @click="openDetail(row)"
            >详情</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <span v-if="errorText">{{ errorText }}</span>
            <span v-else>暂无数据</span>
            <el-button v-if="errorText" size="small" type="primary" link @click="load">重试</el-button>
          </div>
        </template>
      </el-table>
      <div class="pager-wrap">
        <el-pagination
          layout="total, prev, pager, next"
          :total="total"
          :page-size="query.pageSize"
          :current-page="query.pageNum"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <!-- 创建消息 -->
    <el-dialog v-model="createVisible" title="创建消息" width="620px">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="请求编号" required>
          <el-input v-model="createForm.requestId" placeholder="幂等键；相同编号的等价请求只创建一次" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="createForm.type" style="width: 100%">
            <el-option label="系统" value="SYSTEM" />
            <el-option label="审核" value="REVIEW" />
            <el-option label="交易" value="TRANSACTION" />
            <el-option label="权益" value="BENEFIT" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="createForm.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="正文" required>
          <el-input v-model="createForm.content" type="textarea" :rows="4" maxlength="2000" show-word-limit />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-input v-model="createForm.businessType" placeholder="与业务标识同时提供" maxlength="64" />
        </el-form-item>
        <el-form-item label="业务标识">
          <el-input v-model="createForm.businessId" placeholder="与业务类型同时提供" maxlength="64" />
        </el-form-item>
        <el-form-item label="收件人" required>
          <el-select
            v-model="createForm.userIds"
            multiple
            filterable
            remote
            :remote-method="searchReceivers"
            :loading="receiverLoading"
            placeholder="按昵称/账号/手机号搜索 App 用户"
            style="width: 100%"
          >
            <el-option
              v-for="u in receiverOptions"
              :key="u.userId"
              :label="`${u.nickname}（ID ${u.userId} / ${u.phoneMasked || '无手机号'}）`"
              :value="u.userId"
            />
          </el-select>
          <div class="form-hint">已选 {{ createForm.userIds.length }} 人；单次同步上限 50 人</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 消息详情 -->
    <el-dialog v-model="detailVisible" title="消息详情" width="620px">
      <el-descriptions v-if="detail" :column="1" border>
        <el-descriptions-item label="消息 ID">{{ detail.notificationId }}</el-descriptions-item>
        <el-descriptions-item label="请求编号">{{ detail.requestId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(detail.type) }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="正文">{{ detail.content }}</el-descriptions-item>
        <el-descriptions-item label="业务引用">
          {{ detail.businessType || '—' }} / {{ detail.businessId || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="收件人数">{{ detail.receiverCount }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(detail.createdAt) }}</el-descriptions-item>
      </el-descriptions>
      <div class="receiver-block">
        <div class="block-title">收件人（脱敏摘要）</div>
        <el-table :data="detail?.receivers || []" size="small" max-height="260">
          <el-table-column prop="userId" label="用户 ID" width="100" />
          <el-table-column prop="nickname" label="昵称" min-width="140" />
          <el-table-column prop="phoneMasked" label="手机号" width="140">
            <template #default="{ row }">{{ row.phoneMasked || '—' }}</template>
          </el-table-column>
          <el-table-column label="已读时间" width="170">
            <template #default="{ row }">{{ formatTime(row.readAt) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listNotifications, getNotification, createNotification } from '@/api/user/message'
import { listAppUsers } from '@/api/user/appUser'

const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const total = ref(0)
const errorText = ref('')
const query = reactive({ pageNum: 1, pageSize: 10, type: '', createdBy: '' })
const filterForm = reactive({ type: '', createdBy: '' })

const createVisible = ref(false)
const createForm = reactive({
  requestId: '',
  type: 'SYSTEM',
  title: '',
  content: '',
  businessType: '',
  businessId: '',
  userIds: []
})
const receiverOptions = ref([])
const receiverLoading = ref(false)

const detailVisible = ref(false)
const detail = ref(null)

function typeLabel(type) {
  if (type === 'SYSTEM') return '系统'
  if (type === 'REVIEW') return '审核'
  if (type === 'TRANSACTION') return '交易'
  if (type === 'BENEFIT') return '权益'
  return type || '—'
}

function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function load() {
  loading.value = true
  errorText.value = ''
  try {
    const res = await listNotifications({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      type: query.type || undefined,
      createdBy: query.createdBy || undefined
    })
    rows.value = res?.rows || []
    total.value = Number(res?.total || 0)
  } catch (e) {
    rows.value = []
    total.value = 0
    errorText.value = e?.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.type = filterForm.type
  query.createdBy = filterForm.createdBy
  query.pageNum = 1
  load()
}

function handleReset() {
  filterForm.type = ''
  filterForm.createdBy = ''
  handleSearch()
}

function onPageChange(page) {
  query.pageNum = page
  load()
}

function genRequestId() {
  return `a4-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function searchReceivers(keyword) {
  receiverLoading.value = true
  try {
    const res = await listAppUsers({ pageNum: 1, pageSize: 20, keyword: keyword || undefined })
    receiverOptions.value = res?.rows || []
  } catch {
    receiverOptions.value = []
  } finally {
    receiverLoading.value = false
  }
}

function openCreate() {
  createForm.requestId = genRequestId()
  createForm.type = 'SYSTEM'
  createForm.title = ''
  createForm.content = ''
  createForm.businessType = ''
  createForm.businessId = ''
  createForm.userIds = []
  receiverOptions.value = []
  searchReceivers('')
  createVisible.value = true
}

async function submitCreate() {
  if (!createForm.title.trim()) {
    ElMessage.warning('标题必填')
    return
  }
  if (!createForm.content.trim()) {
    ElMessage.warning('正文必填')
    return
  }
  if (!createForm.userIds.length) {
    ElMessage.warning('请选择收件人')
    return
  }
  if (createForm.userIds.length > 50) {
    ElMessage.warning('单次同步提交收件人不得超过 50 人')
    return
  }
  const hasType = !!createForm.businessType.trim()
  const hasId = !!createForm.businessId.trim()
  if (hasType !== hasId) {
    ElMessage.warning('业务类型与业务标识必须同时提供')
    return
  }
  saving.value = true
  try {
    const res = await createNotification({
      requestId: createForm.requestId,
      type: createForm.type,
      title: createForm.title.trim(),
      content: createForm.content.trim(),
      businessType: hasType ? createForm.businessType.trim() : undefined,
      businessId: hasId ? createForm.businessId.trim() : undefined,
      userIds: createForm.userIds
    })
    const created = res?.data?.created
    ElMessage.success(created === false ? '该请求编号已存在等价消息，已复用' : '消息创建成功')
    createVisible.value = false
    await load()
  } catch (e) {
    // 409 = 同一 requestId 被不同内容复用；提示换编号而不是原样重试
    if (e?.response?.status === 409) {
      ElMessage.error('该请求编号已被不同内容使用，请重新生成请求编号')
    } else {
      ElMessage.error(e?.message || '创建失败')
    }
  } finally {
    saving.value = false
  }
}

async function openDetail(row) {
  detail.value = null
  detailVisible.value = true
  try {
    const res = await getNotification(row.notificationId)
    detail.value = res?.data || res
  } catch (e) {
    ElMessage.error(e?.message || '详情加载失败')
  }
}

onMounted(load)
</script>

<style scoped>
.a4-page {
  padding: 20px;
  background-color: #f7f8fa;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.table-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 14px 24px;
  border-top: 1px solid #f0f0f0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 0;
  color: #8c8c8c;
  font-size: 13px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.receiver-block {
  margin-top: 16px;
}

.block-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 8px;
}

.black-button {
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
}

.black-button:hover {
  background-color: #000000;
  border-color: #000000;
}

:deep(.el-table) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #595959;
  font-weight: 500;
  font-size: 12px;
}

:deep(.el-table td) {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.el-button) {
  font-size: 12px;
  border-radius: 4px;
  padding: 5px 12px;
}

:deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  background-color: #f5f5f5;
  color: #8c8c8c;
}
</style>
