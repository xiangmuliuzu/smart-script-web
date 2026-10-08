<template>
  <PageContainer>
    <PageHeader title="视频内容管理" description="管理外部视频内容及其剧集信息">
      <template #actions>
        <BlackButton v-permission="['content:drama:add']" @click="openCreate">新增视频</BlackButton>
      </template>
    </PageHeader>

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
        <el-input
          v-model="queryParams.title"
          placeholder="标题"
          style="width: 180px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <!-- 枚举值暂无文档依据，先按自由文本精确查询，文档补齐后改下拉 -->
        <el-input
          v-model="queryParams.sourceType"
          placeholder="来源类型"
          style="width: 150px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="queryParams.authorizationStatus"
          placeholder="授权状态"
          style="width: 150px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="queryParams.status"
          placeholder="状态"
          style="width: 140px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无视频数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="dramaId" label="视频ID" width="90" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="channelId" label="渠道ID" width="90" />
      <el-table-column prop="sourceType" label="来源类型" width="100" />
      <el-table-column prop="authorizationStatus" label="授权状态" width="120" />
      <el-table-column prop="syncStatus" label="同步状态" width="120" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="externalUrl" label="外部地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="创建时间" width="170">
        <template #default="{ row }">{{ row.createTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:drama:query']"
            size="small"
            link
            type="primary"
            @click="openDetail(row)"
          >详情</el-button>
          <el-button
            v-permission="['content:drama:edit']"
            size="small"
            link
            type="primary"
            @click="openEdit(row)"
          >编辑</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <!-- 详情弹窗：视频字段 + 剧集明细 -->
    <el-dialog v-model="detailDialog.visible" title="视频详情" width="780px">
      <el-descriptions v-loading="detailDialog.loading" :column="2" border>
        <el-descriptions-item label="视频ID">{{ detail.dramaId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="渠道ID">{{ detail.channelId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ detail.title || '—' }}</el-descriptions-item>
        <el-descriptions-item label="外部内容ID">{{ detail.externalContentId || '—' }}</el-descriptions-item>
        <el-descriptions-item label="来源类型">{{ detail.sourceType || '—' }}</el-descriptions-item>
        <el-descriptions-item label="授权状态">{{ detail.authorizationStatus || '—' }}</el-descriptions-item>
        <el-descriptions-item label="同步状态">{{ detail.syncStatus || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status || '—' }}</el-descriptions-item>
        <el-descriptions-item label="封面文件ID">{{ detail.coverFileId ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="外部地址" :span="2">{{ detail.externalUrl || '—' }}</el-descriptions-item>
        <el-descriptions-item label="版权说明" :span="2">{{ detail.copyrightNote || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div class="ep-title">剧集列表</div>
      <el-table :data="detailEpisodes" border size="small" max-height="320" empty-text="暂无剧集数据">
        <el-table-column prop="episodeNo" label="集数" width="80" />
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="playCount" label="播放量" width="100" />
        <el-table-column prop="duration" label="时长" width="90" />
        <el-table-column label="是否免费" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isFree === 1 ? 'success' : 'info'" size="small">
              {{ row.isFree === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" />
      </el-table>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增视频' : '编辑视频'"
      width="620px"
      @closed="handleClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="渠道ID" prop="channelId">
          <el-input v-model="form.channelId" placeholder="请输入渠道ID" />
        </el-form-item>
        <el-form-item label="外部内容ID" prop="externalContentId">
          <el-input v-model="form.externalContentId" placeholder="请输入外部内容ID" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="外部地址" prop="externalUrl">
          <el-input v-model="form.externalUrl" placeholder="请输入外部地址" />
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-input v-model="form.sourceType" placeholder="请输入来源类型" />
        </el-form-item>
        <el-form-item label="授权状态" prop="authorizationStatus">
          <el-input v-model="form.authorizationStatus" placeholder="请输入授权状态" />
        </el-form-item>
        <el-form-item label="同步状态" prop="syncStatus">
          <el-input v-model="form.syncStatus" placeholder="请输入同步状态" />
        </el-form-item>
        <el-form-item label="版权说明" prop="copyrightNote">
          <el-input v-model="form.copyrightNote" type="textarea" :rows="3" placeholder="请输入版权说明（选填）" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="form.status" placeholder="请输入状态" />
        </el-form-item>
        <el-form-item label="封面文件ID" prop="coverFileId">
          <el-input-number v-model="form.coverFileId" :min="0" controls-position="right" style="width: 200px" />
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
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import {
  listDrama,
  getDrama,
  addDrama,
  updateDrama
} from '@/api/content'

defineOptions({ name: 'ExternalDramaContent' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  channelId: '',
  title: '',
  sourceType: '',
  authorizationStatus: '',
  status: ''
})

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    channelId: queryParams.channelId || undefined,
    title: queryParams.title || undefined,
    sourceType: queryParams.sourceType || undefined,
    authorizationStatus: queryParams.authorizationStatus || undefined,
    status: queryParams.status || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listDrama(buildQuery())
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
  queryParams.title = ''
  queryParams.sourceType = ''
  queryParams.authorizationStatus = ''
  queryParams.status = ''
  handleQuery()
}

// ---- 详情弹窗 ----
const detailDialog = reactive({ visible: false, loading: false })
const detail = reactive({})
const detailEpisodes = ref([])
async function openDetail(row) {
  detailDialog.visible = true
  detailDialog.loading = true
  Object.keys(detail).forEach((k) => delete detail[k])
  detailEpisodes.value = []
  try {
    const res = await getDrama(row.dramaId)
    const data = res?.data || res || {}
    Object.assign(detail, data)
    detailEpisodes.value = Array.isArray(data.episodes) ? data.episodes : []
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    detailDialog.loading = false
  }
}

// ---- 新增/编辑弹窗 ----
const dialog = reactive({ visible: false, mode: 'create' })
const submitting = ref(false)
const formRef = ref()
const defaultForm = () => ({
  dramaId: null,
  channelId: '',
  externalContentId: '',
  title: '',
  externalUrl: '',
  sourceType: '',
  authorizationStatus: '',
  syncStatus: '',
  copyrightNote: '',
  status: '',
  coverFileId: 0
})
const form = reactive(defaultForm())
const rules = {
  channelId: [{ required: true, message: '请输入渠道ID', trigger: 'blur' }],
  externalContentId: [{ required: true, message: '请输入外部内容ID', trigger: 'blur' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { whitespace: true, message: '标题不能为空', trigger: 'blur' }
  ],
  externalUrl: [{ required: true, message: '请输入外部地址', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请输入来源类型', trigger: 'blur' }],
  authorizationStatus: [{ required: true, message: '请输入授权状态', trigger: 'blur' }],
  syncStatus: [{ required: true, message: '请输入同步状态', trigger: 'blur' }]
}

function openCreate() {
  Object.assign(form, defaultForm())
  dialog.mode = 'create'
  dialog.visible = true
}

async function openEdit(row) {
  Object.assign(form, defaultForm())
  try {
    const res = await getDrama(row.dramaId)
    const data = res?.data || res || {}
    Object.assign(form, {
      dramaId: data.dramaId ?? row.dramaId,
      channelId: String(data.channelId ?? row.channelId ?? ''),
      externalContentId: data.externalContentId || row.externalContentId || '',
      title: data.title || row.title || '',
      externalUrl: data.externalUrl || row.externalUrl || '',
      sourceType: data.sourceType || row.sourceType || '',
      authorizationStatus: data.authorizationStatus || row.authorizationStatus || '',
      syncStatus: data.syncStatus || row.syncStatus || '',
      copyrightNote: data.copyrightNote || row.copyrightNote || '',
      status: data.status || row.status || '',
      coverFileId: data.coverFileId ?? row.coverFileId ?? 0
    })
  } catch {
    Object.assign(form, {
      dramaId: row.dramaId,
      channelId: String(row.channelId ?? ''),
      externalContentId: row.externalContentId || '',
      title: row.title || '',
      externalUrl: row.externalUrl || '',
      sourceType: row.sourceType || '',
      authorizationStatus: row.authorizationStatus || '',
      syncStatus: row.syncStatus || '',
      copyrightNote: row.copyrightNote || '',
      status: row.status || '',
      coverFileId: row.coverFileId ?? 0
    })
  }
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
      channelId: form.channelId.trim(),
      externalContentId: form.externalContentId.trim(),
      title: form.title.trim(),
      externalUrl: form.externalUrl.trim(),
      sourceType: form.sourceType.trim(),
      authorizationStatus: form.authorizationStatus.trim(),
      syncStatus: form.syncStatus.trim(),
      copyrightNote: form.copyrightNote || '',
      status: form.status || '',
      coverFileId: form.coverFileId ?? 0
    }
    try {
      if (dialog.mode === 'create') {
        await addDrama(payload)
        ElMessage.success('新增成功')
      } else {
        await updateDrama({ ...payload, dramaId: form.dramaId })
        ElMessage.success('编辑成功')
      }
      dialog.visible = false
      loadList()
    } catch {
      // 错误信息已由 request 拦截器统一提示
    } finally {
      submitting.value = false
    }
  })
}

onMounted(loadList)
</script>

<style scoped>
.ep-title {
  margin: 16px 0 8px;
  font-weight: 600;
}
</style>
