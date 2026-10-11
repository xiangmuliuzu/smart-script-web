<template>
  <PageContainer>
    <PageHeader title="版权申请管理" description="管理作品的版权登记申请，跟踪审核状态及证书发放情况" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="申请状态" clearable style="width: 160px">
          <el-option label="待审核" value="pending" />
          <el-option label="待提交" value="approved" />
          <el-option label="待提交到第三方" value="submitted" />
          <el-option label="审核中" value="reviewing" />
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
      <el-table-column prop="workName" label="作品名称" width="200" show-overflow-tooltip />
      <el-table-column prop="centerName" label="版权中心" width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tooltip v-if="row.centerName" :content="`中心代码: ${row.copyrightCenter || '未知'}`" placement="top">
            <span>{{ row.centerName }}</span>
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
            {{ row.statusText || statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="170" />
      <el-table-column prop="certNo" label="证书编号" width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.certNo || '—' }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.remark || '—' }}</template>
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

    <!-- 提交到版权中心对话框 -->
    <el-dialog v-model="submitDialogVisible" title="选择版权中心" width="500px">
      <el-form :model="submitForm" label-width="100px">
        <el-form-item label="选择版权中心" required>
          <el-select
            v-model="submitForm.configId"
            placeholder="请选择版权中心"
            style="width: 100%"
            :loading="loadingCenters"
          >
            <el-option
              v-for="center in availableCenters"
              :key="center.configId"
              :label="center.centerName"
              :value="center.configId"
            >
              <div style="display: flex; justify-content: space-between">
                <span>{{ center.centerName }}</span>
                <el-tag size="small" type="success">可用</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        >
          <template #default>
            <div style="font-size: 13px">
              选择版权中心后，申请将被分配到该版权中心的待处理列表，您可以在版权中心配置页进一步提交到第三方API。
            </div>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="submitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="confirmSubmitToCenter">
          确定提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量提交到版权中心对话框 -->
    <el-dialog v-model="batchSubmitDialogVisible" title="批量提交到版权中心" width="500px">
      <el-form label-width="100px">
        <el-form-item label="选择版权中心" required>
          <el-select
            v-model="batchSubmitConfigId"
            placeholder="请选择版权中心"
            style="width: 100%"
            :loading="loadingCenters"
          >
            <el-option
              v-for="center in availableCenters"
              :key="center.configId"
              :label="center.centerName"
              :value="center.configId"
            >
              <div style="display: flex; justify-content: space-between">
                <span>{{ center.centerName }}</span>
                <el-tag size="small" type="success">可用</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-alert
          :title="`即将提交 ${selectedRows.filter(row => row.status === 'approved').length} 条申请`"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        >
          <template #default>
            <div style="font-size: 13px">
              所有选中的已审核通过申请将被分配到该版权中心的待处理列表
            </div>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="batchSubmitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchSubmitting" @click="confirmBatchSubmit">
          确定提交
        </el-button>
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
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '停用' }}
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
    pending: '待审核 - 等待管理员审核',
    approved: '待提交 - 等待提交到版权中心配置页',
    submitted: '待提交到第三方 - 已分配到版权中心配置页，需在配置页提交到第三方API',
    reviewing: '审核中 - 已提交到第三方版权中心，等待审核',
    certificated: '已发证 - 版权登记成功',
    rejected: '已驳回'
  }
  return map[status] || status
}

