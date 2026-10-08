<template>
  <div class="works-page">
    <div class="page-heading"><h1>我的作品</h1><p>查看个人作品的创作与审核进度</p></div>
    <div class="works-panel">
      <nav class="works-tabs" aria-label="作品状态">
        <router-link
          v-for="item in tabs"
          :key="item.path"
          :to="item.path"
          :class="{ active: route.path === item.path }"
          @click="loadList(item.status)"
        >{{ item.title }}</router-link>
      </nav>

      <el-table
        v-loading="loading"
        :data="works"
        class="works-table"
        @row-click="openDetail"
      >
        <el-table-column prop="title" label="作品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="genreName" label="分类" width="110">
          <template #default="{ row }">{{ row.genreName || '未分类' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="字数" width="100">
          <template #default="{ row }">{{ row.wordCount || 0 }}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="170">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="`${route.meta.title || '全部作品'}暂无可展示的作品`" />
        </template>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listWorks } from '@/api/pcWork'

const route = useRoute()
const router = useRouter()

const tabs = [
  { path: '/pc/user/works/all', title: '全部作品', status: 'all' },
  { path: '/pc/user/works/draft', title: '草稿', status: 'draft' },
  { path: '/pc/user/works/review', title: '审核中', status: 'reviewing' },
  { path: '/pc/user/works/revision', title: '待修改', status: 'revision' },
  { path: '/pc/user/works/listed', title: '已上架', status: 'published' }
]

const loading = ref(false)
const works = ref([])

const statusMap = {
  draft: { text: '草稿', type: 'info' },
  reviewing: { text: '审核中', type: 'primary' },
  revision: { text: '待修改', type: 'warning' },
  rejected: { text: '已驳回', type: 'danger' },
  published: { text: '已上架', type: 'success' }
}

function statusText(status) {
  return statusMap[status]?.text || status || '—'
}
function statusTag(status) {
  return statusMap[status]?.type || 'info'
}
function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadList(status) {
  loading.value = true
  try {
    const data = await listWorks(status)
    works.value = Array.isArray(data) ? data : []
  } catch (error) {
    ElMessage.error(error?.message || '作品列表加载失败')
    works.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(row) {
  if (row && row.workId) {
    router.push(`/pc/user/works/${row.workId}`)
  }
}

watch(
  () => route.path,
  () => {
    const tab = tabs.find((t) => t.path === route.path)
    if (tab) loadList(tab.status)
  },
  { immediate: true }
)
</script>

<style scoped>
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}.works-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;min-height:420px}.works-tabs{display:flex;gap:30px;padding:0 24px;border-bottom:1px solid #edf0f2;overflow-x:auto}.works-tabs a{display:block;padding:18px 0;color:#6b7078;text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent;cursor:pointer}.works-tabs a.active{color:#1f2329;font-weight:600;border-color:#1f2329}.works-table{padding:8px 12px}.works-table :deep(.el-table__row){cursor:pointer}
</style>
