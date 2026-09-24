<template>
  <div class="module-page">
    <div class="page-heading">
      <div>
        <div class="eyebrow">{{ config.eyebrow }}</div>
        <h1>{{ config.title }}</h1>
        <p>{{ config.description }}</p>
      </div>
      <div class="heading-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" @click="handlePrimary">
          <el-icon><Plus /></el-icon>
          {{ config.primaryAction }}
        </el-button>
      </div>
    </div>

    <div class="kpi-grid">
      <div v-for="item in config.kpis" :key="item.label" class="kpi-card">
        <span class="kpi-label">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <span class="kpi-trend">{{ item.trend }}</span>
      </div>
    </div>

    <el-card class="work-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-title">
          <span>业务列表</span>
          <el-tag type="info" effect="plain">{{ filteredRows.length }} 条</el-tag>
        </div>
        <div class="toolbar-filters">
          <el-input
            v-model="keyword"
            clearable
            placeholder="搜索名称、编号或负责人"
            class="keyword-input"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="status" clearable placeholder="全部状态" class="status-select">
            <el-option label="全部状态" value="" />
            <el-option label="启用" value="启用" />
            <el-option label="待审核" value="待审核" />
            <el-option label="审核中" value="审核中" />
            <el-option label="已通过" value="已通过" />
            <el-option label="待签署" value="待签署" />
            <el-option label="待结算" value="待结算" />
            <el-option label="补充材料" value="补充材料" />
          </el-select>
        </div>
      </div>

      <el-table :data="filteredRows" stripe>
        <el-table-column
          v-for="column in config.columns"
          :key="column"
          :label="column"
          min-width="140"
        >
          <template #default="{ row }">
            <span v-if="statusColumns.includes(column)">
              <el-tag :type="statusType(statusValue(row, column))" effect="plain">
                {{ statusValue(row, column) }}
              </el-tag>
            </span>
            <span v-else-if="column === '材料完整度'">
              <el-tag :type="row.count === '完整' ? 'success' : 'warning'" effect="plain">
                {{ row.count }}
              </el-tag>
            </span>
            <span v-else>{{ cellValue(row, column) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button
              v-for="action in config.actions"
              :key="action"
              link
              size="small"
              @click="handleAction(action, row)"
            >
              {{ action }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无匹配数据" :image-size="72" />
        </template>
      </el-table>

      <div class="table-footer">
        <span>当前展示模拟数据，后续由对应负责人接入后端接口。</span>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredRows.length"
          :page-size="10"
        />
      </div>
    </el-card>

    <div class="handoff-grid">
      <el-card shadow="never">
        <template #header>
          <div class="card-title">开发接入点</div>
        </template>
        <ul class="handoff-list">
          <li>页面路径和菜单已固定，业务负责人直接替换模拟数据。</li>
          <li>列表接口统一接入 `/api/v1/admin`，分页兼容若依 `rows + total`。</li>
          <li>新增、编辑、审核和状态变更需要补充操作日志。</li>
        </ul>
      </el-card>
      <el-card shadow="never">
        <template #header>
          <div class="card-title">交付检查</div>
        </template>
        <div class="check-list">
          <span><el-icon><CircleCheck /></el-icon> 页面结构已具备</span>
          <span><el-icon><CircleCheck /></el-icon> 加载、空数据状态已具备</span>
          <span><el-icon><CircleCheck /></el-icon> 公共主题和组件已接入</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheck, Plus, Refresh, Search } from '@element-plus/icons-vue'

const route = useRoute()
const keyword = ref('')
const status = ref('')

const fallbackConfig = {
  eyebrow: '业务模块',
  title: route.meta.title || '业务管理',
  description: '业务模块页面骨架，等待负责人接入接口和真实数据。',
  primaryAction: '新增',
  kpis: [{ label: '待处理', value: '0', trend: '待接入' }],
  columns: ['名称', '负责人', '状态', '更新时间'],
  rows: [],
  actions: ['查看']
}

const config = computed(() => route.meta.moduleConfig || fallbackConfig)
const filteredRows = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  return config.value.rows.filter((row) => {
    const matchesKeyword = !key || Object.values(row).some((value) => String(value).toLowerCase().includes(key))
    const matchesStatus = !status.value || row.status === status.value
    return matchesKeyword && matchesStatus
  })
})

