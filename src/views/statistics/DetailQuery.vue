<template>
  <div class="detail-query-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">明细数据查询</h2>
      <el-button type="primary" class="black-button">数据导出</el-button>
    </div>

    <!-- 标签页区域 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 标签页一：内容数据 -->
        <el-tab-pane label="内容数据" name="content">
          <!-- 筛选与时间栏 -->
          <div class="filter-row">
            <div class="date-filters">
              <el-date-picker
                v-model="filterForm.startDate"
                type="date"
                placeholder="开始日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-date-picker
                v-model="filterForm.endDate"
                type="date"
                placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-button type="primary" class="black-button" @click="handleQuery">查询</el-button>
            </div>
            <div class="time-tabs">
              <span 
                v-for="tab in timeTabs" 
                :key="tab.value"
                :class="['time-tab', { active: activeTimeTab === tab.value }]"
                @click="activeTimeTab = tab.value"
              >
                {{ tab.label }}
              </span>
            </div>
          </div>

          <!-- 内容数据表格 -->
          <el-table :data="contentData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="140" />
            <el-table-column prop="works" label="作品数" width="120" />
            <el-table-column prop="visits" label="访问量" width="140" />
            <el-table-column prop="amount" label="交易额" width="140" />
            <el-table-column prop="newUsers" label="新增用户" width="140" />
            <el-table-column prop="conversion" label="转化率" width="120" />
            <el-table-column prop="adRevenue" label="广告收入" width="140" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-row">
            <div class="pagination-info">共7条，第1/2页</div>
            <div class="pagination-buttons">
              <el-button size="default">上一页</el-button>
              <el-button size="default">下一页</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 标签页二：用户数据 -->
        <el-tab-pane label="用户数据" name="user">
          <!-- 筛选与时间栏 -->
          <div class="filter-row">
            <div class="date-filters">
              <el-date-picker
                v-model="filterForm.startDate"
                type="date"
                placeholder="开始日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-date-picker
                v-model="filterForm.endDate"
                type="date"
                placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-button type="primary" class="black-button" @click="handleQuery">查询</el-button>
            </div>
            <div class="time-tabs">
              <span 
                v-for="tab in timeTabs" 
                :key="tab.value"
                :class="['time-tab', { active: activeTimeTab === tab.value }]"
                @click="activeTimeTab = tab.value"
              >
                {{ tab.label }}
              </span>
            </div>
          </div>

          <!-- 用户数据表格 -->
          <el-table :data="userData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="140" />
            <el-table-column prop="newUsers" label="新增用户" width="140" />
            <el-table-column prop="activeUsers" label="活跃用户" width="140" />
            <el-table-column prop="paidUsers" label="付费用户" width="140" />
            <el-table-column prop="payRate" label="付费率" width="120" />
            <el-table-column prop="avgDuration" label="平均停留时长" width="160" />
            <el-table-column prop="arpu" label="ARPU" width="120" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-row">
            <div class="pagination-info">共7条，第1/2页</div>
            <div class="pagination-buttons">
              <el-button size="default">上一页</el-button>
              <el-button size="default">下一页</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 标签页三：交易数据 -->
        <el-tab-pane label="交易数据" name="trade">
          <!-- 筛选与时间栏 -->
          <div class="filter-row">
            <div class="date-filters">
              <el-date-picker
                v-model="filterForm.startDate"
                type="date"
                placeholder="开始日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-date-picker
                v-model="filterForm.endDate"
                type="date"
                placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-button type="primary" class="black-button" @click="handleQuery">查询</el-button>
            </div>
            <div class="time-tabs">
              <span 
                v-for="tab in timeTabs" 
                :key="tab.value"
                :class="['time-tab', { active: activeTimeTab === tab.value }]"
                @click="activeTimeTab = tab.value"
              >
                {{ tab.label }}
              </span>
            </div>
          </div>

          <!-- 交易数据表格 -->
          <el-table :data="tradeData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="140" />
            <el-table-column prop="orders" label="订单数" width="140" />
            <el-table-column prop="amount" label="交易额" width="140" />
            <el-table-column prop="refund" label="退款额" width="140" />
            <el-table-column prop="avgOrder" label="客单价" width="140" />
            <el-table-column prop="payRate" label="支付成功率" width="140" />
            <el-table-column prop="commission" label="平台佣金" width="140" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-row">
            <div class="pagination-info">共7条，第1/2页</div>
            <div class="pagination-buttons">
              <el-button size="default">上一页</el-button>
              <el-button size="default">下一页</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 标签页四：广告数据 -->
        <el-tab-pane label="广告数据" name="ad">
          <!-- 筛选与时间栏 -->
          <div class="filter-row">
            <div class="date-filters">
              <el-date-picker
                v-model="filterForm.startDate"
                type="date"
                placeholder="开始日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-date-picker
                v-model="filterForm.endDate"
                type="date"
                placeholder="结束日期"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                style="width: 160px"
              />
              <el-button type="primary" class="black-button" @click="handleQuery">查询</el-button>
            </div>
            <div class="time-tabs">
              <span 
                v-for="tab in timeTabs" 
                :key="tab.value"
                :class="['time-tab', { active: activeTimeTab === tab.value }]"
                @click="activeTimeTab = tab.value"
              >
                {{ tab.label }}
              </span>
            </div>
          </div>

          <!-- 广告数据表格 -->
          <el-table :data="adData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="140" />
            <el-table-column prop="impressions" label="曝光量" width="160" />
            <el-table-column prop="clicks" label="点击量" width="140" />
            <el-table-column prop="ctr" label="点击率" width="120" />
            <el-table-column prop="revenue" label="广告收入" width="140" />
            <el-table-column prop="conversions" label="转化数" width="140" />
            <el-table-column prop="cpc" label="转化成本" width="140" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-row">
            <div class="pagination-info">共7条，第1/2页</div>
            <div class="pagination-buttons">
              <el-button size="default">上一页</el-button>
              <el-button size="default">下一页</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 标签页状态
