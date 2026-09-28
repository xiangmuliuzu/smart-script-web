<template>
  <PageContainer>
    <PageHeader title="书城作品管理" description="管理作品展示范围、推荐状态与上下架" />

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
        <el-select v-model="queryParams.recommendStatus" placeholder="推荐状态" style="width: 150px" clearable>
          <el-option label="首页热门" value="home_hot" />
          <el-option label="分类推荐" value="category_rec" />
          <el-option label="无推荐" value="none" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部上下架" style="width: 150px" clearable>
          <el-option label="已上架" value="on_shelf" />
          <el-option label="已下架" value="off_shelf" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.tradeEnabled" placeholder="交易状态" style="width: 140px" clearable>
          <el-option label="开启交易" :value="1" />
          <el-option label="关闭交易" :value="0" />
        </el-select>
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无书城作品数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="workId" label="作品ID" width="90" />
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
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
            @change="() => handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="交易" width="100">
        <template #default="{ row }">
          <el-switch
            v-permission="['content:bookstore:edit']"
            v-model="row.tradeEnabled"
            :active-value="1"
            :inactive-value="0"
            @change="() => handleTradeChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="阅读量" width="90" />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
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

    <el-dialog v-model="dialog.visible" title="编辑推荐扩展信息" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="推荐状态">
          <el-select v-model="form.recommendStatus" placeholder="请选择" style="width: 100%">
            <el-option label="首页热门" value="home_hot" />
            <el-option label="分类推荐" value="category_rec" />
            <el-option label="无推荐" value="none" />
          </el-select>
        </el-form-item>
        <el-form-item label="展示位">
          <el-checkbox-group v-model="form.showScope">
            <el-checkbox label="bookstore">书城</el-checkbox>
            <el-checkbox label="category_page">分类页</el-checkbox>
            <el-checkbox label="search">搜索页</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="推荐权重">
          <el-input-number v-model="form.recommendWeight" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="失效时间">
          <el-date-picker
            v-model="form.recommendExpireAt"
            type="datetime"
            placeholder="选择推荐失效时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="extJson 原文">
          <el-input
            v-model="form.extJsonRaw"
            type="textarea"
            :rows="5"
            placeholder='{"recommendStatus":"home_hot","showScope":["bookstore"],"recommendWeight":100}'
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" @click="syncFormToRaw">从表单同步到 extJson</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  listBookstore,
  getBookstore,
  changeBookstoreStatus,
  changeBookstoreTrade,
  updateBookstoreExt
} from '@/api/content'

defineOptions({ name: 'ContentBookstore' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  recommendStatus: '',
  status: '',
  tradeEnabled: ''
})

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

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    title: queryParams.title || undefined,
    recommendStatus: queryParams.recommendStatus || undefined,
    status: queryParams.status || undefined,
    tradeEnabled: queryParams.tradeEnabled === '' ? undefined : queryParams.tradeEnabled
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listBookstore(buildQuery())
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
  queryParams.recommendStatus = ''
  queryParams.status = ''
  queryParams.tradeEnabled = ''
  handleQuery()
}

async function handleStatusChange(row) {
  const targetStatus = row.status
  const actionText = targetStatus === 'on_shelf' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认${actionText}作品「${row.title}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    row.status = targetStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf'
    return
  }
  try {
    await changeBookstoreStatus({ workId: row.workId, status: targetStatus })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.status = targetStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  }
}

async function handleTradeChange(row) {
  const targetTrade = row.tradeEnabled
  const actionText = targetTrade === 1 ? '开启交易' : '关闭交易'
  try {
    await ElMessageBox.confirm(`确认${actionText}作品「${row.title}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    row.tradeEnabled = targetTrade === 1 ? 0 : 1
    return
  }
  try {
    await changeBookstoreTrade({ workId: row.workId, tradeEnabled: targetTrade })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.tradeEnabled = targetTrade === 1 ? 0 : 1
  }
}

const dialog = reactive({ visible: false })
const submitting = ref(false)
const SCOPE_OPTIONS = ['bookstore', 'category_page', 'search']
const defaultForm = () => ({
  workId: null,
  recommendStatus: 'none',
  showScope: [],
  recommendWeight: 0,
  recommendExpireAt: '',
  extJsonRaw: ''
})
const form = reactive(defaultForm())

function syncFormToRaw() {
  const obj = {
    recommendStatus: form.recommendStatus || 'none',
    showScope: Array.isArray(form.showScope) ? form.showScope : [],
    recommendWeight: form.recommendWeight ?? 0,
    recommendExpireAt: form.recommendExpireAt || null
  }
  form.extJsonRaw = JSON.stringify(obj, null, 2)
}

function parseExtJsonToForm(extJsonStr) {
  if (!extJsonStr) {
    Object.assign(form, defaultForm())
    syncFormToRaw()
    return
  }
  try {
    const obj = JSON.parse(extJsonStr)
    form.recommendStatus = obj.recommendStatus || 'none'
    form.showScope = Array.isArray(obj.showScope)
      ? obj.showScope.filter((s) => SCOPE_OPTIONS.includes(s))
      : []
    form.recommendWeight = typeof obj.recommendWeight === 'number' ? obj.recommendWeight : 0
    form.recommendExpireAt = obj.recommendExpireAt || ''
    form.extJsonRaw = JSON.stringify(obj, null, 2)
  } catch {
    // 既有 extJson 非合法 JSON：保留原文让用户自行修正
    Object.assign(form, defaultForm())
    form.extJsonRaw = extJsonStr
  }
}

async function openEditExt(row) {
  Object.assign(form, defaultForm())
  form.workId = row.workId
  try {
    const res = await getBookstore(row.workId)
    const data = res?.data || res || {}
    const rowExt = data.extJson || row.extJson || ''
    parseExtJsonToForm(rowExt)
  } catch {
    // 详情接口失败时回退到行内 extJson
    parseExtJsonToForm(row.extJson || '')
  }
  dialog.visible = true
}

async function handleSubmit() {
  let extObj
  try {
    extObj = form.extJsonRaw ? JSON.parse(form.extJsonRaw) : {}
  } catch (e) {
    ElMessage.error('extJson 不是合法 JSON，请检查或点击“从表单同步到 extJson”')
    return
  }
  submitting.value = true
  try {
    await updateBookstoreExt({
      workId: form.workId,
      extJson: JSON.stringify(extObj)
    })
    ElMessage.success('推荐信息已更新')
    dialog.visible = false
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    submitting.value = false
  }
}

onMounted(loadList)
</script>
