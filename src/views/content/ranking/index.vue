<template>
  <PageContainer>
    <PageHeader title="排行榜管理" description="查看榜单数据、调整排名、触发重算">
      <template #actions>
        <BlackButton v-permission="['content:ranking:edit']" @click="openRecompute">触发重算</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <!-- 榜单类型枚举值暂无文档依据，先按自由文本精确查询，文档补齐后改下拉 -->
        <el-input
          v-model="queryParams.rankingType"
          placeholder="榜单类型"
          style="width: 160px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option label="有效" value="0" />
          <el-option label="失效" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="queryParams.periodStart"
          type="date"
          placeholder="周期开始"
          value-format="YYYY-MM-DD"
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="queryParams.periodEnd"
          type="date"
          placeholder="周期结束"
          value-format="YYYY-MM-DD"
          style="width: 160px"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无榜单数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="rankingId" label="榜单ID" width="90" />
      <el-table-column prop="rankingType" label="榜单类型" width="120" />
      <el-table-column prop="workTitle" label="作品标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="排名" width="140">
        <template #default="{ row }">
          <el-input-number
            v-model="row.rankNo"
            :min="1"
            :max="9999"
            size="small"
            controls-position="right"
            style="width: 88px"
          />
          <el-button
            v-permission="['content:ranking:edit']"
            size="small"
            link
            type="primary"
            :loading="sortingId === row.rankingId"
            @click="handleSort(row)"
          >保存</el-button>
        </template>
      </el-table-column>
      <el-table-column label="周期开始" width="110">
        <template #default="{ row }">{{ row.periodStart || '—' }}</template>
      </el-table-column>
      <el-table-column label="周期结束" width="110">
        <template #default="{ row }">{{ row.periodEnd || '—' }}</template>
      </el-table-column>
      <el-table-column prop="score" label="分数" width="100" />
      <el-table-column prop="viewCount" label="阅读量" width="90" />
      <el-table-column prop="bookshelfCount" label="收藏量" width="90" />
      <el-table-column prop="growthScore" label="增长分" width="100" />
      <el-table-column label="快照时间" width="170">
        <template #default="{ row }">{{ row.snapshotTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' || row.status === 0 ? 'success' : 'info'" size="small">
            {{ row.status === '0' || row.status === 0 ? '有效' : '失效' }}
          </el-tag>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog v-model="recomputeDialog.visible" title="触发榜单重算" width="480px">
      <el-form :model="recomputeForm" label-width="100px">
        <el-form-item label="榜单类型">
          <el-input v-model="recomputeForm.rankingType" placeholder="如 view_rank" />
        </el-form-item>
        <el-form-item label="指标">
          <el-select v-model="recomputeForm.metric" placeholder="请选择" style="width: 100%">
            <el-option label="阅读量(view_count)" value="view_count" />
            <el-option label="收藏量(bookshelf_count)" value="bookshelf_count" />
            <el-option label="增长分(growth_score)" value="growth_score" />
          </el-select>
        </el-form-item>
        <el-form-item label="周期开始">
          <el-date-picker
            v-model="recomputeForm.periodStart"
            type="date"
            placeholder="选择周期开始"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="周期结束">
          <el-date-picker
            v-model="recomputeForm.periodEnd"
            type="date"
            placeholder="选择周期结束"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recomputeDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="recomputing" @click="handleRecompute">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { listRanking, changeRankNo, recomputeRanking } from '@/api/content'

defineOptions({ name: 'ContentRanking' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  rankingType: '',
  status: '',
  periodStart: '',
  periodEnd: ''
})

const sortingId = ref(null)

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    rankingType: queryParams.rankingType || undefined,
    status: queryParams.status || undefined,
    periodStart: queryParams.periodStart || undefined,
    periodEnd: queryParams.periodEnd || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listRanking(buildQuery())
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
  queryParams.rankingType = ''
  queryParams.status = ''
  queryParams.periodStart = ''
  queryParams.periodEnd = ''
  handleQuery()
}

async function handleSort(row) {
  if (row.rankNo === null || row.rankNo === undefined) {
    ElMessage.warning('请输入排名')
    return
  }
  sortingId.value = row.rankingId
  try {
    await changeRankNo({ rankingId: row.rankingId, rankNo: row.rankNo })
    ElMessage.success('排名已更新')
  } catch {
    // 失败后重新拉取，回滚界面上的本地改动
    await loadList()
  } finally {
    sortingId.value = null
  }
}

const recomputeDialog = reactive({ visible: false })
const recomputing = ref(false)
const recomputeForm = reactive({
  rankingType: '',
  metric: '',
  periodStart: '',
  periodEnd: ''
})
function openRecompute() {
  recomputeForm.rankingType = ''
  recomputeForm.metric = ''
  recomputeForm.periodStart = ''
  recomputeForm.periodEnd = ''
  recomputeDialog.visible = true
}
async function handleRecompute() {
  if (!recomputeForm.rankingType) {
    ElMessage.warning('请输入榜单类型')
    return
  }
  if (!recomputeForm.metric) {
    ElMessage.warning('请选择指标')
    return
  }
  if (!recomputeForm.periodStart || !recomputeForm.periodEnd) {
    ElMessage.warning('请选择周期开始与结束时间')
    return
  }
  recomputing.value = true
  try {
    const res = await recomputeRanking({
      rankingType: recomputeForm.rankingType,
      metric: recomputeForm.metric,
      periodStart: recomputeForm.periodStart,
      periodEnd: recomputeForm.periodEnd
    })
    const data = res?.data || res || {}
    const newCount = data.newSnapshotCount
    const oldCount = data.oldInvalidatedCount
    ElMessage.success(
      `重算成功：新增快照 ${newCount ?? 0} 条，旧快照失效 ${oldCount ?? 0} 条`
    )
    recomputeDialog.visible = false
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    recomputing.value = false
  }
}

onMounted(loadList)
</script>