const activeTab = ref('content')
const activeTimeTab = ref('month')

// 时间粒度标签
const timeTabs = ref([
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '自定义', value: 'custom' }
])

// 筛选表单
const filterForm = ref({
  startDate: '2026-09-01',
  endDate: '2026-09-07'
})

// 内容数据
const contentData = ref([
  { date: '2026-09-07', works: '89', visits: '52,341', amount: '¥89,234', newUsers: '1,234', conversion: '3.2%', adRevenue: '¥12,567' },
  { date: '2026-09-06', works: '76', visits: '48,123', amount: '¥76,543', newUsers: '1,102', conversion: '2.8%', adRevenue: '¥11,234' },
  { date: '2026-09-05', works: '92', visits: '55,678', amount: '¥95,432', newUsers: '1,345', conversion: '3.5%', adRevenue: '¥13,890' },
  { date: '2026-09-04', works: '68', visits: '43,210', amount: '¥68,901', newUsers: '987', conversion: '2.9%', adRevenue: '¥10,456' },
  { date: '2026-09-03', works: '81', visits: '46,789', amount: '¥72,345', newUsers: '1,056', conversion: '3.1%', adRevenue: '¥11,890' }
])

// 用户数据
const userData = ref([
  { date: '2026-09-07', newUsers: '1,234', activeUsers: '18,456', paidUsers: '892', payRate: '4.8%', avgDuration: '26.5分钟', arpu: '¥38.2' },
  { date: '2026-09-06', newUsers: '1,102', activeUsers: '17,890', paidUsers: '810', payRate: '4.5%', avgDuration: '25.1分钟', arpu: '¥36.4' },
  { date: '2026-09-05', newUsers: '1,345', activeUsers: '19,234', paidUsers: '945', payRate: '4.9%', avgDuration: '27.2分钟', arpu: '¥39.6' },
  { date: '2026-09-04', newUsers: '987', activeUsers: '16,543', paidUsers: '721', payRate: '4.4%', avgDuration: '24.8分钟', arpu: '¥35.1' },
  { date: '2026-09-03', newUsers: '1,056', activeUsers: '17,120', paidUsers: '768', payRate: '4.5%', avgDuration: '25.4分钟', arpu: '¥36.8' }
])

