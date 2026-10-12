<template>
  <PageContainer>
    <PageHeader title="印章管理" description="管理用户个人印章的启用、停用状态，查看审核记录和异常处理历史。" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
          <el-option label="已启用" value="enabled" />
          <el-option label="已停用" value="disabled" />
          <el-option label="异常" value="abnormal" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" clearable placeholder="用户名称 / 用户ID" style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="rows"
      :loading="loading"
      :total="total"
      :empty-text="loadFailed ? '加载失败，请重试' : '暂无印章记录'"
      @page-change="loadRows"
      @size-change="loadRows"
    >
      <template #actions>
        <el-button v-if="loadFailed" link type="primary" @click="loadRows">重试</el-button>
      </template>
      <el-table-column prop="sealId" label="印章ID" width="90" />
      <el-table-column prop="sealName" label="印章名称" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.sealName || '—' }}</template>
      </el-table-column>
      <el-table-column label="用户信息" min-width="150">
        <template #default="{ row }">
          <div>{{ row.userName || '—' }}</div>
          <div v-if="row.userId" class="muted">ID: {{ row.userId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100">
        <template #default="{ row }"><el-tag :type="reviewStatusType(row.reviewStatus)" size="small">{{ reviewStatusLabel(row.reviewStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="印章状态" width="100">
        <template #default="{ row }"><el-tag :type="statusType(row.sealStatus)" size="small">{{ statusLabel(row.sealStatus) }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="reviewTime" label="审核时间" width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ row.reviewTime || '—' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="驳回原因" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.rejectReason" style="color: #f56c6c;">{{ row.rejectReason }}</span>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详细</el-button>
          <el-button link type="primary" @click="openLogs(row)">审核记录</el-button>
          <!-- 只有审核通过且已停用的印章才能启用 -->
          <el-button
            v-if="row.reviewStatus === 'approved' && row.sealStatus === 'disabled'"
            v-permission="'smartscript:copyright:seal:manage'"
            type="success"
            size="small"
            :loading="statusChangingSealId === row.sealId"
            :disabled="statusChangingSealId !== null && statusChangingSealId !== row.sealId"
            @click="changeSealStatus(row, 'enabled')"
          >启用</el-button>
          <!-- 只有审核通过且已启用的印章才能停用 -->
          <el-button
            v-if="row.reviewStatus === 'approved' && row.sealStatus === 'enabled'"
            v-permission="'smartscript:copyright:seal:manage'"
            type="warning"
            size="small"
            :loading="statusChangingSealId === row.sealId"
            :disabled="statusChangingSealId !== null && statusChangingSealId !== row.sealId"
            @click="changeSealStatus(row, 'disabled')"
          >停用</el-button>
          <!-- 只有审核通过且异常的印章才能处理异常 -->
          <el-button
            v-if="row.reviewStatus === 'approved' && row.sealStatus === 'abnormal'"
            v-permission="'smartscript:copyright:seal:manage'"
            type="danger"
            size="small"
            @click="openResolveAbnormal(row)"
          >处理异常</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-drawer v-model="logsVisible" title="审核记录" size="700px">
      <div v-loading="logsLoading" class="drawer-content">
        <el-empty v-if="!logsLoading && logs.length === 0" description="暂无审核记录" />
        <el-timeline v-else>
          <el-timeline-item
            v-for="log in logs"
            :key="log.logId"
            :timestamp="log.createTime"
            :type="logType(log.operationType)"
            placement="top"
          >
            <el-card>
              <template #header>
                <div class="log-header">
                  <el-tag :type="logType(log.operationType)" size="small">{{ logActionLabel(log.operationType) }}</el-tag>
                  <span class="operator">{{ log.operatorName || '系统' }}</span>
                </div>
              </template>
              <div v-if="log.fromStatus || log.toStatus" class="log-content">
                <strong>状态变更：</strong>
                <el-tag v-if="log.fromStatus" size="small" style="margin: 0 4px;">{{ statusLabel(log.fromStatus) }}</el-tag>
                <span v-if="log.fromStatus && log.toStatus">→</span>
                <el-tag v-if="log.toStatus" :type="statusType(log.toStatus)" size="small" style="margin: 0 4px;">{{ statusLabel(log.toStatus) }}</el-tag>
              </div>
              <div v-if="log.reason" class="log-content">
                <strong>原因：</strong>{{ log.reason }}
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>

    <el-drawer v-model="detailVisible" title="印章详细信息" size="600px">
      <div v-loading="detailLoading" class="drawer-content">
        <template v-if="currentDetail">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="印章ID">{{ currentDetail.sealId }}</el-descriptions-item>
            <el-descriptions-item label="用户信息">
              <div>{{ currentDetail.userName || '—' }}</div>
              <div style="color: #909399; font-size: 12px;">ID: {{ currentDetail.userId || '—' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="印章名称">{{ currentDetail.sealName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="reviewStatusType(currentDetail.reviewStatus)" size="small">{{ reviewStatusLabel(currentDetail.reviewStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="印章状态">
              <el-tag :type="statusType(currentDetail.sealStatus)" size="small">{{ statusLabel(currentDetail.sealStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ currentDetail.reviewTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentDetail.createTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="驳回原因" v-if="currentDetail.rejectReason">
              <span style="color: #f56c6c;">{{ currentDetail.rejectReason }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 印章预览 -->
          <div class="material-block">
            <h3>印章预览</h3>
            <el-image 
              v-if="currentDetail.sealImageUrl" 
              :src="currentDetail.sealImageUrl" 
              :preview-src-list="[currentDetail.sealImageUrl]" 
              fit="contain" 
              class="seal-image"
            />
            <el-empty v-else description="未上传印章图片" :image-size="80" />
          </div>

          <!-- 审核材料 -->
          <div class="material-block" v-if="currentDetail.materialUrls">
            <h3>审核材料</h3>
            <ul class="material-list">
              <li v-for="(url, index) in parseMaterials(currentDetail.materialUrls)" :key="index">
                <el-link type="primary" :href="url" target="_blank">材料{{ index + 1 }}</el-link>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </el-drawer>

    <el-dialog v-model="resolveVisible" title="处理异常" width="500px">
      <el-form label-width="100px">
        <el-form-item label="处理说明" required>
          <el-input v-model="resolveReason" type="textarea" :rows="4" placeholder="请填写异常处理说明" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" :loading="resolveSubmitting" @click="resolveAbnormal">确认处理</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { getPersonalSealList, getCopyrightSealLogs, updateCopyrightSealStatus, resolveAbnormalCopyrightSeal } from '@/api/copyright'

const query = reactive({
  pageNo: 1,
  pageSize: 10,
  status: '',
  keyword: ''
})

const rows = ref([])
const total = ref(0)
const loading = ref(false)
const loadFailed = ref(false)
let requestId = 0

const logsVisible = ref(false)
const logsLoading = ref(false)
const logs = ref([])
const currentSealId = ref(null)

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentDetail = ref(null)

const statusChangingSealId = ref(null)
const resolveVisible = ref(false)
const resolveReason = ref('')
const resolveSubmitting = ref(false)
const resolveSealId = ref(null)

function statusLabel(status) {
  const map = {
    // 印章状态
    enabled: '已启用',
    disabled: '已停用',
    abnormal: '异常',
    // 审核状态（用于日志状态变更显示）
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

function statusType(status) {
  const map = {
    // 印章状态
    enabled: 'success',
    disabled: 'info',
    abnormal: 'danger',
    // 审核状态（用于日志状态变更显示）
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

function reviewStatusLabel(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

function reviewStatusType(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

function logActionLabel(action) {
  const map = {
    submit: '提交审核',
    review_approve: '审核通过',
    review_reject: '审核驳回',
    enable: '启用',
    disable: '停用',
    resolve_abnormal: '异常处理'
  }
  return map[action] || action
}

function logType(action) {
  const map = {
    submit: 'primary',
    review_approve: 'success',
    review_reject: 'danger',
    enable: 'success',
    disable: 'warning',
    resolve_abnormal: 'info'
  }
  return map[action] || 'primary'
}

function handleQuery() {
  query.pageNo = 1
  loadRows()
}

function handleReset() {
  query.status = ''
  query.keyword = ''
  query.pageNo = 1
  loadRows()
}

async function loadRows() {
  const currentRequestId = ++requestId
  loading.value = true
  loadFailed.value = false
  try {
    // 后端CopyrightSealReviewController使用sealStatus参数
    const params = {
      ...query,
      sealStatus: query.status,
      status: undefined
    }
    const result = await getPersonalSealList(params)
    if (!Array.isArray(result?.rows) || !Number.isFinite(Number(result.total))) {
      throw new Error('印章列表接口响应格式无效')
    }
    if (currentRequestId === requestId) {
      rows.value = result.rows
      total.value = Number(result.total)
    }
  } catch {
    if (currentRequestId === requestId) {
      rows.value = []
      total.value = 0
      loadFailed.value = true
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

async function openLogs(row) {
  currentSealId.value = row.sealId
  logsVisible.value = true
  logsLoading.value = true
  logs.value = []
  try {
    logs.value = await getCopyrightSealLogs(row.sealId)
    if (!Array.isArray(logs.value)) logs.value = []
  } catch (error) {
    ElMessage.error(error?.message || '加载审核记录失败')
  } finally {
    logsLoading.value = false
  }
}

function openDetail(row) {
  currentDetail.value = row
  detailVisible.value = true
}

function parseMaterials(materialUrls) {
  if (!materialUrls) return []
  try {
    // 如果是JSON格式
    if (materialUrls.startsWith('[')) {
      return JSON.parse(materialUrls)
    }
    // 如果是逗号分隔的字符串
    return materialUrls.split(',').filter(url => url.trim())
  } catch {
    return []
  }
}

async function changeSealStatus(row, status) {
  if (statusChangingSealId.value) return
  const action = status === 'enabled' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确认${action}该印章？`, '提示', { type: 'warning' })
    statusChangingSealId.value = row.sealId
    await updateCopyrightSealStatus(row.sealId, status)
    ElMessage.success(`${action}成功`)
    await loadRows()
    if (currentSealId.value === row.sealId && logsVisible.value) await openLogs(row)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error?.message || `${action}失败`)
  } finally {
    statusChangingSealId.value = null
  }
}

function openResolveAbnormal(row) {
  resolveSealId.value = row.sealId
  resolveReason.value = ''
  resolveVisible.value = true
}

async function resolveAbnormal() {
  if (resolveSubmitting.value) return
  const reason = resolveReason.value.trim()
  if (!reason) {
    ElMessage.warning('请填写异常处理说明')
    return
  }
  resolveSubmitting.value = true
  try {
    await resolveAbnormalCopyrightSeal(resolveSealId.value, reason)
    ElMessage.success('异常已处理')
    resolveVisible.value = false
    await loadRows()
    if (currentSealId.value === resolveSealId.value && logsVisible.value) {
      const row = rows.value.find(r => r.sealId === resolveSealId.value)
      if (row) await openLogs(row)
    }
  } catch (error) {
    ElMessage.error(error?.message || '异常处理失败')
  } finally {
    resolveSubmitting.value = false
  }
}

onMounted(loadRows)
</script>

<style scoped>
.drawer-content { min-height: 180px; }
.muted { color: #909399; font-size: 12px; }
.log-header { display: flex; justify-content: space-between; align-items: center; }
.operator { color: #606266; font-size: 13px; }
.log-content { margin-top: 8px; color: #606266; line-height: 1.6; }
.log-content strong { color: #303133; margin-right: 4px; }
.material-block { margin-top: 24px; }
.material-block h3 { margin: 0 0 12px; color: #303133; font-size: 14px; font-weight: 600; }
.seal-image { width: 100%; max-width: 300px; height: auto; border: 1px solid #ebeef5; border-radius: 4px; cursor: pointer; }
.material-list { margin: 0; padding-left: 20px; line-height: 2.2; color: #606266; }

/* 操作按钮样式优化 */
:deep(.el-button.is-link) {
  font-weight: 500;
}
:deep(.el-button.is-link[type="success"]) {
  color: #67c23a;
  font-weight: 600;
}
:deep(.el-button.is-link[type="warning"]) {
  color: #e6a23c;
  font-weight: 600;
}
:deep(.el-button.is-link[type="danger"]) {
  color: #f56c6c;
  font-weight: 600;
}
</style>
