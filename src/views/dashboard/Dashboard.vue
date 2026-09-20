<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
              <span class="trend-icon">{{ stat.trend > 0 ? '↑' : '↓' }}</span>
              <span class="trend-value">{{ Math.abs(stat.trend) }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口卡片 -->
    <el-row :gutter="20" class="quick-access-row">
      <el-col :span="6" v-for="(item, index) in quickAccessData" :key="index">
        <el-card class="quick-card" shadow="hover" @click="handleQuickAccess(item.route)">
          <div class="quick-content">
            <el-icon :size="40" class="quick-icon">
              <component :is="item.icon" />
            </el-icon>
            <div class="quick-title">{{ item.title }}</div>
            <div class="quick-count">{{ item.count }}件{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 交易趋势 -->
      <el-col :span="14">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">交易趋势</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="trend-chart">
            <div class="trend-axis">
              <span v-for="item in trendData" :key="item.label">{{ item.label }}</span>
            </div>
            <div class="trend-bars">
              <div v-for="item in trendData" :key="item.label" class="trend-column">
                <div class="trend-bar" :style="{ height: `${item.value}%` }">
                  <span>{{ item.amount }}</span>
                </div>
              </div>
            </div>
            <div class="chart-caption">
              <el-icon><TrendCharts /></el-icon>
              <span>交易额趋势 · {{ trendPeriod === 'week' ? '近 7 日' : trendPeriod === 'month' ? '近 30 日' : '年度' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 作品状态分布 -->
      <el-col :span="10">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">作品状态分布</span>
          </template>
          <div class="status-chart">
            <div class="status-item" v-for="item in statusData" :key="item.name">
              <div class="status-bar">
                <div class="status-label">{{ item.name }}</div>
                <div class="status-progress">
                  <div 
                    class="status-fill" 
                    :style="{ width: item.percent + '%', backgroundColor: item.color }"
                  ></div>
                </div>
                <div class="status-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近审核列表 -->
    <el-row class="recent-row">
      <el-col :span="24">
        <el-card class="recent-card">
          <template #header>
            <div class="recent-header">
              <span class="chart-title">最近审核</span>
              <el-link type="primary" :underline="false" @click="handleViewAll">查看全部</el-link>
            </div>
          </template>
          <el-table :data="recentReviews" style="width: 100%">
            <el-table-column prop="name" label="作品名称" min-width="200" />
            <el-table-column prop="author" label="作者" width="120" />
            <el-table-column prop="submitTime" label="提交时间" width="180" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === '待审核'" 
                  type="primary" 
                  size="small" 
                  link
                  @click="handleReview(row)"
                >
                  审核
                </el-button>
                <el-button type="primary" size="small" link @click="handleDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Document, 
  DocumentCopy, 
  User, 
  WarningFilled,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 统计数据
const statsData = ref([
  { title: '待审核作品', value: '1,284', trend: 12.5 },
  { title: '已授权作品', value: '3,567', trend: 8.2 },
  { title: '本月交易额', value: '¥892万', trend: 15.3 },
  { title: '活跃用户数', value: '25,891', trend: -2.1 }
])

// 快捷入口数据
const quickAccessData = ref([
  { title: '作品审核', count: 12, label: '待审核', icon: Document, route: '/copyright/ai-review' },
  { title: '订单管理', count: 5, label: '待处理', icon: DocumentCopy, route: '/trade/orders' },
  { title: '用户管理', count: 3, label: '待审核', icon: User, route: '/user' },
  { title: '风控管理', count: 2, label: '待处理', icon: WarningFilled, route: '/risk' }
])

// 图表周期
const trendPeriod = ref('week')

const trendData = ref([
  { label: '09/14', value: 42, amount: '42万' },
  { label: '09/15', value: 58, amount: '58万' },
  { label: '09/16', value: 48, amount: '48万' },
  { label: '09/17', value: 72, amount: '72万' },
  { label: '09/18', value: 64, amount: '64万' },
  { label: '09/19', value: 84, amount: '84万' },
  { label: '09/20', value: 76, amount: '76万' }
])

// 作品状态分布数据
const statusData = ref([
  { name: '待审核', value: 1284, percent: 27, color: '#E6A23C' },
  { name: '审核中', value: 456, percent: 10, color: '#303133' },
  { name: '已通过', value: 2890, percent: 60, color: '#67C23A' },
  { name: '已驳回', value: 231, percent: 5, color: '#F56C6C' }
])

// 最近审核数据
const recentReviews = ref([
  { name: '《都市迷途》', author: '张编剧', submitTime: '2024-03-14 10:23', status: '待审核' },
  { name: '《山河故人》', author: '李创作', submitTime: '2024-03-14 09:15', status: 'AI审核中' },
  { name: '《末日黎明》', author: '王大锤', submitTime: '2024-03-13 16:42', status: '已通过' }
])

// 处理快捷入口点击
const handleQuickAccess = (route) => {
  router.push(route)
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待审核': 'warning',
    'AI审核中': '',
    '已通过': 'success',
    '已驳回': 'danger'
  }
  return typeMap[status] || ''
}

// 处理审核
const handleReview = (row) => {
  ElMessage.success(`开始审核《${row.name}》`)
  router.push('/copyright/ai-review')
}

// 处理详情
const handleDetail = (row) => {
  ElMessage.info(`查看《${row.name}》详情`)
}

// 查看全部
const handleViewAll = () => {
  router.push('/copyright/ai-review')
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f7f8fa;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-card :deep(.el-card__body) {
  padding: 24px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 400;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #1f2329;
  letter-spacing: -0.5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.trend-up {
  color: #52c41a;
  background-color: transparent;
}

.trend-down {
  color: #ff4d4f;
  background-color: transparent;
}

.trend-icon {
  font-size: 12px;
  font-weight: bold;
}

/* 快捷入口 */
.quick-access-row {
  margin-bottom: 20px;
}

.quick-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #d9d9d9;
}

.quick-card :deep(.el-card__body) {
  padding: 32px 20px;
}

.quick-content {
  text-align: center;
}

.quick-icon {
  color: #1f2329;
  margin-bottom: 14px;
}

.quick-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 500;
  margin-bottom: 8px;
}

.quick-count {
  font-size: 12px;
  color: #8c8c8c;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.chart-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.chart-card :deep(.el-card__body) {
  padding: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

/* 交易趋势图 */
.trend-chart {
  height: 320px;
  padding: 20px 12px 8px;
  background: #fafafa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.trend-bars {
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: space-around;
  gap: 14px;
  padding: 0 10px 12px;
  border-bottom: 1px solid #e4e7ed;
}

.trend-column {
  display: flex;
  flex: 1;
  height: 100%;
  align-items: flex-end;
  justify-content: center;
}

.trend-bar {
  position: relative;
  width: min(44px, 70%);
  min-height: 16px;
  border-radius: 3px 3px 0 0;
  background: #303133;
  transition: height 0.25s ease;
}

.trend-bar span {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  color: #606266;
  font-size: 11px;
  white-space: nowrap;
}

.trend-axis {
  display: flex;
  justify-content: space-around;
  padding: 10px 8px 0;
  color: #909399;
  font-size: 11px;
}

.chart-caption {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 14px;
  color: #8c8c8c;
  font-size: 12px;
}

/* 作品状态图表 */
.status-chart {
  padding: 20px 0;
}

.status-item {
  margin-bottom: 24px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-label {
  width: 60px;
  font-size: 12px;
  color: #595959;
  text-align: right;
  font-weight: 400;
}

.status-progress {
  flex: 1;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  transition: width 0.3s;
  border-radius: 2px;
}

.status-value {
  width: 70px;
  font-size: 13px;
  color: #1f2329;
  font-weight: 600;
  text-align: right;
}

/* 最近审核 */
.recent-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.recent-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.recent-card :deep(.el-card__body) {
  padding: 0;
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格样式优化 */
.recent-card :deep(.el-table) {
  font-size: 13px;
  color: #262626;
}

.recent-card :deep(.el-table th) {
  background-color: #fafafa;
  color: #595959;
  font-weight: 500;
  font-size: 12px;
}

.recent-card :deep(.el-table td) {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.recent-card :deep(.el-table tr:hover > td) {
  background-color: #fafafa !important;
}

.recent-card :deep(.el-button) {
  padding: 0;
  height: auto;
  font-size: 12px;
}

.recent-card :deep(.el-button.is-link) {
  color: #1f2329;
}

.recent-card :deep(.el-button.is-link:hover) {
  color: #000000;
}

.recent-card :deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
}

.recent-card :deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

.recent-card :deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

.recent-card :deep(.el-tag:not(.el-tag--warning):not(.el-tag--success):not(.el-tag--danger)) {
  background-color: #fafafa;
  color: #595959;
}

/* Radio 按钮组样式 */
.chart-card :deep(.el-radio-button__inner) {
  background: transparent;
  border-color: #d9d9d9;
  color: #595959;
  font-size: 12px;
  padding: 6px 12px;
}

.chart-card :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
  box-shadow: none;
}

.chart-card :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}

.chart-card :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}

/* 链接样式 */
.recent-card :deep(.el-link) {
  font-size: 12px;
  color: #595959;
}

.recent-card :deep(.el-link:hover) {
  color: #1f2329;
}
</style>
