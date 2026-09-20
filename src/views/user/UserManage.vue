<template>
  <div class="user-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户与创作者管理</h2>
      <div class="header-actions">
        <el-button size="default">导出</el-button>
        <el-button type="primary" size="default" class="black-button">添加用户</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item>
          <el-select v-model="filterForm.role" placeholder="全部角色" style="width: 140px">
            <el-option label="全部角色" value="" />
            <el-option label="创作者" value="creator" />
            <el-option label="甲方" value="buyer" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="冻结" value="frozen" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="用户搜索"
            style="width: 200px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="black-button" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="role" label="角色" width="120" />
        <el-table-column prop="registerTime" label="注册时间" width="140" />
        <el-table-column prop="worksCount" label="作品数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
              {{ row.status === 'normal' ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button 
                :type="row.status === 'normal' ? 'danger' : 'success'" 
                size="small" 
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'normal' ? '冻结' : '解冻' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创作者资质与权限配置 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">创作者资质与权限配置</span>
          <el-button type="primary" size="default" class="black-button">配置权限</el-button>
        </div>
      </template>
      <el-table :data="creatorQualificationList" style="width: 100%">
        <el-table-column prop="creator" label="创作者" min-width="120" />
        <el-table-column label="资质等级" width="140">
          <template #default="{ row }">
            <el-tag :type="getQualificationLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadLimit" label="上传权限" width="120" />
        <el-table-column label="交易权限" width="120">
          <template #default="{ row }">
            <el-tag :type="row.tradePermission === 'opened' ? 'success' : 'warning'" size="small">
              {{ row.tradePermission === 'opened' ? '已开通' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="withdrawLimit" label="提现额度" width="140" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 资产调整 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">资产调整</span>
          <el-button type="primary" size="default" class="black-button">新增调整</el-button>
        </div>
      </template>
      <el-table :data="assetAdjustmentList" style="width: 100%">
        <el-table-column prop="adjustNo" label="调整编号" width="140" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'add' ? 'success' : 'danger'" size="small">
              {{ row.type === 'add' ? '增加' : '扣除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="140" />
        <el-table-column prop="reason" label="原因" min-width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="time" label="时间" width="140" />
      </el-table>
    </el-card>

    <!-- 提现申请审核 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">提现申请审核</span>
          <el-button size="default">导出记录</el-button>
        </div>
      </template>
      <el-table :data="withdrawalList" style="width: 100%">
        <el-table-column prop="withdrawNo" label="申请编号" width="140" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="amount" label="提现金额" width="140" />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : 'success'" size="small">
              {{ row.status === 'pending' ? '待审核' : '已通过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleReview(row)">
              {{ row.status === 'pending' ? '审核' : '详情' }}
            </el-button>
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
  role: '',
  status: '',
  keyword: ''
})

// 用户列表数据
const userList = ref([
  {
    id: '#U001',
    username: '张编剧',
    role: '创作者',
    registerTime: '2026-01-15',
    worksCount: '12部',
    status: 'normal'
  },
  {
    id: '#U002',
    username: '影视公司A',
    role: '甲方',
    registerTime: '2026-02-20',
    worksCount: '-',
    status: 'normal'
  },
  {
    id: '#U003',
    username: '可疑用户X',
    role: '普通用户',
    registerTime: '2026-08-01',
    worksCount: '-',
    status: 'frozen'
  }
])

// 创作者资质与权限配置数据
const creatorQualificationList = ref([
  {
    creator: '张编剧',
    level: '金牌创作者',
    uploadLimit: '无限',
    tradePermission: 'opened',
    withdrawLimit: '¥100,000/月'
  },
  {
    creator: '李创作',
    level: '银牌创作者',
    uploadLimit: '50件/月',
    tradePermission: 'opened',
    withdrawLimit: '¥50,000/月'
  },
  {
    creator: '王大锤',
    level: '普通创作者',
    uploadLimit: '10件/月',
    tradePermission: 'pending',
    withdrawLimit: '¥10,000/月'
  }
])

// 资产调整列表数据
const assetAdjustmentList = ref([
  {
    adjustNo: '#ADJ-001',
    user: '张编剧',
    type: 'add',
    amount: '+¥5,000',
    reason: '作品交易分成',
    operator: 'system',
    time: '2026-09-07'
  },
  {
    adjustNo: '#ADJ-002',
    user: '李创作',
    type: 'deduct',
    amount: '-¥500',
    reason: '违规内容处罚',
    operator: 'admin',
    time: '2026-09-06'
  }
])

// 提现申请审核列表数据
const withdrawalList = ref([
  {
    withdrawNo: '#WD-001',
    user: '张编剧',
    amount: '¥15,000',
    applyTime: '2026-09-07 09:00',
    status: 'pending'
  },
  {
    withdrawNo: '#WD-002',
    user: '李创作',
    amount: '¥8,000',
    applyTime: '2026-09-06 16:30',
    status: 'approved'
  }
])

// 获取资质等级类型
const getQualificationLevelType = (level) => {
  if (level === '金牌创作者') return 'success'
  if (level === '银牌创作者') return 'info'
  return ''
}

// 处理搜索
const handleSearch = () => {
  ElMessage.success('搜索条件已应用')
}

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑：${row.username || row.creator}`)
}

// 处理冻结/解冻切换
const handleToggleStatus = async (row) => {
  const action = row.status === 'normal' ? '冻结' : '解冻'
  try {
    await ElMessageBox.confirm(`确认${action}该用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    row.status = row.status === 'normal' ? 'frozen' : 'normal'
    ElMessage.success(`已${action}用户：${row.username}`)
  } catch {
    // 用户取消操作
  }
}

// 处理审核
const handleReview = (row) => {
  if (row.status === 'pending') {
    ElMessage.info(`审核提现申请：${row.withdrawNo}`)
  } else {
    ElMessage.info(`查看提现详情：${row.withdrawNo}`)
  }
}
</script>

<style scoped>
.user-manage-container {
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

:deep(.el-button--danger) {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: #ffffff;
}

:deep(.el-button--danger:hover) {
  background-color: #ff7875;
  border-color: #ff7875;
}

:deep(.el-button--success) {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #ffffff;
}

:deep(.el-button--success:hover) {
  background-color: #73d13d;
  border-color: #73d13d;
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

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #8c8c8c;
}

:deep(.el-tag:not(.el-tag--success):not(.el-tag--danger):not(.el-tag--warning):not(.el-tag--info)) {
  background-color: #f5f5f5;
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
