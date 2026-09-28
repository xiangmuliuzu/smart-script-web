<template>
  <PageContainer>
    <PageHeader title="播放数据" description="查看外部视频播放量、追更数与播放历史" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="queryParams.channelId"
          placeholder="渠道ID"
          style="width: 140px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="queryParams.workId"
          placeholder="剧本ID"
          style="width: 140px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无播放数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="workId" label="剧本ID" width="90" />
      <el-table-column label="剧本标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">{{ row.workTitle || '—' }}</template>
      </el-table-column>
      <el-table-column prop="totalPlayCount" label="总播放量" width="120" />
      <el-table-column prop="subscribeCount" label="追更数" width="100" />
      <el-table-column prop="episodeCount" label="剧集数" width="90" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:dramastats:query']"
            size="small"
            link
            type="primary"
            @click="openDetail(row)"
          >详情</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 详情弹窗：剧本统计 + 剧集明细 + 播放历史 -->
    <el-dialog v-model="detailDialog.visible" title="播放数据详情" width="860px">
      <el-descriptions v-loading="detailDialog.loading" :column="3" border>
        <el-descriptions-item label="剧本ID">{{ detail.workId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="剧本标题">{{ detail.workTitle || '—' }}</el-descriptions-item>
        <el-descriptions-item label="剧集数">{{ detail.episodeCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="总播放量">{{ detail.totalPlayCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="追更数">{{ detail.subscribeCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="渠道ID">{{ detail.channelId || '—' }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">剧集明细</div>
      <el-table :data="detailEpisodes" border size="small" max-height="240" empty-text="暂无剧集数据">
        <el-table-column prop="episodeNo" label="集数" width="80" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="playCount" label="播放量" width="100" />
        <el-table-column prop="likeCount" label="点赞数" width="90" />
        <el-table-column prop="commentCount" label="评论数" width="90" />
        <el-table-column label="完播率" width="100">
          <template #default="{ row }">
            {{ formatRate(row.completionRate) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="section-title">播放历史</div>
      <el-table
        v-loading="historyLoading"
        :data="historyList"
        border
        size="small"
        max-height="240"
        empty-text="暂无播放历史"
      >
        <el-table-column prop="episodeTitle" label="剧集标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column label="播放时间" width="170">
          <template #default="{ row }">{{ row.playTime || '—' }}</template>
        </el-table-column>
      </el-table>
      <div class="history-pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="historyTotal"
          :current-page="historyQuery.pageNum"
          :page-size="historyQuery.pageSize"
          @current-change="onHistoryPageChange"
        />
      </div>

      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  listDramaStats,
  getDramaStats,
  listDramaHistory
} from '@/api/content'

defineOptions({ name: 'ExternalDramaStats' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  channelId: '',
  workId: ''
})

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    channelId: queryParams.channelId || undefined,
    workId: queryParams.workId || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listDramaStats(buildQuery())
    list.value = res?.rows || []
    total.value = Number(res?.total || 0)
  } catch {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  loadList()
}

function handleReset() {
  queryParams.channelId = ''
  queryParams.workId = ''
  handleQuery()
}

// ---- 详情弹窗 ----
const detailDialog = reactive({ visible: false, loading: false })
const detail = reactive({})
const detailEpisodes = ref([])

// ---- 播放历史（带分页） ----
const historyLoading = ref(false)
const historyList = ref([])
const historyTotal = ref(0)
const historyQuery = reactive({
  workId: null,
  pageNum: 1,
  pageSize: 5
})

function formatRate(rate) {
  if (rate === null || rate === undefined || rate === '') return '—'
  const n = Number(rate)
  if (!Number.isFinite(n)) return '—'
  // 若已是 0~1 小数则按百分比展示，否则原样展示
  if (n >= 0 && n <= 1) return `${(n * 100).toFixed(1)}%`
  return `${n}%`
}

async function openDetail(row) {
  detailDialog.visible = true
  detailDialog.loading = true
  Object.keys(detail).forEach((k) => delete detail[k])
  detailEpisodes.value = []
  historyList.value = []
  historyTotal.value = 0
  const workId = row.workId
  historyQuery.workId = workId
  historyQuery.pageNum = 1
  try {
    const res = await getDramaStats(workId)
    const data = res?.data || res || {}
    Object.assign(detail, data)
    detailEpisodes.value = Array.isArray(data.episodes) ? data.episodes : []
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    detailDialog.loading = false
  }
  loadHistory()
}

async function loadHistory() {
  if (!historyQuery.workId) return
  historyLoading.value = true
  try {
    const res = await listDramaHistory({
      workId: historyQuery.workId,
      pageNum: historyQuery.pageNum,
      pageSize: historyQuery.pageSize
    })
    historyList.value = res?.rows || []
    historyTotal.value = Number(res?.total || 0)
  } catch {
    historyList.value = []
    historyTotal.value = 0
  } finally {
    historyLoading.value = false
  }
}

function onHistoryPageChange(val) {
  historyQuery.pageNum = val
  loadHistory()
}

onMounted(loadList)
</script>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-weight: 600;
}
.history-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