// 交易数据
const tradeData = ref([
  { date: '2026-09-07', orders: '3,215', amount: '¥89,234', refund: '¥2,140', avgOrder: '¥27.8', payRate: '98.2%', commission: '¥4,461' },
  { date: '2026-09-06', orders: '2,876', amount: '¥76,543', refund: '¥1,980', avgOrder: '¥26.6', payRate: '97.8%', commission: '¥3,827' },
  { date: '2026-09-05', orders: '3,420', amount: '¥95,432', refund: '¥2,310', avgOrder: '¥27.9', payRate: '98.5%', commission: '¥4,771' },
  { date: '2026-09-04', orders: '2,540', amount: '¥68,901', refund: '¥1,650', avgOrder: '¥27.1', payRate: '97.5%', commission: '¥3,445' },
  { date: '2026-09-03', orders: '2,690', amount: '¥72,345', refund: '¥1,780', avgOrder: '¥26.9', payRate: '98.0%', commission: '¥3,617' }
])

// 广告数据
const adData = ref([
  { date: '2026-09-07', impressions: '1,254,300', clicks: '38,420', ctr: '3.1%', revenue: '¥12,567', conversions: '1,842', cpc: '¥6.8' },
  { date: '2026-09-06', impressions: '1,120,450', clicks: '33,610', ctr: '3.0%', revenue: '¥11,234', conversions: '1,654', cpc: '¥6.8' },
  { date: '2026-09-05', impressions: '1,342,890', clicks: '42,180', ctr: '3.1%', revenue: '¥13,890', conversions: '2,012', cpc: '¥6.9' },
  { date: '2026-09-04', impressions: '1,032,120', clicks: '29,870', ctr: '2.9%', revenue: '¥10,456', conversions: '1,480', cpc: '¥7.1' },
  { date: '2026-09-03', impressions: '1,128,760', clicks: '33,050', ctr: '2.9%', revenue: '¥11,890', conversions: '1,712', cpc: '¥6.9' }
])

// 处理查询
const handleQuery = () => {
  ElMessage.success('查询成功')
}
</script>

<style scoped>
.detail-query-container {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 60px);
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

/* 标签页卡片 */
.tabs-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.tabs-card :deep(.el-card__body) {
  padding: 0;
}

/* 标签页样式 */
.detail-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.detail-tabs :deep(.el-tabs__nav-wrap) {
  padding: 8px 0;
}

.detail-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  color: #595959;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.detail-tabs :deep(.el-tabs__item.is-active) {
  color: #1f2329;
  font-weight: 600;
}

.detail-tabs :deep(.el-tabs__active-bar) {
  background-color: #1f2329;
  height: 3px;
}

.detail-tabs :deep(.el-tabs__content) {
  padding: 20px;
}

/* 筛选与时间栏 */
.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-filters {
  display: flex;
  gap: 12px;
}

/* 时间粒度标签 */
.time-tabs {
  display: flex;
  gap: 4px;
  background: #ffffff;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.time-tab {
  padding: 6px 16px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.time-tab:hover {
  color: #1f2329;
}

.time-tab.active {
  background: #1f2329;
  color: #ffffff;
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

/* 表格样式 */
:deep(.el-table) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #595959;
  font-weight: 500;
  font-size: 12px;
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.el-table tr:hover > td) {
  background-color: #fafafa !important;
}

:deep(.el-table .cell) {
  padding-left: 16px;
  padding-right: 16px;
}

/* 分页区域 */
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  font-size: 13px;
  color: #8c8c8c;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

/* 按钮样式 */
:deep(.el-button) {
  font-size: 13px;
  border-radius: 4px;
  padding: 7px 15px;
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

/* 日期选择器样式 */
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-input__inner) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}
</style>
