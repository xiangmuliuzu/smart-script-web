<template>
  <div class="user-profile-rec-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户画像与推荐配置</h2>
      <div class="header-actions">
        <el-button type="primary" size="default" class="black-button">保存配置</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 左侧主内容 -->
      <div class="main-content">
        <!-- 推荐策略列表 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">推荐策略列表</span>
            </div>
          </template>
          <el-table :data="strategyList" style="width: 100%">
            <el-table-column prop="name" label="策略名称" min-width="150" />
            <el-table-column prop="type" label="策略类型" width="140" />
            <el-table-column prop="weight" label="权重" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 相似作品推荐配置 -->
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">相似作品推荐配置</span>
            </div>
          </template>
          <el-table :data="similarWorksList" style="width: 100%">
            <el-table-column prop="workName" label="作品名称" min-width="150" />
            <el-table-column prop="similarCount" label="相似作品数" width="140" />
            <el-table-column prop="matchRate" label="匹配度" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'on' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'on' ? '开启' : '关闭' }}
                </el-tag>
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

      <!-- 右侧用户画像配置 -->
      <div class="sidebar-content">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">用户画像配置</span>
            </div>
          </template>
          <div class="profile-items">
            <div class="profile-item" v-for="item in profileConfig" :key="item.id">
              <div class="item-header">
                <span class="item-label">{{ item.label }}</span>
                <el-switch v-model="item.enabled" />
              </div>
              <div class="item-desc">{{ item.desc }}</div>
            </div>
          </div>
          <el-button type="primary" class="black-button save-btn" block>保存配置</el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 推荐策略列表数据
const strategyList = ref([
  {
    id: 1,
    name: '基于内容推荐',
    type: '协同过滤',
    weight: '30%',
    status: 'enabled'
  },
  {
    id: 2,
    name: '基于热度推荐',
    type: '热度排序',
    weight: '50%',
    status: 'enabled'
  },
  {
    id: 3,
    name: '基于用户推荐',
    type: '个性化推荐',
    weight: '20%',
    status: 'disabled'
  }
])

// 相似作品推荐配置数据
const similarWorksList = ref([
  {
    id: 1,
    workName: '《都市迷途》',
    similarCount: '12部',
    matchRate: '85%',
    status: 'on'
  },
  {
    id: 2,
    workName: '《山河故人》',
    similarCount: '8部',
    matchRate: '72%',
    status: 'off'
  }
])

// 用户画像配置数据
const profileConfig = ref([
  {
    id: 1,
    label: '地域偏好',
    desc: '根据用户所在地区推荐相关内容',
    enabled: true
  },
  {
    id: 2,
    label: '题材偏好',
    desc: '根据用户历史浏览题材推荐内容',
    enabled: true
  },
  {
    id: 3,
    label: '作者偏好',
    desc: '根据用户关注作者推荐内容',
    enabled: true
  },
  {
    id: 4,
    label: '热度加权',
    desc: '结合作品热度进行加权推荐',
    enabled: true
  }
])

// 处理编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑：${row.name || row.workName}`)
}
</script>

<style scoped>
.user-profile-rec-container {
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

/* 内容布局 */
.content-wrapper {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-content {
  width: 320px;
  flex-shrink: 0;
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

/* 用户画像配置卡片 */
.profile-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.profile-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.profile-card :deep(.el-card__body) {
  padding: 24px;
}

.profile-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.profile-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-label {
  font-size: 13px;
  color: #1f2329;
  font-weight: 500;
}

.item-desc {
  font-size: 11px;
  color: #8c8c8c;
  line-height: 1.5;
}

.save-btn {
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

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

/* 开关样式 */
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #52c41a;
  border-color: #52c41a;
}
</style>
