<template>
  <PageContainer>
    <PageHeader title="需求标签管理" description="维护合作方需求标签，供合作方档案与征集项目归类使用">
      <template #actions>
        <BlackButton @click="handleCreate">新增标签</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="query.keyword"
          placeholder="标签名称搜索"
          style="width: 220px"
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
      :empty-image="emptyTagsImg"
      empty-text="暂无需求标签，点击右上角新增"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="tagId" label="标签ID" width="120" />
      <el-table-column prop="tagName" label="标签名称" min-width="180" />
      <el-table-column prop="usedCount" label="使用合作方数" width="140" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增标签' : '编辑标签'"
      width="440px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名称，不可重复" maxlength="32" show-word-limit />
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
import { getDemandTags, createDemandTag, updateDemandTag, deleteDemandTag } from '@/api/trade'
import emptyTagsImg from '@/assets/images/demand-tags-empty.png'

defineOptions({ name: 'DemandTags' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = ref({ pageNo: 1, pageSize: 10, keyword: '' })

const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const form = ref({ tagId: null, tagName: '' })
const rules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

async function loadList() {
  loading.value = true
  try {
    const res = await getDemandTags(query.value)
    list.value = res.rows || []
    total.value = res.total || 0
  } catch {
    list.value = []
    total.value = 0
    ElMessage.error('加载需求标签失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  query.value.pageNo = 1
  loadList()
}

function handleReset() {
  query.value = { pageNo: 1, pageSize: 10, keyword: '' }
  loadList()
}

function handleCreate() {
  dialogMode.value = 'create'
  form.value = { tagId: null, tagName: '' }
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'
  form.value = { tagId: row.tagId, tagName: row.tagName }
  dialogVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除标签「${row.tagName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteDemandTag(row.tagId)
    ElMessage.success('删除成功')
    loadList()
  } catch {
    // 用户取消
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        await createDemandTag({ tagName: form.value.tagName })
        ElMessage.success('新增成功')
      } else {
        await updateDemandTag(form.value.tagId, { tagName: form.value.tagName })
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      loadList()
    } catch {
      ElMessage.error('保存失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(loadList)
</script>
