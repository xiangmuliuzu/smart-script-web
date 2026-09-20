<template>
  <div class="copyright-center-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">版权中心对接管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="default" class="black-button">批量提交确权</el-button>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-label">待提交确权</div>
        <div class="stat-value">342</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-label">确权审核中</div>
        <div class="stat-value">128</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-label">已确权作品</div>
        <div class="stat-value">2,890</div>
      </el-card>
    </div>

    <!-- 状态同步回传模块 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">状态同步回传</span>
          <el-button type="primary" size="default" class="black-button">批量同步</el-button>
        </div>
      </template>
      <el-table
        :data="syncList"
        style="width: 100%"
        @selection-change="handleSyncSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="作品编号" width="120" />
        <el-table-column prop="name" label="作品名称" min-width="160" />
        <el-table-column label="版权中心状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getCenterStatusType(row.centerStatus)" size="small">
              {{ getCenterStatusText(row.centerStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="本地状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getLocalStatusType(row.localStatus)" size="small">
              {{ getLocalStatusText(row.localStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="syncTime" label="同步时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleDetail(row)">详情</el-button>
              <el-button size="small" @click="handleManualSync(row)">手动同步</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 电子证书归档管理模块 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">电子证书归档管理</span>
          <el-button size="default">批量下载</el-button>
        </div>
      </template>
      <el-table
        :data="certificateList"
        style="width: 100%"
        @selection-change="handleCertSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="certNo" label="证书编号" width="160" />
        <el-table-column prop="workName" label="作品名称" min-width="160" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="confirmTime" label="确权时间" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDownload(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 选中的同步项
const selectedSyncItems = ref([])

// 选中的证书项
const selectedCertItems = ref([])

// 状态同步回传数据
const syncList = ref([
  {
    id: '#C001',
    name: '《都市迷途》',
    centerStatus: 'confirmed',
    localStatus: 'synced',
    syncTime: '2026-09-07 10:00'
  },
  {
    id: '#C002',
    name: '《山河故人》',
    centerStatus: 'reviewing',
    localStatus: 'pending',
    syncTime: '-'
  },
  {
    id: '#C003',
    name: '《末日黎明》',
    centerStatus: 'waiting',
    localStatus: 'pending',
    syncTime: '-'
  }
])

// 电子证书归档数据
const certificateList = ref([
  {
    certNo: 'CERT-2026-001',
    workName: '《都市迷途》',
    author: '张编剧',
    confirmTime: '2026-09-05',
    status: '已归档'
  },
  {
    certNo: 'CERT-2026-002',
    workName: '《末日黎明》',
    author: '王大锤',
    confirmTime: '2026-09-04',
    status: '已归档'
  }
])

// 获取版权中心状态类型
const getCenterStatusType = (status) => {
  const typeMap = {
    confirmed: 'success',
    reviewing: 'warning',
    waiting: 'info'
  }
  return typeMap[status] || ''
}

// 获取版权中心状态文本
const getCenterStatusText = (status) => {
  const textMap = {
    confirmed: '已确权',
    reviewing: '审核中',
    waiting: '待提交'
  }
  return textMap[status] || status
}

// 获取本地状态类型
const getLocalStatusType = (status) => {
  const typeMap = {
    synced: 'success',
    pending: 'warning'
  }
  return typeMap[status] || ''
}

// 获取本地状态文本
const getLocalStatusText = (status) => {
  const textMap = {
    synced: '已同步',
    pending: '待同步'
  }
  return textMap[status] || status
}

// 处理同步选择变化
const handleSyncSelectionChange = (selection) => {
  selectedSyncItems.value = selection
}

// 处理证书选择变化
const handleCertSelectionChange = (selection) => {
  selectedCertItems.value = selection
}

// 处理详情
const handleDetail = (row) => {
  ElMessage.info(`查看作品详情：${row.name}`)
}

// 处理手动同步
const handleManualSync = (row) => {
  ElMessage.success(`正在同步：${row.name}`)
}

// 处理下载
const handleDownload = (row) => {
  ElMessage.success(`正在下载证书：${row.certNo}`)
}
</script>

<style scoped>
.copyright-center-container {
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
}

/* 统计卡片区 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  padding: 24px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f2329;
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

/* 黑色主按钮 */
.black-button {
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
}

.black-button:hover {
  background-color: #000000;
  border-color: #000000;
}

.black-button:active {
  background-color: #000000;
  border-color: #000000;
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
}

:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #8c8c8c;
}
</style>
