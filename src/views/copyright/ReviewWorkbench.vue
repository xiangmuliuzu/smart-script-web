<template>
  <div class="review-workbench-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">作品审核工作台</h2>
      <div class="header-actions">
        <el-button size="default">导出报告</el-button>
        <el-button type="primary" size="default" class="black-button">批量分配</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="AI审核中" value="ai_reviewing" />
            <el-option label="待人工复核" value="manual_review" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 140px">
            <el-option label="全部类型" value="" />
            <el-option label="电影剧本" value="movie" />
            <el-option label="电视剧剧本" value="tv" />
            <el-option label="短剧剧本" value="short" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.genre" placeholder="全部题材" style="width: 140px">
            <el-option label="全部题材" value="" />
            <el-option label="都市" value="urban" />
            <el-option label="古装" value="ancient" />
            <el-option label="科幻" value="scifi" />
            <el-option label="悬疑" value="suspense" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="开始日期"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="结束日期"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 作品审核列表 -->
    <el-card class="table-card">
      <el-table
        :data="worksList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="作品名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="genre" label="题材" width="100" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column label="AI评分" width="100">
          <template #default="{ row }">
            <span :class="getScoreClass(row.aiScore)">{{ row.aiScore }}分</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending' || row.status === 'manual_review'"
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

    <!-- 审核日志 -->
    <el-card class="log-card">
      <template #header>
        <div class="log-header">
          <span class="log-title">审核日志</span>
          <el-button size="small">导出日志</el-button>
        </div>
      </template>
      <el-table :data="reviewLogs" style="width: 100%">
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="work" label="作品" min-width="150" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="280" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 筛选表单
const filterForm = ref({
  status: '',
  type: '',
  genre: '',
  startDate: '',
  endDate: ''
})

// 选中的作品
const selectedWorks = ref([])

// 作品审核列表数据
const worksList = ref([
  {
    id: '#W001',
    name: '《都市迷途》',
    type: '电影剧本',
    genre: '都市',
    author: '张编剧',
    submitTime: '2026-09-07 10:30',
    aiScore: 87,
    status: 'pending'
  },
  {
    id: '#W002',
    name: '《山河故人》',
    type: '电视剧剧本',
    genre: '古装',
    author: '李创作',
    submitTime: '2026-09-07 09:15',
    aiScore: 72,
    status: 'ai_reviewing'
  },
  {
    id: '#W003',
    name: '《末日黎明》',
    type: '短剧剧本',
    genre: '科幻',
    author: '王大锤',
    submitTime: '2026-09-06 18:42',
    aiScore: 93,
    status: 'approved'
  },
  {
    id: '#W004',
    name: '《暗夜追踪》',
    type: '电影剧本',
    genre: '悬疑',
    author: '陈导演',
    submitTime: '2026-09-06 14:10',
    aiScore: 81,
    status: 'manual_review'
  }
])

// 审核日志数据
const reviewLogs = ref([
  {
    time: '2026-09-07 10:30',
    operator: 'admin',
    work: '《都市迷途》',
    action: '通过',
    remark: '内容完整优质，AI评分87，符合审核标准'
  },
  {
    time: '2026-09-07 09:15',
    operator: 'system',
    work: '《山河故人》',
    action: 'AI初筛',
    remark: '自动检测通过，AI评分72，转入人工复核队列'
  },
  {
    time: '2026-09-06 18:42',
    operator: 'reviewer1',
    work: '《末日黎明》',
    action: '通过',
    remark: '剧情创新突出，人物塑造优秀，评分93'
  },
  {
    time: '2026-09-06 16:20',
    operator: 'reviewer1',
    work: '《暗夜追踪》',
    action: '通过',
    remark: '悬疑设定合理，AI评分81，剧本结构完整'
  },
  {
    time: '2026-09-06 15:30',
    operator: 'admin',
    work: '《长安十二时》',
    action: 'AI初筛',
    remark: '历史剧题材检测，进入人工核查'
  },
  {
    time: '2026-09-06 14:20',
    operator: 'system',
    work: '《乱世情缘》',
    action: 'AI初筛',
    remark: '检测结果：剧情连贯性90，人物饱满度85'
  },
  {
    time: '2026-09-06 11:45',
    operator: 'reviewer2',
    work: '《AI觉醒》',
    action: '通过',
    remark: '科幻设定新颖，评分88'
  },
  {
    time: '2026-09-06 10:30',
    operator: 'system',
    work: '《江湖往事》',
    action: '驳回',
    remark: '版权风险提示，需补充授权证明'
  }
])

// 获取AI评分样式
const getScoreClass = (score) => {
  if (score >= 85) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    manual_review: 'warning',
    ai_reviewing: '',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    manual_review: '待人工复核',
    ai_reviewing: 'AI审核中',
    approved: '已通过',
    rejected: '已驳回'
  }
  return textMap[status] || status
}

// 获取操作类型
const getActionType = (action) => {
  if (action === '通过') return 'success'
  if (action === '驳回') return 'danger'
  return 'info'
}

// 处理搜索
const handleSearch = () => {
  ElMessage.success('搜索条件已应用')
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedWorks.value = selection
}

// 处理审核
const handleReview = (row) => {
  ElMessage.success(`开始审核《${row.name}》`)
}

// 处理详情
const handleDetail = (row) => {
  ElMessage.info(`查看《${row.name}》详情`)
}
</script>

<style scoped>
.review-workbench-container {
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

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-form {
  margin: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.filter-form :deep(.el-form-item:last-child) {
  margin-right: 0;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

/* AI评分样式 */
.score-high {
  color: #52c41a;
  font-weight: 600;
  font-size: 14px;
}

.score-medium {
  color: #fa8c16;
  font-weight: 600;
  font-size: 14px;
}

.score-low {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 14px;
}

/* 日志卡片 */
.log-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.log-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.log-card :deep(.el-card__body) {
  padding: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-title {
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

:deep(.el-button.is-link) {
  color: #1f2329;
  font-size: 12px;
  padding: 0;
}

:deep(.el-button.is-link:hover) {
  color: #000000;
}

/* 标签样式 */
:deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
}

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

:deep(.el-tag.el-tag--danger) {
  background-color: #fff1f0;
  color: #cf1322;
}

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #595959;
}

:deep(.el-tag:not(.el-tag--warning):not(.el-tag--success):not(.el-tag--danger):not(.el-tag--info)) {
  background-color: #1f2329;
  color: #ffffff;
}

/* 按钮样式统一 */
:deep(.el-button) {
  font-size: 12px;
  border-radius: 4px;
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

/* 表单控件样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-date-editor .el-input__wrapper) {
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
