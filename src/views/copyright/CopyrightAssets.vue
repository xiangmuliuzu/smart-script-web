<template>
  <div class="copyright-assets-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">版权资产管理</h2>
      <div class="header-actions">
        <el-button size="default">导出</el-button>
        <el-button type="primary" size="default" class="black-button">新增作品</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="已上架" value="online" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.tag" placeholder="全部标签" style="width: 140px">
            <el-option label="全部标签" value="" />
            <el-option label="都市" value="urban" />
            <el-option label="古装" value="ancient" />
            <el-option label="科幻" value="scifi" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="作品名称/作者"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleSearch">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 版权资产列表 -->
    <el-card class="table-card">
      <el-table :data="assetsList" style="width: 100%">
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="作品名称" min-width="150" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="tag" label="标签" width="100" />
        <el-table-column prop="authCount" label="授权状态" width="120" />
        <el-table-column label="上架状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.onlineStatus === 'online' ? 'success' : 'info'" size="small">
              {{ row.onlineStatus === 'online' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleDetail(row)">详情</el-button>
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" @click="handleToggleOnline(row)">
                {{ row.onlineStatus === 'online' ? '下架' : '上架' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 授权历史查询 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">授权历史查询</span>
          <el-button size="default">导出历史</el-button>
        </div>
      </template>
      <el-table :data="authHistoryList" style="width: 100%">
        <el-table-column prop="authNo" label="授权编号" width="140" />
        <el-table-column prop="workName" label="作品名称" min-width="140" />
        <el-table-column prop="licensee" label="被授权方" width="140" />
        <el-table-column prop="authType" label="授权类型" width="120" />
        <el-table-column prop="authTime" label="授权时间" width="120" />
        <el-table-column prop="validPeriod" label="有效期" min-width="200" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '生效中' : '已过期' }}
            </el-tag>
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
  status: '',
  tag: '',
  keyword: ''
})

// 版权资产列表数据
const assetsList = ref([
  {
    id: '#C001',
    name: '《都市迷途》',
    author: '张编剧',
    type: '电影剧本',
    tag: '都市',
    authCount: '已授权3次',
    onlineStatus: 'online'
  },
  {
    id: '#C002',
    name: '《山河故人》',
    author: '李创作',
    type: '电视剧剧本',
    tag: '古装',
    authCount: '已授权1次',
    onlineStatus: 'online'
  },
  {
    id: '#C003',
    name: '《末日黎明》',
    author: '王大锤',
    type: '短剧',
    tag: '科幻',
    authCount: '已授权0次',
    onlineStatus: 'offline'
  }
])

// 授权历史列表数据
const authHistoryList = ref([
  {
    authNo: '#AUTH-001',
    workName: '《都市迷途》',
    licensee: '影视公司A',
    authType: '独家授权',
    authTime: '2026-08-15',
    validPeriod: '2026-08-15 ~ 2027-08-15',
    status: 'active'
  },
  {
    authNo: '#AUTH-002',
    workName: '《山河故人》',
    licensee: '平台C',
    authType: '非独家授权',
    authTime: '2026-07-01',
    validPeriod: '2026-07-01 ~ 2027-01-01',
    status: 'active'
  },
  {
    authNo: '#AUTH-003',
    workName: '《星辰大海》',
    licensee: '制作公司B',
    authType: '改编授权',
    authTime: '2026-03-10',
    validPeriod: '2026-03-10 ~ 2026-09-10',
    status: 'expired'
  }
])

// 处理搜索
const handleSearch = () => {
  ElMessage.success('搜索条件已应用')
}

// 处理重置
const handleReset = () => {
  filterForm.value = {
    status: '',
    tag: '',
    keyword: ''
  }
  ElMessage.success('已重置筛选条件')
}

// 处理详情
const handleDetail = (row) => {
  ElMessage.info(`查看作品详情：${row.name}`)
}

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑作品：${row.name}`)
}

// 处理上架/下架切换
const handleToggleOnline = async (row) => {
  const action = row.onlineStatus === 'online' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确认${action}该作品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.onlineStatus = row.onlineStatus === 'online' ? 'offline' : 'online'
    ElMessage.success(`已${action}作品：${row.name}`)
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped>
.copyright-assets-container {
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
  border-radius: 10px;
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
