<template>
  <PageContainer>
    <PageHeader title="交易作品管理">
      <template #actions>
        <el-button @click="handleExport">导出</el-button>
        <BlackButton @click="handleCreate">上架新作品</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select
          v-model="query.authorizationType"
          placeholder="全部授权类型"
          style="width: 160px"
          clearable
        >
          <el-option
            v-for="opt in licenseOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="query.listingStatus"
          placeholder="全部上架状态"
          style="width: 150px"
          clearable
        >
          <el-option
            v-for="opt in listingOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="作品名称搜索"
          style="width: 200px"
          clearable
          @keyup.enter="handleQuery"
        />
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
      <el-table-column prop="workNo" label="编号" width="100" />
      <el-table-column prop="title" label="作品名称" min-width="150" />
      <el-table-column prop="authorizationTypeLabel" label="授权类型" width="120" />
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <span class="price-text">{{ row.priceText }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="100" />
      <el-table-column prop="favoriteCount" label="收藏" width="90" />
      <el-table-column label="置顶" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.topped" type="success" size="small">置顶中</el-tag>
          <el-button v-else size="small" @click="handlePin(row)">置顶</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag type="tradeWork" :status="row.listingStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </TableCard>
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
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions } from '@/constants/tradeEnum'
import { getTradeWorks } from '@/api/trade'

defineOptions({ name: 'TradeWorks' })

// 授权类型 / 上架状态枚举统一取自 constants/tradeEnum.js（授权类型以文档 non_exclusive 下划线为准）
const licenseOptions = enumOptions('license')
const listingOptions = enumOptions('tradeWork')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, authorizationType: '', listingStatus: '', keyword: '' })

async function loadList() {
  loading.value = true
  try {
    const res = await getTradeWorks(query.value)
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

async function handlePin(row) {
  try {
    await ElMessageBox.confirm('确认置顶该作品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    row.topped = true
    ElMessage.success(`已置顶作品：${row.title}`)
  } catch {
    // 用户取消操作
  }
}

function handleEdit(row) {
  ElMessage.info(`编辑作品：${row.title}`)
}

function handleCreate() {
  ElMessage.info('上架新作品')
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
</style>
