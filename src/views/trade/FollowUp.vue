<template>
  <PageContainer>
    <PageHeader title="商务跟进" description="记录与合作方的商务跟进（电话/邮件/面谈），支持线上合作与线下谈判跟进">
      <template #actions>
        <BlackButton @click="handleCreate">新增跟进记录</BlackButton>
      </template>
    </PageHeader>

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
        <el-form-item label="下次跟进">
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
import { getFollowUps, createFollowUp, getPartnerList } from '@/api/trade'

defineOptions({ name: 'FollowUp' })

// 跟进状态 / 跟进方式枚举取自 constants/tradeEnum.js（接口 2.38）
const followStatusOptions = enumOptions('follow')
const followMethodOptions = enumOptions('followMethod')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, partnerId: '', status: '' })
const partnerOptions = ref([])

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()
const form = ref({ partnerId: '', followUpAt: '', method: '', content: '', nextFollowUpAt: '', status: '' })
const rules = {
  partnerId: [{ required: true, message: '请选择合作方', trigger: 'change' }],
  followUpAt: [{ required: true, message: '请选择跟进时间', trigger: 'change' }],
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择跟进状态', trigger: 'change' }]
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
    const res = await getFollowUps(query.value)
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

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, partnerId: '', status: '' }
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
