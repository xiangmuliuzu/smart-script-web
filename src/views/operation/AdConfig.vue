<template>
  <div class="ad-config-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">广告运营配置</h2>
    </div>

    <!-- 左右分栏布局 -->
    <div class="layout-wrapper">
      <!-- 左侧内容区 -->
      <div class="left-content">
        <!-- 广告位管理 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">广告位管理</span>
            </div>
          </template>
          <el-table :data="placementList" style="width: 100%">
            <el-table-column prop="name" label="广告位" min-width="200" />
            <el-table-column prop="frequency" label="频次/天" width="180" />
            <el-table-column label="状态" width="150">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'enabled' ? '开启' : '关闭' }}
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

        <!-- 多广告源接入与调度 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">多广告源接入与调度</span>
              <el-button type="primary" size="default" class="black-button">新增广告源</el-button>
            </div>
          </template>
          <el-table :data="adSourceList" style="width: 100%">
            <el-table-column prop="source" label="广告源" min-width="150" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="priority" label="优先级" width="140" />
            <el-table-column prop="ratio" label="占比" width="120" />
            <el-table-column label="状态" width="150">
              <template #default="{ row }">
                <el-tag :type="row.status === 'connected' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'connected' ? '已接入' : '接入中' }}
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

      <!-- 右侧配置栏 -->
      <div class="right-sidebar">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">人群定向配置</span>
            </div>
          </template>
          <el-form :model="targetConfig" label-position="top" class="config-form">
            <el-form-item label="目标人群">
              <el-select v-model="targetConfig.targetAudience" placeholder="请选择" style="width: 100%">
                <el-option label="全部用户" value="all" />
                <el-option label="新用户" value="new" />
                <el-option label="活跃用户" value="active" />
                <el-option label="付费用户" value="paid" />
              </el-select>
            </el-form-item>
            <el-form-item label="每日观看上限">
              <el-input-number 
                v-model="targetConfig.dailyLimit" 
                :min="1" 
                :max="100"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <el-button 
              type="primary" 
              class="black-button save-button" 
              @click="handleSaveConfig"
            >
              保存配置
            </el-button>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 广告位列表数据
const placementList = ref([
  {
    id: 1,
    name: '开屏广告',
    frequency: '1次/用户',
    status: 'enabled'
  },
  {
    id: 2,
    name: '视频前贴片',
    frequency: '2次/用户',
    status: 'enabled'
  },
  {
    id: 3,
    name: '信息流广告',
    frequency: '5次/用户',
    status: 'disabled'
  }
])

// 广告源列表数据
const adSourceList = ref([
  {
    id: 1,
    source: '穿山甲',
    type: 'SDK',
    priority: '优先级1',
    ratio: '40%',
    status: 'connected'
  },
  {
    id: 2,
    source: '优量汇',
    type: 'SDK',
    priority: '优先级2',
    ratio: '35%',
    status: 'connected'
  },
  {
    id: 3,
    source: '百青藤',
    type: 'API',
    priority: '优先级3',
    ratio: '25%',
    status: 'connecting'
  }
])

// 人群定向配置数据
const targetConfig = ref({
  targetAudience: 'all',
  dailyLimit: 10
})

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑：${row.name || row.source}`)
}

// 处理保存配置
const handleSaveConfig = () => {
  ElMessage.success('配置已保存')
}
</script>

<style scoped>
.ad-config-container {
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

/* 左右分栏布局 */
.layout-wrapper {
  display: flex;
  gap: 20px;
}

/* 左侧内容区 */
.left-content {
  flex: 1;
  min-width: 0;
}

/* 右侧配置栏 */
.right-sidebar {
  width: 320px;
  flex-shrink: 0;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.table-card:last-child {
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

/* 配置卡片 */
.config-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.config-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.config-card :deep(.el-card__body) {
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

/* 配置表单 */
.config-form {
  margin: 0;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.config-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  padding-bottom: 8px;
  line-height: 1.5;
}

.config-form :deep(.el-form-item:last-of-type) {
  margin-bottom: 0;
}

.save-button {
  width: 100%;
  margin-top: 20px;
  height: 36px;
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

/* 表单控件样式 */
:deep(.el-select .el-input__wrapper),
:deep(.el-input-number .el-input__wrapper) {
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

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
