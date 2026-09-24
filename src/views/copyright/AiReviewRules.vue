<template>
  <div class="ai-review-rules-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">AI审核规则配置</h2>
      <div class="header-actions">
        <el-button size="default">导出规则</el-button>
        <el-button type="primary" size="default" class="black-button" @click="handleAdd">新增规则</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 140px">
            <el-option label="全部类型" value="" />
            <el-option label="内容安全" value="content_safety" />
            <el-option label="版权保护" value="copyright" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.ruleName"
            placeholder="规则名称搜索"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 审核规则列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">审核规则列表</span>
          <span class="table-count">共{{ rulesList.length }}条</span>
        </div>
      </template>
      <el-table :data="rulesList" style="width: 100%">
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="120" />
        <el-table-column prop="action" label="处理方式" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" @click="handleToggleStatus(row)">
                {{ row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 规则新增/编辑弹窗 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="dialogMode === 'add' ? '新增规则' : '编辑规则'"
      width="500px"
    >
      <el-form :model="currentRule" label-width="80px">
        <el-form-item label="规则名称">
          <el-input v-model="currentRule.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="currentRule.type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="内容安全" value="content_safety" />
            <el-option label="版权保护" value="copyright" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值">
          <el-input v-model="currentRule.threshold" placeholder="例如：≥80分" />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="currentRule.action" placeholder="请选择处理方式" style="width: 100%">
            <el-option label="自动通过" value="auto_pass" />
            <el-option label="人工复审" value="manual_review" />
            <el-option label="自动驳回" value="auto_reject" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="currentRule.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = ref({
  type: '',
  status: '',
  ruleName: ''
})

// 规则弹窗
const ruleDialogVisible = ref(false)
const dialogMode = ref('add')
const currentRule = ref({
  id: null,
  name: '',
  type: '',
  threshold: '',
  action: '',
  status: 'enabled'
})

// 加载状态
const loading = ref(false)

// 审核规则列表数据
const rulesList = ref([])

// 页面加载时获取数据
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/admin/review/ai-rule/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      rulesList.value = data.rows || []
    }
  } catch (e) {
    console.error('获取AI审核规则失败:', e)
  }
})

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    content_safety: '内容安全',
    copyright: '版权保护'
  }
  return typeMap[type] || type
}

// 处理重置
const handleReset = () => {
  filterForm.value = {
    type: '',
    status: '',
    ruleName: ''
  }
  ElMessage.success('已重置筛选条件')
}

// 处理编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  Object.assign(currentRule.value, row)
  ruleDialogVisible.value = true
}

// 处理新增
const handleAdd = () => {
  dialogMode.value = 'add'
  currentRule.value = {
    id: null,
    name: '',
    type: '',
    threshold: '',
    action: '',
    status: 'enabled'
  }
  ruleDialogVisible.value = true
}

// 提交规则
const handleSubmitRule = async () => {
  try {
    if (dialogMode.value === 'add') {
      await fetch('/api/v1/admin/review/ai-rule/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRule.value)
      })
      ElMessage.success('新增规则成功')
    } else {
      await fetch(`/api/v1/admin/review/ai-rule/update/${currentRule.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRule.value)
      })
      ElMessage.success('更新规则成功')
    }
    ruleDialogVisible.value = false
    // 刷新列表
    const res = await fetch('/api/v1/admin/review/ai-rule/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      rulesList.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('提交失败，请重试')
  }
}

// 处理启用/停用切换
const handleToggleStatus = async (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}该规则吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await fetch(`/api/v1/admin/review/ai-rule/status/${row.id}`, {
      method: 'POST'
    })
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`已${action}规则：${row.name}`)
  } catch {
    // 用户取消操作
  }
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该规则吗？删除后无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = rulesList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      rulesList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped>
.ai-review-rules-container {
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

.table-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

.table-count {
  font-size: 12px;
  color: #8c8c8c;
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

:deep(.el-button--danger) {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #ffffff;
}

:deep(.el-button--danger:hover) {
  background-color: #ff7875;
  border-color: #ff7875;
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







