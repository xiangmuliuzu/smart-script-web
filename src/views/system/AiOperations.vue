<template>
  <div class="ai-operations-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">AI次数配置</h2>
      <div class="header-actions">
        <el-tag type="info" size="default">用户注册自动开通，初始额度为0</el-tag>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value primary">{{ stats.totalUsers }}</div>
          <div class="stat-label">使用用户数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value success">{{ stats.todayCalls }}</div>
          <div class="stat-label">今日调用次数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value warning">{{ stats.failedCalls }}</div>
          <div class="stat-label">fail次数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value danger">{{ stats.refundedCalls }}</div>
          <div class="stat-label">补偿次数</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI功能配置列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">AI功能次数配置</span>
          <span class="table-count">共{{ configList.length }}条</span>
        </div>
      </template>
      <el-table :data="configList" style="width: 100%">
        <el-table-column prop="nickname" label="用户" min-width="150" />
        <el-table-column prop="available_quota" label="可用配额" width="120" />
        <el-table-column prop="reserved_quota" label="预留配额" width="120" />
        <el-table-column prop="total_earned" label="累计获得" width="120" />
        <el-table-column prop="total_consumed" label="累计消耗" width="120" />
        <el-table-column prop="total_refunded" label="累计补偿" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" @click="handleToggleStatus(row)">
                调整配额
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 调用记录 -->
    <el-card class="table-card" style="margin-top: 20px">
      <template #header>
        <div class="table-header">
          <span class="table-title">调用记录</span>
        </div>
      </template>
      <el-table :data="callRecords" style="width: 100%">
        <el-table-column prop="created_at" label="时间" width="160" />
        <el-table-column prop="nickname" label="用户" width="120" />
        <el-table-column prop="business_type" label="业务类型" min-width="120" />
        <el-table-column prop="change_type" label="变更类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCallTypeTag(row.change_type)" size="small">
              {{ row.change_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="change_amount" label="变更数量" width="100" />
        <el-table-column prop="after_balance" label="变更后余额" width="100" />
      </el-table>
    </el-card>

    <!-- 配置弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增配置' : '编辑配置'"
      width="500px"
    >
      <el-form :model="currentConfig" label-width="100px">
        <el-form-item label="功能名称">
          <el-input v-model="currentConfig.name" placeholder="例如：AI大纲生成" />
        </el-form-item>
        <el-form-item label="每日限额">
          <el-input-number v-model="currentConfig.dailyLimit" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="单位">
          <el-select v-model="currentConfig.unit" style="width: 100%">
            <el-option label="次" value="次" />
            <el-option label="张" value="张" />
            <el-option label="章" value="章" />
          </el-select>
        </el-form-item>
        <el-form-item label="积分价格">
          <el-input-number v-model="currentConfig.price" :min="0" />
        </el-form-item>
        <el-form-item label="广告奖励次数">
          <el-input-number v-model="currentConfig.adReward" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="currentConfig.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统计数据
const stats = ref({
  totalUsers: 0,
  todayCalls: 0,
  failedCalls: 0,
  refundedCalls: 0
})

// AI功能配置列表
const configList = ref([])

// 调用记录
const callRecords = ref([])

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 获取AI配额统计
    const statsRes = await fetch('/api/v1/admin/ai/statistics')
    const statsData = await statsRes.json()
    if (statsData.code === 200) {
      stats.value = {
        totalUsers: statsData.totalUsers,
        todayCalls: statsData.todayCalls,
        failedCalls: statsData.failedCalls,
        refundedCalls: statsData.refundedCalls
      }
    }

    // 获取配额账户列表
    const listRes = await fetch('/api/v1/admin/ai/quota/list?page=1&pageSize=10')
    const listData = await listRes.json()
    if (listData.code === 200) {
      configList.value = listData.rows || []
    }

    // 获取调用记录
    const recordsRes = await fetch('/api/v1/admin/ai/quota/records?page=1&pageSize=10')
    const recordsData = await recordsRes.json()
    if (recordsData.code === 200) {
      callRecords.value = recordsData.rows || []
    }
  } catch (e) {
    console.error('获取数据失败:', e)
  }
})

// 弹窗
const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentConfig = reactive({
  id: null,
  name: '',
  dailyLimit: 10,
  unit: '次',
  price: 0,
  adReward: 0,
  status: 'enabled'
})

// 获取调用类型标签
const getCallTypeTag = (type) => {
  const typeMap = {
    '免费额度': 'success',
    '积分兑换': 'primary',
    '广告获取': 'warning',
    '会员特权': 'danger'
  }
  return typeMap[type] || 'info'
}

// 处理新增
const handleAdd = () => {
  dialogMode.value = 'add'
  Object.assign(currentConfig, {
    id: null,
    name: '',
    dailyLimit: 10,
    unit: '次',
    price: 0,
    adReward: 0,
    status: 'enabled'
  })
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  Object.assign(currentConfig, row)
  dialogVisible.value = true
}

// 提交配置
const handleSubmit = async () => {
  try {
    if (dialogMode.value === 'add') {
      // 调用后端API新增配置
      await fetch('/api/v1/admin/ai/quota/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      })
      ElMessage.success('新增配置成功')
    } else {
      // 调用后端API更新配置
      await fetch(`/api/v1/admin/ai/quota/update/${currentConfig.account_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      })
      ElMessage.success('更新配置成功')
    }
    dialogVisible.value = false
    // 刷新列表
    const res = await fetch('/api/v1/admin/ai/quota/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      configList.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('提交失败，请重试')
  }
}

// 处理启用/停用
const handleToggleStatus = async (row) => {
  const action = row.status === 1 ? '停用' : '启用'
  try {
    await ElMessageBox.confirm('确认' + action + '该配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 调用后端API更新状态
    await fetch(`/api/v1/admin/ai/quota/status/${row.account_id}`, { 
      method: 'POST' 
    })
    ElMessage.success('状态更新成功')
    // 刷新列表
    const res = await fetch('/api/v1/admin/ai/quota/list?page=1&pageSize=10')
    const data = await res.json()
    if (data.code === 200) {
      configList.value = data.rows || []
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('更新失败，请重试')
    }
  }
}

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-value.primary {
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-weight: bold;
}

.table-count {
  color: #909399;
  font-size: 14px;
}
</style>