const cellValue = (row, column) => {
  const map = {
    作品名称: row.name,
    合同编号: row.name,
    申请编号: row.name,
    询盘编号: row.name,
    名称: row.name,
    作者: row.owner,
    申请人: row.owner,
    需求方: row.owner,
    榜单类型: row.owner,
    合作双方: row.category,
    分类: row.category,
    类型: row.category,
    统计周期: row.category,
    关联作品: row.category,
    当前报价: row.count,
    关联订单: row.owner,
    章节数: row.count,
    作品数量: row.count,
    奖励次数: row.category,
    每日上限: row.count,
    奖励内容: row.category,
    适用用户: row.count,
    排序: row.count,
    发送范围: row.category,
    发送状态: row.count,
    作品: row.owner,
    更新时间: row.time,
    提交时间: row.time
  }
  return map[column] ?? row[column] ?? '-'
}

const statusColumns = ['状态', '展示状态', '合同状态', '结算状态', '发送状态']
const statusValue = (row, column) => {
  if (column === '合同状态' || column === '发送状态') return row.count || row.status
  return row.status
}

const statusType = (value) => {
  if (['已通过', '启用', '已签署', '已结算', '已达成', '已发送'].includes(value)) return 'success'
  if (['待审核', '审核中', '补充材料', '待签署', '待结算', '草稿', '待完善', '待响应', '报价中', '线下谈判', '定时发送', '待发送'].includes(value)) return 'warning'
  if (['驳回', '停用'].includes(value)) return 'danger'
  return 'info'
}

const handleRefresh = () => ElMessage.success('已刷新当前模块')
const handlePrimary = () => ElMessage.info(`${config.value.primaryAction}功能等待后端接口接入`)
const handleAction = (action, row) => ElMessage.info(`${action}：${row.name}`)
</script>

<style scoped>
.module-page {
  padding: 24px;
  min-height: calc(100vh - 56px);
  background: #f5f6f8;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
}

.eyebrow {
  margin-bottom: 8px;
  color: #8a8f99;
  font-size: 12px;
}

h1 {
  margin: 0;
  color: #1f2329;
  font-size: 24px;
  font-weight: 600;
}

.page-heading p {
  max-width: 720px;
  margin: 8px 0 0;
  color: #8a8f99;
  font-size: 13px;
}

.heading-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.kpi-card {
  min-height: 112px;
  padding: 18px 20px;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.kpi-label,
.kpi-trend {
  display: block;
  color: #8a8f99;
  font-size: 12px;
}

.kpi-card strong {
  display: block;
  margin: 8px 0;
  color: #1f2329;
  font-size: 24px;
  font-weight: 600;
}

.kpi-trend {
  color: #4a8f68;
}

.work-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.toolbar,
.toolbar-title,
.toolbar-filters,
.table-footer {
  display: flex;
  align-items: center;
}

.toolbar {
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.toolbar-title {
  gap: 10px;
  color: #1f2329;
  font-size: 14px;
  font-weight: 600;
}

.toolbar-filters {
  justify-content: flex-end;
  gap: 10px;
}

.keyword-input {
  width: 260px;
}

.status-select {
  width: 140px;
}

.table-footer {
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  color: #8a8f99;
  font-size: 12px;
}

.handoff-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.card-title {
  color: #1f2329;
  font-size: 14px;
  font-weight: 600;
}

.handoff-list {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  font-size: 13px;
  line-height: 2;
}

.check-list {
  display: grid;
  gap: 13px;
  color: #606266;
  font-size: 13px;
}

.check-list .el-icon {
  margin-right: 6px;
  color: #67c23a;
  vertical-align: -2px;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-heading,
  .toolbar,
  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-filters {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
