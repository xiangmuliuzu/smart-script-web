<template>
  <div class="permission-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
      <el-button type="primary" class="black-button">添加管理员</el-button>
    </div>

    <!-- 上半部分左右两栏布局 -->
    <div class="layout-wrapper">
      <!-- 左侧：管理员账号 -->
      <div class="left-content">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">管理员账号</span>
            </div>
          </template>
          <el-table :data="adminList" style="width: 100%">
            <el-table-column prop="account" label="账号" min-width="220" />
            <el-table-column label="角色" width="160">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.role)" size="small">
                  {{ row.role }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag type="success" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 右侧：角色权限 -->
      <div class="right-content">
        <el-card class="role-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">角色权限</span>
              <el-button size="default">新建角色</el-button>
            </div>
          </template>
          <div class="role-list">
            <div class="role-item" v-for="role in roleList" :key="role.id">
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-desc">{{ role.description }}</div>
              </div>
              <el-button size="small" @click="handleEditRole(role)">编辑</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 下半部分通栏：批量授权 -->
    <el-card class="batch-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">批量授权</span>
        </div>
      </template>
      <div class="batch-form">
        <el-select v-model="batchForm.account" placeholder="请选择账号" style="width: 280px">
          <el-option label="admin@platform.com" value="admin@platform.com" />
          <el-option label="reviewer1@platform.com" value="reviewer1@platform.com" />
          <el-option label="ops@platform.com" value="ops@platform.com" />
        </el-select>
        <el-select v-model="batchForm.role" placeholder="请选择角色" style="width: 280px">
          <el-option label="超级管理员" value="superadmin" />
          <el-option label="审核员" value="reviewer" />
          <el-option label="运维人员" value="ops" />
        </el-select>
        <el-select v-model="batchForm.scope" placeholder="请选择范围" style="width: 280px">
          <el-option label="全部模块" value="all" />
          <el-option label="部分模块" value="partial" />
        </el-select>
        <el-button type="primary" class="black-button" @click="handleBatchAuth">批量授权</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 管理员账号列表数据
const adminList = ref([
  {
    id: 1,
    account: 'admin@platform.com',
    role: '超级管理员',
    status: '正常'
  },
  {
    id: 2,
    account: 'reviewer1@platform.com',
    role: '审核员',
    status: '正常'
  },
  {
    id: 3,
    account: 'ops@platform.com',
    role: '运维',
    status: '正常'
  }
])

// 角色权限列表数据
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '全部权限'
  },
  {
    id: 2,
    name: '审核员',
    description: '版权审核、作品管理'
  },
  {
    id: 3,
    name: '运维人员',
    description: '平台运维、数据查看'
  }
])

// 批量授权表单数据
const batchForm = ref({
  account: '',
  role: '',
  scope: 'all'
})

// 获取角色标签类型
const getRoleType = (role) => {
  if (role === '超级管理员') return 'danger'
  return ''
}

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑管理员：${row.account}`)
}

// 处理编辑角色
const handleEditRole = (role) => {
  ElMessage.info(`编辑角色：${role.name}`)
}

// 处理批量授权
const handleBatchAuth = () => {
  if (!batchForm.value.account || !batchForm.value.role) {
    ElMessage.warning('请选择账号和角色')
    return
  }
  ElMessage.success('批量授权成功')
}
</script>

<style scoped>
.permission-manage-container {
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

/* 上半部分左右两栏布局 */
.layout-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.left-content,
.right-content {
  min-width: 0;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-card :deep(.el-card__body) {
  padding: 20px;
}

/* 角色卡片 */
.role-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.role-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.role-card :deep(.el-card__body) {
  padding: 20px;
}

/* 角色列表 */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
  margin-bottom: 6px;
}

.role-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 批量授权卡片 */
.batch-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.batch-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.batch-card :deep(.el-card__body) {
  padding: 20px;
}

.batch-form {
  display: flex;
  align-items: center;
  gap: 16px;
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

:deep(.el-button--small) {
  font-size: 12px;
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

:deep(.el-tag.el-tag--danger) {
  background-color: #fff1f0;
  color: #cf1322;
}

:deep(.el-tag:not(.el-tag--success):not(.el-tag--danger):not(.el-tag--warning):not(.el-tag--info)) {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* 下拉框样式 */
:deep(.el-select .el-input__wrapper) {
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
