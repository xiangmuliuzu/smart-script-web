<template>
  <div class="profile-page">
    <div class="page-heading"><h1>个人资料</h1><p>管理展示给其他用户的个人信息</p></div>
    <div v-loading="loading" class="profile-panel">
      <div v-if="loadError" class="load-error"><el-alert title="资料加载失败，请重试" type="error" :closable="false" show-icon /><el-button @click="loadProfile">重新加载</el-button></div>
      <template v-else>
        <div class="section-title">基本信息</div>
        <div class="avatar-row">
          <el-avatar :size="72" :src="form.avatar || undefined"><el-icon :size="28"><UserFilled /></el-icon></el-avatar>
          <div><el-button :loading="uploading" @click="fileInput?.click()">更换头像</el-button><p>支持 JPG、PNG、GIF、BMP，最大 5 MB</p></div>
          <input ref="fileInput" class="file-input" type="file" accept=".jpg,.jpeg,.png,.gif,.bmp,image/jpeg,image/png,image/gif,image/bmp" @change="handleAvatar" />
        </div>
        <el-form label-position="top" class="profile-form" @submit.prevent="saveProfile">
          <el-form-item label="昵称"><el-input v-model="form.nickname" maxlength="30" show-word-limit placeholder="请输入昵称" /></el-form-item>
          <el-form-item label="个人简介"><el-input v-model="form.bio" type="textarea" :rows="4" maxlength="200" show-word-limit placeholder="介绍一下自己" /></el-form-item>
          <el-form-item label="手机号"><el-input :model-value="profile.phoneMasked || '—'" disabled /></el-form-item>
          <el-form-item label="账号类型"><el-input :model-value="userTypeLabel" disabled /></el-form-item>
          <el-form-item label="实名认证"><el-tag :type="realNameTagType">{{ realNameLabel }}</el-tag></el-form-item>
          <div class="profile-actions"><el-button @click="resetForm">重置</el-button><el-button type="primary" native-type="submit" :loading="saving" :disabled="uploading">保存修改</el-button></div>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getProfile, updateProfile, uploadAvatar } from '@/api/pcUser'
import { usePcUserStore } from '@/stores/pcUser'

const pcUserStore = usePcUserStore()
const profile = ref({})
const form = reactive({ nickname: '', avatar: '', bio: '' })
const loading = ref(false)
const loadError = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const userTypeLabel = computed(() => ({ '01': '普通用户', '02': '创作者', '03': '甲方' })[profile.value.userType] || '用户')
const realNameLabel = computed(() => ({ APPROVED: '已认证', PENDING: '审核中', REJECTED: '未通过', NOT_SUBMITTED: '未认证' })[profile.value.realNameStatus] || '未认证')
const realNameTagType = computed(() => ({ APPROVED: 'success', PENDING: 'warning', REJECTED: 'danger' })[profile.value.realNameStatus] || 'info')

function resetForm() {
  form.nickname = profile.value.nickname || ''
  form.avatar = profile.value.avatar || ''
  form.bio = profile.value.bio || ''
}

async function loadProfile() {
  loading.value = true
  loadError.value = false
  try {
    profile.value = await getProfile() || {}
    resetForm()
  } catch { loadError.value = true }
  finally { loading.value = false }
}

async function handleAvatar(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!/\.(jpe?g|png|gif|bmp)$/i.test(file.name) || !file.type.startsWith('image/')) {
    ElMessage.warning('请选择 JPG、PNG、GIF 或 BMP 图片')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5 MB')
    return
  }
  uploading.value = true
  try {
    const result = await uploadAvatar(file)
    if (result?.url) form.avatar = result.url
  } catch { /* 请求封装已提示错误 */ }
  finally { uploading.value = false }
}

async function saveProfile() {
  const nickname = form.nickname.trim()
  if (!nickname) { ElMessage.warning('请输入昵称'); return }
  saving.value = true
  try {
    const result = await updateProfile({ nickname, avatar: form.avatar, bio: form.bio.trim() })
    profile.value = result || profile.value
    pcUserStore.user = { ...(pcUserStore.user || {}), ...profile.value }
    resetForm()
    ElMessage.success('个人资料已保存')
  } catch { /* 请求封装已提示错误 */ }
  finally { saving.value = false }
}

onMounted(loadProfile)
</script>

<style scoped>
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}.profile-panel{max-width:780px;min-height:440px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;padding:28px 34px}.section-title{font-size:16px;font-weight:600;color:#303133;padding-bottom:18px;border-bottom:1px solid #edf0f2}.avatar-row{display:flex;align-items:center;gap:18px;padding:24px 0}.avatar-row p{font-size:12px;color:#a0a5ac;margin-top:8px}.file-input{display:none}.profile-form{max-width:500px}.profile-form :deep(.el-form-item){margin-bottom:24px}.profile-form :deep(.el-form-item__label){color:#606266;font-size:13px}.profile-form :deep(.el-input__inner){height:34px!important}.profile-actions{display:flex;gap:10px;padding-top:8px}
.load-error{display:flex;align-items:center;gap:16px}
@media(max-width:700px){.profile-panel{padding:20px}}
</style>
