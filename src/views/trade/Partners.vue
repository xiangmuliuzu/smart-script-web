<template>
  <PageContainer>
    <PageHeader title="合作方管理" description="管理投资方、制作机构等合作方档案">
      <template #actions>
        <BlackButton @click="handleCreate">新增合作方</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select v-model="query.partnerType" placeholder="全部合作方类型" style="width: 170px" clearable>
          <el-option v-for="opt in partnerTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="query.keyword" placeholder="企业名称搜索" style="width: 200px" clearable @keyup.enter="handleQuery" />
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
      <el-table-column prop="partnerNo" label="编号" width="110" />
      <el-table-column prop="partnerName" label="企业名称" min-width="160" />
      <el-table-column label="合作方类型" width="130">
        <template #default="{ row }">
          {{ enumLabel('partnerType', row.partnerType) }}
        </template>
      </el-table-column>
      <el-table-column prop="contactPerson" label="联系人" width="100" />
      <el-table-column prop="contactPhone" label="电话" width="130" />
      <el-table-column label="需求标签" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="tag in parseTags(row.demandTags)" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
          <span v-if="!parseTags(row.demandTags).length">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="cooperationCount" label="合作次数" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag type="partnerStatus" :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleFollowUp(row)">跟进</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 新增/编辑合作方弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增合作方' : '编辑合作方'" width="580px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="企业名称" prop="partnerName">
          <el-input v-model="form.partnerName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="合作方类型" prop="partnerType">
          <el-select v-model="form.partnerType" placeholder="请选择合作方类型" style="width: 100%">
            <el-option v-for="opt in partnerTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="form.contactEmail" placeholder="请输入邮箱（选填）" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入地址（选填）" />
        </el-form-item>
        <el-form-item label="需求标签">
          <el-input v-model="form.demandTags" placeholder="逗号分隔，如：剧本采购,IP改编" />
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { enumOptions, enumLabel } from '@/constants/tradeEnum'
import { getPartnerList, createPartner } from '@/api/trade'

defineOptions({ name: 'Partners' })

const router = useRouter()
const partnerTypeOptions = enumOptions('partnerType')

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, partnerType: '', keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const form = ref({
  partnerName: '', partnerType: '', contactPerson: '', contactPhone: '', contactEmail: '', address: '', demandTags: ''
})
const rules = {
  partnerName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  partnerType: [{ required: true, message: '请选择合作方类型', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const res = await getPartnerList(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载合作方列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, partnerType: '', keyword: '' }
  loadList()
}

function handleCreate() {
  dialogMode.value = 'create'
  form.value = { partnerName: '', partnerType: '', contactPerson: '', contactPhone: '', contactEmail: '', address: '', demandTags: '' }
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'
  form.value = {
    partnerId: row.partnerId,
    partnerName: row.partnerName,
    partnerType: row.partnerType,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail || '',
    address: row.address || '',
    demandTags: row.demandTags || ''
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createPartner(form.value)
      ElMessage.success(dialogMode.value === 'create' ? '新增合作方成功' : '编辑合作方成功')
      dialogVisible.value = false
      loadList()
    } catch {
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

function handleFollowUp(row) {
  router.push({ path: '/trade/follow-up', query: { partnerId: row.partnerId, partnerName: row.partnerName } })
}

function parseTags(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val).split(',').map(s => s.trim()).filter(Boolean)
}

onMounted(loadList)
</script>

<style scoped>
.tag-item {
  margin-right: 6px;
}
</style>
