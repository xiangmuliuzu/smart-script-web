<template>
  <PageContainer>
    <PageHeader title="Banner管理" description="管理首页Banner的展示与排序">
      <template #actions>
        <BlackButton v-permission="['content:banner:add']" @click="openCreate">新增Banner</BlackButton>
      </template>
    </PageHeader>

    <FilterBar @query="handleQuery" @reset="handleReset">
      <el-form-item>
        <el-input
          v-model="queryParams.title"
          placeholder="Banner标题"
          style="width: 180px"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.position" placeholder="全部展示位置" style="width: 160px" clearable>
          <el-option v-for="t in BANNER_POSITION" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="全部状态" style="width: 140px" clearable>
          <el-option label="上架" value="on" />
          <el-option label="下架" value="off" />
        </el-select>
      </el-form-item>
    </FilterBar>

    <TableCard
      v-model:page="queryParams.pageNum"
      v-model:pageSize="queryParams.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      empty-text="暂无Banner数据"
      @page-change="loadList"
      @size-change="loadList"
    >
      <el-table-column prop="bannerId" label="BannerID" width="90" />
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="封面图" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.imageUrl"
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
            fit="cover"
            style="width: 60px; height: 40px; border-radius: 4px"
            preview-teleported
          />
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="展示位置" width="120">
        <template #default="{ row }">{{ contentEnumLabel(BANNER_POSITION, row.position) }}</template>
      </el-table-column>
      <el-table-column label="排序" width="140">
        <template #default="{ row }">
          <el-input-number
            v-model="row.sortOrder"
            :min="0"
            :max="9999"
            size="small"
            controls-position="right"
            style="width: 88px"
          />
          <el-button
            v-permission="['content:banner:edit']"
            size="small"
            link
            type="primary"
            :loading="sortingId === row.bannerId"
            @click="handleSort(row)"
          >保存</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-permission="['content:banner:edit']"
            v-model="row.status"
            active-value="on"
            inactive-value="off"
            @change="() => handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="170">
        <template #default="{ row }">{{ row.startTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="结束时间" width="170">
        <template #default="{ row }">{{ row.endTime || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="['content:banner:edit']"
            size="small"
            @click="openEdit(row)"
          >编辑</el-button>
        </template>
      </el-table-column>
    </TableCard>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? '新增Banner' : '编辑Banner'"
      width="560px"
      @closed="handleClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入Banner标题" />
        </el-form-item>
        <el-form-item label="封面图" prop="imageUrl">
          <el-upload
            class="banner-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <div v-if="form.imageUrl" class="banner-uploader__preview">
              <img :src="form.imageUrl" alt="封面图" />
              <span class="banner-uploader__mask">点击更换</span>
            </div>
            <div v-else class="banner-uploader__placeholder" v-loading="uploading">
              <span>点击上传封面图</span>
            </div>
          </el-upload>
          <div class="banner-uploader__tip">支持 jpg/png 格式，大小不超过 2MB，建议尺寸 750×360</div>
        </el-form-item>
        <el-form-item label="链接类型" prop="linkType">
          <el-input v-model="form.linkType" placeholder="如 work / page / url" />
        </el-form-item>
        <el-form-item label="链接ID" prop="linkId">
          <el-input-number v-model="form.linkId" :min="0" :max="9999999999" />
        </el-form-item>
        <el-form-item label="链接URL" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="跳转URL（选填）" />
        </el-form-item>
        <el-form-item label="展示位置" prop="position">
          <el-select v-model="form.position" placeholder="请选择展示位置" style="width: 100%" clearable>
            <el-option v-for="t in BANNER_POSITION" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-value="on"
            inactive-value="off"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
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
  listBanner,
  getBanner,
  addBanner,
  updateBanner,
  changeBannerStatus,
  changeBannerSort,
  uploadFile
} from '@/api/content'
import { BANNER_POSITION, contentEnumLabel } from '@/constants/contentEnum'

defineOptions({ name: 'ContentBanner' })

const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  position: '',
  status: ''
})

const sortingId = ref(null)

