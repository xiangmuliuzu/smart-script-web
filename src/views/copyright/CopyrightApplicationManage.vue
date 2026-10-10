<template>
  <PageContainer>
    <PageHeader title="版权申请管理" description="管理作品的版权登记申请，跟踪审核状态及证书发放情况" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="申请状态" clearable style="width: 160px">
          <el-option label="待审核" value="pending" />
          <el-option label="待提交" value="approved" />
          <el-option label="已提交" value="submitted" />
          <el-option label="已驳回" value="rejected" />
          <el-option label="已发证" value="certificated" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.copyrightCenter" placeholder="版权中心" clearable style="width: 160px">
          <el-option label="国家版权中心" value="national" />
          <el-option label="地方版权中心" value="local" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.applyNo"
          clearable
          placeholder="申请编号"
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="applications"
      :loading="loading"
      :total="total"
      :empty-text="emptyText"
      @page-change="loadApplications"
      @size-change="loadApplications"
      @selection-change="handleSelectionChange"
    >
      <template #actions>
        <el-button 
          v-permission="'smartscript:copyright:application:submit'"
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="handleBatchSubmit"
        >
          批量提交
        </el-button>
      </template>
      <el-table-column type="selection" width="55" />
      <el-table-column prop="applyNo" label="申请编号" width="180" show-overflow-tooltip />
      <el-table-column prop="workId" label="作品ID" width="100" />
      <el-table-column prop="copyrightCenter" label="版权中心" width="140">
        <template #default="{ row }">
          <el-tooltip v-if="row.copyrightCenter" :content="`配置ID: ${row.configId || '未关联'}`" placement="top">
            <span>{{ centerLabel(row.copyrightCenter) }}</span>
          </el-tooltip>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column prop="externalApplyNo" label="外部申请号" width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tooltip v-if="row.externalApplyNo" :content="`在${centerLabel(row.copyrightCenter)}的申请编号`" placement="top">
            <span>{{ row.externalApplyNo }}</span>
          </el-tooltip>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="申请状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="170" />
      <el-table-column prop="certNo" label="证书编号" width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.certNo || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" @click="handleDetail(row)">详情</el-button>
            
            <!-- pending状态：显示审核按钮 -->
            <template v-if="row.status === 'pending'">
              <el-button
                v-permission="'smartscript:copyright:application:approve'"
                size="small"
                type="success"
                @click="handleReview(row)"
              >
                审核
              </el-button>
            </template>
            
            <!-- approved状态：显示提交按钮 -->
            <template v-if="row.status === 'approved'">
              <el-button
                v-permission="'smartscript:copyright:application:submit'"
                size="small"
                type="primary"
                @click="handleSubmitToCenter(row)"
              >
                提交
              </el-button>
            </template>
            
            <!-- submitted/reviewing状态：显示同步按钮 -->
            <template v-if="row.status === 'submitted' || row.status === 'reviewing'">
              <el-button
                v-permission="'smartscript:copyright:application:sync'"
                size="small"
                type="warning"
                :loading="syncingId === row.applyId"
                :disabled="syncingId !== null && syncingId !== row.applyId"
                @click="handleSync(row)"
              >
                状态查询
              </el-button>
            </template>
            
            <!-- rejected状态：显示重新提交按钮 -->
            <template v-if="row.status === 'rejected'">
              <el-button
                v-permission="'smartscript:copyright:application:submit'"
                size="small"
                type="primary"
                @click="handleResubmit(row)"
              >
                重新提交
              </el-button>
            </template>
          </div>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="申请详情" size="520px">
      <div v-loading="detailLoading" class="detail-content">
        <el-descriptions v-if="currentRecord" :column="1" border>
          <el-descriptions-item label="申请编号">{{ currentRecord.applyNo }}</el-descriptions-item>
          <el-descriptions-item label="作品ID">{{ currentRecord.workId }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ currentRecord.userId }}</el-descriptions-item>
          <el-descriptions-item label="版权中心">{{ centerLabel(currentRecord.copyrightCenter) }}</el-descriptions-item>
          <el-descriptions-item label="外部申请号">{{ currentRecord.externalApplyNo || '—' }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="statusType(currentRecord.status)" size="small">
              {{ statusLabel(currentRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentRecord.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="证书编号">{{ currentRecord.certNo || '—' }}</el-descriptions-item>
          <el-descriptions-item label="发证时间">{{ currentRecord.certTime || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.certUrl" label="证书文件">
            <el-link :href="currentRecord.certUrl" type="primary" target="_blank">查看证书</el-link>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.rejectReason" label="驳回原因">
            {{ currentRecord.rejectReason }}
          </el-descriptions-item>
          <el-descriptions-item label="最后同步时间">{{ currentRecord.lastSyncTime || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="currentRecord.remark" label="备注">{{ currentRecord.remark }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核版权申请" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核操作" required>
          <el-radio-group v-model="reviewForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.action === 'reject'" label="驳回原因" required>
          <el-input
            v-model="reviewForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="confirmReview">确定</el-button>
      </template>
    </el-dialog>

    <!-- 状态查询结果对话框 -->
    <el-dialog v-model="syncStatusVisible" title="版权审核状态" width="600px">
      <div v-loading="syncStatusLoading">
        <el-descriptions v-if="syncStatusData" :column="1" border>
          <el-descriptions-item label="申请编号">{{ syncStatusData.applyNo }}</el-descriptions-item>
          <el-descriptions-item label="外部申请号">{{ syncStatusData.externalApplyNo || '—' }}</el-descriptions-item>
          <el-descriptions-item label="版权中心">{{ syncStatusData.centerName }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusType(syncStatusData.status)" size="small">
              {{ syncStatusData.statusDesc || statusLabel(syncStatusData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ syncStatusData.submitTime }}</el-descriptions-item>
          <el-descriptions-item label="最后同步时间">{{ syncStatusData.lastSyncTime }}</el-descriptions-item>
          <el-descriptions-item v-if="syncStatusData.progress" label="审核进度">
            {{ syncStatusData.progress }}
          </el-descriptions-item>
          <el-descriptions-item v-if="syncStatusData.estimatedTime" label="预计完成时间">
            {{ syncStatusData.estimatedTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="syncStatusData.remark" label="备注">
            {{ syncStatusData.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button type="primary" @click="syncStatusVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑对话框 -->
    
    <!-- 版权中心配置信息对话框 -->
    <el-dialog v-model="centerInfoVisible" title="已配置的版权中心" width="700px">
      <div v-loading="loadingCenters">
        <el-alert 
          type="info" 
          :closable="false" 
          style="margin-bottom: 16px;"
        >
          <template #title>
            当前系统中已配置的版权登记中心，申请提交时会自动选择可用的版权中心
          </template>
        </el-alert>
        
        <el-table :data="availableCenters" border>
          <el-table-column prop="centerCode" label="中心代码" width="120" />
          <el-table-column prop="centerName" label="中心名称" width="180" />
          <el-table-column prop="apiUrl" label="API地址" show-overflow-tooltip />
          <el-table-column prop="priority" label="优先级" width="80" align="center" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="!loadingCenters && availableCenters.length === 0" description="暂无可用的版权中心配置" />
      </div>
      <template #footer>
        <el-button type="primary" @click="centerInfoVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  getCopyrightApplicationList,
  getCopyrightApplicationDetail,
  syncCopyrightApplication,
  reviewCopyrightApplication,
  submitCopyrightApplicationToCenter,
  batchSubmitCopyrightApplicationToCenter,
  batchSyncCopyrightStatus,
  resubmitCopyrightApplication,
  syncCopyrightApplicationStatus,
  getAvailableCopyrightCenters
} from '@/api/copyright'

const loading = ref(false)
const applications = ref([])
const total = ref(0)
const emptyText = ref('暂无数据')
const syncingId = ref(null)
const batchSyncing = ref(false)
const selectedRows = ref([])
const syncStatusVisible = ref(false)
const syncStatusLoading = ref(false)
const syncStatusData = ref(null)

const query = reactive({
  pageNo: 1,
  pageSize: 10,
  status: '',
  copyrightCenter: '',
  applyNo: ''
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentRecord = ref(null)

const reviewDialogVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewForm = reactive({
  applyId: null,
  action: '', // 'approve' 或 'reject'
  reason: ''
})

const loadApplications = async () => {
  loading.value = true
  try {
    const res = await getCopyrightApplicationList(query)
    applications.value = res.rows || []
    total.value = res.total || 0
    emptyText.value = '暂无数据'
  } catch (error) {
    applications.value = []
    total.value = 0
    emptyText.value = '加载失败'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  query.pageNo = 1
  loadApplications()
}

const handleReset = () => {
  query.status = ''
  query.copyrightCenter = ''
  query.applyNo = ''
  handleQuery()
}

const handleDetail = async (row) => {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getCopyrightApplicationDetail(row.applyId)
    console.log('详情响应数据:', res)
    // 兼容不同的响应格式
    currentRecord.value = res.data || res || null
    if (!currentRecord.value) {
      ElMessage.warning('暂无详情数据')
    }
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

const handleSync = async (row) => {
  syncingId.value = row.applyId
  syncStatusLoading.value = true
  try {
    await syncCopyrightApplicationStatus(row.applyId)
    
    // 重新加载列表以获取最新状态
    await loadApplications()
    
    // 从刷新后的列表中找到该申请，显示详细信息
    const updatedRow = applications.value.find(app => app.applyId === row.applyId)
    if (updatedRow) {
      // 准备状态详情数据
      syncStatusData.value = {
        applyNo: updatedRow.applyNo,
        externalApplyNo: updatedRow.externalApplyNo || '—',
        status: updatedRow.status,
        statusDesc: getStatusDescription(updatedRow.status),
        centerName: centerLabel(updatedRow.copyrightCenter),
        submitTime: updatedRow.submitTime || '—',
        lastSyncTime: new Date().toLocaleString(),
        progress: getProgressDescription(updatedRow.status, updatedRow.externalApplyNo)
      }
      syncStatusVisible.value = true
    }
    
    ElMessage.success('状态查询成功')
  } catch (error) {
    console.error('状态查询失败:', error)
    ElMessage.error(error.msg || '状态查询失败，请稍后重试')
  } finally {
    syncingId.value = null
    syncStatusLoading.value = false
  }
}

// 获取状态描述
const getStatusDescription = (status) => {
  const map = {
    pending: '待审核',
    approved: '待提交',
    submitted: '已提交到配置页，等待管理员提交到第三方',
    reviewing: '第三方审核中',
    certificated: '已发证',
    rejected: '已驳回'
  }
  return map[status] || status
}

// 获取进度描述
const getProgressDescription = (status, externalApplyNo) => {
  if (!externalApplyNo) {
    return '已提交到配置页，等待管理员提交到第三方版权中心'
  }
  
  const map = {
    submitted: '已提交到第三方版权中心，等待审核',
    reviewing: '第三方版权中心审核中，请耐心等待',
    certificated: '版权证书已发放，可在详情中查看证书信息',
    rejected: '申请被驳回，请查看驳回原因'
  }
  return map[status] || '处理中'
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 审核对话框
const rejectDialogVisible = ref(false)
const rejectSubmitting = ref(false)
const rejectForm = reactive({
  applyId: null,
  reason: ''
})

// 打开审核对话框
const handleReview = (row) => {
  reviewForm.applyId = row.applyId
  reviewForm.action = ''
  reviewForm.reason = ''
  reviewDialogVisible.value = true
}

// 确认审核
const confirmReview = async () => {
  if (!reviewForm.action) {
    ElMessage.warning('请选择审核操作')
    return
  }
  
  if (reviewForm.action === 'reject' && !reviewForm.reason.trim()) {
    ElMessage.warning('驳回操作必须填写驳回原因')
    return
  }
  
  reviewSubmitting.value = true
  try {
    await reviewCopyrightApplication(reviewForm.applyId, {
      action: reviewForm.action,
      rejectReason: reviewForm.reason
    })
    const actionText = reviewForm.action === 'approve' ? '审核通过' : '驳回'
    ElMessage.success(`${actionText}成功`)
    reviewDialogVisible.value = false
    loadApplications()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    reviewSubmitting.value = false
  }
}

// 提交到版权中心
const handleSubmitToCenter = (row) => {
  ElMessageBox.confirm(`确认将申请提交到${centerLabel(row.copyrightCenter)}？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await submitCopyrightApplicationToCenter(row.applyId)
      ElMessage.success('提交成功')
      loadApplications()
    } catch (error) {
      ElMessage.error('提交失败')
    }
  }).catch(() => {})
}

// 批量提交
const handleBatchSubmit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要提交的申请')
    return
  }
  
  const approvedRows = selectedRows.value.filter(row => row.status === 'approved')
  if (approvedRows.length === 0) {
    ElMessage.warning('请选择状态为"已通过"的申请')
    return
  }
  
  ElMessageBox.confirm(`确认批量提交 ${approvedRows.length} 条申请到版权中心？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const applyIds = approvedRows.map(row => row.applyId)
      await batchSubmitCopyrightApplicationToCenter(applyIds)
      ElMessage.success(`成功提交 ${approvedRows.length} 条申请`)
      loadApplications()
    } catch (error) {
      ElMessage.error('批量提交失败')
    }
  }).catch(() => {})
}

const centerLabel = (center) => {
  const map = {
    national: '国家版权中心',
    local: '地方版权中心'
  }
  return map[center] || center
}

const statusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '待提交',
    submitted: '已提交',
    rejected: '已驳回',
    certificated: '已发证'
  }
  return map[status] || status
}

const statusType = (status) => {
  const map = {
    pending: 'info',
    approved: 'warning',
    submitted: 'primary',
    rejected: 'danger',
    certificated: 'success'
  }
  return map[status] || ''
}

const handleBatchSync = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要同步的申请')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定同步选中的 ${selectedRows.value.length} 个申请的状态吗？`,
      '批量同步确认',
      { type: 'warning' }
    )
    
    const applyIds = selectedRows.value.map(row => row.applyId)
    await batchSyncCopyrightStatus(applyIds)
    ElMessage.success('批量同步成功')
    loadApplications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量同步失败')
    }
  }
}

const handleResubmit = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定重新提交申请"${row.applyNo}"吗？`,
      '重新提交确认',
      { type: 'warning' }
    )
    
    await resubmitCopyrightApplication(row.applyId)
    ElMessage.success('重新提交成功')
    loadApplications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新提交失败')
    }
  }
}

const centerInfoVisible = ref(false)
const availableCenters = ref([])
const loadingCenters = ref(false)

const showCenterInfo = async () => {
  centerInfoVisible.value = true
  loadingCenters.value = true
  
  try {
    const res = await getAvailableCopyrightCenters()
    availableCenters.value = res.data || []
  } catch (error) {
    ElMessage.error('获取版权中心信息失败')
  } finally {
    loadingCenters.value = false
  }
}

loadApplications()
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-content {
  padding: 0 16px;
}
</style>
