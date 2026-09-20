<template>
  <div class="operation-log-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
      <el-button type="primary" class="black-button" @click="handleExport">日志导出</el-button>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 160px">
            <el-option label="全部类型" value="" />
            <el-option label="审核" value="审核" />
            <el-option label="登录" value="登录" />
            <el-option label="配置" value="配置" />
            <el-option label="系统" value="系统" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.operator" placeholder="全部操作人" style="width: 200px">
            <el-option label="全部操作人" value="" />
            <el-option label="admin@platform.com" value="admin@platform.com" />
            <el-option label="reviewer1@platform.com" value="reviewer1@platform.com" />
            <el-option label="reviewer2@platform.com" value="reviewer2@platform.com" />
            <el-option label="ops@platform.com" value="ops@platform.com" />
            <el-option label="system" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleFilter">筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作日志列表 -->
    <el-card class="table-card">
      <el-table :data="logList" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="operator" label="操作人" min-width="200" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag class="type-tag" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="280" />
        <el-table-column prop="ip" label="IP" width="150" />
        <el-table-column label="结果" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.result === '成功' ? 'success' : 'danger'" 
              size="small"
            >
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 筛选表单数据
const filterForm = ref({
  type: '',
  operator: '',
  startDate: '2026/09/01',
  endDate: '2026/09/07'
})

// 操作日志列表数据
const logList = ref([
  {
    id: 1,
    time: '2026-09-07 10:30:15',
    operator: 'admin@platform.com',
    type: '审核',
    content: '通过作品《末日黎明》审核',
    ip: '192.168.1.100',
    result: '成功'
  },
  {
    id: 2,
    time: '2026-09-07 10:15:22',
    operator: 'reviewer1@platform.com',
    type: '审核',
    content: '驳回作品《星辰大海》',
    ip: '192.168.1.101',
    result: '成功'
  },
  {
    id: 3,
    time: '2026-09-07 09:30:01',
    operator: 'ops@platform.com',
    type: '登录',
    content: '管理员登录系统',
    ip: '192.168.1.102',
    result: '成功'
  },
  {
    id: 4,
    time: '2026-09-07 09:12:45',
    operator: 'unknown',
    type: '登录',
    content: '异常登录尝试',
    ip: '10.0.0.55',
    result: '失败'
  },
  {
    id: 5,
    time: '2026-09-07 08:45:33',
    operator: 'admin@platform.com',
    type: '配置',
    content: '修改AI审核阈值为60',
    ip: '192.168.1.100',
    result: '成功'
  },
  {
    id: 6,
    time: '2026-09-07 08:30:12',
    operator: 'reviewer2@platform.com',
    type: '审核',
    content: '通过作品《流浪地球3》审核',
    ip: '192.168.1.103',
    result: '成功'
  },
  {
    id: 7,
    time: '2026-09-07 08:15:08',
    operator: 'system',
    type: '系统',
    content: '自动备份数据库完成',
    ip: '127.0.0.1',
    result: '成功'
  },
  {
    id: 8,
    time: '2026-09-07 07:50:22',
    operator: 'admin@platform.com',
    type: '配置',
    content: '新增需求标签"悬疑"',
    ip: '192.168.1.100',
    result: '成功'
  }
])

// 筛选操作
const handleFilter = () => {
  ElMessage.success('筛选操作')
}

// 导出操作
const handleExport = () => {
  ElMessage.success('日志导出功能')
}
</script>

<style scoped>
.operation-log-container {
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

/* 筛选卡片 */
.filter-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 16px 20px;
}

/* 筛选表单 */
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
  background: #ffffff;
}

.table-card :deep(.el-card__body) {
  padding: 20px;
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

/* 按钮样式统一 */
:deep(.el-button) {
  font-size: 13px;
  border-radius: 4px;
  padding: 7px 15px;
}

/* 标签样式 */
:deep(.el-tag) {
  border: none;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
}

/* 浅灰色类型标签 */
.type-tag {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* 绿色成功标签 */
:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

/* 红色失败标签 */
:deep(.el-tag.el-tag--danger) {
  background-color: #fff1f0;
  color: #cf1322;
}

/* 下拉框样式 */
:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-select .el-input__inner) {
  font-size: 13px;
  color: #262626;
}

/* 日期选择器样式 */
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
}

:deep(.el-date-editor .el-input__inner) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}
</style>
