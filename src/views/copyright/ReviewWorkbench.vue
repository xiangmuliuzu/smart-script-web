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

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value warning">{{ statistics.pending }}</div>
          <div class="stat-label">待审核</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value primary">{{ statistics.aiReviewing }}</div>
          <div class="stat-label">AI审核中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value success">{{ statistics.approved }}</div>
          <div class="stat-label">本月通过</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value danger">{{ statistics.rejected }}</div>
          <div class="stat-label">本月驳回</div>
        </el-card>
      </el-col>
    </el-row>

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
    <el-card class="table-card" v-loading="loading">
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
    <!-- 审核详情弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="作品审核"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="作品名称">{{ currentReview.name }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentReview.author }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentReview.type }}</el-descriptions-item>
        <el-descriptions-item label="题材">{{ currentReview.genre }}</el-descriptions-item>
        <el-descriptions-item label="AI评分">{{ currentReview.aiScore }}分</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentReview.submitTime }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="reviewForm" label-width="80px" style="margin-top: 20px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.action">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="reviewForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReview">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="作品详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="作品名称">{{ currentDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentDetail.author }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentDetail.type }}</el-descriptions-item>
        <el-descriptions-item label="题材">{{ currentDetail.genre }}</el-descriptions-item>
        <el-descriptions-item label="AI评分">{{ currentDetail.aiScore }}分</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentDetail.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDetail.status)" size="small">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
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

// 加载状态
const loading = ref(false)

// 选中的作品
const selectedWorks = ref([])

// 统计数据
const statistics = ref({
  pending: 12,
  aiReviewing: 8,
  approved: 156,
  rejected: 23
})

// 审核详情弹窗
const reviewDialogVisible = ref(false)
const currentReview = ref({})
const reviewForm = ref({
  action: 'approve',
  remark: ''
})

// 作品审核列表数据
const worksList = ref([])

// 审核日志数据
const reviewLogs = ref([])

// 页面加载时获取数据
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    // 获取审核统计
    const statsRes = await fetch('/api/v1/admin/review/statistics')
    const statsData = await statsRes.json()
    if (statsData.code === 200) {
      statistics.value = {
        pending: statsData.pending,
        aiReviewing: statsData.aiReviewing,
        approved: statsData.approved,
        rejected: statsData.rejected
      }
    }

    // 获取审核列表
    const listRes = await fetch('/api/v1/admin/review/list?page=1&pageSize=10')
    const listData = await listRes.json()
    if (listData.code === 200) {
      worksList.value = listData.rows || []
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
})

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
  currentReview.value = row
  reviewForm.value.action = 'approve'
  reviewForm.value.remark = ''
  reviewDialogVisible.value = true
}

// 提交审核结果
const handleSubmitReview = async () => {
  try {
    await fetch(`/api/admin/reviews/${currentReview.value.review_id}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: reviewForm.value.action,
        opinion: reviewForm.value.remark
      })
    })
    ElMessage.success('审核提交成功')
    reviewDialogVisible.value = false
    // 刷新列表
    const res = await fetch('/api/v1/admin/review/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      worksList.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('提交失败，请重试')
  }
}

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetail = ref({})

// 处理详情
const handleDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
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






