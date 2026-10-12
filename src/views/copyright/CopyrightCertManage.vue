<template>
  <PageContainer>
    <PageHeader title="电子证书管理" description="查看版权存证证书列表、查看详情并下载证书文件。" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 150px">
          <el-option label="申请中" value="pending" />
          <el-option label="已签发" value="issued" />
          <el-option label="已失效" value="expired" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" clearable placeholder="证书编号 / 作品名称" style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="query.pageNo"
      v-model:pageSize="query.pageSize"
      :data="rows"
      :loading="loading"
      :total="total"
      :empty-text="loadFailed ? '加载失败，请重试' : '暂无证书记录'"
      @page-change="loadRows"
      @size-change="loadRows"
    >
      <template #actions>
        <el-button v-if="loadFailed" link type="primary" @click="loadRows">重试</el-button>
      </template>
      <el-table-column prop="certId" label="证书ID" width="90" />
      <el-table-column prop="certNo" label="证书编号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="workName" label="作品名称" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">{{ row.workName || '—' }}</template>
      </el-table-column>
      <el-table-column prop="userName" label="申请人" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.userName || '—' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="170" />
      <el-table-column prop="certTime" label="签发时间" width="170">
        <template #default="{ row }">{{ row.certTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <el-button v-if="row.status === 'issued' && row.certUrl" link type="primary" :loading="downloadingCertId === row.certId" @click="downloadCert(row)">下载</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-drawer v-model="detailVisible" title="证书详情" size="600px">
      <div v-loading="detailLoading" class="drawer-content">
        <template v-if="detail">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="证书ID">{{ detail.certId }}</el-descriptions-item>
            <el-descriptions-item label="证书编号">{{ detail.certNo }}</el-descriptions-item>
            <el-descriptions-item label="作品ID">{{ detail.workId }}</el-descriptions-item>
            <el-descriptions-item label="作品名称">{{ detail.workName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ detail.userName || '—' }}</el-descriptions-item>
            <el-descriptions-item label="区块链哈希">
              <span v-if="detail.blockchainHash" class="hash-text">{{ detail.blockchainHash }}</span>
              <span v-else>—</span>
            </el-descriptions-item>
            <el-descriptions-item label="证书状态">
              <el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ detail.applyTime }}</el-descriptions-item>
            <el-descriptions-item label="签发时间">{{ detail.certTime || '—' }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detail.remark || '—' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
    </el-drawer>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { getCopyrightCertList, getCopyrightCertDetail, downloadCopyrightCert } from '@/api/copyright'

const query = reactive({
  pageNo: 1,
  pageSize: 10,
  status: '',
  keyword: ''
})

const rows = ref([])
const total = ref(0)
const loading = ref(false)
const loadFailed = ref(false)
let requestId = 0

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)
const downloadingCertId = ref(null)

function statusLabel(status) {
  const map = { pending: '申请中', issued: '已签发', expired: '已失效' }
  return map[status] || status
}

function statusType(status) {
  const map = { pending: 'warning', issued: 'success', expired: 'info' }
  return map[status] || 'info'
}

function handleQuery() {
  query.pageNo = 1
  loadRows()
}

function handleReset() {
  query.status = ''
  query.keyword = ''
  query.pageNo = 1
  loadRows()
}

async function loadRows() {
  const currentRequestId = ++requestId
  loading.value = true
  loadFailed.value = false
  try {
    const result = await getCopyrightCertList(query)
    if (!Array.isArray(result?.rows) || !Number.isFinite(Number(result.total))) {
      throw new Error('证书列表接口响应格式无效')
    }
    if (currentRequestId === requestId) {
      rows.value = result.rows
      total.value = Number(result.total)
    }
  } catch {
    if (currentRequestId === requestId) {
      rows.value = []
      total.value = 0
      loadFailed.value = true
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

async function openDetail(row) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getCopyrightCertDetail(row.certId)
  } catch (error) {
    ElMessage.error(error?.message || '加载证书详情失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function downloadCert(row) {
  if (downloadingCertId.value) return
  downloadingCertId.value = row.certId
  try {
    const blob = await downloadCopyrightCert(row.certId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `证书_${row.certNo}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('证书下载成功')
  } catch (error) {
    ElMessage.error(error?.message || '证书下载失败')
  } finally {
    downloadingCertId.value = null
  }
}

onMounted(loadRows)
</script>

<style scoped>
.drawer-content { min-height: 180px; }
.hash-text { font-family: monospace; font-size: 12px; word-break: break-all; }
</style>
