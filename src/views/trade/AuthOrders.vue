<template>
  <div class="auth-orders-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">授权订单管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="订单编号/作品/买家"
          style="width: 240px"
          clearable
        />
        <el-button size="default">导出订单</el-button>
      </div>
    </div>

    <!-- 订单状态标签栏 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" class="status-tabs">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="已付款" name="paid" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
    </el-card>

    <!-- 授权订单列表 -->
    <el-card class="table-card">
      <el-table :data="ordersList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="120" />
        <el-table-column prop="work" label="作品" min-width="130" />
        <el-table-column prop="buyer" label="买家" width="120" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span class="price-text">{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)" size="small">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 合同生成与归档 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">合同生成与归档</span>
          <el-button size="default">批量生成</el-button>
        </div>
      </template>
      <el-table :data="contractsList" style="width: 100%">
        <el-table-column prop="contractNo" label="合同编号" width="140" />
        <el-table-column prop="relatedOrder" label="关联订单" width="140" />
        <el-table-column prop="contractType" label="合同类型" min-width="160" />
        <el-table-column prop="generateTime" label="生成时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getContractStatusType(row.status)" size="small">
              {{ getContractStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handlePreview(row)">预览</el-button>
              <el-button size="small" @click="handleDownload(row)">下载</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分成核算与结算 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">分成核算与结算</span>
          <el-button size="default">导出报表</el-button>
        </div>
      </template>
      <el-table :data="settlementList" style="width: 100%">
        <el-table-column prop="period" label="结算周期" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="100" />
        <el-table-column label="总交易额" width="120">
          <template #default="{ row }">
            <span class="price-text">{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platformShare" label="平台分成" min-width="160" />
        <el-table-column prop="creatorShare" label="创作者分成" min-width="180" />
        <el-table-column label="结算状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getSettlementStatusType(row.status)" size="small">
              {{ getSettlementStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleSettlementDetail(row)">明细</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的标签
const activeTab = ref('all')

// 授权订单列表数据
const ordersList = ref([
  {
    orderNo: '#ORD-001',
    work: '《都市迷途》',
    buyer: '影视公司A',
    type: '独家授权',
    amount: '¥50,000',
    orderTime: '2026-09-07 10:00',
    status: 'pending'
  },
  {
    orderNo: '#ORD-002',
    work: '《暗夜追踪》',
    buyer: '制作公司B',
    type: '非独家',
    amount: '¥25,000',
    orderTime: '2026-09-06 15:30',
    status: 'paid'
  },
  {
    orderNo: '#ORD-003',
    work: '《长安旧事》',
    buyer: '平台C',
    type: '独家授权',
    amount: '¥80,000',
    orderTime: '2026-09-05 09:20',
    status: 'completed'
  },
  {
    orderNo: '#ORD-004',
    work: '《孤岛来信》',
    buyer: '影视公司A',
    type: '非独家',
    amount: '¥18,000',
    orderTime: '2026-09-04 14:10',
    status: 'pending'
  }
])

// 合同列表数据
const contractsList = ref([
  {
    contractNo: '#CON-001',
    relatedOrder: '#ORD-001',
    contractType: '独家授权合同',
    generateTime: '2026-09-07 10:05',
    status: 'pending_sign'
  },
  {
    contractNo: '#CON-002',
    relatedOrder: '#ORD-002',
    contractType: '非独家授权合同',
    generateTime: '2026-09-06 15:35',
    status: 'archived'
  }
])

// 结算列表数据
const settlementList = ref([
  {
    period: '2026年8月',
    orderCount: '45单',
    totalAmount: '¥450,000',
    platformShare: '平台¥45,000(10%)',
    creatorShare: '创作者¥405,000(90%)',
    status: 'settled'
  },
  {
    period: '2026年9月',
    orderCount: '12单',
    totalAmount: '¥125,000',
    platformShare: '平台¥12,500(10%)',
    creatorShare: '创作者¥112,500(90%)',
    status: 'pending_settle'
  }
])

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'success',
    completed: 'info'
  }
  return typeMap[status] || ''
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const textMap = {
    pending: '待付款',
    paid: '已付款',
    completed: '已完成'
  }
  return textMap[status] || status
}

// 获取合同状态类型
const getContractStatusType = (status) => {
  const typeMap = {
    pending_sign: 'warning',
    archived: 'success'
  }
  return typeMap[status] || ''
}

// 获取合同状态文本
const getContractStatusText = (status) => {
  const textMap = {
    pending_sign: '待签署',
    archived: '已归档'
  }
  return textMap[status] || status
}

// 获取结算状态类型
const getSettlementStatusType = (status) => {
  const typeMap = {
    settled: 'success',
    pending_settle: 'warning'
  }
  return typeMap[status] || ''
}

// 获取结算状态文本
const getSettlementStatusText = (status) => {
  const textMap = {
    settled: '已结算',
    pending_settle: '待结算'
  }
  return textMap[status] || status
}

// 处理详情
const handleDetail = (row) => {
  ElMessage.info(`查看订单详情：${row.orderNo}`)
}

// 处理预览
const handlePreview = (row) => {
  ElMessage.info(`预览合同：${row.contractNo}`)
}

// 处理下载
const handleDownload = (row) => {
  ElMessage.success(`正在下载合同：${row.contractNo}`)
}

// 处理结算明细
const handleSettlementDetail = (row) => {
  ElMessage.info(`查看${row.period}结算明细`)
}
</script>

<style scoped>
.auth-orders-container {
  padding: 20px;
  background-color: #f7f8fa;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 标签页卡片 */
.tabs-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.tabs-card :deep(.el-card__body) {
  padding: 0;
}

.status-tabs {
  padding: 0 20px;
}

.status-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.status-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.status-tabs :deep(.el-tabs__item) {
  font-size: 13px;
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.table-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

/* 操作按钮容器 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 价格文本 */
.price-text {
  color: #1f2329;
  font-weight: 600;
  font-size: 13px;
}

/* 表格样式统一 */
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

:deep(.el-table tr:hover > td) {
  background-color: #fafafa !important;
}

/* 按钮样式统一 */
:deep(.el-button) {
  font-size: 12px;
  border-radius: 4px;
  padding: 5px 12px;
}

:deep(.el-button--default) {
  color: #595959;
  border-color: #d9d9d9;
  background: #ffffff;
}

:deep(.el-button--default:hover) {
  color: #1f2329;
  border-color: #1f2329;
}

/* 标签样式 */
:deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #8c8c8c;
}

/* 表单控件样式 */
:deep(.el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-input__inner) {
  font-size: 12px;
  color: #262626;
}

:deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}
</style>
