<template>
  <div class="risk-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">全局风控管理</h2>
    </div>

    <!-- 顶部统计卡片区 -->
    <div class="stats-row">
      <el-card class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
      </el-card>
    </div>

    <!-- 上半部分左右两栏布局 -->
    <div class="layout-wrapper">
      <!-- 左侧：违规内容处理 -->
      <div class="left-content">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">违规内容处理</span>
            </div>
          </template>
          <el-table :data="violationList" style="width: 100%">
            <el-table-column prop="content" label="内容" min-width="200" />
            <el-table-column prop="type" label="类型" width="140" />
            <el-table-column label="严重度" width="120">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.severity)" size="small">
                  {{ row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'warning' : 'success'" size="small">
                  {{ row.status === 'pending' ? '待处理' : '已处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" @click="handleProcess(row)">处理</el-button>
                  <el-button size="small" @click="handleDetail(row)">详情</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 右侧：风控规则配置 -->
      <div class="right-content">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">风控规则配置</span>
              <el-button type="primary" size="default" class="black-button" @click="handleAddRule">新增规则</el-button>
            </div>
          </template>
          <el-table :data="ruleList" style="width: 100%">
            <el-table-column prop="rule" label="规则" min-width="160" />
            <el-table-column prop="condition" label="触发条件" width="140" />
            <el-table-column prop="action" label="处理方式" width="140" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag type="success" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>

    <!-- 下半部分通栏：黑名单维护 -->
    <el-card class="table-card full-width">
      <template #header>
        <div class="card-header">
          <span class="card-title">黑名单维护</span>
          <el-button type="primary" size="default" class="black-button" @click="handleAddBlacklist">添加黑名单</el-button>
        </div>
      </template>
      <el-table :data="blacklistData" style="width: 100%">
        <el-table-column prop="object" label="对象" min-width="180" />
        <el-table-column label="类型" width="140">
          <template #default="{ row }">
            <el-tag type="danger" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="200" />
        <el-table-column prop="addTime" label="加入时间" width="160" />
        <el-table-column prop="validity" label="有效期" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="handleRemove(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增规则弹窗 -->
    <el-dialog v-model="ruleDialogVisible" title="新增风控规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.rule_type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="敏感词检测" value="sensitive" />
            <el-option label="风险评分" value="risk" />
            <el-option label="行为检测" value="behavior" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="ruleForm.trigger_condition" placeholder="请输入触发条件" />
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="ruleForm.action" placeholder="请选择处理方式" style="width: 100%">
            <el-option label="自动驳回" value="reject" />
            <el-option label="人工复核" value="review" />
            <el-option label="警告" value="warning" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值">
          <el-input v-model="ruleForm.threshold" placeholder="请输入阈值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加黑名单弹窗 -->
    <el-dialog v-model="blacklistDialogVisible" title="添加黑名单" width="500px">
      <el-form :model="blacklistForm" label-width="100px">
        <el-form-item label="类型">
          <el-select v-model="blacklistForm.target_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="用户" value="user" />
            <el-option label="IP地址" value="ip" />
            <el-option label="设备" value="device" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标值">
          <el-input v-model="blacklistForm.target_value" placeholder="请输入目标值" />
        </el-form-item>
        <el-form-item label="加入原因">
          <el-input v-model="blacklistForm.reason" type="textarea" placeholder="请输入加入黑名单的原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="blacklistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitBlacklist">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)

// 顶部统计数据
const statsData = ref([])

// 违规内容列表数据
const violationList = ref([])

// 风控规则列表数据
const ruleList = ref([])

// 黑名单数据
const blacklistData = ref([])

// 页面加载时获取数据
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    // 获取风控规则列表
    const ruleRes = await fetch('/api/v1/admin/review/risk-rule/list?page=1&pageSize=10')
    const ruleData = await ruleRes.json()
    if (ruleData.code === 200) {
      ruleList.value = ruleData.rows || []
    }

    // 获取违规内容列表（暂时用风控规则数据代替）
    violationList.value = []
    
    // 获取黑名单数据（暂时空）
    blacklistData.value = []
  } catch (e) {
    console.error('获取风控数据失败:', e)
  }
})

// 获取严重度标签类型
const getSeverityType = (severity) => {
  if (severity === '高') return 'danger'
  if (severity === '中') return 'warning'
  return ''
}

// 处理违规内容
const handleProcess = (row) => {
  ElMessage.info(`处理违规内容：${row.content}`)
}

// 查看详情
const handleDetail = (row) => {
  ElMessage.info(`查看详情：${row.content}`)
}

// 移除黑名单
const handleRemove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认移除黑名单 "${row.object}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success(`已移除：${row.object}`)
  } catch {
    // 用户取消操作
  }
}

// 新增规则弹窗
const ruleDialogVisible = ref(false)
const ruleForm = ref({
  rule_name: '',
  rule_type: '',
  trigger_condition: '',
  action: '',
  threshold: 80
})

const handleAddRule = () => {
  ruleForm.value = { rule: '', condition: '', action: '' }
  ruleDialogVisible.value = true
}

const handleSubmitRule = async () => {
  try {
    await fetch('/api/v1/admin/review/risk-rule/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleForm.value)
    })
    ElMessage.success('新增规则成功')
    ruleDialogVisible.value = false
    // 刷新列表
    const res = await fetch('/api/v1/admin/review/risk-rule/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      ruleList.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('提交失败，请重试')
  }
}

// 添加黑名单弹窗
const blacklistDialogVisible = ref(false)
const blacklistForm = ref({
  target_type: 'user',
  target_value: '',
  reason: ''
})

const handleAddBlacklist = () => {
  blacklistForm.value = { username: '', reason: '' }
  blacklistDialogVisible.value = true
}

const handleSubmitBlacklist = async () => {
  try {
    await fetch('/api/v1/admin/review/blacklist/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blacklistForm.value)
    })
    ElMessage.success('添加黑名单成功')
    blacklistDialogVisible.value = false
    // 刷新列表
    const res = await fetch('/api/v1/admin/review/blacklist/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      blacklistData.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('提交失败，请重试')
  }
}
</script>

<style scoped>
.risk-manage-container {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 60px);
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

/* 顶部统计卡片区 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  padding: 24px 20px;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #1f2329;
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

.table-card.full-width {
  margin-bottom: 0;
}

.table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.table-card :deep(.el-card__body) {
  padding: 20px;
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

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}
</style>









