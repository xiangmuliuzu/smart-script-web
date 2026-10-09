<template>
  <PageContainer>
    <PageHeader title="上下架管理" description="管理外部视频上下架状态与同步">
      <template #actions>
        <BlackButton
          v-permission="['content:dramastatus:edit']"
          :disabled="selectedIds.length === 0"
          :loading="syncing"
          @click="handleBatchSync"
        >批量同步</BlackButton>
      </template>
    </PageHeader>

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
        <el-select v-model="queryParams.status" placeholder="全部上下架" style="width: 150px" clearable>
          <el-option label="已上架" value="on_shelf" />
          <el-option label="已下架" value="off_shelf" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <!-- 同步状态枚举值暂无文档依据，先按自由文本精确查询 -->
        <el-input
          v-model="queryParams.syncStatus"
          placeholder="同步状态"
          style="width: 150px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="dramaId" label="视频ID" width="90" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="channelId" label="渠道ID" width="90" />
        <el-table-column label="上下架" width="110">
          <template #default="{ row }">
            <el-switch
              v-permission="['content:dramastatus:edit']"
              v-model="row.status"
              active-value="on_shelf"
              inactive-value="off_shelf"
              @change="() => handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="同步状态" width="120">
          <template #default="{ row }">
            <el-tag :type="syncTagType(row.syncStatus)" size="small">
              {{ row.syncStatus || '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authorizationStatus" label="授权状态" width="120" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="['content:dramastatus:edit']"
              size="small"
              link
              type="primary"
              :loading="syncingId === row.dramaId"
              @click="handleSingleSync(row)"
            >同步</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无上下架数据" :image-size="72" />
        </template>
      </el-table>

      <div class="table-footer">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import {
  listDramaStatus,
  changeDramaStatus,
  syncDrama
} from '@/api/content'

defineOptions({ name: 'ExternalDramaStatus' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  channelId: '',
  status: '',
  syncStatus: ''
})

const selectedIds = ref([])
const syncing = ref(false)
const syncingId = ref(null)

/** 同步状态标签颜色：成功 success，失败/异常 danger，其余 info */
function syncTagType(status) {
  if (!status) return 'info'
  const s = String(status).toLowerCase()
  if (s.includes('success') || s.includes('done') || s.includes('ok')) return 'success'
  if (s.includes('fail') || s.includes('error') || s.includes('pending')) return 'danger'
  return 'info'
}

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    channelId: queryParams.channelId || undefined,
    status: queryParams.status || undefined,
    syncStatus: queryParams.syncStatus || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listDramaStatus(buildQuery())
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
  queryParams.status = ''
  queryParams.syncStatus = ''
  handleQuery()
}

function onPageChange(val) {
  queryParams.pageNum = val
  loadList()
}

function onSizeChange(val) {
  queryParams.pageSize = val
  queryParams.pageNum = 1
  loadList()
}

function handleSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.dramaId)
}

async function handleStatusChange(row) {
  const targetStatus = row.status
  const actionText = targetStatus === 'on_shelf' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认${actionText}视频「${row.title}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    row.status = targetStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf'
    return
  }
  try {
    await changeDramaStatus({ dramaId: row.dramaId, status: targetStatus })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.status = targetStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf'
  }
}

/** 单条同步：仅传单元素数组 */
async function handleSingleSync(row) {
  try {
    await ElMessageBox.confirm(`确认同步视频「${row.title}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  syncingId.value = row.dramaId
  try {
    await syncDrama([row.dramaId])
    ElMessage.success('同步已触发')
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    syncingId.value = null
  }
}

/** 批量同步：收集勾选项 ID 调用 sync 接口 */
async function handleBatchSync() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先勾选要同步的视频')
    return
  }
  try {
    await ElMessageBox.confirm(`确认同步选中的 ${selectedIds.value.length} 条视频？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  syncing.value = true
  try {
    await syncDrama(selectedIds.value)
    ElMessage.success('同步已触发')
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    syncing.value = false
  }
}

onMounted(loadList)
</script>

<style scoped>
.table-card {
  margin-bottom: 20px;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0 18px;
}
</style>
