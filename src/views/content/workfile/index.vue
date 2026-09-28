<template>
  <PageContainer>
    <PageHeader title="作品上传资料" description="查看作品上传的文件与版本记录">
      <template #actions>
        <el-input
          v-model="workId"
          placeholder="请输入作品ID"
          style="width: 220px"
          clearable
          @keyup.enter="handleWorkQuery"
        />
        <BlackButton :loading="fileLoading || versionLoading" @click="handleWorkQuery">查询</BlackButton>
      </template>
    </PageHeader>

    <el-tabs v-model="activeTab" class="workfile-tabs">
      <el-tab-pane
        v-permission="['content:workfile:list']"
        label="文件列表"
        name="file"
      >
        <FilterBar @query="handleFileQuery" @reset="handleFileReset">
          <el-form-item>
            <el-input
              v-model="fileQuery.fileType"
              placeholder="文件类型"
              style="width: 160px"
              clearable
              @keyup.enter="handleFileQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-select v-model="fileQuery.isPreview" placeholder="是否预览" style="width: 140px" clearable>
              <el-option label="否" value="0" />
              <el-option label="是" value="1" />
            </el-select>
          </el-form-item>
        </FilterBar>

        <TableCard
          v-model:page="fileQuery.pageNum"
          v-model:pageSize="fileQuery.pageSize"
          :data="fileList"
          :loading="fileLoading"
          :total="fileTotal"
          empty-text="暂无文件数据"
          @page-change="loadFileList"
          @size-change="loadFileList"
        >
          <el-table-column prop="fileId" label="文件ID" width="90" />
          <el-table-column prop="fileName" label="文件名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="fileType" label="文件类型" width="100" />
          <el-table-column label="文件大小" width="120">
            <template #default="{ row }">{{ formatFileSize(row.fileSize) }}</template>
          </el-table-column>
          <el-table-column label="是否预览" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isPreview === 1 ? 'success' : 'info'" size="small">
                {{ row.isPreview === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" />
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ row.createTime || '—' }}</template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>

      <el-tab-pane
        v-permission="['content:workfile:list']"
        label="版本记录"
        name="version"
      >
        <TableCard
          v-model:page="versionQuery.pageNum"
          v-model:pageSize="versionQuery.pageSize"
          :data="versionList"
          :loading="versionLoading"
          :total="versionTotal"
          empty-text="暂无版本数据"
          @page-change="loadVersions"
          @size-change="loadVersions"
        >
          <el-table-column prop="versionId" label="版本ID" width="90" />
          <el-table-column prop="versionNo" label="版本号" width="100" />
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column prop="changeLog" label="变更日志" min-width="200" show-overflow-tooltip />
          <el-table-column prop="creatorName" label="创建人" width="120" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="是否当前" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isCurrent === 1 ? 'success' : 'info'" size="small">
                {{ row.isCurrent === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="170">
            <template #default="{ row }">{{ row.createTime || '—' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                v-permission="['content:workfile:query']"
                size="small"
                link
                type="primary"
                @click="openVersionDetail(row)"
              >查看详情</el-button>
            </template>
          </el-table-column>
        </TableCard>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="versionDialog.visible" title="版本详情" width="640px">
      <el-descriptions v-loading="versionDialog.loading" :column="2" border>
        <el-descriptions-item label="标题" :span="2">{{ versionDetail.title || '—' }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ versionDetail.versionNo || '—' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ versionDetail.creatorName || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ versionDetail.status || '—' }}</el-descriptions-item>
        <el-descriptions-item label="是否当前">
          <el-tag :type="versionDetail.isCurrent === 1 ? 'success' : 'info'" size="small">
            {{ versionDetail.isCurrent === 1 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="变更日志" :span="2">{{ versionDetail.changeLog || '—' }}</el-descriptions-item>
        <el-descriptions-item label="文件地址" :span="2">
          <el-link
            v-if="versionDetail.fileUrl"
            :href="versionDetail.fileUrl"
            target="_blank"
            type="primary"
            :underline="false"
          >
            {{ versionDetail.fileUrl }}
          </el-link>
          <span v-else>—</span>
        </el-descriptions-item>
        <el-descriptions-item label="版本内容" :span="2">
          <div v-if="versionDetail.content" class="version-content">{{ versionDetail.content }}</div>
          <span v-else>—</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="versionDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import BlackButton from '@/components/BlackButton.vue'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { listWorkFile, listWorkVersions, getWorkVersion } from '@/api/content'

defineOptions({ name: 'ContentWorkfile' })

const workId = ref('')
const activeTab = ref('file')

const fileQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  fileType: '',
  isPreview: ''
})
const fileList = ref([])
const fileTotal = ref(0)
const fileLoading = ref(false)
const fileLoaded = ref(false)

const versionQuery = reactive({
  pageNum: 1,
  pageSize: 10
})
const versionList = ref([])
const versionTotal = ref(0)
const versionLoading = ref(false)
const versionLoaded = ref(false)

function hasWorkId() {
  const id = String(workId.value ?? '').trim()
  if (!id) {
    ElMessage.warning('请先输入作品ID')
    return false
  }
  return true
}

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildFileQuery() {
  return {
    workId: String(workId.value).trim(),
    pageNum: fileQuery.pageNum,
    pageSize: fileQuery.pageSize,
    fileType: fileQuery.fileType || undefined,
    isPreview: fileQuery.isPreview || undefined
  }
}

async function loadFileList() {
  if (!hasWorkId()) return
  fileLoading.value = true
  try {
    const res = await listWorkFile(buildFileQuery())
    fileList.value = res?.rows || []
    fileTotal.value = Number(res?.total || 0)
    fileLoaded.value = true
  } catch {
    fileList.value = []
    fileTotal.value = 0
  } finally {
    fileLoading.value = false
  }
}

async function loadVersions() {
  if (!hasWorkId()) return
  versionLoading.value = true
  try {
    const res = await listWorkVersions({
      workId: String(workId.value).trim(),
      pageNum: versionQuery.pageNum,
      pageSize: versionQuery.pageSize
    })
    versionList.value = res?.rows || []
    versionTotal.value = Number(res?.total || 0)
    versionLoaded.value = true
  } catch {
    versionList.value = []
    versionTotal.value = 0
  } finally {
    versionLoading.value = false
  }
}

/** 顶部查询：重置两个 tab 的分页与已加载标记，按当前激活 tab 拉取 */
function handleWorkQuery() {
  if (!hasWorkId()) return
  fileQuery.pageNum = 1
  versionQuery.pageNum = 1
  fileList.value = []
  versionList.value = []
  fileTotal.value = 0
  versionTotal.value = 0
  fileLoaded.value = false
  versionLoaded.value = false
  if (activeTab.value === 'file') loadFileList()
  else loadVersions()
}

function handleFileQuery() {
  fileQuery.pageNum = 1
  loadFileList()
}

function handleFileReset() {
  fileQuery.fileType = ''
  fileQuery.isPreview = ''
  handleFileQuery()
}

/** 切换 tab 时按需懒加载，仅当该 tab 尚未加载过且 workId 已填 */
watch(activeTab, (val) => {
  if (!String(workId.value ?? '').trim()) return
  if (val === 'file' && !fileLoaded.value) loadFileList()
  else if (val === 'version' && !versionLoaded.value) loadVersions()
})

const versionDialog = reactive({ visible: false, loading: false })
const versionDetail = reactive({})
async function openVersionDetail(row) {
  versionDialog.visible = true
  versionDialog.loading = true
  Object.keys(versionDetail).forEach((k) => delete versionDetail[k])
  try {
    const res = await getWorkVersion(row.versionId)
    const data = res?.data || res || {}
    Object.assign(versionDetail, data)
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    versionDialog.loading = false
  }
}

/** 文件大小格式化：仅展示 KB / MB，原始值缺省或非法时返回占位符 */
function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || bytes === '') return '—'
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
</script>

<style scoped>
.workfile-tabs {
  margin-bottom: 20px;
}
.version-content {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow: auto;
}
</style>
