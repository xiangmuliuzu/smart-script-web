<template>
  <PageContainer>
    <PageHeader title="作品管理" description="查看平台所有作品及其章节信息" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="queryParams.title"
          placeholder="作品标题"
          style="width: 180px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option label="草稿" value="draft" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已上架" value="on_shelf" />
          <el-option label="已下架" value="off_shelf" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.workType" placeholder="全部作品类型" style="width: 160px" clearable>
          <el-option v-for="t in WORK_TYPE" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.tradeType" placeholder="全部交易类型" style="width: 160px" clearable>
          <el-option v-for="t in TRADE_TYPE" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无作品数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="workId" label="作品ID" width="90" />
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column prop="authorName" label="作者" width="120" show-overflow-tooltip />
      <el-table-column prop="genreName" label="分类" width="120" show-overflow-tooltip />
      <el-table-column label="作品类型" width="100">
        <template #default="{ row }">{{ contentEnumLabel(WORK_TYPE, row.workType) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="wordCount" label="字数" width="100" />
      <el-table-column prop="episodeCount" label="章节数" width="90" />
      <el-table-column prop="viewCount" label="阅读量" width="90" />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:work:query']"
            size="small"
            @click="openDetail(row)"
          >详情</el-button>
          <el-button
            v-permission="['content:work:list']"
            size="small"
            @click="openChapters(row)"
          >章节</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog v-model="detailDialog.visible" title="作品详情" width="640px">
      <el-descriptions v-loading="detailDialog.loading" :column="2" border>
        <el-descriptions-item label="作品标题" :span="2">{{ detail.title || '—' }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ detail.authorName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ detail.genreName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="作品类型">{{ contentEnumLabel(WORK_TYPE, detail.workType) }}</el-descriptions-item>
        <el-descriptions-item label="篇幅类型">{{ detail.lengthType || '—' }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ detail.summary || '—' }}</el-descriptions-item>
        <el-descriptions-item label="核心设定" :span="2">{{ detail.coreSetting || '—' }}</el-descriptions-item>
        <el-descriptions-item label="人物设定" :span="2">{{ detail.characterSetting || '—' }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{ detail.price ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="交易类型">{{ contentEnumLabel(TRADE_TYPE, detail.tradeType) }}</el-descriptions-item>
        <el-descriptions-item label="交易状态">
          <el-tag :type="detail.tradeEnabled ? 'success' : 'info'" size="small">
            {{ detail.tradeEnabled ? '已开启' : '未开启' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="作品状态">
          <el-tag :type="statusTagType(detail.status)" size="small">
            {{ statusText(detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="字数">{{ detail.wordCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="章节数">{{ detail.episodeCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="阅读量">{{ detail.viewCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="收藏量">{{ detail.favoriteCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="销售量">{{ detail.saleCount ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ detail.rating ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="质量等级">{{ detail.qualityLevel || '—' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ detail.reviewTime || '—' }}</el-descriptions-item>
        <el-descriptions-item label="驳回理由" :span="2">{{ detail.rejectReason || '—' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="chapterDialog.visible" :title="`「${chapterDialog.title}」章节列表`" width="780px">
      <el-table v-loading="chapterDialog.loading" :data="chapterDialog.list" style="width: 100%">
        <el-table-column prop="chapterNo" label="章节号" width="100" />
        <el-table-column prop="chapterTitle" label="章节标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="wordCount" label="字数" width="100" />
        <el-table-column label="免费" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isFree === 1 ? 'success' : 'warning'" size="small">
              {{ row.isFree === 1 ? '免费' : '付费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <template #empty>
          <el-empty description="暂无章节数据" :image-size="80" />
        </template>
      </el-table>
      <div class="chapter-pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="chapterDialog.total"
          :current-page="chapterDialog.pageNum"
          :page-size="chapterDialog.pageSize"
          @current-change="onChapterPageChange"
        />
      </div>
      <template #footer>
        <el-button @click="chapterDialog.visible = false">关闭</el-button>
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
import { listWork, getWork, listWorkChapters } from '@/api/content'
import { WORK_TYPE, TRADE_TYPE, contentEnumLabel } from '@/constants/contentEnum'

defineOptions({ name: 'ContentWork' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  status: '',
  workType: '',
  tradeType: ''
})

const STATUS_LABEL_MAP = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  on_shelf: '已上架',
  off_shelf: '已下架'
}
const STATUS_TAG_TYPE_MAP = {
  draft: 'info',
  pending: 'warning',
  approved: 'primary',
  on_shelf: 'success',
  off_shelf: 'danger'
}
function statusText(status) {
  return STATUS_LABEL_MAP[status] || status || '—'
}
function statusTagType(status) {
  return STATUS_TAG_TYPE_MAP[status] || 'info'
}

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    title: queryParams.title || undefined,
    status: queryParams.status || undefined,
    workType: queryParams.workType || undefined,
    tradeType: queryParams.tradeType || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listWork(buildQuery())
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
  queryParams.title = ''
  queryParams.status = ''
  queryParams.workType = ''
  queryParams.tradeType = ''
  handleQuery()
}

const detailDialog = reactive({ visible: false, loading: false })
const detail = reactive({})
async function openDetail(row) {
  detailDialog.visible = true
  detailDialog.loading = true
  Object.keys(detail).forEach((k) => delete detail[k])
  try {
    const res = await getWork(row.workId)
    const data = res?.data || res || {}
    Object.assign(detail, data)
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    detailDialog.loading = false
  }
}

const chapterDialog = reactive({
  visible: false,
  loading: false,
  workId: null,
  title: '',
  list: [],
  total: 0,
  pageNum: 1,
  pageSize: 10
})
async function loadChapters() {
  chapterDialog.loading = true
  try {
    const res = await listWorkChapters(chapterDialog.workId, {
      pageNum: chapterDialog.pageNum,
      pageSize: chapterDialog.pageSize
    })
    chapterDialog.list = res?.rows || []
    chapterDialog.total = Number(res?.total || 0)
  } catch {
    chapterDialog.list = []
    chapterDialog.total = 0
  } finally {
    chapterDialog.loading = false
  }
}
function openChapters(row) {
  chapterDialog.workId = row.workId
  chapterDialog.title = row.title || ''
  chapterDialog.pageNum = 1
  chapterDialog.list = []
  chapterDialog.total = 0
  chapterDialog.visible = true
  loadChapters()
}
function onChapterPageChange(pageNum) {
  chapterDialog.pageNum = pageNum
  loadChapters()
}

onMounted(loadList)
</script>

<style scoped>
.chapter-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
