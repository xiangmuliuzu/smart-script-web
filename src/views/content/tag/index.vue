<template>
  <PageContainer>
    <PageHeader title="标签管理" description="维护作品标签，供作品打标与分类检索使用">
      <template #actions>
        <BlackButton v-permission="['content:tag:add']" @click="openCreate">新增标签</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="queryParams.tagName"
          placeholder="标签名称"
          style="width: 180px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <!-- 标签类型枚举值暂无文档依据，先按自由文本精确查询，文档补齐后改下拉 -->
        <el-input
          v-model="queryParams.tagType"
          placeholder="标签类型"
          style="width: 160px"
          clearable
          @keyup.enter="handleQuery"
        />
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
      empty-text="暂无标签数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <template #actions>
        <el-button
          v-permission="['content:tag:remove']"
          type="danger"
          plain
          :disabled="checkedIds.length === 0"
          @click="handleBatchRemove"
        >批量删除</el-button>
      </template>

      <el-table-column label="选择" width="50">
        <template #header>
          <el-checkbox
            :model-value="allChecked"
            :indeterminate="indeterminate"
            @change="toggleAll"
          />
        </template>
        <template #default="{ row }">
          <el-checkbox v-model="checkedMap[row.tagId]" />
        </template>
      </el-table-column>
      <el-table-column prop="tagId" label="标签ID" width="90" />
      <el-table-column prop="tagName" label="标签名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="标签类型" width="120">
        <template #default="{ row }">{{ row.tagType || '—' }}</template>
      </el-table-column>
      <el-table-column prop="useCount" label="使用数量" width="100" />
      <el-table-column prop="sort" label="显示顺序" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:tag:edit']"
            size="small"
            @click="openEdit(row)"
          >编辑</el-button>
          <el-button
            v-permission="['content:tag:remove']"
            size="small"
            type="danger"
            @click="handleRemove(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增标签' : '编辑标签'"
      width="480px"
      @closed="handleClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" placeholder="请输入标签名称，不可重复" />
        </el-form-item>
        <el-form-item label="标签类型" prop="tagType">
          <!-- 标签类型枚举值暂无文档依据，先按自由文本预留，文档补齐后改下拉 -->
          <el-input v-model="form.tagType" placeholder="请输入标签类型（选填）" />
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
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { listTag, addTag, updateTag, delTag } from '@/api/content'

defineOptions({ name: 'ContentTag' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tagName: '',
  tagType: '',
  status: ''
})

/** 当前页勾选状态：{ [tagId]: true }，翻页/刷新后清空 */
const checkedMap = reactive({})
const checkedIds = computed(() => list.value.filter((row) => checkedMap[row.tagId]).map((row) => row.tagId))
const allChecked = computed(() => list.value.length > 0 && checkedIds.value.length === list.value.length)
const indeterminate = computed(() => checkedIds.value.length > 0 && !allChecked.value)

function toggleAll(checked) {
  list.value.forEach((row) => {
    checkedMap[row.tagId] = checked
  })
}

function clearChecked() {
  Object.keys(checkedMap).forEach((key) => delete checkedMap[key])
}

const dialog = reactive({ visible: false, mode: 'create' })
const submitting = ref(false)
const formRef = ref()
const defaultForm = () => ({
  tagId: null,
  tagName: '',
  tagType: '',
  remark: ''
})
const form = reactive(defaultForm())
const rules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { whitespace: true, message: '标签名称不能为空', trigger: 'blur' }
  ]
}

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    tagName: queryParams.tagName || undefined,
    tagType: queryParams.tagType || undefined,
    status: queryParams.status || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listTag(buildQuery())
    list.value = res?.rows || []
    total.value = Number(res?.total || 0)
    clearChecked()
  } catch {
    list.value = []
    total.value = 0
    clearChecked()
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  loadList()
}

function handleReset() {
  queryParams.tagName = ''
  queryParams.tagType = ''
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
    tagId: row.tagId,
    tagName: row.tagName || '',
    tagType: row.tagType || '',
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
      tagName: form.tagName.trim(),
      tagType: form.tagType?.trim() || '',
      remark: form.remark || ''
    }
    try {
      if (dialog.mode === 'create') {
        await addTag(payload)
        ElMessage.success('新增成功')
      } else {
        await updateTag({ ...payload, tagId: form.tagId })
        ElMessage.success('编辑成功')
      }
      dialog.visible = false
      loadList()
    } catch {
      // 名称重复等错误信息已由 request 拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

async function handleRemove(row) {
  try {
    await ElMessageBox.confirm(`确认删除标签「${row.tagName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await delTag(row.tagId)
    ElMessage.success('删除成功')
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  }
}

async function handleBatchRemove() {
  const ids = checkedIds.value
  if (ids.length === 0) return
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${ids.length} 个标签吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    await delTag(ids.join(','))
    ElMessage.success('删除成功')
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  }
}

onMounted(loadList)
</script>
