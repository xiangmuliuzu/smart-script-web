<template>
  <PageContainer>
    <PageHeader title="报价管理" description="甲方 PC 端：卖方报价为「待买方确认」，本端可议价/接受/拒绝，接受即直接生成授权订单；买方议价为「待卖方确认」，需卖方在客户端处理">
      <template #actions>
        <el-button @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部报价状态" style="width: 150px" clearable>
          <el-option
            v-for="opt in quoteStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.quoterRole" placeholder="全部报价方" style="width: 140px" clearable>
          <el-option
            v-for="opt in quoterRoleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="报价编号/关联询盘/作品"
          style="width: 220px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="quoteNo" label="报价编号" width="120" />
      <el-table-column prop="inquiryNo" label="关联询盘" width="120" />
      <el-table-column prop="workTitle" label="作品" min-width="130" />
      <el-table-column label="报价方" width="110">
        <template #default="{ row }">
          <StatusTag type="quoterRole" :status="row.quoterRole" />
        </template>
      </el-table-column>
      <el-table-column prop="quoterName" label="报价人" width="110" />
      <el-table-column label="报价金额" width="120">
        <template #default="{ row }">
          <span class="price-text">{{ row.priceText }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="validDays" label="有效天数" width="90" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <StatusTag type="quote" :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="报价截止" width="150" />
      <!-- 2026-09-29 操作列改为每行两个按钮共两行：保留四个常用动作，宽度从 300 降到 136 -->
      <el-table-column label="操作" width="136" fixed="right">
        <template #default="{ row }">
          <div class="op-actions">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="canCounter(row)" size="small" type="warning" @click="handleCounterOffer(row)">议价</el-button>
            <el-button v-if="canConfirm(row)" size="small" type="success" @click="handleAccept(row)">接受</el-button>
            <el-button v-if="canConfirm(row)" size="small" type="danger" @click="handleReject(row)">拒绝</el-button>
          </div>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog v-model="detailVisible" title="报价详情" width="620px">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="报价编号">{{ detail.quoteNo }}</el-descriptions-item>
        <el-descriptions-item label="报价状态">
          <StatusTag type="quote" :status="detail.status" />
        </el-descriptions-item>
        <el-descriptions-item label="关联询盘">{{ detail.inquiryNo }}</el-descriptions-item>
        <el-descriptions-item label="作品名称">{{ detail.workTitle }}</el-descriptions-item>
        <el-descriptions-item label="报价方">
          <StatusTag type="quoterRole" :status="detail.quoterRole" />
        </el-descriptions-item>
        <el-descriptions-item label="报价人">{{ detail.quoterName }}</el-descriptions-item>
        <el-descriptions-item label="报价金额">
          <span class="price-text">{{ detail.priceText }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="授权类型">{{ detail.licenseTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="有效天数">{{ detail.validDays }} 天</el-descriptions-item>
        <el-descriptions-item label="报价截止">{{ detail.expireAt }}</el-descriptions-item>
        <el-descriptions-item label="报价时间" :span="2">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="报价说明" :span="2">{{ detail.description || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-alert
          v-if="detail.status === 'pending_seller'"
          class="negotiate-tip"
          type="info"
          :closable="false"
          show-icon
          title="此条为买方议价，状态「待卖方确认」，本端仅可修改议价金额，接受/拒绝由卖方在客户端操作"
        />
        <el-alert
          v-else-if="canConfirm(detail)"
          class="negotiate-tip"
          type="warning"
          :closable="false"
          show-icon
          title="卖方报价由卖方维护，本端（买方）不可修改金额；可接受、拒绝或发起买方议价"
        />
        <el-button v-if="canModify(detail)" @click="handleModify(detail)">修改议价</el-button>
        <el-button v-if="canCounter(detail)" type="warning" @click="handleCounterOffer(detail)">买方议价</el-button>
        <el-button v-if="canConfirm(detail)" type="success" @click="handleAccept(detail)">接受报价</el-button>
        <el-button v-if="canConfirm(detail)" type="danger" @click="handleReject(detail)">拒绝报价</el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions } from '@/constants/tradeEnum'
import { getQuoteList, acceptQuote, rejectQuote, modifyQuote, counterOffer } from '@/api/trade'

defineOptions({ name: 'Quote' })

// 报价状态已定稿（见 constants/tradeEnum.js QUOTE_STATUS）：
// pending=待买方确认（卖方报价）、pending_seller=待卖方确认（买方议价）
const quoteStatusOptions = enumOptions('quote')
const quoterRoleOptions = enumOptions('quoterRole')

/** 本端为甲方 PC，固定买方视角（客户端为卖方视角） */
const OPERATOR_ROLE = 'buyer'

/** 待确认状态（待买方确认 / 待卖方确认），终态不可再操作 */
function isPendingLike(status) {
  return status === 'pending' || status === 'pending_seller'
}

/** 接受/拒绝：仅针对「待买方确认的卖方报价」，买方议价需卖方在客户端确认 */
function canConfirm(row) {
  return !!row && row.status === 'pending' && row.quoterRole === 'seller'
}

/** 修改：报价只能由报价方本人改——本端（买方）仅可改自己发起的议价 */
function canModify(row) {
  return !!row && isPendingLike(row.status) && row.quoterRole === OPERATOR_ROLE
}

/** 买方议价：针对待确认的卖方报价发起，不对自己的议价再议价 */
function canCounter(row) {
  return canConfirm(row)
}

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, status: '', quoterRole: '', keyword: '' })

const detailVisible = ref(false)
const detail = ref({})

async function loadList() {
  loading.value = true
  try {
    const res = await getQuoteList(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载报价记录失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, status: '', quoterRole: '', keyword: '' }
  loadList()
}

function handleDetail(row) {
  detail.value = { ...row }
  detailVisible.value = true
}

async function handleAccept(row) {
  try {
    await ElMessageBox.confirm(
      `确认接受报价 ${row.priceText || row.price || ''}？接受后将直接生成授权订单，对应询盘转为已达成`,
      '接受报价',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await acceptQuote(row.quoteId)
    ElMessage.success(`已接受报价，询盘已转为已达成，订单号：${res?.data?.orderNo || '已生成'}`)
    detailVisible.value = false
    loadList()
  } catch { /* 用户取消 */ }
}

async function handleReject(row) {
  try {
    await ElMessageBox.confirm('确认拒绝该报价吗？', '拒绝报价', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    await rejectQuote(row.quoteId)
    ElMessage.success('已拒绝报价')
    detailVisible.value = false
    loadList()
  } catch { /* 用户取消 */ }
}

function handleExport() {
  ElMessage.info('导出报价记录')
}

/** 修改议价（仅本方发起且待确认）：弹框输入新金额 */
async function handleModify(row) {
  if (!row || !row.quoteId) return
  if (!canModify(row)) {
    ElMessage.warning('报价只能由报价方本人修改：卖方报价请由卖方在客户端修改')
    return
  }
  try {
    const { value } = await ElMessageBox.prompt('请输入新的议价金额（元）', `修改议价 ${row.quoteNo}`, {
      confirmButtonText: '提交', cancelButtonText: '取消',
      inputValue: row.price != null ? String(row.price) : '',
      inputValidator: (v) => (v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0 ? true : '请输入合法金额')
    })
    await modifyQuote(row.quoteId, { price: Number(value) })
    ElMessage.success('议价金额已修改')
    detailVisible.value = false
    loadList()
  } catch { /* 用户取消 */ }
}

/** 买方议价（仅针对待买方确认的卖方报价）：新增一行 buyer 报价（状态待卖方确认），保留历史 */
async function handleCounterOffer(row) {
  if (!row || !row.inquiryId) {
    ElMessage.warning('缺少关联询盘，无法议价')
    return
  }
  if (!canCounter(row)) {
    ElMessage.warning('仅可对待买方确认的卖方报价发起议价')
    return
  }
  try {
    const { value } = await ElMessageBox.prompt('请输入买方议价金额（元），提交后状态为待卖方确认', `买方议价（询盘 ${row.inquiryNo || ''}）`, {
      confirmButtonText: '提交议价', cancelButtonText: '取消',
      inputValidator: (v) => (v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0 ? true : '请输入合法金额')
    })
    await counterOffer({ inquiryId: row.inquiryId, price: Number(value) })
    ElMessage.success('议价已提交')
    detailVisible.value = false
    loadList()
  } catch { /* 用户取消 */ }
}

onMounted(loadList)
</script>

<style scoped>
.price-text {
  color: #1f2329;
  font-weight: 600;
}
.op-actions {
  display: flex;
  /* 仅本页：四个按钮折成两行（每行两个），避开 300px 的超宽操作列 */
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
/* 折行后统一用 gap 控制间距，清掉 Element Plus 默认的 12px 相邻外边距 */
.op-actions .el-button + .el-button {
  margin-left: 0;
}
.negotiate-tip {
  margin-bottom: 12px;
}
</style>
