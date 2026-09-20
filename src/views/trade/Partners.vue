<template>
  <div class="partners-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">合作方管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="default" class="black-button">新增合作方</el-button>
      </div>
    </div>

    <!-- 合作方卡片区域 -->
    <div class="partners-cards">
      <el-card class="partner-card" v-for="partner in partnersList" :key="partner.id">
        <div class="card-name">{{ partner.name }}</div>
        <div class="card-desc">{{ partner.desc }}</div>
        <div class="card-tags">
          <el-tag v-for="tag in partner.tags" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
      </el-card>
    </div>

    <!-- 需求标签管理 -->
    <el-card class="tags-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">需求标签管理</span>
          <el-button type="primary" size="default" class="black-button">新增标签</el-button>
        </div>
      </template>
      <div class="demand-tags">
        <el-tag v-for="tag in demandTags" :key="tag" size="default" class="demand-tag">
          {{ tag }}
        </el-tag>
      </div>
    </el-card>

    <!-- 商务跟进记录 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">商务跟进记录</span>
          <el-button type="primary" size="default" class="black-button">新增记录</el-button>
        </div>
      </template>
      <el-table :data="followUpList" style="width: 100%">
        <el-table-column prop="partner" label="合作方" width="140" />
        <el-table-column prop="followTime" label="跟进时间" width="140" />
        <el-table-column prop="followMethod" label="跟进方式" width="100" />
        <el-table-column prop="content" label="跟进内容" min-width="200" />
        <el-table-column prop="nextFollow" label="下次跟进" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getFollowStatusType(row.status)" size="small">
              {{ getFollowStatusText(row.status) }}
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

// 合作方列表数据
const partnersList = ref([
  {
    id: 1,
    name: '影视公司A',
    desc: '投资方·合作12次',
    icon: 'Office',
    tags: ['电影', '电视剧']
  },
  {
    id: 2,
    name: '制作公司B',
    desc: '制作机构·合作8次',
    icon: 'Shop',
    tags: ['短剧', '网剧']
  },
  {
    id: 3,
    name: '平台C',
    desc: '发行平台·合作5次',
    icon: 'Platform',
    tags: ['电影', '短剧']
  }
])

// 需求标签数据
const demandTags = ref([
  '电影剧本',
  '电视剧',
  '短剧',
  '悬疑题材',
  '都市题材',
  '古装题材',
  '科幻题材',
  '喜剧题材'
])

// 商务跟进记录数据
const followUpList = ref([
  {
    partner: '影视公司A',
    followTime: '2026-09-07',
    followMethod: '电话',
    content: '沟通新项目合作意向',
    nextFollow: '2026-09-14',
    status: 'ongoing'
  },
  {
    partner: '制作公司B',
    followTime: '2026-09-05',
    followMethod: '邮件',
    content: '发送合同模板',
    nextFollow: '2026-09-12',
    status: 'pending'
  },
  {
    partner: '平台C',
    followTime: '2026-09-03',
    followMethod: '面谈',
    content: '确认第二季度合作需求',
    nextFollow: '-',
    status: 'completed'
  }
])

// 获取跟进状态类型
const getFollowStatusType = (status) => {
  const typeMap = {
    ongoing: 'success',
    pending: 'warning',
    completed: 'info'
  }
  return typeMap[status] || ''
}

// 获取跟进状态文本
const getFollowStatusText = (status) => {
  const textMap = {
    ongoing: '进行中',
    pending: '待跟进',
    completed: '已完成'
  }
  return textMap[status] || status
}
</script>

<style scoped>
.partners-container {
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

/* 合作方卡片区域 */
.partners-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.partner-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  text-align: center;
}

.partner-card :deep(.el-card__body) {
  padding: 32px 24px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.card-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.card-tags :deep(.el-tag) {
  border: none;
  background-color: #fafafa;
  color: #595959;
  font-size: 11px;
  padding: 4px 10px;
}

/* 需求标签管理卡片 */
.tags-card {
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.tags-card :deep(.el-card__header) {
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.tags-card :deep(.el-card__body) {
  padding: 24px;
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

.demand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demand-tag {
  border: none;
  background-color: #fafafa;
  color: #595959;
  font-size: 12px;
  padding: 6px 14px;
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

:deep(.el-tag.el-tag--warning) {
  background-color: #fff7e6;
  color: #d48806;
}

:deep(.el-tag.el-tag--info) {
  background-color: #fafafa;
  color: #8c8c8c;
}
</style>
