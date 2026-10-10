<template>
  <div class="overview-container">
    <div class="page-header">
      <h2 class="page-title">运营数据总览</h2>
      <el-radio-group v-model="trendDays" size="small" @change="fetchTrend">
        <el-radio-button :value="7">近7天</el-radio-button>
        <el-radio-button :value="14">近14天</el-radio-button>
        <el-radio-button :value="30">近30天</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 概览卡片 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-num">{{ overview.totalUsers ?? 0 }}</div>
          <div class="stat-label">平台用户</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-num">{{ overview.totalCreators ?? 0 }}</div>
          <div class="stat-label">创作者</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-num">{{ overview.totalWorks ?? 0 }}</div>
          <div class="stat-label">作品总数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card warn">
          <div class="stat-num">{{ overview.pendingWorks ?? 0 }}</div>
          <div class="stat-label">待审核作品</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card success">
          <div class="stat-num">{{ overview.onShelfWorks ?? 0 }}</div>
          <div class="stat-label">已上架作品</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card primary">
          <div class="stat-num">{{ overview.todayNewWorks ?? 0 }}</div>
          <div class="stat-label">今日新增作品</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <el-card class="table-card trend-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户与作品新增趋势</span>
        </div>
      </template>
      <div ref="trendChartRef" class="trend-chart"></div>
    </el-card>

    <!-- 创作者排行 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">创作者作品排行</span>
          <el-button type="primary" class="black-button" size="small" @click="fetchRank">刷新</el-button>
        </div>
      </template>
      <el-table :data="rankList" v-loading="loading" style="width: 100%">
        <el-table-column label="排名" width="80" align="center">
          <template #default="{ $index }">
            <span class="rank-badge" :class="'rank-' + ($index + 1)">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="创作者ID" width="120" />
        <el-table-column prop="nickname" label="创作者" min-width="160" />
        <el-table-column label="已上架作品" width="120" align="center">
          <template #default="{ row }">{{ row.publishedCount ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="总浏览量" width="120" align="center">
          <template #default="{ row }">{{ row.totalViews ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="总收藏量" width="120" align="center">
          <template #default="{ row }">{{ row.totalFavorites ?? 0 }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import adminFetch from '@/utils/adminFetch'

const STAT_PREFIX = '/api/v1/admin/statistics'

const loading = ref(false)
const trendDays = ref(7)
const overview = reactive({})
const rankList = ref([])
const trendChartRef = ref(null)
let chart = null

const fetchOverview = async () => {
  try {
    const res = await adminFetch(`${STAT_PREFIX}/overview`)
    const data = await res.json()
    if (data.code === 200 && data.data) {
      Object.assign(overview, data.data)
    }
  } catch (e) {
    ElMessage.error('获取运营概览失败')
  }
}

const fetchTrend = async () => {
  try {
    const res = await adminFetch(`${STAT_PREFIX}/trend?days=${trendDays.value}`)
    const data = await res.json()
    if (data.code === 200) {
      renderTrend(data.rows || [])
    }
  } catch (e) {
    ElMessage.error('获取趋势数据失败')
  }
}

const fetchRank = async () => {
  loading.value = true
  try {
    const res = await adminFetch(`${STAT_PREFIX}/creator-rank?limit=10`)
    const data = await res.json()
    if (data.code === 200) {
      rankList.value = data.rows || []
    }
  } catch (e) {
    ElMessage.error('获取创作者排行失败')
  } finally {
    loading.value = false
  }
}

const renderTrend = (rows) => {
  if (!trendChartRef.value) return
  if (!chart) {
    chart = echarts.init(trendChartRef.value)
  }
  const dates = rows.map(r => String(r.statDate).slice(0, 10))
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增用户', '新增作品'] },
    grid: { left: 50, right: 30, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '新增用户', type: 'line', smooth: true, data: rows.map(r => r.newUsers || 0), itemStyle: { color: '#409eff' } },
      { name: '新增作品', type: 'line', smooth: true, data: rows.map(r => r.newWorks || 0), itemStyle: { color: '#67c23a' } }
    ]
  })
}

const handleResize = () => {
  if (chart) chart.resize()
}

onMounted(async () => {
  await fetchOverview()
  await fetchTrend()
  fetchRank()
  nextTick(() => {
    window.addEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.overview-container { padding: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { margin: 0; font-size: 20px; font-weight: 600; }
.stat-cards { margin-bottom: 16px; }
.stat-card { text-align: center; margin-bottom: 16px; }
.stat-num { font-size: 30px; font-weight: 700; color: #303133; }
.stat-card.warn .stat-num { color: #e6a23c; }
.stat-card.success .stat-num { color: #67c23a; }
.stat-card.primary .stat-num { color: #409eff; }
.stat-label { margin-top: 6px; color: #909399; font-size: 13px; }
.trend-card { margin-bottom: 16px; }
.trend-chart { height: 300px; width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: 600; }
.rank-badge { display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; background: #f0f2f5; color: #606266; font-weight: 600; }
.rank-1 { background: #f56c6c; color: #fff; }
.rank-2 { background: #e6a23c; color: #fff; }
.rank-3 { background: #409eff; color: #fff; }
</style>
