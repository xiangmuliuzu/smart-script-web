<template>
  <div class="works-page">
    <div class="page-heading">
      <h1>我的作品</h1>
      <p>查看个人作品的创作与审核进度</p>
    </div>

    <div class="works-panel">
      <!-- 状态分类（路由驱动，切换即重新查询） -->
      <nav class="works-tabs" aria-label="作品状态">
        <router-link
          v-for="item in tabs"
          :key="item.path"
          :to="item.path"
          :class="{ active: route.path === item.path }"
        >{{ item.title }}</router-link>
      </nav>

      <!-- 搜索与筛选 -->
      <div class="works-filters">
        <el-input
          v-model="query.keyword"
          placeholder="按作品名称搜索"
          clearable
          class="filter-keyword"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="query.workType" placeholder="全部作品类型" clearable class="filter-type" @change="handleSearch">
          <el-option v-for="t in WORK_TYPE" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 接口失败 -->
      <el-alert
        v-if="errorMessage"
        class="works-error"
        type="error"
        :closable="false"
        show-icon
        :title="errorMessage"
      >
        <template #default><el-button link type="primary" @click="loadList">重新加载</el-button></template>
      </el-alert>

      <el-table
        v-loading="loading"
        :data="works"
        class="works-table"
        @row-click="openDetail"
      >
        <el-table-column label="封面" width="88">
          <template #default="{ row }">
            <img v-if="resolveMediaUrl(row.cover)" class="work-cover" :src="resolveMediaUrl(row.cover)" alt="作品封面" />
            <div v-else class="work-cover is-placeholder"><el-icon><Picture /></el-icon></div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="作品名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="作品类型" width="110">
          <template #default="{ row }">{{ contentEnumLabel(WORK_TYPE, row.workType) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="最近更新" width="150">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="最近审核意见" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.reviewSummary || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="emptyText" />
        </template>
      </el-table>

      <div class="works-pager">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50]"
          @current-change="loadList"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Picture } from '@element-plus/icons-vue'
import { listWorksPage } from '@/api/pcWork'
import { resolveMediaUrl } from '@/utils/request'
import { WORK_TYPE, contentEnumLabel } from '@/constants/contentEnum'

const route = useRoute()
const router = useRouter()

/** 状态分类：路由 path → 后端 status 过滤值（「待修改」归并 revision + rejected） */
const tabs = [
  { path: '/pc/user/works/all', title: '全部作品', status: 'all' },
  { path: '/pc/user/works/draft', title: '草稿', status: 'draft' },
  { path: '/pc/user/works/review', title: '审核中', status: 'reviewing' },
  { path: '/pc/user/works/revision', title: '待修改', status: 'revision,rejected' },
  { path: '/pc/user/works/listed', title: '已上架', status: 'published' }
]

const loading = ref(false)
const errorMessage = ref('')
const works = ref([])
const total = ref(0)

const query = reactive({
  keyword: '',
  workType: '',
  pageNum: 1,
  pageSize: 10
})

const currentTab = computed(() => tabs.find((t) => t.path === route.path) || tabs[0])

const statusMap = {
  draft: { text: '草稿', type: 'info' },
  reviewing: { text: '审核中', type: 'primary' },
  revision: { text: '待修改', type: 'warning' },
  rejected: { text: '已驳回', type: 'danger' },
  published: { text: '已上架', type: 'success' }
}

const emptyText = computed(() => {
  const hasFilter = !!query.keyword.trim() || !!query.workType
  return hasFilter ? '没有符合条件的作品' : `${currentTab.value.title}暂无可展示的作品`
})

function statusText(status) {
  return statusMap[status]?.text || status || '—'
}
function statusTag(status) {
  return statusMap[status]?.type || 'info'
}
function formatTime(value) {
  if (!value) return '—'
  const text = String(value)
  const normalized = text.includes('T') ? text.replace('T', ' ').slice(0, 19) : text
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized
}

async function loadList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await listWorksPage({
      status: currentTab.value.status,
      keyword: query.keyword.trim() || undefined,
      workType: query.workType || undefined,
      pageNum: query.pageNum,
      pageSize: query.pageSize
    })
    works.value = Array.isArray(data?.list) ? data.list : []
    total.value = Number(data?.total) || 0
    // 删除/筛选后当前页越界时回退到最后一页
    if (works.value.length === 0 && total.value > 0 && query.pageNum > 1) {
      query.pageNum = Math.max(1, Math.ceil(total.value / query.pageSize))
      return loadList()
    }
  } catch (error) {
    errorMessage.value = error?.message || '作品列表加载失败，请稍后重试'
    works.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.pageNum = 1
  loadList()
}

function handleReset() {
  query.keyword = ''
  query.workType = ''
  query.pageNum = 1
  loadList()
}

function handleSizeChange() {
  query.pageNum = 1
  loadList()
}

function openDetail(row) {
  if (row && row.workId) {
    router.push(`/pc/user/works/${row.workId}`)
  }
}

// 切换状态分类（路由变化）时重置到第一页并重新查询
watch(
  () => route.path,
  () => {
    query.pageNum = 1
    loadList()
  },
  { immediate: true }
)
</script>

<style scoped>
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}
.works-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;min-height:420px}
.works-tabs{display:flex;gap:30px;padding:0 24px;border-bottom:1px solid #edf0f2;overflow-x:auto}
.works-tabs a{display:block;padding:18px 0;color:#6b7078;text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent;cursor:pointer}
.works-tabs a.active{color:#1f2329;font-weight:600;border-color:#1f2329}
.works-filters{display:flex;flex-wrap:wrap;gap:12px;padding:18px 24px 6px}
.filter-keyword{width:240px}.filter-type{width:170px}
.works-error{margin:8px 24px 0;width:auto}
.works-table{padding:8px 12px}
.works-table :deep(.el-table__row){cursor:pointer}
.work-cover{width:52px;height:70px;object-fit:cover;border-radius:4px;display:block}
.work-cover.is-placeholder{display:flex;align-items:center;justify-content:center;background:#f2f3f5;color:#c0c4cc;font-size:22px}
.works-pager{display:flex;justify-content:flex-end;padding:16px 24px}
</style>
