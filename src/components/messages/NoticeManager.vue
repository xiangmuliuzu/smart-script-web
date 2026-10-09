<template>
  <div class="messages-manager">
    <FilterBar @query="search" @reset="reset">
      <el-form-item label="标题"><el-input v-model="filters.noticeTitle" placeholder="搜索公告标题" clearable style="width:190px" /></el-form-item>
      <el-form-item label="接收范围"><el-select v-model="filters.audience" clearable placeholder="全部范围" style="width:150px"><el-option v-for="item in audiences" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="filters.status" clearable placeholder="全部状态" style="width:120px"><el-option label="启用" value="0" /><el-option label="关闭" value="1" /></el-select></el-form-item>
      <template #extra><el-button v-permission="['system:notice:add']" @click="openCreate">新增公告</el-button></template>
    </FilterBar>
    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon class="error"><template #default><el-button link @click="load">重新加载</el-button></template></el-alert>
    <TableCard title="公告管理" :data="rows" :loading="loading" :total="total" v-model:page="query.pageNum" v-model:page-size="query.pageSize" @page-change="load" @size-change="load">
      <template #actions><el-button @click="load">刷新</el-button></template>
      <el-table-column prop="noticeId" label="公告ID" width="90" />
      <el-table-column prop="noticeTitle" label="标题" min-width="220" show-overflow-tooltip />
      <el-table-column label="接收范围" width="150"><template #default="{ row }"><el-tag type="info">{{ audienceLabel(row.audience) }}</el-tag></template></el-table-column>
      <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === '0' ? 'success' : 'info'">{{ row.status === '0' ? '启用' : '关闭' }}</el-tag></template></el-table-column>
      <el-table-column prop="createBy" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" fixed="right" width="230"><template #default="{ row }">
        <el-button v-permission="['system:notice:query']" link type="primary" @click="openPreview(row)">预览</el-button>
        <el-button v-if="canQuery" v-permission="['system:notice:edit']" link type="primary" @click="openEdit(row)">编辑</el-button>
        <el-button v-permission="['system:notice:edit']" link type="primary" :disabled="busy" @click="toggle(row)">{{ row.status === '0' ? '关闭' : '启用' }}</el-button>
        <el-button v-permission="['system:notice:remove']" link type="danger" :disabled="busy" @click="remove(row)">删除</el-button>
      </template></el-table-column>
    </TableCard>
    <el-dialog v-model="editorVisible" :title="form.noticeId ? '编辑公告' : '新增公告'" width="660px" :close-on-click-modal="false" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form :model="form" label-width="90px" :disabled="saving">
        <el-form-item label="标题" required><el-input v-model="form.noticeTitle" maxlength="50" show-word-limit /></el-form-item>
        <el-form-item label="接收范围" required><el-select v-model="form.audience" :disabled="!!form.noticeId && originalStatus === '0'" style="width:100%"><el-option v-for="item in audiences" :key="item.value" :label="item.label" :value="item.value" /></el-select><span class="hint">{{ originalStatus === '0' ? '修改接收范围前，请先关闭公告。' : '普通用户包含 PC 用户端与 App；全部包含普通用户及后台管理员。' }}</span></el-form-item>
        <el-form-item label="正文" required><el-input v-model="form.noticeContent" type="textarea" :rows="10" maxlength="5000" show-word-limit /></el-form-item>
      </el-form>
      <el-alert v-if="saveError" :title="saveError" type="error" :closable="false" show-icon />
      <template #footer><el-button :disabled="saving" @click="editorVisible = false">取消</el-button><el-button :disabled="saving" @click="previewDraft">预览</el-button><el-button :loading="saving" @click="save(originalStatus)">{{ form.noticeId ? '保存修改' : '保存' }}</el-button><el-button v-if="originalStatus !== '0'" type="primary" :loading="saving" @click="save('0')">保存并启用</el-button></template>
    </el-dialog>
    <el-dialog v-model="previewVisible" title="公告预览" width="650px" @closed="previewGeneration++"><div v-loading="previewLoading" style="min-height:120px"><el-alert v-if="previewError" :title="previewError" type="error" :closable="false"><template #default><el-button link @click="openPreview(previewRow)">重试</el-button></template></el-alert><template v-if="previewData"><el-tag type="info">{{ audienceLabel(previewData.audience) }}</el-tag><h3>{{ previewData.noticeTitle }}</h3><p class="body-text">{{ previewData.noticeContent }}</p></template></div></el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import './messages.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import FilterBar from '@/components/FilterBar.vue'
