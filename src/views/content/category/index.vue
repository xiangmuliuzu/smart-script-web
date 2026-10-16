<template>
  <PageContainer>
    <PageHeader title="分类管理" description="维护剧本分类，供 App 分类浏览与作品归类使用">
      <template #actions>
        <BlackButton v-permission="['content:category:add']" @click="openCreate">新增分类</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-select
          v-model="queryParams.categoryName"
          placeholder="全部分类"
          style="width: 180px"
          clearable
          filterable
        >
          <el-option v-for="name in nameOptions" :key="name" :label="name" :value="name" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无分类数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="sort" label="位次" width="80" />
      <el-table-column prop="categoryName" label="分类名称" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" min-width="120">
        <template #default="{ row }">
          <el-switch
            v-permission="['content:category:edit']"
            v-model="row.status"
            active-value="0"
            inactive-value="1"
            @change="() => handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="160">
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:category:edit']"
            size="small"
            @click="openEdit(row)"
          >编辑</el-button>
          <el-button
            v-permission="['content:category:remove']"
            size="small"
            type="danger"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增分类' : '编辑分类'"
      width="480px"
      @closed="handleClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称，不可重复" />
        </el-form-item>
        <el-form-item label="位次" prop="sort">
          <el-input-number v-model="form.sort" :min="1" />
          <div style="font-size: 12px; color: #909399; line-height: 1.5; margin-top: 4px;">
            数字越小越靠前；留空则追加到末尾；改为已存在位次时，其他分类自动顺延
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-value="0"
            inactive-value="1"
            active-text="正常"
            inactive-text="停用"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  listCategory,
  addCategory,
  updateCategory,
  changeCategoryStatus,
  delCategory
} from '@/api/content'

defineOptions({ name: 'ContentCategory' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  categoryName: '',
  status: ''
})

/** 分类名称下拉选项：从已有分类动态加载，供按名称筛选 */
const nameOptions = ref([])
async function loadNameOptions() {
  try {
    const res = await listCategory({ pageNum: 1, pageSize: 200 })
    nameOptions.value = [...new Set((res?.rows || []).map((r) => r.categoryName).filter(Boolean))]
  } catch {
    nameOptions.value = []
  }
}

const dialog = reactive({ visible: false, mode: 'create' })
const submitting = ref(false)
const formRef = ref()
const defaultForm = () => ({
  categoryId: null,
  categoryName: '',
  sort: null,
  status: '0',
  remark: ''
})
const form = reactive(defaultForm())
const rules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { whitespace: true, message: '分类名称不能为空', trigger: 'blur' }
  ]
}

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    categoryName: queryParams.categoryName || undefined,
    status: queryParams.status || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listCategory(buildQuery())
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
  queryParams.categoryName = ''
  queryParams.status = ''
  handleQuery()
}

function openCreate() {
  Object.assign(form, defaultForm())
  dialog.mode = 'create'
  dialog.visible = true
}

function openEdit(row) {
  Object.assign(form, {
    categoryId: row.categoryId,
    categoryName: row.categoryName || '',
    sort: row.sort ?? null,
    status: row.status || '0',
    remark: row.remark || ''
  })
  dialog.mode = 'edit'
  dialog.visible = true
}

function handleClosed() {
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    const payload = {
      categoryName: form.categoryName.trim(),
      sort: form.sort,
      status: form.status,
      remark: form.remark || ''
    }
    try {
      if (dialog.mode === 'create') {
        await addCategory(payload)
        ElMessage.success('新增成功')
      } else {
        await updateCategory({ ...payload, categoryId: form.categoryId })
        ElMessage.success('编辑成功')
      }
      dialog.visible = false
      loadNameOptions()
      loadList()
    } catch {
      // 名称重复等错误信息已由 request 拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

async function handleStatusChange(row) {
  const targetStatus = row.status
  const actionText = targetStatus === '0' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确认${actionText}分类「${row.categoryName}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    row.status = targetStatus === '0' ? '1' : '0'
    return
  }
  try {
    await changeCategoryStatus({ categoryId: row.categoryId, status: targetStatus })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.status = targetStatus === '0' ? '1' : '0'
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.categoryName}」吗？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await delCategory(row.categoryId)
    ElMessage.success('删除成功')
    loadNameOptions()
    loadList()
  } catch {
    // 被作品引用等错误信息已由 request 拦截器统一提示
  }
}

onMounted(() => {
  loadNameOptions()
  loadList()
})
</script>
