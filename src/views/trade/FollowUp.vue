<template>
  <PageContainer>
    <PageHeader title="商务跟进" description="记录与合作方的商务跟进（电话/邮件/面谈），并查看线上合作记录与线下谈判记录">
      <template #actions>
        <BlackButton v-if="activeTab === 'follow'" @click="handleCreate">新增跟进记录</BlackButton>
      </template>
    </PageHeader>

    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="跟进记录" name="follow">

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.partnerId" placeholder="全部合作方" style="width: 180px" clearable>
          <el-option
            v-for="p in partnerOptions"
            :key="p.partnerId"
            :label="p.partnerName"
            :value="p.partnerId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="query.status" placeholder="全部跟进状态" style="width: 150px" clearable>
          <el-option
            v-for="opt in followStatusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="跟进开始日期"
          end-placeholder="跟进结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
          clearable
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
      <el-table-column prop="partnerName" label="合作方" width="140" />
      <el-table-column prop="followUpAt" label="跟进时间" width="160" />
      <el-table-column label="跟进方式" width="100">
        <template #default="{ row }">
          {{ enumLabel('followMethod', row.method) }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="跟进内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="nextFollowUpAt" label="下次跟进" width="160">
        <template #default="{ row }">{{ row.nextFollowUpAt || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag type="follow" :status="row.status" />
        </template>
      </el-table-column>
    </TableCard>

      </el-tab-pane>

      <el-tab-pane label="线上合作记录" name="online">
        <TableCard
          v-model:page="onlineQuery.pageNo"
          v-model:pageSize="onlineQuery.pageSize"
          :data="onlineList"
          :loading="onlineLoading"
          :total="onlineTotal"
          empty-text="暂无线上合作记录"
          @page-change="loadOnline"
          @size-change="loadOnline"
        >
          <el-table-column prop="workTitle" label="作品" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.workTitle || '-' }}</template>
          </el-table-column>
          <el-table-column prop="creatorName" label="作者" width="120">
            <template #default="{ row }">{{ row.creatorName || '-' }}</template>
          </el-table-column>
          <el-table-column prop="partnerName" label="合作方" width="140">
            <template #default="{ row }">{{ row.partnerName || '-' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <StatusTag type="cooperationStatus" :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="expectedAmountText" label="预期金额" width="130">
            <template #default="{ row }">{{ row.expectedAmountText || '-' }}</template>
          </el-table-column>
          <el-table-column prop="contactPerson" label="联系人" width="110">
            <template #default="{ row }">{{ row.contactPerson || '-' }}</template>
          </el-table-column>
          <el-table-column prop="contactValue" label="联系方式" width="150">
            <template #default="{ row }">{{ row.contactValue || '-' }}</template>
          </el-table-column>
          <el-table-column prop="nextFollowAt" label="下次跟进" width="160">
            <template #default="{ row }">{{ row.nextFollowAt || '-' }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || '-' }}</template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>

      <el-tab-pane label="线下谈判记录" name="offline">
        <TableCard
          v-model:page="offlineQuery.pageNo"
          v-model:pageSize="offlineQuery.pageSize"
          :data="offlineList"
          :loading="offlineLoading"
          :total="offlineTotal"
          empty-text="暂无线下谈判记录"
          @page-change="loadOffline"
          @size-change="loadOffline"
        >
          <el-table-column prop="workTitle" label="作品" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.workTitle || '-' }}</template>
          </el-table-column>
          <el-table-column prop="partnerName" label="合作方" width="140">
            <template #default="{ row }">{{ row.partnerName || '-' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <StatusTag type="cooperationStatus" :status="row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="nextFollowAt" label="谈判时间" width="160">
            <template #default="{ row }">{{ row.nextFollowAt || '-' }}</template>
          </el-table-column>
          <el-table-column prop="negotiationPlace" label="谈判地点" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.negotiationPlace || '-' }}</template>
          </el-table-column>
          <el-table-column prop="contactPerson" label="联系人" width="110">
            <template #default="{ row }">{{ row.contactPerson || '-' }}</template>
          </el-table-column>
          <el-table-column prop="contactValue" label="联系方式" width="150">
            <template #default="{ row }">{{ row.contactValue || '-' }}</template>
          </el-table-column>
          <el-table-column prop="expectedAmountText" label="预期金额" width="130">
            <template #default="{ row }">{{ row.expectedAmountText || '-' }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remark || '-' }}</template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" title="新增跟进记录" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="合作方" prop="partnerId">
          <el-select v-model="form.partnerId" placeholder="请选择合作方" style="width: 100%">
            <el-option
              v-for="p in partnerOptions"
              :key="p.partnerId"
              :label="p.partnerName"
              :value="p.partnerId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进时间" prop="followUpAt">
          <el-date-picker
            v-model="form.followUpAt"
            type="datetime"
            placeholder="选择跟进时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="跟进方式" prop="method">
          <el-select v-model="form.method" placeholder="请选择跟进方式" style="width: 100%">
            <el-option
              v-for="opt in followMethodOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入跟进内容"
          />
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowUpAt">
          <el-date-picker
            v-model="form.nextFollowUpAt"
            type="datetime"
            placeholder="选择下次跟进时间（选填）"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="跟进状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择跟进状态" style="width: 100%">
            <el-option
              v-for="opt in followStatusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
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
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions, enumLabel } from '@/constants/tradeEnum'
import { getFollowUps, createFollowUp, getPartnerList, getCooperations } from '@/api/trade'

