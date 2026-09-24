<template>
  <div class="short-drama-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">外部漫剧发行</h2>
      <div class="header-actions">
        <el-button type="primary" size="default" class="black-button" @click="handleSync">
          同步接口内容
        </el-button>
      </div>
    </div>

    <el-alert
      title="当前版本仅接入外部视频接口，不提供漫剧文件上传功能。"
      type="info"
      :closable="false"
      show-icon
      class="source-alert"
    />

    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-label">接口内容</div>
        <div class="stat-value">156</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-label">已接入平台</div>
        <div class="stat-value">8</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-label">本月同步成功率</div>
        <div class="stat-value">99.2%</div>
      </el-card>
    </div>

    <!-- 外部视频接口管理 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">外部视频接口管理</span>
          <el-button size="default" @click="handleAddChannel">新增接口</el-button>
        </div>
      </template>
      <el-table :data="channelsList" style="width: 100%">
        <el-table-column prop="channel" label="平台接口" min-width="140" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column prop="onlineCount" label="可展示内容" width="120" />
        <el-table-column prop="totalViews" label="最近同步" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelStatusType(row.status)" size="small">
              {{ getChannelStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleConfig(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 发行渠道列表数据
const channelsList = ref([
  {
    channel: '抖音短剧',
    type: '短视频平台',
    onlineCount: '45部',
    totalViews: '1.2亿',
    status: 'normal'
  },
  {
    channel: '快手短剧',
    type: '短视频平台',
    onlineCount: '38部',
    totalViews: '8,500万',
    status: 'normal'
  },
  {
    channel: '微信视频号',
    type: '社交平台',
    onlineCount: '22部',
    totalViews: '3,200万',
    status: 'pending'
  }
])

// 获取渠道状态类型
const getChannelStatusType = (status) => {
  const typeMap = {
    normal: 'success',
    pending: 'warning'
  }
  return typeMap[status] || ''
}

// 获取渠道状态文本
const getChannelStatusText = (status) => {
  const textMap = {
    normal: '正常',
    pending: '待配置'
  }
  return textMap[status] || status
}

// 处理配置
const handleConfig = (row) => {
  ElMessage.info(`配置接口：${row.channel}`)
}

const handleSync = () => {
  ElMessage.success('已发起外部接口同步，完成后会更新可展示内容')
}

const handleAddChannel = () => {
  ElMessage.info('新增接口功能等待后端接口配置完成')
}
</script>

<style scoped>
.short-drama-container {
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

.source-alert {
  margin-bottom: 20px;
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
  border-radius: 10px;
}

:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}
</style>