/** GET 入参：空串不下发，让后端走“不过滤”分支 */
function buildQuery() {
  return {
    pageNum: queryParams.pageNum,
    pageSize: queryParams.pageSize,
    title: queryParams.title || undefined,
    position: queryParams.position || undefined,
    status: queryParams.status || undefined
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listBanner(buildQuery())
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
  queryParams.title = ''
  queryParams.position = ''
  queryParams.status = ''
  handleQuery()
}

const dialog = reactive({ visible: false, mode: 'create' })
const submitting = ref(false)
const uploading = ref(false)
const formRef = ref()
const defaultForm = () => ({
  bannerId: null,
  title: '',
  imageUrl: '',
  linkType: '',
  linkId: 0,
  linkUrl: '',
  position: '',
  sortOrder: 0,
  status: 'on',
  startTime: '',
  endTime: '',
  remark: ''
})
const form = reactive(defaultForm())
const rules = {
  title: [
    { required: true, message: '请输入Banner标题', trigger: 'blur' },
    { whitespace: true, message: '标题不能为空', trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '请上传封面图', trigger: 'change' }
  ]
}

/** 上传前置校验：仅图片、≤2MB */
function beforeImageUpload(file) {
  if (!/^image\//.test(file.type)) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

/** 自定义上传：走通用上传接口，成功后回填 imageUrl */
async function handleImageUpload(options) {
  uploading.value = true
  try {
    const res = await uploadFile(options.file)
    const url = res?.url || res?.data?.url
    if (!url) {
      ElMessage.error('上传失败，未返回图片地址')
      return
    }
    form.imageUrl = url
    formRef.value?.clearValidate('imageUrl')
    ElMessage.success('上传成功')
  } catch {
    // 错误信息已由 request 拦截器统一提示
  } finally {
    uploading.value = false
  }
}

function openCreate() {
  Object.assign(form, defaultForm())
  dialog.mode = 'create'
  dialog.visible = true
}

async function openEdit(row) {
  Object.assign(form, defaultForm())
  dialog.mode = 'edit'
  dialog.visible = true
  try {
    const res = await getBanner(row.bannerId)
    const data = res?.data || res || {}
    Object.assign(form, {
      bannerId: row.bannerId,
      title: data.title ?? row.title ?? '',
      imageUrl: data.imageUrl ?? row.imageUrl ?? '',
      linkType: data.linkType ?? row.linkType ?? '',
      linkId: data.linkId ?? row.linkId ?? 0,
      linkUrl: data.linkUrl ?? row.linkUrl ?? '',
      position: data.position ?? row.position ?? '',
      sortOrder: data.sortOrder ?? row.sortOrder ?? 0,
      status: data.status ?? row.status ?? 'on',
      startTime: data.startTime ?? row.startTime ?? '',
      endTime: data.endTime ?? row.endTime ?? '',
      remark: data.remark ?? row.remark ?? ''
    })
  } catch {
    // 详情接口失败：回退到行内字段
    Object.assign(form, {
      bannerId: row.bannerId,
      title: row.title ?? '',
      imageUrl: row.imageUrl ?? '',
      linkType: row.linkType ?? '',
      linkId: row.linkId ?? 0,
      linkUrl: row.linkUrl ?? '',
      position: row.position ?? '',
      sortOrder: row.sortOrder ?? 0,
      status: row.status ?? 'on',
      startTime: row.startTime ?? '',
      endTime: row.endTime ?? '',
      remark: row.remark ?? ''
    })
  }
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
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      linkType: form.linkType?.trim() || '',
      linkId: form.linkId,
      linkUrl: form.linkUrl?.trim() || '',
      position: form.position?.trim() || '',
      sortOrder: form.sortOrder,
      status: form.status,
      startTime: form.startTime || '',
      endTime: form.endTime || '',
      remark: form.remark || ''
    }
    try {
      if (dialog.mode === 'create') {
        await addBanner(payload)
        ElMessage.success('新增成功')
      } else {
        await updateBanner({ ...payload, bannerId: form.bannerId })
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

async function handleStatusChange(row) {
  const targetStatus = row.status
  const actionText = targetStatus === 'on' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认${actionText}Banner「${row.title}」？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    row.status = targetStatus === 'on' ? 'off' : 'on'
    return
  }
  try {
    await changeBannerStatus({ bannerId: row.bannerId, status: targetStatus })
    ElMessage.success(`${actionText}成功`)
  } catch {
    row.status = targetStatus === 'on' ? 'off' : 'on'
  }
}

async function handleSort(row) {
  if (row.sortOrder === null || row.sortOrder === undefined) {
    ElMessage.warning('请输入排序')
    return
  }
  sortingId.value = row.bannerId
  try {
    await changeBannerSort({ bannerId: row.bannerId, sortOrder: row.sortOrder })
    ElMessage.success('排序已更新')
  } catch {
    // 失败后重新拉取，回滚界面上的本地改动
    await loadList()
  } finally {
    sortingId.value = null
  }
}

onMounted(loadList)
</script>

<style scoped>
.banner-uploader__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 60px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.banner-uploader__placeholder:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.banner-uploader__preview {
  position: relative;
  width: 120px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}
.banner-uploader__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.banner-uploader__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
}
.banner-uploader__preview:hover .banner-uploader__mask {
  opacity: 1;
}
.banner-uploader__tip {
  width: 100%;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