defineOptions({ name: 'FollowUp' })

// 跟进状态 / 跟进方式枚举取自 constants/tradeEnum.js（接口 2.38）
const followStatusOptions = enumOptions('follow')
const followMethodOptions = enumOptions('followMethod')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, partnerId: '', status: '' })
// 跟进时间范围（接口 2.38 startDate/endDate）；el-date-picker daterange 输出 [start, end]
const dateRange = ref([])
const partnerOptions = ref([])

// 合作记录（分工 15 线上合作意向 / 16 线下谈判）：两个只读视图，切换页签时懒加载
const activeTab = ref('follow')
const onlineList = ref([])
const onlineTotal = ref(0)
const onlineLoading = ref(false)
const onlineLoaded = ref(false)
const onlineQuery = ref({ pageNo: 1, pageSize: 10 })
const offlineList = ref([])
const offlineTotal = ref(0)
const offlineLoading = ref(false)
const offlineLoaded = ref(false)
const offlineQuery = ref({ pageNo: 1, pageSize: 10 })

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()
const form = ref({ partnerId: '', followUpAt: '', method: '', content: '', nextFollowUpAt: '', status: '' })
const rules = {
  partnerId: [{ required: true, message: '请选择合作方', trigger: 'change' }],
  followUpAt: [{ required: true, message: '请选择跟进时间', trigger: 'change' }],
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
  nextFollowUpAt: [{ validator: validateNextFollowUp, trigger: 'change' }],
  status: [{ required: true, message: '请选择跟进状态', trigger: 'change' }]
}

// 修复 BIZ_FOLLOW_002：下次跟进时间不得早于跟进时间（按日期比较，选填项为空时不校验）
function validateNextFollowUp(rule, value, callback) {
  const next = value ? String(value).slice(0, 10) : ''
  const cur = form.value.followUpAt ? String(form.value.followUpAt).slice(0, 10) : ''
  if (next && cur && next < cur) {
    callback(new Error('下次跟进时间不能早于跟进时间'))
  } else {
    callback()
  }
}

async function loadPartners() {
  try {
    const res = await getPartnerList({ pageNo: 1, pageSize: 100 })
    partnerOptions.value = res.rows || []
  } catch {
    partnerOptions.value = []
  }
}

async function loadList() {
  loading.value = true
  try {
    const params = {
      ...query.value,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined
    }
    const res = await getFollowUps(params)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载商务跟进记录失败')
  } finally {
    loading.value = false
  }
}

async function loadOnline() {
  onlineLoading.value = true
  try {
    const res = await getCooperations({ ...onlineQuery.value, source: 'online' })
    onlineList.value = res.rows || []
    onlineTotal.value = res.total || 0
    onlineLoaded.value = true
  } catch {
    onlineList.value = []
    onlineTotal.value = 0
    ElMessage.error('加载线上合作记录失败')
  } finally {
    onlineLoading.value = false
  }
}

async function loadOffline() {
  offlineLoading.value = true
  try {
    const res = await getCooperations({ ...offlineQuery.value, source: 'offline' })
    offlineList.value = res.rows || []
    offlineTotal.value = res.total || 0
    offlineLoaded.value = true
  } catch {
    offlineList.value = []
    offlineTotal.value = 0
    ElMessage.error('加载线下谈判记录失败')
  } finally {
    offlineLoading.value = false
  }
}

function onTabChange(name) {
  if (name === 'online' && !onlineLoaded.value) loadOnline()
  else if (name === 'offline' && !offlineLoaded.value) loadOffline()
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, partnerId: '', status: '' }
  dateRange.value = []
  loadList()
}

function handleCreate() {
  form.value = { partnerId: '', followUpAt: '', method: '', content: '', nextFollowUpAt: '', status: '' }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createFollowUp(form.value)
      ElMessage.success('新增跟进记录成功')
      dialogVisible.value = false
      loadList()
    } catch {
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadPartners()
  loadList()
})
</script>
