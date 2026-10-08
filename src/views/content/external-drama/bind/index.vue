<template>
  <PageContainer>
    <PageHeader title="关联剧本" description="管理外部视频与平台剧本的关联关系" />

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="queryParams.channelId"
          placeholder="渠道ID"
          style="width: 140px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-switch
          v-model="queryParams.unboundOnly"
          active-text="仅看未关联"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无关联数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="dramaId" label="视频ID" width="90" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="channelId" label="渠道ID" width="90" />
      <el-table-column prop="relatedWorkId" label="关联剧本ID" width="110" />
      <el-table-column label="关联剧本标题" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.relatedWorkTitle || '—' }}</template>
      </el-table-column>
      <el-table-column prop="sourceType" label="来源类型" width="100" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.relatedWorkId === null || row.relatedWorkId === undefined || row.relatedWorkId === ''"
            v-permission="['content:dramabind:edit']"
            size="small"
            link
            type="primary"
            @click="openBind(row)"
          >关联</el-button>
          <el-button
            v-else
            v-permission="['content:dramabind:edit']"
            size="small"
            link
            type="danger"
            @click="handleUnbind(row)"
          >解除</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 关联弹窗 -->
    <el-dialog v-model="bindDialog.visible" title="关联剧本" width="420px" @closed="handleClosed">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="视频ID">
          <span>{{ form.dramaId }}</span>
        </el-form-item>
        <el-form-item label="视频标题">
          <span>{{ form.dramaTitle || '—' }}</span>
        </el-form-item>
        <el-form-item label="剧本ID" prop="relatedWorkId">
          <el-input-number
            v-model="form.relatedWorkId"
            :min="1"
            controls-position="right"
            style="width: 200px"
            placeholder="请输入剧本ID"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDialog.visible = false">取消</el-button>
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
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  listDramaBind,
  getDramaBind,
  bindDrama,
  unbindDrama
} from '@/api/content'

defineOptions({ name: 'ExternalDramaBind' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  channelId: '',
  unboundOnly: 0
})

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    channelId: queryParams.channelId || undefined,
    unboundOnly: queryParams.unboundOnly === 1 ? 1 : undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listDramaBind(buildQuery())
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
  queryParams.channelId = ''
  queryParams.unboundOnly = 0
  handleQuery()
}

// ---- 关联弹窗 ----
const bindDialog = reactive({ visible: false })
const submitting = ref(false)
const formRef = ref()
const form = reactive({
  dramaId: null,
  dramaTitle: '',
  relatedWorkId: null
})
const rules = {
  relatedWorkId: [{ required: true, message: '请输入剧本ID', trigger: 'blur' }]
}

function openBind(row) {
  form.dramaId = row.dramaId
  form.dramaTitle = row.title || ''
  form.relatedWorkId = null
  bindDialog.visible = true
}

function handleClosed() {
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await bindDrama({ dramaId: form.dramaId, relatedWorkId: form.relatedWorkId })
      ElMessage.success('关联成功')
      bindDialog.visible = false
      loadList()
    } catch {
      // 错误信息已由 request 拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

async function handleUnbind(row) {
  try {
    await ElMessageBox.confirm(
      `确认解除视频「${row.title}」与剧本「${row.relatedWorkTitle || row.relatedWorkId}」的关联？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }
  try {
    await unbindDrama({ dramaId: row.dramaId })
    ElMessage.success('解除成功')
    loadList()
  } catch {
    // 错误信息已由 request 拦截器统一提示
  }
}

onMounted(loadList)
</script>
