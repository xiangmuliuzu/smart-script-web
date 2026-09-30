<template>
  <div class="system-config-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">系统配置</h2>
    </div>

    <!-- 上半部分左右两栏布局 -->
    <div class="layout-wrapper">
      <!-- 左侧：全局参数 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">全局参数</span>
        </template>
        <el-form :model="globalForm" label-position="top" class="config-form">
          <el-form-item label="平台名称">
            <el-input v-model="globalForm.platformName" placeholder="请输入平台名称" />
          </el-form-item>
          <el-form-item label="审核自动通过阈值">
            <el-input-number 
              v-model="globalForm.autoPassThreshold" 
              :min="0" 
              :max="100"
              controls-position="right"
              class="full-width-number"
            />
          </el-form-item>
          <el-form-item label="每日审核上限">
            <el-input-number 
              v-model="globalForm.dailyReviewLimit" 
              :min="0"
              controls-position="right"
              class="full-width-number"
            />
          </el-form-item>
          <el-button type="primary" class="black-button full-width" @click="handleSaveGlobal">
            保存设置
          </el-button>
        </el-form>
      </el-card>

      <!-- 右侧：第三方接口 -->
      <el-card class="form-card">
        <template #header>
          <span class="card-title">第三方接口</span>
        </template>
        <el-form :model="apiForm" label-position="top" class="config-form">
          <el-form-item label="版权存证接口">
            <el-input v-model="apiForm.copyrightApi" placeholder="请输入版权存证接口地址" />
          </el-form-item>
          <el-form-item label="支付接口">
            <el-input v-model="apiForm.paymentApi" placeholder="请输入支付接口地址" />
          </el-form-item>
          <el-form-item label="AI审核接口">
            <el-input v-model="apiForm.aiReviewApi" placeholder="请输入AI审核接口地址" />
          </el-form-item>
          <el-button type="primary" class="black-button full-width" @click="handleSaveApi">
            保存配置
          </el-button>
        </el-form>
      </el-card>
    </div>

    <!-- 下半部分通栏：通知模板维护 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">通知模板维护</span>
          <el-button type="primary" size="default" class="black-button" @click="handleAddTemplate">
            新增模板
          </el-button>
        </div>
      </template>
      <el-table :data="templateList" style="width: 100%">
        <el-table-column prop="name" label="模板名称" min-width="160" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag class="type-tag" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览" min-width="300" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : ''" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditTemplate(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 全局参数表单数据
const globalForm = ref({
  platformName: '剧本文易平台',
  autoPassThreshold: 60,
  dailyReviewLimit: 200
})

// 第三方接口表单数据
const apiForm = ref({
  copyrightApi: 'https://api.copyright.example.com/v1',
  paymentApi: 'https://pay.example.com/api',
  aiReviewApi: 'https://ai-review.example.com/v1'
})

// 通知模板列表数据
const templateList = ref([
  {
    id: 1,
    name: '审核结果通知',
    type: '站内信',
    content: '尊敬的{用户名}，您提交的作品《作品名》已审核{结果}...',
    status: 'enabled'
  },
  {
    id: 2,
    name: '订单状态通知',
    type: '站内信',
    content: '您的订单#{订单号}状态已更新为{状态}...',
    status: 'enabled'
  },
  {
    id: 3,
    name: '提现到账通知',
    type: '短信',
    content: '您的提现申请{金额}已处理，预计1-3个工作日到账...',
    status: 'enabled'
  },
  {
    id: 4,
    name: '风控告警通知',
    type: '紧急',
    content: '【风控告警】检测到异常行为：{异常描述}...',
    status: 'enabled'
  }
])

// 保存全局参数
const handleSaveGlobal = () => {
  ElMessage.success('全局参数保存成功')
}

// 保存第三方接口配置
const handleSaveApi = () => {
  ElMessage.success('第三方接口配置保存成功')
}

// 新增模板
const handleAddTemplate = () => {
  ElMessage.info('新增模板功能')
}

// 编辑模板
const handleEditTemplate = (row) => {
  ElMessage.info(`编辑模板：${row.name}`)
}
</script>

<style scoped>
.system-config-container {
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

/* 上半部分左右两栏布局 */
.layout-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

/* 表单卡片 */
.form-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.form-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.form-card :deep(.el-card__body) {
  padding: 20px;
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

/* 配置表单样式 */
.config-form {
  margin: 0;
}

.config-form :deep(.el-form-item) {
  margin-bottom: 20px;
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

.full-width {
  width: 100%;
  margin-top: 8px;
}

/* 数字输入框全宽 */
.full-width-number {
  width: 100%;
}

.full-width-number :deep(.el-input__wrapper) {
  width: 100%;
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

/* 绿色启用标签 */
:deep(.el-tag.el-tag--success) {
  background-color: #f6ffed;
  color: #389e0d;
}

/* 浅灰色类型标签 */
.type-tag {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

/* 表单控件样式 */
:deep(.el-input__wrapper),
:deep(.el-input-number) {
  border-radius: 4px;
}

:deep(.el-input__wrapper) {
  border-color: #d9d9d9;
}

:deep(.el-input__inner) {
  font-size: 13px;
  color: #262626;
}

:deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}

/* 数字输入框样式 */
:deep(.el-input-number .el-input__wrapper) {
  padding-left: 12px;
  padding-right: 12px;
}
</style>
