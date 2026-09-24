<template>
  <div class="operation-overview-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">运营数据总览</h2>
      <div class="time-tabs">
        <span 
          v-for="tab in timeTabs" 
          :key="tab.value"
          :class="['time-tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </span>
      </div>
    </div>

    <!-- 顶部统计卡片区 -->
    <div class="stats-row">
      <el-card class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
          {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
        </div>
      </el-card>
    </div>

    <!-- 图表区域2×2网格 -->
    <div class="charts-grid">
      <!-- 访问量趋势 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">访问量趋势</span>
        </template>
        <div ref="visitChartRef" class="chart-container"></div>
      </el-card>

      <!-- 交易额趋势 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">交易额趋势</span>
        </template>
        <div ref="tradeChartRef" class="chart-container"></div>
      </el-card>

      <!-- 流量来源分布 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">流量来源分布</span>
        </template>
        <div ref="sourceChartRef" class="chart-container"></div>
      </el-card>

      <!-- 内容类型分布 -->
      <el-card class="chart-card">
        <template #header>
          <span class="card-title">内容类型分布</span>
        </template>
        <div ref="contentChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 底部异常指标预警 -->
    <el-card class="alert-card">
      <template #header>
        <span class="card-title">异常指标预警</span>
      </template>
      <div class="alert-list">
        <div class="alert-item danger">
          <span class="alert-dot"></span>
          <span class="alert-text">退款率异常：今日退款率 8.5%，超出阈值 5%</span>
        </div>
        <div class="alert-item warning">
          <span class="alert-dot"></span>
          <span class="alert-text">API调用异常：第三方接口响应超过 3s</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// 时间标签
const timeTabs = ref([
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
])
const activeTab = ref('today')

// 顶部统计数据
const statsData = ref([
  { label: '今日访问量', value: '52,341', trend: 18.2 },
  { label: '今日交易额', value: '¥89,234', trend: 23.5 },
  { label: '新增用户', value: '1,234', trend: 5.7 },
  { label: '新增作品', value: '89', trend: -3.2 }
])

// 图表引用
const visitChartRef = ref(null)
const tradeChartRef = ref(null)
const sourceChartRef = ref(null)
const contentChartRef = ref(null)

// 图表实例
let visitChart = null
let tradeChart = null
let sourceChart = null
let contentChart = null

// 初始化访问量趋势图
const initVisitChart = () => {
  if (!visitChartRef.value) return
  
  visitChart = echarts.init(visitChartRef.value)
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'solid'
        }
      },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11
      }
    },
    series: [{
      data: [3200, 5100, 7200, 8900, 9200, 8500, 7800, 6500],
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: '#595959',
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }
  visitChart.setOption(option)
}

// 初始化交易额趋势图
const initTradeChart = () => {
  if (!tradeChartRef.value) return
  
  tradeChart = echarts.init(tradeChartRef.value)
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisLabel: {
        color: '#8c8c8c',
        fontSize: 11
      }
    },
    series: [{
      data: [12000, 28000, 45000, 62000, 75000, 89000],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#1f2329',
        width: 2
      },
      itemStyle: {
        color: '#1f2329'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(31, 35, 41, 0.2)' },
            { offset: 1, color: 'rgba(31, 35, 41, 0.02)' }
          ]
        }
      }
    }]
  }
  tradeChart.setOption(option)
}

// 初始化流量来源分布图
const initSourceChart = () => {
  if (!sourceChartRef.value) return
  
  sourceChart = echarts.init(sourceChartRef.value)
  const option = {
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#595959',
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: '65%',
      center: ['35%', '50%'],
      data: [
        { value: 35, name: '自然搜索', itemStyle: { color: '#1f2329' } },
        { value: 28, name: '直接访问', itemStyle: { color: '#595959' } },
        { value: 20, name: '社交媒体', itemStyle: { color: '#8c8c8c' } },
        { value: 12, name: '广告投放', itemStyle: { color: '#bfbfbf' } },
        { value: 5, name: '其他', itemStyle: { color: '#e8e8e8' } }
      ],
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }]
  }
  sourceChart.setOption(option)
}

// 初始化内容类型分布图
const initContentChart = () => {
  if (!contentChartRef.value) return
  
  contentChart = echarts.init(contentChartRef.value)
  const option = {
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#595959',
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      data: [
        { value: 30, name: '电影剧本', itemStyle: { color: '#ff4d4f' } },
        { value: 25, name: '电视剧', itemStyle: { color: '#ff7a45' } },
        { value: 22, name: '短剧', itemStyle: { color: '#52c41a' } },
        { value: 18, name: '网剧', itemStyle: { color: '#1f2329' } },
        { value: 5, name: '其他', itemStyle: { color: '#8c8c8c' } }
      ],
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }]
  }
  contentChart.setOption(option)
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  visitChart?.resize()
  tradeChart?.resize()
  sourceChart?.resize()
  contentChart?.resize()
}

onMounted(() => {
  // 初始化所有图表
  initVisitChart()
  initTradeChart()
  initSourceChart()
  initContentChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // 销毁图表实例
  visitChart?.dispose()
  tradeChart?.dispose()
  sourceChart?.dispose()
  contentChart?.dispose()
  
  // 移除监听
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.operation-overview-container {
  padding: 20px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 60px);
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

/* 时间切换标签 */
.time-tabs {
  display: flex;
  gap: 4px;
  background: #ffffff;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.time-tab {
  padding: 6px 16px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.time-tab:hover {
  color: #1f2329;
}

.time-tab.active {
  background: #1f2329;
  color: #ffffff;
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
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.up {
  color: #52c41a;
}

.stat-trend.down {
  color: #ff4d4f;
}

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.card-title {
  font-size: 14px;
  color: #1f2329;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 280px;
}

/* 异常指标预警 */
.alert-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #ffffff;
}

.alert-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.alert-card :deep(.el-card__body) {
  padding: 20px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 6px;
}

.alert-item.danger {
  background-color: #fff1f0;
}

.alert-item.warning {
  background-color: #fffbe6;
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-item.danger .alert-dot {
  background-color: #ff4d4f;
}

.alert-item.warning .alert-dot {
  background-color: #faad14;
}

.alert-text {
  font-size: 13px;
  color: #595959;
  line-height: 1.5;
}
</style>
