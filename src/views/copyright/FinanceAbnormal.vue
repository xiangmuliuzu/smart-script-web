<template>
  <PageContainer>
    <PageHeader title="财务异常处理" description="处理重复支付、退款异常、托管异常和结算异常等财务问题。" />

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="重复支付" name="duplicate">
        <FilterBar @query="handleQuery" @reset="handleReset">
          <el-form-item>
            <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="handled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.keyword" clearable placeholder="订单号 / 用户名" style="width: 230px" @keyup.enter="handleQuery" />
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="query.pageNo"
          v-model:pageSize="query.pageSize"
          :data="duplicateRows"
          :loading="loading"
          :total="duplicateTotal"
          :empty-text="'暂无重复支付记录'"
          @page-change="loadDuplicate"
          @size-change="loadDuplicate"
        >
          <el-table-column prop="orderNo" label="订单号" width="160" />
          <el-table-column label="用户" min-width="130">
            <template #default="{ row }">{{ row.userName }}</template>
          </el-table-column>
          <el-table-column label="重复次数" width="100" align="center">
            <template #default="{ row }">{{ row.duplicateCount }}</template>
          </el-table-column>
          <el-table-column label="重复金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.duplicateAmount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.status === 'handled' ? 'success' : 'warning'" size="small">{{ row.status === 'handled' ? '已处理' : '待处理' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="createTime" label="发现时间" width="170" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" link type="primary" @click="handleDuplicate(row)">处理</el-button>
              <el-button link type="primary" @click="viewDetail(row, 'duplicate')">详情</el-button>
            </template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>

      <el-tab-pane label="退款异常" name="refund">
        <FilterBar @query="handleQuery" @reset="handleReset">
          <el-form-item>
            <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="handled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.keyword" clearable placeholder="退款单号 / 订单号" style="width: 230px" @keyup.enter="handleQuery" />
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="query.pageNo"
          v-model:pageSize="query.pageSize"
          :data="refundRows"
          :loading="loading"
          :total="refundTotal"
          :empty-text="'暂无退款异常记录'"
          @page-change="loadRefund"
          @size-change="loadRefund"
        >
          <el-table-column prop="refundNo" label="退款单号" width="160" />
          <el-table-column prop="orderNo" label="订单号" width="160" />
          <el-table-column label="退款金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.refundAmount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="异常原因" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.abnormalReason }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.status === 'handled' ? 'success' : 'danger'" size="small">{{ row.status === 'handled' ? '已处理' : '待处理' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="createTime" label="发现时间" width="170" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" link type="primary" @click="handleRefund(row)">处理</el-button>
              <el-button link type="primary" @click="viewDetail(row, 'refund')">详情</el-button>
            </template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>

      <el-tab-pane label="托管异常" name="escrow">
        <FilterBar @query="handleQuery" @reset="handleReset">
          <el-form-item>
            <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="handled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.keyword" clearable placeholder="托管单号 / 订单号" style="width: 230px" @keyup.enter="handleQuery" />
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="query.pageNo"
          v-model:pageSize="query.pageSize"
          :data="escrowRows"
          :loading="loading"
          :total="escrowTotal"
          :empty-text="'暂无托管异常记录'"
          @page-change="loadEscrow"
          @size-change="loadEscrow"
        >
          <el-table-column prop="escrowNo" label="托管单号" width="160" />
          <el-table-column prop="orderNo" label="订单号" width="160" />
          <el-table-column label="托管金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.escrowAmount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="异常类型" width="120">
            <template #default="{ row }">{{ row.abnormalType }}</template>
          </el-table-column>
          <el-table-column label="异常描述" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.abnormalDesc }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.status === 'handled' ? 'success' : 'danger'" size="small">{{ row.status === 'handled' ? '已处理' : '待处理' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="createTime" label="发现时间" width="170" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" link type="primary" @click="handleEscrow(row)">处理</el-button>
              <el-button link type="primary" @click="viewDetail(row, 'escrow')">详情</el-button>
            </template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>

      <el-tab-pane label="结算异常" name="settlement">
        <FilterBar @query="handleQuery" @reset="handleReset">
          <el-form-item>
            <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="handled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.keyword" clearable placeholder="结算单号 / 作者名" style="width: 230px" @keyup.enter="handleQuery" />
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="query.pageNo"
          v-model:pageSize="query.pageSize"
          :data="settlementRows"
          :loading="loading"
          :total="settlementTotal"
          :empty-text="'暂无结算异常记录'"
          @page-change="loadSettlement"
          @size-change="loadSettlement"
        >
          <el-table-column prop="settlementNo" label="结算单号" width="160" />
          <el-table-column label="作者" width="130">
            <template #default="{ row }">{{ row.authorName }}</template>
          </el-table-column>
          <el-table-column label="结算金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.settlementAmount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="异常原因" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.abnormalReason }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }"><el-tag :type="row.status === 'handled' ? 'success' : 'danger'" size="small">{{ row.status === 'handled' ? '已处理' : '待处理' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="createTime" label="发现时间" width="170" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" link type="primary" @click="handleSettlement(row)">处理</el-button>
              <el-button link type="primary" @click="viewDetail(row, 'settlement')">详情</el-button>
            </template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="handleVisible" :title="handleTitle" width="600px">
      <el-form label-width="100px">
        <el-form-item label="异常详情">
          <el-input v-model="handleDetail" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="处理方案">
          <el-select v-model="handleSolution" placeholder="请选择处理方案" style="width: 100%">
            <el-option label="退回用户" value="refund" />
            <el-option label="补发款项" value="reissue" />
            <el-option label="人工核对" value="manual" />
            <el-option label="作废订单" value="cancel" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="handleRemark" type="textarea" :rows="3" placeholder="请输入处理备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" :loading="handleLoading" @click="submitHandle">确认处理</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="getDetailTitle()" width="750px">
      <el-descriptions v-if="detailData" :column="2" border v-loading="detailLoading">
        <!-- 基础信息 -->
        <el-descriptions-item label="记录ID">{{ detailData.id || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)" size="small">{{ formatStatus(detailData.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发现时间" :span="2">{{ detailData.create_time || '—' }}</el-descriptions-item>

        <!-- 重复支付 -->
        <template v-if="detailType === 'duplicate'">
          <el-descriptions-item label="订单号">{{ detailData.related_no || '—' }}</el-descriptions-item>
          <el-descriptions-item label="订单ID">{{ detailData.order_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.user_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.user_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="重复次数">{{ detailData.duplicate_count || 0 }}次</el-descriptions-item>
          <el-descriptions-item label="重复金额">¥{{ detailData.abnormal_amount?.toFixed(2) || '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">{{ detailData.abnormal_reason || '—' }}</el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_desc || '—' }}</div>
          </el-descriptions-item>
        </template>

        <!-- 退款异常 -->
        <template v-if="detailType === 'refund'">
          <el-descriptions-item label="退款单号">{{ detailData.related_no || '—' }}</el-descriptions-item>
          <el-descriptions-item label="订单ID">{{ detailData.order_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.user_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.user_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="退款金额" :span="2">¥{{ detailData.abnormal_amount?.toFixed(2) || '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_reason || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_desc || '—' }}</div>
          </el-descriptions-item>
        </template>

        <!-- 托管异常 -->
        <template v-if="detailType === 'escrow'">
          <el-descriptions-item label="托管单号">{{ detailData.related_no || '—' }}</el-descriptions-item>
          <el-descriptions-item label="订单ID">{{ detailData.order_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.user_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.user_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="托管金额" :span="2">¥{{ detailData.abnormal_amount?.toFixed(2) || '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_reason || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_desc || '—' }}</div>
          </el-descriptions-item>
        </template>

        <!-- 结算异常 -->
        <template v-if="detailType === 'settlement'">
          <el-descriptions-item label="结算单号">{{ detailData.related_no || '—' }}</el-descriptions-item>
          <el-descriptions-item label="订单ID">{{ detailData.order_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="作者名">{{ detailData.user_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="作者ID">{{ detailData.user_id || '—' }}</el-descriptions-item>
          <el-descriptions-item label="结算金额" :span="2">¥{{ detailData.abnormal_amount?.toFixed(2) || '0.00' }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_reason || '—' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.abnormal_desc || '—' }}</div>
          </el-descriptions-item>
        </template>

        <!-- 处理信息 -->
        <template v-if="detailData.status === 'handled'">
          <el-descriptions-item label="处理方案">
            <el-tag size="small" type="info">{{ formatSolution(detailData.handle_solution) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ detailData.handle_by || '—' }}</el-descriptions-item>
          <el-descriptions-item label="处理时间" :span="2">{{ detailData.handle_time || '—' }}</el-descriptions-item>
          <el-descriptions-item label="处理备注" :span="2">
            <div style="white-space: pre-wrap;">{{ detailData.handle_remark || '—' }}</div>
          </el-descriptions-item>
        </template>
      </el-descriptions>
      <div v-else-if="detailLoading" style="text-align: center; padding: 40px 0; color: #999;">
        加载中...
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { getFinanceAbnormalList, getFinanceAbnormalDetail, handleFinanceAbnormal } from '@/api/copyright'

const activeTab = ref('duplicate')

const query = reactive({
  pageNo: 1,
  pageSize: 10,
  status: '',
  keyword: ''
})

const loading = ref(false)

const duplicateRows = ref([])
const duplicateTotal = ref(0)
const refundRows = ref([])
const refundTotal = ref(0)
const escrowRows = ref([])
const escrowTotal = ref(0)
const settlementRows = ref([])
const settlementTotal = ref(0)

const handleVisible = ref(false)
const handleLoading = ref(false)
const handleTitle = ref('')
const handleDetail = ref('')
const handleSolution = ref('')
const handleRemark = ref('')
const currentRecord = ref(null)

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)
const detailType = ref('')

const handleQuery = () => {
  query.pageNo = 1
  loadCurrentTab()
}

const handleReset = () => {
  query.status = ''
  query.keyword = ''
  query.pageNo = 1
  loadCurrentTab()
}

const handleTabChange = () => {
  query.pageNo = 1
  loadCurrentTab()
}

async function loadCurrentTab() {
  const loaders = {
    duplicate: loadDuplicate,
    refund: loadRefund,
    escrow: loadEscrow,
    settlement: loadSettlement
  }
  await loaders[activeTab.value]()
}

async function loadDuplicate() {
  loading.value = true
  try {
    const result = await getFinanceAbnormalList({ ...query, type: 'duplicate' })
    if (result && Array.isArray(result.rows)) {
      duplicateRows.value = result.rows
      duplicateTotal.value = Number(result.total) || 0
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadRefund() {
  loading.value = true
  try {
    const result = await getFinanceAbnormalList({ ...query, type: 'refund' })
    if (result && Array.isArray(result.rows)) {
      refundRows.value = result.rows
      refundTotal.value = Number(result.total) || 0
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadEscrow() {
  loading.value = true
  try {
    const result = await getFinanceAbnormalList({ ...query, type: 'escrow' })
    if (result && Array.isArray(result.rows)) {
      escrowRows.value = result.rows
      escrowTotal.value = Number(result.total) || 0
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadSettlement() {
  loading.value = true
  try {
    const result = await getFinanceAbnormalList({ ...query, type: 'settlement' })
    if (result && Array.isArray(result.rows)) {
      settlementRows.value = result.rows
      settlementTotal.value = Number(result.total) || 0
    }
  } catch (error) {
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleDuplicate(row) {
  currentRecord.value = row
  handleTitle.value = '处理重复支付'
  handleDetail.value = `订单 ${row.orderNo} 重复支付 ${row.duplicateCount} 次，重复金额 ¥${row.duplicateAmount.toFixed(2)}`
  handleSolution.value = ''
  handleRemark.value = ''
  handleVisible.value = true
}

function handleRefund(row) {
  currentRecord.value = row
  handleTitle.value = '处理退款异常'
  handleDetail.value = row.abnormalReason
  handleSolution.value = ''
  handleRemark.value = ''
  handleVisible.value = true
}

function handleEscrow(row) {
  currentRecord.value = row
  handleTitle.value = '处理托管异常'
  handleDetail.value = row.abnormalDesc
  handleSolution.value = ''
  handleRemark.value = ''
  handleVisible.value = true
}

function handleSettlement(row) {
  currentRecord.value = row
  handleTitle.value = '处理结算异常'
  handleDetail.value = row.abnormalReason
  handleSolution.value = ''
  handleRemark.value = ''
  handleVisible.value = true
}

async function viewDetail(row, type) {
  detailType.value = type
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  
  try {
    const res = await getFinanceAbnormalDetail(type, row.id)
    detailData.value = res
  } catch (error) {
    ElMessage.error(error?.message || '加载详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

function getDetailTitle() {
  const titles = {
    duplicate: '重复支付详情',
    refund: '退款异常详情',
    escrow: '托管异常详情',
    settlement: '结算异常详情'
  }
  return titles[detailType.value] || '异常详情'
}

function formatStatus(status) {
  return status === 'handled' ? '已处理' : '待处理'
}

function getStatusType(status) {
  return status === 'handled' ? 'success' : 'warning'
}

function formatSolution(solution) {
  const solutions = {
    refund: '退回用户',
    reissue: '补发款项',
    manual: '人工核对',
    cancel: '作废订单'
  }
  return solutions[solution] || solution || '—'
}

async function submitHandle() {
  if (!handleSolution.value) {
    ElMessage.warning('请选择处理方案')
    return
  }
  if (!handleRemark.value.trim()) {
    ElMessage.warning('请输入处理备注')
    return
  }
  handleLoading.value = true
  try {
    const data = {
      solution: handleSolution.value,
      remark: handleRemark.value
    }
    await handleFinanceAbnormal(activeTab.value, currentRecord.value.id, data)
    ElMessage.success('处理成功')
    handleVisible.value = false
    loadCurrentTab()
  } catch (error) {
    ElMessage.error(error?.message || '处理失败')
  } finally {
    handleLoading.value = false
  }
}

onMounted(loadCurrentTab)
</script>

<style scoped>
:deep(.el-tabs__header) {
  margin-bottom: 20px;
}
</style>
