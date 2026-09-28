<template>
  <PageContainer>
    <PageHeader title="交易作品管理" description="管理已上架的交易作品：授权类型、价格、议价范围、置顶、推荐">
      <template #actions>
        <el-button @click="handleExport">导出</el-button>
        <BlackButton @click="handleCreate">上架新作品</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.authorizationType" placeholder="全部授权类型" style="width: 160px" clearable>
          <el-option v-for="opt in licenseOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.listingStatus" placeholder="全部上架状态" style="width: 150px" clearable>
          <el-option label="已上架" :value="1" />
          <el-option label="未上架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" placeholder="作品名称搜索" style="width: 200px" clearable @keyup.enter="handleQuery" />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="workId" label="ID" width="80" />
      <el-table-column prop="title" label="作品名称" min-width="150" />
      <el-table-column prop="authorName" label="作者" width="100" />
      <el-table-column label="授权类型" width="120">
        <template #default="{ row }">
          {{ enumLabel('license', row.tradeType) }}
        </template>
      </el-table-column>
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <span class="price-text">¥{{ formatPrice(row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="议价范围" width="140">
        <template #default="{ row }">
          <span v-if="row.negotiableMin != null">¥{{ formatPrice(row.negotiableMin) }} ~ ¥{{ formatPrice(row.negotiableMax) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="80" />
      <el-table-column prop="favoriteCount" label="收藏" width="70" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.tradeEnabled === 1 ? 'success' : 'info'" size="small" effect="light">
            {{ row.tradeEnabled === 1 ? '已上架' : '未上架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶/推荐" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.isTop === 1" type="danger" size="small" effect="light" style="margin-right: 4px">置顶</el-tag>
          <el-tag v-if="row.isRecommend === 1" type="warning" size="small" effect="light">推荐</el-tag>
          <span v-if="row.isTop !== 1 && row.isRecommend !== 1">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="op-actions">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleUnlist(row)">下架</el-button>
          </div>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 上架/编辑交易设置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '上架新作品' : '编辑交易设置'" width="580px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item v-if="dialogMode === 'create'" label="作品ID" prop="workId">
          <el-input v-model.number="form.workId" placeholder="输入已审核通过的作品ID" />
        </el-form-item>
        <el-form-item v-else label="作品">
          <el-input :model-value="`${form.title} (ID: ${form.workId})`" disabled />
        </el-form-item>
        <el-form-item label="授权类型" prop="tradeType">
          <el-select v-model="form.tradeType" placeholder="请选择授权类型" style="width: 100%">
            <el-option v-for="opt in licenseOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权价格(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="100" style="width: 100%" placeholder="设置授权价格" />
        </el-form-item>
        <el-form-item label="议价下限(元)">
          <el-input-number v-model="form.negotiableMin" :min="0" :precision="2" style="width: 100%" placeholder="可选" />
        </el-form-item>
        <el-form-item label="议价上限(元)">
          <el-input-number v-model="form.negotiableMax" :min="0" :precision="2" style="width: 100%" placeholder="可选" />
        </el-form-item>
        <el-form-item label="报价有效天数">
          <el-input-number v-model="form.quoteValidDays" :min="1" :max="365" style="width: 100%" placeholder="可选" />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-switch v-model="form.isRecommend" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" style="width: 100%" placeholder="数字越小越靠前" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { enumOptions, enumLabel } from '@/constants/tradeEnum'
import { getTradeWorks, createTradeWork, updateTradeWork } from '@/api/trade'

defineOptions({ name: 'TradeWorks' })

const licenseOptions = enumOptions('license')
const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, authorizationType: '', listingStatus: '', keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const form = ref({ workId: null, title: '', tradeType: '', price: null, negotiableMin: null, negotiableMax: null, quoteValidDays: null, isTop: 0, isRecommend: 0, sortOrder: 0 })
const rules = {
  workId: [{ required: true, message: '请输入作品ID', trigger: 'blur' }],
  tradeType: [{ required: true, message: '请选择授权类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入授权价格', trigger: 'blur' }]
}

function formatPrice(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadList() {
  loading.value = true
  try {
    // 前端筛选项与后端 SysWorkMapper 域字段对齐：authorizationType→tradeType，listingStatus→tradeEnabled
    const params = {
      pageNo: query.value.pageNo,
      pageSize: query.value.pageSize,
      keyword: query.value.keyword || undefined,
      tradeType: query.value.authorizationType || undefined,
      tradeEnabled: query.value.listingStatus === '' || query.value.listingStatus == null ? undefined : query.value.listingStatus
    }
    const res = await getTradeWorks(params)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载交易作品列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, authorizationType: '', listingStatus: '', keyword: '' }
  loadList()
}

function handleCreate() {
  dialogMode.value = 'create'
  form.value = { workId: null, title: '', tradeType: '', price: null, negotiableMin: null, negotiableMax: null, quoteValidDays: null, isTop: 0, isRecommend: 0, sortOrder: 0 }
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    workId: row.workId,
    title: row.title,
    tradeType: row.tradeType || '',
    price: row.price,
    negotiableMin: row.negotiableMin,
    negotiableMax: row.negotiableMax,
    quoteValidDays: row.quoteValidDays,
    isTop: row.isTop ?? 0,
    isRecommend: row.isRecommend ?? 0,
    sortOrder: row.sortOrder ?? 0
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await createTradeWork(form.value)
        ElMessage.success('上架成功')
      } else {
        await updateTradeWork(form.value.workId, form.value)
        ElMessage.success('交易设置已更新')
      }
      dialogVisible.value = false
      loadList()
    } catch (e) {
      ElMessage.error(e?.response?.data?.msg || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

async function handleUnlist(row) {
  try {
    await ElMessageBox.confirm(`确认下架作品「${row.title}」吗？`, '下架确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateTradeWork(row.workId, { tradeEnabled: 0 })
    ElMessage.success('已下架')
    loadList()
  } catch {
    // 用户取消
  }
}

function handleExport() {
  ElMessage.info('导出交易作品')
}

onMounted(loadList)
</script>

<style scoped>
.price-text {
  color: #1f2329;
  font-weight: 600;
}
/* 操作列按钮强制单排：不换行，间距由 el-button 相邻外边距提供 */
.op-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}
</style>
