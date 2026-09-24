<template>
  <PageContainer>
    <PageHeader title="询盘管理" description="买方对交易作品发起的询盘，处理后可转为授权订单（订单生成后交 D 接手）">
      <template #actions>
        <el-button @click="handleExport">导出</el-button>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option
            v-for="opt in inquiryStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.licenseType" placeholder="全部授权类型" style="width: 150px" clearable>
          <el-option
            v-for="opt in licenseOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="作品名称/询盘编号"
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
      <el-table-column prop="inquiryNo" label="询盘编号" width="120" />
      <el-table-column prop="workTitle" label="作品" min-width="130" />
      <el-table-column prop="buyer" label="买方" width="120" />
      <el-table-column prop="seller" label="卖方" width="100" />
      <el-table-column prop="licenseTypeLabel" label="授权类型" width="110" />
      <el-table-column prop="intendedUse" label="意向用途" min-width="130" />
      <el-table-column label="预算" width="110">
        <template #default="{ row }">
          <span class="price-text">{{ row.budgetText }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag type="inquiry" :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="expireAt" label="询盘截止" width="150" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleDetail(row)">详情</el-button>
          <el-button size="small" type="primary" @click="handleConvert(row)">转订单</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 询盘详情：含询盘主体 + 留言；跟进/转订单为 C 分内操作 -->
    <el-dialog v-model="detailVisible" title="询盘详情" width="640px">
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="询盘编号">{{ detail.inquiryNo }}</el-descriptions-item>
          <el-descriptions-item label="询盘状态">
            <StatusTag type="inquiry" :status="detail.status" />
          </el-descriptions-item>
          <el-descriptions-item label="作品名称">{{ detail.workTitle }}</el-descriptions-item>
          <el-descriptions-item label="授权类型">{{ detail.licenseTypeLabel }}</el-descriptions-item>
          <el-descriptions-item label="买方">{{ detail.buyer }}</el-descriptions-item>
          <el-descriptions-item label="卖方">{{ detail.seller }}</el-descriptions-item>
          <el-descriptions-item label="意向用途">{{ detail.intendedUse }}</el-descriptions-item>
          <el-descriptions-item label="预算">
            <span class="price-text">{{ detail.budgetText }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="询盘截止">{{ detail.expireAt }}</el-descriptions-item>
          <el-descriptions-item label="发起时间">{{ detail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="询盘留言" :span="2">{{ detail.message || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="handleFollowUp(detail)">记录跟进</el-button>
        <el-button type="primary" @click="handleConvert(detail)">转为订单</el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions } from '@/constants/tradeEnum'
import {
  getInquiryList,
  getInquiryDetail,
  followUpInquiry,
  convertInquiryToOrder
} from '@/api/trade'

defineOptions({ name: 'Inquiry' })

// 询盘状态为临时枚举（文档未给完整枚举，见 constants/tradeEnum.js INQUIRY_STATUS，待后端确认）
const inquiryStatusOptions = enumOptions('inquiry')
const licenseOptions = enumOptions('license')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, status: '', licenseType: '', keyword: '' })

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref({})

async function loadList() {
  loading.value = true
  try {
    const res = await getInquiryList(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载询盘列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, status: '', licenseType: '', keyword: '' }
  loadList()
}

async function handleDetail(row) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = {}
  try {
    detail.value = await getInquiryDetail(row.inquiryId)
  } catch {
    ElMessage.error('加载询盘详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleFollowUp(row) {
  if (!row || !row.inquiryId) return
  try {
    const { value } = await ElMessageBox.prompt('请输入跟进内容', `跟进询盘 ${row.inquiryNo}`, {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (v) => (v && v.trim() ? true : '跟进内容不能为空')
    })
    await followUpInquiry(row.inquiryId, { content: value })
    ElMessage.success('已记录跟进')
  } catch {
    // 用户取消
  }
}

async function handleConvert(row) {
  if (!row || !row.inquiryId) return
  try {
    await ElMessageBox.confirm(
      `确认将询盘 ${row.inquiryNo} 转为授权订单吗？`,
      '询盘转订单',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await convertInquiryToOrder(row.inquiryId)
    ElMessage.success(`已生成订单：${res?.data?.orderNo || ''}`)
    detailVisible.value = false
    loadList()
  } catch {
    // 用户取消
  }
}

function handleExport() {
  ElMessage.info('导出询盘')
}

onMounted(loadList)
</script>

<style scoped>
.price-text {
  color: #1f2329;
  font-weight: 600;
}
</style>
