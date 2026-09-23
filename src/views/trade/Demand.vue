<template>
  <PageContainer>
    <PageHeader title="征集项目管理" description="买方发布的剧本征集令与投稿作品管理（对应 sys_demand / sys_demand_submission）">
      <template #actions>
        <BlackButton @click="handlePublish">发布征集令</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部项目状态" style="width: 150px" clearable>
          <el-option
            v-for="opt in demandStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="征集标题搜索"
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
      <el-table-column prop="demandNo" label="征集编号" width="120" />
      <el-table-column prop="title" label="征集标题" min-width="160" />
      <el-table-column prop="client" label="发布方" width="120" />
      <el-table-column prop="genre" label="题材" width="90" />
      <el-table-column label="预算" width="110">
        <template #default="{ row }">
          <span class="price-text">{{ row.budgetText }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止日期" width="120" />
      <el-table-column prop="submissionCount" label="投稿数" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag type="demand" :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewSubmissions(row)">查看投稿</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 征集项目详情 + 投稿作品明细 -->
    <el-dialog v-model="detailVisible" title="征集项目详情" width="820px">
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="征集编号">{{ detail.demandNo }}</el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <StatusTag type="demand" :status="detail.status" />
          </el-descriptions-item>
          <el-descriptions-item label="征集标题">{{ detail.title }}</el-descriptions-item>
          <el-descriptions-item label="发布方">{{ detail.client }}</el-descriptions-item>
          <el-descriptions-item label="题材">{{ detail.genre }}</el-descriptions-item>
          <el-descriptions-item label="预算">
            <span class="price-text">{{ detail.budgetText }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ detail.deadline }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ detail.contactInfo }}</el-descriptions-item>
          <el-descriptions-item label="征集要求" :span="2">{{ detail.requirement || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="sub-title">投稿作品（{{ submissions.length }}）</div>
        <el-table :data="submissions" size="small" border>
          <el-table-column prop="workTitle" label="作品名称" min-width="130" />
          <el-table-column prop="submitter" label="投稿人" width="100" />
          <el-table-column label="投稿状态" width="100">
            <template #default="{ row }">
              <StatusTag type="submission" :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="submitMessage" label="投稿留言" min-width="120" show-overflow-tooltip />
          <el-table-column prop="reviewRemark" label="评审备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.reviewRemark || '-' }}</template>
          </el-table-column>
          <el-table-column prop="submittedAt" label="投稿时间" width="150" />
          <template #empty>
            <el-empty description="暂无投稿作品" :image-size="60" />
          </template>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions } from '@/constants/tradeEnum'
import { getDemandList, getDemandSubmissions } from '@/api/trade'

defineOptions({ name: 'Demand' })

// 征集项目状态为临时枚举（PC 接口缺口，见 constants/tradeEnum.js DEMAND_STATUS，待后端确认）
const demandStatusOptions = enumOptions('demand')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, status: '', keyword: '' })

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref({})
const submissions = ref([])

async function loadList() {
  loading.value = true
  try {
    const res = await getDemandList(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载征集项目失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, status: '', keyword: '' }
  loadList()
}

async function handleViewSubmissions(row) {
  detail.value = { ...row }
  submissions.value = []
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getDemandSubmissions(row.demandId)
    submissions.value = res.rows || []
  } catch {
    ElMessage.error('加载投稿作品失败')
  } finally {
    detailLoading.value = false
  }
}

function handlePublish() {
  ElMessage.info('发布征集令')
}

onMounted(loadList)
</script>

<style scoped>
.price-text {
  color: #1f2329;
  font-weight: 600;
}

.sub-title {
  margin: 18px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
}
</style>
