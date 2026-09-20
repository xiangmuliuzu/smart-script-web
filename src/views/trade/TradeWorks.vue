<template>
  <div class="trade-works-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">交易作品管理</h2>
      <div class="header-actions">
        <el-button size="default">导出</el-button>
        <el-button type="primary" size="default" class="black-button">上架新作品</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.authType" placeholder="全部授权类型" style="width: 160px">
            <el-option label="全部授权类型" value="" />
            <el-option label="独家授权" value="exclusive" />
            <el-option label="非独家授权" value="non-exclusive" />
            <el-option label="改编授权" value="adaptation" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="作品名称搜索"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 交易作品列表 -->
    <el-card class="table-card">
      <el-table :data="worksList" style="width: 100%">
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="作品名称" min-width="150" />
        <el-table-column prop="authType" label="授权类型" width="120" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <span class="price-text">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="浏览量" width="120">
          <template #default="{ row }">
            <span class="stat-text">{{ row.views }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收藏" width="100">
          <template #default="{ row }">
            <span class="stat-text">{{ row.favorites }}</span>
          </template>
        </el-table-column>
        <el-table-column label="置顶" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isPinned" type="success" size="small">置顶中</el-tag>
            <el-button v-else size="small" @click="handlePin(row)">置顶</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag type="success" size="small">已上架</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = ref({
  authType: '',
  keyword: ''
})

// 交易作品列表数据
const worksList = ref([
  {
    id: '#T001',
    name: '《都市迷途》',
    authType: '独家授权',
    price: '¥50,000',
    views: 1234,
    favorites: 89,
    isPinned: true,
    status: 'online'
  },
  {
    id: '#T002',
    name: '《暗夜追踪》',
    authType: '非独家授权',
    price: '¥25,000',
    views: 856,
    favorites: 42,
    isPinned: false,
    status: 'online'
  }
])

// 处理重置
const handleReset = () => {
  filterForm.value = {
    authType: '',
    keyword: ''
  }
  ElMessage.success('已重置筛选条件')
}

// 处理置顶
const handlePin = async (row) => {
  try {
    await ElMessageBox.confirm('确认置顶该作品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.isPinned = true
    ElMessage.success(`已置顶作品：${row.name}`)
  } catch {
    // 用户取消操作
  }
}

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑作品：${row.name}`)
}
</script>

<style scoped>
.trade-works-container {
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
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

/* 价格文本 */
.price-text {
  color: #1f2329;
  font-weight: 600;
  font-size: 13px;
}

/* 统计文本 */
.stat-text {
  color: #595959;
  font-size: 13px;
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

/* 表单控件样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

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