// 获取进度描述
const getProgressDescription = (status, externalApplyNo) => {
  if (status === 'pending') {
    return '申请已创建，等待管理员审核'
  }
  
  if (status === 'approved') {
    return '管理员已审核通过，请提交到版权中心配置页'
  }
  
  if (status === 'submitted' && !externalApplyNo) {
    return '已分配到版权中心配置页，需在配置页提交到第三方API后才能查询审核进度'
  }
  
  const map = {
    reviewing: '已提交到第三方版权中心，正在审核中，请耐心等待',
    certificated: '版权证书已发放，可在详情中查看证书信息',
    rejected: '申请被第三方驳回，请查看驳回原因'
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
const submitDialogVisible = ref(false)
const submitForm = reactive({
  applyId: null,
  configId: null
})
const submitting = ref(false)

const handleSubmitToCenter = async (row) => {
  // 加载可用的版权中心列表
  loadingCenters.value = true
  try {
    const res = await getAvailableCopyrightCenters()
    // unwrapRuoYiResponse 已经解包，res 直接就是数组
    availableCenters.value = Array.isArray(res) ? res : []
    
    if (availableCenters.value.length === 0) {
      ElMessage.warning('暂无可用的版权中心，请先在版权中心配置页启用版权中心')
      return
    }
    
    // 打开选择对话框
    submitForm.applyId = row.applyId
    submitForm.configId = null
    submitDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取版权中心列表失败')
  } finally {
    loadingCenters.value = false
  }
}

// 确认提交到版权中心
const confirmSubmitToCenter = async () => {
  if (!submitForm.configId) {
    ElMessage.warning('请选择版权中心')
    return
  }
  
  submitting.value = true
  try {
    await submitCopyrightApplicationToCenter(submitForm.applyId, submitForm.configId)
    ElMessage.success('提交成功')
    submitDialogVisible.value = false
    loadApplications()
  } catch (error) {
    console.error('提交失败:', error)
    const errorMsg = error.response?.data?.msg || error.message || '提交失败'
    ElMessage.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

// 批量提交
const batchSubmitDialogVisible = ref(false)
const batchSubmitConfigId = ref(null)
const batchSubmitting = ref(false)

const handleBatchSubmit = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要提交的申请')
    return
  }
  
  const approvedRows = selectedRows.value.filter(row => row.status === 'approved')
  if (approvedRows.length === 0) {
    ElMessage.warning('请选择状态为"已通过"的申请')
    return
  }
  
  // 加载可用的版权中心列表
  loadingCenters.value = true
  try {
    const res = await getAvailableCopyrightCenters()
    // unwrapRuoYiResponse 已经解包，res 直接就是数组
    availableCenters.value = Array.isArray(res) ? res : []
    
    if (availableCenters.value.length === 0) {
      ElMessage.warning('暂无可用的版权中心，请先在版权中心配置页启用版权中心')
      return
    }
    
    // 打开批量提交对话框
    batchSubmitConfigId.value = null
    batchSubmitDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取版权中心列表失败')
  } finally {
    loadingCenters.value = false
  }
}

// 确认批量提交
const confirmBatchSubmit = async () => {
  if (!batchSubmitConfigId.value) {
    ElMessage.warning('请选择版权中心')
    return
  }
  
  const approvedRows = selectedRows.value.filter(row => row.status === 'approved')
  
  batchSubmitting.value = true
  try {
    // 逐个提交到选中的版权中心
    for (const row of approvedRows) {
      await submitCopyrightApplicationToCenter(row.applyId, batchSubmitConfigId.value)
    }
    ElMessage.success(`成功提交 ${approvedRows.length} 条申请`)
    batchSubmitDialogVisible.value = false
    loadApplications()
  } catch (error) {
    console.error('批量提交失败:', error)
    const errorMsg = error.response?.data?.msg || error.message || '批量提交失败'
    ElMessage.error(errorMsg)
  } finally {
    batchSubmitting.value = false
  }
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
    submitted: '待提交到第三方',  // 已从申请页提交到配置页，等待配置页提交到第三方
    reviewing: '审核中',  // 已从配置页提交到第三方
    rejected: '已驳回',
    certificated: '已发证'
  }
  return map[status] || status
}

const statusType = (status) => {
  const map = {
    pending: 'info',
    approved: 'warning',
    submitted: 'warning',   // 待审核状态 - 黄色
    reviewing: 'primary',   // 审核中状态 - 蓝色
    rejected: 'danger',
    certificated: 'success'
  }
  return map[status] || 'info'
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

const centerInfoVisible = ref(false)
const availableCenters = ref([])
const loadingCenters = ref(false)

const showCenterInfo = async () => {
  centerInfoVisible.value = true
  loadingCenters.value = true
  
  try {
    const res = await getAvailableCopyrightCenters()
    // unwrapRuoYiResponse 已经解包，res 直接就是数组
    availableCenters.value = Array.isArray(res) ? res : []
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
