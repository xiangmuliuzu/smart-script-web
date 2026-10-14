<template>
  <PageContainer>
    <PageHeader title="作品管理" description="管理全部作品及其章节、书城展示作品与推荐" />

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- ============ 全部作品 ============ -->
      <el-tab-pane label="全部作品" name="all">
        <FilterBar @query="handleAllQuery" @reset="handleAllReset">
          <el-form-item>
            <el-input
              v-model="allQuery.title"
              placeholder="作品标题"
              style="width: 180px"
              clearable
              @keyup.enter="handleAllQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="allQuery.status" placeholder="全部状态" style="width: 140px" clearable>
              <el-option label="草稿" value="draft" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
              <el-option label="已上架" value="on_shelf" />
              <el-option label="已下架" value="off_shelf" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="allQuery.workType" placeholder="全部作品类型" style="width: 160px" clearable>
              <el-option v-for="t in WORK_TYPE" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="allQuery.tradeType" placeholder="全部交易类型" style="width: 160px" clearable>
              <el-option v-for="t in TRADE_TYPE" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="allQuery.pageNum"
          v-model:pageSize="allQuery.pageSize"
          :data="allList"
          :loading="allLoading"
          :total="allTotal"
          empty-text="暂无作品数据"
          @page-change="loadAllList"
          @size-change="loadAllList"
        >
          <el-table-column label="封面" width="72">
            <template #default="{ row }">
              <CoverThumb :url="row.cover" />
            </template>
          </el-table-column>
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
          <el-table-column prop="wordCount" label="字数" width="90" />
          <el-table-column prop="episodeCount" label="章节数" width="90" />
          <el-table-column prop="viewCount" label="阅读量" width="90" />
          <el-table-column label="创建时间" width="165">
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
              <!-- tradeEnabled 实体为 String（"1"/"0"），"0" 是 truthy，须按字符串判断 -->
              <el-tag :type="detail.tradeEnabled === '1' ? 'success' : 'info'" size="small">
                {{ detail.tradeEnabled === '1' ? '已开启' : '未开启' }}
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
                <!-- is_free 为 tinyint，后端实体 String 返回字符串 "1"/"0"，须按字符串比较 -->
                <el-tag :type="row.isFree === '1' ? 'success' : 'warning'" size="small">
                  {{ row.isFree === '1' ? '免费' : '付费' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <!-- 章节 status：0=正常 1=停用 -->
                <el-tag :type="row.status === '1' ? 'danger' : 'success'" size="small">
                  {{ row.status === '1' ? '停用' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
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
      </el-tab-pane>

      <!-- ============ 书城作品（仅已上架，即出现在书城里的作品） ============ -->
      <el-tab-pane label="书城作品" name="bookstore">
        <FilterBar @query="handleBookQuery" @reset="handleBookReset">
          <el-form-item>
            <el-input
              v-model="bookQuery.title"
              placeholder="作品标题"
              style="width: 180px"
              clearable
              @keyup.enter="handleBookQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="bookQuery.recommendStatus" placeholder="推荐状态" style="width: 150px" clearable>
              <el-option label="首页热门" value="home_hot" />
              <el-option label="分类推荐" value="category_rec" />
              <el-option label="无推荐" value="none" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="bookQuery.tradeEnabled" placeholder="交易状态" style="width: 140px" clearable>
              <el-option label="开启交易" :value="1" />
              <el-option label="关闭交易" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-alert
              type="info"
              :closable="false"
              title="仅列出已上架（出现在书城）的作品"
              style="width: 260px"
            />
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="bookQuery.pageNum"
          v-model:pageSize="bookQuery.pageSize"
          :data="bookList"
          :loading="bookLoading"
          :total="bookTotal"
          empty-text="书城暂无已上架作品"
          @page-change="loadBookList"
          @size-change="loadBookList"
        >
          <el-table-column label="封面" width="72">
            <template #default="{ row }">
              <CoverThumb :url="row.cover" />
            </template>
          </el-table-column>
          <el-table-column prop="workId" label="作品ID" width="90" />
          <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
          <el-table-column prop="authorName" label="作者" width="120" show-overflow-tooltip />
          <el-table-column label="推荐状态" width="120">
            <template #default="{ row }">
              <el-tag :type="recommendTagType(row.recommendStatus)" size="small">
                {{ recommendText(row.recommendStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上下架" width="100">
            <template #default="{ row }">
              <el-switch
                v-permission="['content:bookstore:edit']"
                v-model="row.status"
                active-value="on_shelf"
                inactive-value="off_shelf"
                @change="() => handleBookStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="交易" width="100">
            <template #default="{ row }">
              <el-switch
                v-permission="['content:bookstore:edit']"
                v-model="row.tradeEnabled"
                active-value="1"
                inactive-value="0"
                :disabled="row.status !== 'on_shelf'"
                @change="() => handleBookTradeChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="viewCount" label="阅读量" width="90" />
          <el-table-column label="创建时间" width="165">
            <template #default="{ row }">{{ row.createTime || '—' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="['content:bookstore:edit']"
                size="small"
                link
                type="primary"
                @click="openEditExt(row)"
              >编辑推荐</el-button>
            </template>
          </el-table-column>
        </TableCard>

        <el-dialog v-model="extDialog.visible" title="编辑推荐" width="520px">
          <el-form :model="form" label-width="90px">
            <el-form-item label="推荐状态">
              <el-select v-model="form.recommendStatus" style="width: 100%" @change="handleRecommendChange">
                <el-option label="首页热门" value="home_hot" />
                <el-option label="分类推荐" value="category_rec" />
                <el-option label="无推荐" value="none" />
              </el-select>
            </el-form-item>
            <el-form-item label="展示位">
              <el-checkbox-group v-model="form.showScope" :disabled="form.recommendStatus === 'none'">
                <el-checkbox label="bookstore">书城</el-checkbox>
                <el-checkbox label="category_page">分类页</el-checkbox>
                <el-checkbox label="search">搜索页</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="推荐权重">
              <el-input-number v-model="form.recommendWeight" :min="0" :max="9999" :disabled="form.recommendStatus === 'none'" />
            </el-form-item>
            <el-form-item label="失效时间">
              <el-date-picker
                v-model="form.recommendExpireAt"
                type="datetime"
                placeholder="选择推荐失效时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled="form.recommendStatus === 'none'"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="extDialog.visible = false">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleExtSubmit">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import CoverThumb from './cover-thumb.vue'
import {
  listWork, getWork, listWorkChapters,
  listBookstore, getBookstore, changeBookstoreStatus,
  changeBookstoreTrade, updateBookstoreExt
} from '@/api/content'
import { WORK_TYPE, TRADE_TYPE, contentEnumLabel } from '@/constants/contentEnum'

defineOptions({ name: 'ContentWork' })

const activeTab = ref('all')

// ============ 全部作品 ============
const allLoading = ref(false)
const allList = ref([])
const allTotal = ref(0)
const allQuery = reactive({ pageNum: 1, pageSize: 10, title: '', status: '', workType: '', tradeType: '' })

const STATUS_LABEL_MAP = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  on_shelf: '已上架',
  off_shelf: '已下架'
}
const STATUS_TAG_TYPE_MAP = {
  draft: 'info',
  pending: 'warning',
  approved: 'primary',
  rejected: 'danger',
  on_shelf: 'success',
  off_shelf: 'danger'
}
function statusText(status) {
  return STATUS_LABEL_MAP[status] || status || '—'
}
function statusTagType(status) {
  return STATUS_TAG_TYPE_MAP[status] || 'info'
}

function buildAllQuery() {
  return {
    pageNum: allQuery.pageNum,
    pageSize: allQuery.pageSize,
    title: allQuery.title || undefined,
    status: allQuery.status || undefined,
    workType: allQuery.workType || undefined,
    tradeType: allQuery.tradeType || undefined
  }
}

async function loadAllList() {
  allLoading.value = true
  try {
    const res = await listWork(buildAllQuery())
    allList.value = res?.rows || []
    allTotal.value = Number(res?.total || 0)
  } catch {
    allList.value = []
    allTotal.value = 0
  } finally {
    allLoading.value = false
  }
}

function handleAllQuery() {
  allQuery.pageNum = 1
  loadAllList()
}

function handleAllReset() {
  allQuery.title = ''
  allQuery.status = ''
  allQuery.workType = ''
  allQuery.tradeType = ''
  handleAllQuery()
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

// ============ 书城作品（仅已上架） ============
const bookLoading = ref(false)
const bookList = ref([])
const bookTotal = ref(0)
const bookQuery = reactive({ pageNum: 1, pageSize: 10, title: '', recommendStatus: '', tradeEnabled: '' })

const RECOMMEND_TAG_MAP = {
  home_hot: { text: '首页热门', type: 'warning' },
  category_rec: { text: '分类推荐', type: 'success' },
  none: { text: '无推荐', type: 'info' }
}
function recommendText(status) {
  return RECOMMEND_TAG_MAP[status]?.text || status || '—'
}
function recommendTagType(status) {
  return RECOMMEND_TAG_MAP[status]?.type || 'info'
}

/** 书城列表只管理「已上架（出现在书城）的作品」，故固定 status=on_shelf */
function buildBookQuery() {
  return {
    pageNum: bookQuery.pageNum,
    pageSize: bookQuery.pageSize,
    title: bookQuery.title || undefined,
    recommendStatus: bookQuery.recommendStatus || undefined,
    status: 'on_shelf',
    tradeEnabled: bookQuery.tradeEnabled === '' ? undefined : bookQuery.tradeEnabled
  }
}

async function loadBookList() {
  bookLoading.value = true
  try {
    const res = await listBookstore(buildBookQuery())
    bookList.value = res?.rows || []
    bookTotal.value = Number(res?.total || 0)
  } catch {
    bookList.value = []
    bookTotal.value = 0
  } finally {
    bookLoading.value = false
  }
}

function handleBookQuery() {
  bookQuery.pageNum = 1
  loadBookList()
}

function handleBookReset() {
  bookQuery.title = ''
  bookQuery.recommendStatus = ''
  bookQuery.tradeEnabled = ''
  handleBookQuery()
}

async function handleBookStatusChange(row) {
  const targetStatus = row.status
  const actionText = targetStatus === 'on_shelf' ? '上架' : '下架'
  try {
    await changeBookstoreStatus({ workId: row.workId, status: targetStatus })
    // 下架即移出书城，刷新列表使该行从「书城作品」消失
    if (targetStatus === 'off_shelf') {
      row.tradeEnabled = '0'
      loadBookList()
    }
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.status = targetStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  }
}

async function handleBookTradeChange(row) {
  const targetTrade = row.tradeEnabled
  const actionText = targetTrade === '1' ? '开启交易' : '关闭交易'
  try {
    await changeBookstoreTrade({ workId: row.workId, tradeEnabled: targetTrade })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.tradeEnabled = targetTrade === '1' ? '0' : '1'
  }
}

const extDialog = reactive({ visible: false })
const submitting = ref(false)
const SCOPE_OPTIONS = ['bookstore', 'category_page', 'search']
const RECOMMEND_DEFAULT_SCOPE = {
  home_hot: ['bookstore'],
  category_rec: ['category_page'],
  none: []
}
const extraExtKeys = ref({})
const form = reactive({
  workId: null,
  recommendStatus: 'none',
  showScope: [],
  recommendWeight: 0,
  recommendExpireAt: ''
})

function resetRecommendFields() {
  form.recommendStatus = 'none'
  form.showScope = []
  form.recommendWeight = 0
  form.recommendExpireAt = ''
}

function handleRecommendChange(val) {
  if (!val || val === 'none') {
    form.showScope = []
    form.recommendWeight = 0
    form.recommendExpireAt = ''
  } else {
    form.showScope = [...RECOMMEND_DEFAULT_SCOPE[val]]
  }
}

function parseExtJsonToForm(extJsonStr) {
  resetRecommendFields()
  extraExtKeys.value = {}
  if (!extJsonStr) return
  try {
    const obj = JSON.parse(extJsonStr)
    form.recommendStatus = obj.recommendStatus || 'none'
    form.showScope = Array.isArray(obj.showScope)
      ? obj.showScope.filter((s) => SCOPE_OPTIONS.includes(s))
      : []
    form.recommendWeight = typeof obj.recommendWeight === 'number' ? obj.recommendWeight : 0
    form.recommendExpireAt = obj.recommendExpireAt || ''
    const known = ['recommendStatus', 'showScope', 'recommendWeight', 'recommendExpireAt']
    for (const [k, v] of Object.entries(obj)) {
      if (!known.includes(k)) extraExtKeys.value[k] = v
    }
  } catch {
    // 既有 extJson 非合法 JSON：按默认值打开，不丢数据但需重新填写
  }
}

async function openEditExt(row) {
  form.workId = row.workId
  try {
    const res = await getBookstore(row.workId)
    const data = res?.data || res || {}
    parseExtJsonToForm(data.extJson || row.extJson || '')
  } catch {
    parseExtJsonToForm(row.extJson || '')
  }
  extDialog.visible = true
}

async function handleExtSubmit() {
  const extObj = {
    ...extraExtKeys.value,
    recommendStatus: form.recommendStatus || 'none',
    showScope: Array.isArray(form.showScope) ? form.showScope : [],
    recommendWeight: form.recommendWeight ?? 0
  }
  if (form.recommendExpireAt) {
    extObj.recommendExpireAt = form.recommendExpireAt
  }
  submitting.value = true
  try {
    await updateBookstoreExt({
      workId: form.workId,
      extJson: JSON.stringify(extObj)
    })
    ElMessage.success('推荐信息已更新')
    extDialog.visible = false
    loadBookList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    submitting.value = false
  }
}

// ============ 切换 Tab：懒加载首次列表 ============
let allLoaded = false
let bookLoaded = false
function handleTabChange(name) {
  if (name === 'bookstore' && !bookLoaded) {
    bookLoaded = true
    loadBookList()
  } else if (name === 'all' && !allLoaded) {
    allLoaded = true
    loadAllList()
  }
}

onMounted(() => {
  allLoaded = true
  loadAllList()
})
</script>

<style scoped>
.chapter-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
