<template>
  <PageContainer>
    <PageHeader title="结算管理" description="管理作者收益分成核算与结算明细，处理结算异常情况。" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
          <el-option label="待结算" value="pending" />
          <el-option label="已结算" value="settled" />
          <el-option label="结算失败" value="failed" />
          <el-option label="异常" value="abnormal" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" clearable placeholder="作者名称 / 结算单号" style="width: 230px" @keyup.enter="handleQuery" />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="rows"
      :loading="loading"
      :total="total"
      :empty-text="loadFailed ? '加载失败，请重试' : '暂无结算记录'"
      @page-change="loadRows"
      @size-change="loadRows"
    >
      <template #actions>
        <el-button v-if="loadFailed" link type="primary" @click="loadRows">重试</el-button>
        <el-button v-permission="'smartscript:copyright:settlement:calculate'" type="primary" @click="openCalculate">批量核算</el-button>
      </template>
      <el-table-column prop="settlementNo" label="结算单号" width="180" fixed="left" />
      <el-table-column label="作者" width="120" show-overflow-tooltip>
        <template #default="{ row }">{{ row.authorName || '—' }}</template>
      </el-table-column>
      <el-table-column label="订单数" width="90" align="center">
        <template #default="{ row }">{{ row.orderCount || 0 }}</template>
      </el-table-column>
      <el-table-column label="总金额" width="110" align="right">
        <template #default="{ row }">¥{{ row.totalAmount?.toFixed(2) || '0.00' }}</template>
      </el-table-column>
      <el-table-column label="平台分成" width="110" align="right">
        <template #default="{ row }">¥{{ row.platformAmount?.toFixed(2) || '0.00' }}</template>
      </el-table-column>
      <el-table-column label="作者收益" width="110" align="right">
        <template #default="{ row }">¥{{ row.authorAmount?.toFixed(2) || '0.00' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="settlementTime" label="结算时间" width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="300" fixed="right" align="center">
        <template #default="{ row }">
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
            <el-button type="primary" size="small" @click="openDetail(row)">查看明细</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              v-permission="'smartscript:copyright:settlement:handle'" 
              type="success" 
              size="small" 
              @click="handleSettle(row)"
            >
              确认结算
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              v-permission="'smartscript:copyright:settlement:handle'" 
              type="warning" 
              size="small" 
              @click="openMarkAbnormal(row)"
            >
              标记异常
            </el-button>
            <el-button 
              v-if="row.status === 'abnormal'" 
              v-permission="'smartscript:copyright:settlement:handle'" 
              type="danger" 
              size="small" 
              @click="handleAbnormal(row)"
            >
              处理异常
            </el-button>
          </div>
        </template>
      </el-table-column>
    </TableCard>

    <el-drawer v-model="detailVisible" title="结算明细" size="70%">
      <div v-loading="detailLoading" class="drawer-content">
        <div v-if="detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="结算单号">{{ detail.settlementNo }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ detail.authorName }}</el-descriptions-item>
            <el-descriptions-item label="结算周期">{{ detail.periodStart }} 至 {{ detail.periodEnd }}</el-descriptions-item>
            <el-descriptions-item label="订单数量">{{ detail.orderCount }}</el-descriptions-item>
            <el-descriptions-item label="总交易额">¥{{ detail.totalAmount?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="平台分成比例">{{ detail.platformRatio }}%</el-descriptions-item>
            <el-descriptions-item label="平台分成">¥{{ detail.platformAmount?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="作者收益">¥{{ detail.authorAmount?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结算时间">{{ detail.settlementTime || '—' }}</el-descriptions-item>
          </el-descriptions>

          <div style="margin-top: 24px;">
            <h3 style="margin-bottom: 12px;">订单明细</h3>
            <el-table :data="detail.orders || []" border>
            <el-table-column prop="orderNo" label="订单号" width="160" />
            <el-table-column prop="workName" label="作品" min-width="150" show-overflow-tooltip />
            <el-table-column label="订单金额" width="120" align="right">
              <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="作者收益" width="120" align="right">
              <template #default="{ row }">¥{{ row.authorIncome?.toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="orderTime" label="交易时间" width="170" />
          </el-table>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="calculateVisible" title="批量核算" width="500px">
      <el-alert type="info" :closable="false" style="margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-weight: bold;">功能说明：</p>
        <p style="margin: 0 0 4px 0;">1. 系统将扫描所选周期内所有"已完成"但"未结算"的订单</p>
        <p style="margin: 0 0 4px 0;">2. 按作者分组统计：订单数量、总金额、平台分成（20%）、作者收益（80%）</p>
        <p style="margin: 0;">3. 为每位作者自动生成一条结算记录，状态为"待结算"</p>
      </el-alert>
      <el-form :model="calculateForm" label-width="100px">
        <el-form-item label="结算周期">
          <el-date-picker
            v-model="calculateForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="calculateVisible = false">取消</el-button>
        <el-button type="primary" :loading="calculateLoading" @click="submitCalculate">开始核算</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="abnormalVisible" title="处理异常" width="500px">
      <el-form label-width="100px">
        <el-form-item label="异常原因">
          <el-input v-model="abnormalReason" type="textarea" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="handleRemark" type="textarea" :rows="3" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="abnormalVisible = false">取消</el-button>
        <el-button type="primary" :loading="abnormalLoading" @click="submitHandle">确认处理</el-button>
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
import { getSettlementList, getSettlementDetail, batchCalculateSettlement, handleSettlementAbnormal, confirmSettlement } from '@/api/copyright'

const query = reactive({
  pageNo: 1,
  pageSize: 10,
  status: '',
  dateRange: null,
  keyword: ''
})

const rows = ref([])
const total = ref(0)
const loading = ref(false)
const loadFailed = ref(false)

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

const calculateVisible = ref(false)
const calculateLoading = ref(false)
const calculateForm = reactive({
  dateRange: null
})

const abnormalVisible = ref(false)
const abnormalLoading = ref(false)
const abnormalReason = ref('')
const handleRemark = ref('')
const currentSettlementId = ref(null)

const statusType = (status) => {
  const map = { pending: 'warning', settled: 'success', failed: 'danger', abnormal: 'danger' }
  return map[status] || 'info'
}

const statusLabel = (status) => {
  const map = { pending: '待结算', settled: '已结算', failed: '结算失败', abnormal: '异常' }
  return map[status] || status
}

const handleQuery = () => {
  query.pageNo = 1
  loadRows()
}

const handleReset = () => {
  query.status = ''
  query.dateRange = null
  query.keyword = ''
  query.pageNo = 1
  loadRows()
}

async function loadRows() {
  loading.value = true
  loadFailed.value = false
  try {
    const params = { ...query }
    if (query.dateRange && query.dateRange.length === 2) {
      params.startDate = query.dateRange[0]
      params.endDate = query.dateRange[1]
    }
    delete params.dateRange
    const result = await getSettlementList(params)
    if (result && Array.isArray(result.rows)) {
      rows.value = result.rows
      total.value = Number(result.total) || 0
    } else {
      rows.value = []
      total.value = 0
    }
  } catch (error) {
    loadFailed.value = true
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(row) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const result = await getSettlementDetail(row.settlementId)
    if (!result) {
      throw new Error('返回数据为空')
    }
    detail.value = result
  } catch (error) {
    ElMessage.error(error?.message || '加载详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

function openCalculate() {
  calculateVisible.value = true
}

async function submitCalculate() {
  if (!calculateForm.dateRange || calculateForm.dateRange.length !== 2) {
    ElMessage.warning('请选择结算周期')
    return
  }
  calculateLoading.value = true
  try {
    const data = {
      periodStart: calculateForm.dateRange[0],
      periodEnd: calculateForm.dateRange[1]
    }
    await batchCalculateSettlement(data)
    ElMessage.success('核算任务已提交，系统正在生成结算单')
    calculateVisible.value = false
    calculateForm.dateRange = null
    loadRows()
  } catch (error) {
    ElMessage.error(error?.message || '核算失败')
  } finally {
    calculateLoading.value = false
  }
}

function handleAbnormal(row) {
  currentSettlementId.value = row.settlementId
  abnormalReason.value = row.abnormalReason || '待处理异常'
  handleRemark.value = ''
  abnormalVisible.value = true
}

async function openMarkAbnormal(row) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入异常原因', '标记异常', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如：订单存在退款申请，需要核实后重新计算',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '异常原因不能为空'
        }
        return true
      }
    })
    
    await handleSettlementAbnormal(row.settlementId, { 
      remark: reason,
      markAsAbnormal: true 
    })
    ElMessage.success('已标记为异常')
    loadRows()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

async function handleSettle(row) {
  try {
    await ElMessageBox.confirm(`确认对结算单 ${row.settlementNo} 进行结算打款？`, '确认结算', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await confirmSettlement(row.settlementId)
    ElMessage.success('结算确认成功')
    loadRows()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败')
    }
  }
}

async function submitHandle() {
  if (!handleRemark.value.trim()) {
    ElMessage.warning('请输入处理说明')
    return
  }
  abnormalLoading.value = true
  try {
    await handleSettlementAbnormal(currentSettlementId.value, { remark: handleRemark.value })
    ElMessage.success('处理成功')
    abnormalVisible.value = false
    loadRows()
  } catch (error) {
    ElMessage.error(error?.message || '处理失败')
  } finally {
    abnormalLoading.value = false
  }
}

onMounted(loadRows)
</script>

<style scoped>
.drawer-content { padding: 0 20px; }
</style>