import TableCard from '@/components/TableCard.vue'
import { useUserStore } from '@/stores/user'
import { listNotices, getNotice, addNotice, updateNotice, removeNotice } from '@/api/announcements'
const emit = defineEmits(['changed'])
const userStore = useUserStore()
const canQuery = computed(() => userStore.hasPermission('system:notice:query'))
const audiences = [{ value: 'ADMIN', label: '后台管理员' }, { value: 'USER', label: '普通用户' }, { value: 'ALL', label: '全部' }]
const audienceLabel = value => audiences.find(item => item.value === value)?.label || '范围未知'
const emptyFilters = () => ({ noticeTitle: '', audience: '', status: '' })
const filters = reactive(emptyFilters()), query = reactive({ pageNum: 1, pageSize: 10 })
const rows = ref([]), total = ref(0), loading = ref(false), error = ref(''), busy = ref(false)
let listGeneration = 0, editGeneration = 0
async function load() {
  const generation = ++listGeneration
  loading.value = true; error.value = ''
  try {
    const result = await listNotices({ ...query })
    if (generation !== listGeneration) return
    rows.value = result.rows || []; total.value = Number(result.total || 0)
    if (!rows.value.length && total.value > 0 && query.pageNum > 1) { query.pageNum--; return load() }
  } catch (e) { if (generation === listGeneration) { rows.value = []; total.value = 0; error.value = e?.message || '公告加载失败' } }
  finally { if (generation === listGeneration) loading.value = false }
}
function search() { Object.assign(query, filters, { noticeTitle: filters.noticeTitle.trim(), pageNum: 1 }); load() }
function reset() { Object.assign(filters, emptyFilters()); search() }
const emptyForm = () => ({ noticeId: undefined, noticeTitle: '', noticeType: '2', audience: 'ADMIN', noticeContent: '' })
const form = reactive(emptyForm()), editorVisible = ref(false), saving = ref(false), saveError = ref(''), originalStatus = ref('1')
function payload(notice, status) { return { noticeId: notice.noticeId, noticeTitle: notice.noticeTitle.trim(), noticeType: '2', audience: notice.audience, noticeContent: notice.noticeContent.trim(), status } }
function openCreate() { editGeneration++; Object.assign(form, emptyForm()); originalStatus.value = '1'; saveError.value = ''; editorVisible.value = true }
async function openEdit(row) {
  const generation = ++editGeneration
  try { const result = await getNotice(row.noticeId); if (generation !== editGeneration) return; Object.assign(form, payload(result, result.status)); originalStatus.value = result.status; saveError.value = ''; editorVisible.value = true }
  catch (e) { ElMessage.error(e?.message || '公告加载失败') }
}
function validate() {
  if (!form.noticeTitle.trim() || form.noticeTitle.trim().length > 50) { ElMessage.warning('标题必填且不超过50个字符'); return false }
  if (!form.noticeContent.trim() || form.noticeContent.trim().length > 5000) { ElMessage.warning('正文必填且不超过5000个字符'); return false }
  return true
}
async function confirmStatus(title) {
  try { await ElMessageBox.confirm(title, '公告状态', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }); return true }
  catch { return false }
}
async function save(status) {
  if (saving.value || !validate()) return
  saving.value = true; saveError.value = ''
  try {
    if (status === '0' && originalStatus.value !== '0' && !await confirmStatus(`启用后，${audienceLabel(form.audience)}即可阅读此公告。确认启用？`)) return
    const data = payload(form, status)
    await (form.noticeId ? updateNotice(data) : addNotice(data))
    ElMessage.success(status === '0' ? '公告已保存并启用' : '公告已保存'); editorVisible.value = false; emit('changed'); await load()
  } catch (e) { saveError.value = e?.message || '保存失败，请重试' }
  finally { saving.value = false }
}
async function toggle(row) {
  if (busy.value) return
  busy.value = true
  try {
    const enabling = row.status !== '0'
    if (!await confirmStatus(enabling ? `启用后，${audienceLabel(row.audience)}即可阅读“${row.noticeTitle}”。确认启用？` : `关闭“${row.noticeTitle}”后，接收者将无法继续阅读。确认关闭？`)) return
    await updateNotice(payload(row, enabling ? '0' : '1')); ElMessage.success(enabling ? '公告已启用' : '公告已关闭'); emit('changed'); await load()
  } catch (e) { ElMessage.error(e?.message || '状态更新失败') }
  finally { busy.value = false }
}
async function remove(row) {
  if (busy.value) return
  busy.value = true
  try {
    try { await ElMessageBox.confirm(`确认删除“${row.noticeTitle}”？该公告的已读记录也会删除。`, '删除公告', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }) } catch { return }
    await removeNotice(row.noticeId); ElMessage.success('公告已删除'); emit('changed'); await load()
  } catch (e) { ElMessage.error(e?.message || '删除失败') }
  finally { busy.value = false }
}
const previewVisible = ref(false), previewLoading = ref(false), previewData = ref(null), previewError = ref(''), previewRow = ref(null)
let previewGeneration = 0
function previewDraft() { if (!validate()) return; previewGeneration++; previewData.value = { ...form }; previewError.value = ''; previewLoading.value = false; previewVisible.value = true }
async function openPreview(row) {
  const generation = ++previewGeneration
  previewRow.value = row; previewVisible.value = true; previewLoading.value = true; previewError.value = ''; previewData.value = null
  try { const result = await getNotice(row.noticeId); if (generation === previewGeneration) previewData.value = result }
  catch (e) { if (generation === previewGeneration) previewError.value = e?.message || '预览加载失败' }
  finally { if (generation === previewGeneration) previewLoading.value = false }
}
onMounted(load)
onBeforeUnmount(() => { listGeneration++; previewGeneration++; editGeneration++ })
</script>
<style scoped>
.body-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8}.error{margin-bottom:16px}.hint{display:block;font-size:12px;color:#909399;margin-top:6px} :deep(.el-form-item__content){display:block}
</style>
