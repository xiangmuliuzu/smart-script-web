<template>
  <div class="work-detail-page">
    <div class="page-heading">
      <h1>作品详情</h1>
      <p>查看作品信息、管理章节与提交审核</p>
    </div>

    <!-- 加载中/失败态 -->
    <div v-if="loading" class="work-panel">
      <div v-loading="true" style="min-height: 260px"></div>
    </div>
    <div v-else-if="loadError" class="work-panel">
      <div class="load-error">
        <el-alert title="作品加载失败" :description="loadError" type="error" :closable="false" show-icon />
        <el-button style="margin-top: 16px" @click="loadDetail">重新加载</el-button>
      </div>
    </div>

    <template v-else-if="work">
      <!-- ① 作品基本信息 -->
      <section class="work-panel">
        <div class="work-head">
          <el-avatar :size="96" shape="square" :src="work.cover || undefined">
            <el-icon :size="40"><Document /></el-icon>
          </el-avatar>
          <div class="work-head-main">
            <div class="work-title-row">
              <h2 class="work-title">{{ work.title }}</h2>
              <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
            </div>
            <p class="work-meta">
              <span>{{ workTypeText }}</span>
              <span v-if="work.genreName">· {{ work.genreName }}</span>
              <span>· 创建 {{ work.createTime || work.createdAt || '—' }}</span>
              <span>· 更新 {{ work.updateTime || work.updatedAt || '—' }}</span>
            </p>
            <p class="work-summary">{{ work.summary || '暂无简介' }}</p>
          </div>
          <div class="work-actions">
            <template v-if="editable">
              <el-button type="primary" @click="openEditDialog">编辑作品</el-button>
              <el-button :loading="submitting" @click="handleSubmit">提交审核</el-button>
            </template>
            <el-button plain @click="contactAdmin">联系管理员</el-button>
          </div>
        </div>

        <!-- 审核中提示 -->
        <el-alert v-if="work.status === 'reviewing'" title="作品正在审核中，审核期间不可编辑或重复提交" type="warning" :closable="false" show-icon style="margin-top: 16px" />
        <!-- 待修改/已驳回提示 -->
        <el-alert v-else-if="work.status === 'revision' || work.status === 'rejected'" :title="work.status === 'revision' ? '作品需要修改后重新提交审核' : '作品已被驳回，请查看驳回原因并修改'" type="error" :closable="false" show-icon style="margin-top: 16px" />
        <!-- 已上架提示 -->
        <el-alert v-else-if="work.status === 'published'" title="作品已上架，如需修改将重新进入审核流程" type="success" :closable="false" show-icon style="margin-top: 16px" />
      </section>

      <!-- ② 章节目录 -->
      <section class="work-panel">
        <div class="section-head">
          <h2 class="section-title">章节目录</h2>
          <el-button v-if="editable" size="small" type="primary" plain @click="openChapterDialog()">新增章节</el-button>
        </div>
        <el-empty v-if="!chapters.length" description="暂无章节" :image-size="60">
          <el-button v-if="editable" type="primary" @click="openChapterDialog()">新增第一章</el-button>
        </el-empty>
        <div v-else class="chapter-list">
          <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-row">
            <div class="chapter-info">
              <span class="chapter-no">第 {{ chapter.chapterNo }} 章</span>
              <span class="chapter-title">{{ chapter.chapterTitle || '（未命名章节）' }}</span>
              <span class="chapter-count">{{ chapter.wordCount || 0 }} 字</span>
            </div>
            <div class="chapter-actions">
              <el-button v-if="editable" size="small" text type="primary" @click="openChapterDialog(chapter)">编辑</el-button>
              <el-button v-if="editable" size="small" text type="danger" @click="handleDeleteChapter(chapter)">删除</el-button>
              <el-button size="small" text @click="expandedChapterId = expandedChapterId === chapter.chapterId ? null : chapter.chapterId">
                {{ expandedChapterId === chapter.chapterId ? '收起' : '查看内容' }}
              </el-button>
            </div>
            <div v-if="expandedChapterId === chapter.chapterId" class="chapter-content">
              <p style="white-space: pre-wrap">{{ chapter.content || '（本章暂无内容）' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ③ 审核历史 -->
      <section class="work-panel">
        <h2 class="section-title">审核历史</h2>
        <el-empty v-if="!reviewRecords.length" description="暂无审核记录" :image-size="60" />
        <el-timeline v-else class="review-timeline">
          <el-timeline-item
            v-for="record in reviewRecords"
            :key="record.reviewId"
            :timestamp="record.createdAt"
            :type="timelineType(record)"
          >
            <div class="review-item">
              <div class="review-head">
                <strong>{{ record.reviewResult === 'approved' ? '审核通过' : record.reviewResult === 'rejected' ? '审核驳回' : record.reviewResult === 'revision' ? '发回修改' : '提交审核' }}</strong>
                <span class="review-status">{{ reviewStatusText(record) }}</span>
              </div>
              <p v-if="record.reviewOpinion" class="review-opinion">意见：{{ record.reviewOpinion }}</p>
              <p v-if="record.reviewerName" class="review-meta">审核人：{{ record.reviewerName }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </section>
    </template>

    <!-- 编辑作品弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑作品" width="520px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="作品名称" required>
          <el-input v-model="editForm.title" maxlength="100" show-word-limit placeholder="请输入作品名称" />
        </el-form-item>
        <el-form-item label="作品简介">
          <el-input v-model="editForm.summary" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入作品简介" />
        </el-form-item>
        <el-form-item label="作品分类">
          <el-select v-model="editForm.genreId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="g in genreOptions" :key="g.categoryId" :label="g.categoryName" :value="g.categoryId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveWork">保存</el-button>
      </template>
    </el-dialog>

    <!-- 章节编辑弹窗 -->
    <el-dialog v-model="chapterDialogVisible" :title="chapterForm.chapterId ? '编辑章节' : '新增章节'" width="640px">
      <el-form :model="chapterForm" label-width="80px">
        <el-form-item label="章节标题" required>
          <el-input v-model="chapterForm.chapterTitle" maxlength="100" show-word-limit placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="章节内容">
          <el-input v-model="chapterForm.content" type="textarea" :rows="12" placeholder="请输入章节内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveChapter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { getWorkDetail, updateWork, submitWork, addChapter, updateChapter, deleteChapter, getReviewRecords } from '@/api/pcWork'

const route = useRoute()
const router = useRouter()
const workId = computed(() => Number(route.params.workId))

const loading = ref(true)
const loadError = ref('')
const work = ref(null)
const chapters = ref([])
const reviewRecords = ref([])
const expandedChapterId = ref(null)

const editDialogVisible = ref(false)
const editForm = ref({ title: '', summary: '', genreId: null })

const chapterDialogVisible = ref(false)
const chapterForm = ref({ chapterId: null, chapterTitle: '', content: '' })

const saving = ref(false)
const submitting = ref(false)

/** 可编辑状态：草稿/待修改/已驳回 */
const editable = computed(() => ['draft', 'revision', 'rejected'].includes(work.value?.status))

const statusTextMap = {
  draft: '草稿', reviewing: '审核中', revision: '待修改', rejected: '已驳回', published: '已上架'
}
const statusTagTypeMap = {
  draft: 'info', reviewing: 'primary', revision: 'warning', rejected: 'danger', published: 'success'
}
const statusText = computed(() => statusTextMap[work.value?.status] || work.value?.status || '—')
const statusTagType = computed(() => statusTagTypeMap[work.value?.status] || 'info')
const workTypeText = computed(() => {
  const map = { script: '剧本', comic: '漫画', drama: '短剧' }
  return map[work.value?.workType] || work.value?.workType || '作品'
})

/** 分类选项（写死常见分类，后端 genre 枚举：1-12 题材、20-22 风格、30-31 频道） */
const genreOptions = [
  { categoryId: 1, categoryName: '古装言情' }, { categoryId: 2, categoryName: '都市悬疑' },
  { categoryId: 3, categoryName: '穿越复仇' }, { categoryId: 4, categoryName: '科幻末世' },
  { categoryId: 5, categoryName: '喜剧轻喜' }, { categoryId: 6, categoryName: '甜宠恋爱' },
  { categoryId: 7, categoryName: '家庭伦理' }, { categoryId: 8, categoryName: '职场商战' },
  { categoryId: 9, categoryName: '历史权谋' }, { categoryId: 10, categoryName: '青春校园' },
  { categoryId: 11, categoryName: '武侠仙侠' }, { categoryId: 12, categoryName: '犯罪推理' }
]

async function loadDetail() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await getWorkDetail(workId.value)
    work.value = data.work
    chapters.value = data.chapters || []
    // 审核历史单独加载
    try {
      reviewRecords.value = await getReviewRecords(workId.value)
    } catch (e) {
      reviewRecords.value = []
    }
    // 初始展开第一章节？不展开，避免长内容
  } catch (e) {
    loadError.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function openEditDialog() {
  editForm.value = {
    title: work.value?.title || '',
    summary: work.value?.summary || '',
    genreId: work.value?.genreId || null
  }
  editDialogVisible.value = true
}

async function handleSaveWork() {
  if (!editForm.value.title?.trim()) {
    ElMessage.warning('请输入作品名称')
    return
  }
  saving.value = true
  try {
    await updateWork(workId.value, {
      title: editForm.value.title.trim(),
      summary: editForm.value.summary,
      genreId: editForm.value.genreId
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    await loadDetail()
  } catch (e) {
    // pcRequest 已弹全局提示
  } finally {
    saving.value = false
  }
}

function openChapterDialog(chapter) {
  chapterForm.value = chapter
    ? { chapterId: chapter.chapterId, chapterTitle: chapter.chapterTitle || '', content: chapter.content || '' }
    : { chapterId: null, chapterTitle: '', content: '' }
  chapterDialogVisible.value = true
}

async function handleSaveChapter() {
  if (!chapterForm.value.chapterTitle?.trim()) {
    ElMessage.warning('请输入章节标题')
    return
  }
  saving.value = true
  try {
    if (chapterForm.value.chapterId) {
      await updateChapter(workId.value, chapterForm.value.chapterId, {
        chapterTitle: chapterForm.value.chapterTitle.trim(),
        content: chapterForm.value.content
      })
    } else {
      await addChapter(workId.value, {
        chapterTitle: chapterForm.value.chapterTitle.trim(),
        content: chapterForm.value.content
      })
    }
    ElMessage.success('保存成功')
    chapterDialogVisible.value = false
    await loadDetail()
  } catch (e) {
    // pcRequest 已弹全局提示
  } finally {
    saving.value = false
  }
}

async function handleDeleteChapter(chapter) {
  try {
    await ElMessageBox.confirm(`确认删除「第 ${chapter.chapterNo} 章 ${chapter.chapterTitle || ''}」？删除后不可恢复。`, '删除章节', { type: 'warning' })
  } catch (e) {
    return
  }
  try {
    await deleteChapter(workId.value, chapter.chapterId)
    ElMessage.success('删除成功')
    await loadDetail()
  } catch (e) {
    // pcRequest 已弹全局提示
  }
}

async function handleSubmit() {
  try {
    await ElMessageBox.confirm('提交后作品将进入审核流程，审核期间不可编辑。确认提交审核？', '提交审核', { type: 'info' })
  } catch (e) {
    return
  }
  submitting.value = true
  try {
    await submitWork(workId.value)
    ElMessage.success('提交成功，等待审核')
    await loadDetail()
  } catch (e) {
    // pcRequest 已弹全局提示
  } finally {
    submitting.value = false
  }
}

/** 联系管理员：向 A3 消息模块传递业务参数（分工文档约定） */
function contactAdmin() {
  router.push({
    path: '/pc/user/messages',
    query: {
      businessType: 'WORK',
      businessId: workId.value,
      businessName: work.value?.title || '',
      targetUserId: ''
    }
  })
}

function timelineType(record) {
  if (record.reviewResult === 'approved') return 'success'
  if (record.reviewResult === 'rejected' || record.reviewResult === 'revision') return 'danger'
  return 'primary'
}

function reviewStatusText(record) {
  const map = { pending_review: '待审核', reviewing: '审核中', approved: '已通过', rejected: '已驳回', revision: '待修改' }
  return map[record.status] || record.status || '—'
}

onMounted(loadDetail)
</script>

<style scoped>
.work-detail-page{max-width:920px}
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}
.work-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;padding:24px;margin-bottom:20px}
.work-head{display:flex;gap:20px;align-items:flex-start}
.work-head-main{flex:1;min-width:0}
.work-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.work-title{font-size:20px;font-weight:600;color:#1f2329;margin:0}
.work-meta{font-size:13px;color:#8a8f99;margin:10px 0 0}
.work-summary{font-size:14px;color:#4e5969;margin:14px 0 0;line-height:1.7}
.work-actions{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.section-title{font-size:16px;font-weight:600;color:#1f2329;margin:0 0 12px}
.chapter-list{border:1px solid #edf0f2;border-radius:8px;overflow:hidden}
.chapter-row{padding:14px 16px;border-bottom:1px solid #f2f3f5;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.chapter-row:last-child{border-bottom:none}
.chapter-info{display:flex;align-items:center;gap:12px;min-width:0}
.chapter-no{color:#8a8f99;font-size:13px;flex-shrink:0}
.chapter-title{font-size:14px;color:#1f2329;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:380px}
.chapter-count{font-size:12px;color:#c2c7d0;flex-shrink:0}
.chapter-actions{display:flex;gap:4px;flex-shrink:0}
.chapter-content{padding:14px 16px;background:#f7f8fa;border-top:1px solid #f2f3f5;font-size:14px;color:#4e5969;line-height:1.8;width:100%}
.load-error{padding:40px 0;text-align:center}
.review-timeline{padding:0 4px}
.review-item{padding-bottom:4px}
.review-head{display:flex;align-items:center;gap:10px}
.review-status{font-size:12px;color:#8a8f99}
.review-opinion{font-size:13px;color:#4e5969;margin:6px 0 2px}
.review-meta{font-size:12px;color:#c2c7d0;margin:2px 0 0}
</style>
