<template>
  <section class="announcement-reader">
    <div class="reader-toolbar"><span>未读公告 <strong>{{ unread === null ? '—' : unread }}</strong></span><div><el-button :disabled="loading" @click="load">刷新</el-button><el-button :loading="markingAll" @click="readAll">全部标为已读</el-button></div></div>
    <div v-loading="loading" class="reader-list">
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon><template #default><el-button link @click="load">重新加载</el-button></template></el-alert>
      <button v-for="notice in rows" :key="notice.noticeId" type="button" class="notice-row" @click="open(notice.noticeId)"><span class="dot" :class="{ read: notice.isRead }" /><div class="notice-copy"><strong>{{ notice.noticeTitle }}</strong><span>公告 · {{ notice.createTime }}</span></div><el-tag :type="notice.isRead ? 'info' : 'warning'" size="small">{{ notice.isRead ? '已读' : '未读' }}</el-tag></button>
      <el-empty v-if="!loading && !error && !rows.length" description="暂无平台公告" :image-size="70" />
    </div>
    <el-pagination v-if="total > 0" v-model:current-page="page" background layout="total, prev, pager, next" :total="total" :page-size="10" class="reader-pager" @current-change="load" />
    <el-dialog v-model="detailVisible" title="公告详情" width="min(650px, 90vw)" append-to-body @closed="closeDetail">
      <div v-loading="detailLoading" style="min-height:150px"><el-alert v-if="detailError" :title="detailError" type="error" :closable="false"><template #default><el-button link @click="open(detailId)">重试</el-button></template></el-alert><template v-if="detail"><h3>{{ detail.noticeTitle }}</h3><p class="notice-date">{{ detail.createTime }}</p><p class="body-text">{{ detail.noticeContent }}</p><el-alert v-if="readError" title="已读状态更新失败" type="warning" :closable="false"><template #default><el-button link :loading="marking" @click="markDetail">重试标记已读</el-button></template></el-alert></template></div>
    </el-dialog>
  </section>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({ api: { type: Object, required: true } })
const emit = defineEmits(['changed'])
const page = ref(1), total = ref(0), rows = ref([]), unread = ref(null), loading = ref(false), error = ref(''), markingAll = ref(false)
let listGeneration = 0, detailGeneration = 0
async function load() {
  const generation = ++listGeneration
  loading.value = true; error.value = ''
  const [listResult, countResult] = await Promise.allSettled([props.api.list({ pageNum: page.value, pageSize: 10 }), props.api.unreadCount({ silent: true })])
  if (generation !== listGeneration) return
  if (countResult.status === 'fulfilled' && Number.isInteger(countResult.value?.total) && countResult.value.total >= 0) unread.value = countResult.value.total
  else unread.value = null
  if (listResult.status === 'fulfilled') { rows.value = listResult.value.rows || listResult.value.list || []; total.value = Number(listResult.value.total || 0); if (!rows.value.length && total.value > 0 && page.value > 1) { page.value--; return load() } }
  else { rows.value = []; total.value = 0; error.value = listResult.reason?.message || '公告加载失败' }
  loading.value = false
}
async function readAll() {
  if (markingAll.value) return
  markingAll.value = true
  try { await props.api.readAll(); emit('changed'); await load() }
  catch (e) { error.value = e?.message || '标记失败，请重试' }
  finally { markingAll.value = false }
}
const detailVisible = ref(false), detailLoading = ref(false), detail = ref(null), detailId = ref(null), detailError = ref(''), readError = ref(false), marking = ref(false)
function closeDetail() { detailGeneration++; detail.value = null; marking.value = false }
async function open(id) {
  const generation = ++detailGeneration
  detailId.value = id; detailVisible.value = true; detailLoading.value = true; detailError.value = ''; readError.value = false; detail.value = null; marking.value = false
  try {
    const result = await props.api.detail(id)
    if (generation !== detailGeneration) return
    detail.value = result
    detailLoading.value = false
    if (!result.isRead) await markDetail()
  } catch (e) { if (generation === detailGeneration) detailError.value = e?.message || '公告详情加载失败' }
  finally { if (generation === detailGeneration) detailLoading.value = false }
}
async function markDetail() {
  if (marking.value || !detail.value) return
  const generation = detailGeneration, id = detailId.value
  marking.value = true; readError.value = false
  try {
    await props.api.read(id)
    if (generation !== detailGeneration) return
    detail.value.isRead = true; rows.value.forEach(row => { if (row.noticeId === id) row.isRead = true }); emit('changed'); await load()
  } catch { if (generation === detailGeneration) readError.value = true }
  finally { if (generation === detailGeneration) marking.value = false }
}
defineExpose({ refresh: load })
onMounted(load)
onBeforeUnmount(() => { listGeneration++; detailGeneration++ })
</script>
<style scoped>
.announcement-reader{background:#fff;border:1px solid #e7e9ec;border-radius:8px;overflow:hidden}.reader-toolbar{padding:16px 20px;border-bottom:1px solid #edf0f2;display:flex;align-items:center;justify-content:space-between;gap:12px;color:#606266;font-size:13px}.reader-list{min-height:180px}.notice-row{display:flex;align-items:center;gap:14px;width:100%;border:0;border-bottom:1px solid #edf0f2;background:#fff;padding:20px;text-align:left;cursor:pointer;color:#303133}.notice-row:hover{background:#fafbfc}.dot{width:7px;height:7px;flex-shrink:0;border-radius:50%;background:#e6a23c}.dot.read{background:transparent}.notice-copy{display:flex;flex:1;min-width:0;flex-direction:column;gap:7px}.notice-copy strong{font-size:14px;overflow-wrap:anywhere}.notice-copy span,.notice-date{font-size:12px;color:#909399}.body-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.8}.reader-pager{padding:16px 20px;justify-content:flex-end}
</style>
