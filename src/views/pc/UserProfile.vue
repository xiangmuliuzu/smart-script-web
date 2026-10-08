<template>
  <div class="profile-page">
    <div class="page-heading"><h1>个人资料</h1><p>管理展示给其他用户的个人信息</p></div>

    <!-- 首次加载遮罩：加载完成前不提交空表单 -->
    <div v-loading="loading" class="profile-panel">
      <div v-if="loadError" class="load-error">
        <el-alert title="资料加载失败，请重试" type="error" :closable="false" show-icon />
        <el-button @click="loadProfile">重新加载</el-button>
      </div>

      <!-- 基础资料异常：缺少必需身份字段时不开放编辑，可选字段为空正常显示 -->
      <div v-else-if="profileInvalid" class="load-error">
        <el-alert title="账号基础资料异常，暂不能编辑" description="缺少必需的账号信息，请重新加载；若持续出现请联系管理员。" type="error" :closable="false" show-icon />
        <el-button @click="loadProfile">重新加载</el-button>
      </div>

      <template v-else-if="profileLoaded">
        <!-- ① 基本资料 -->
        <section class="profile-section">
          <h2 class="section-title">基本资料</h2>
          <div class="avatar-row">
            <el-avatar :size="72" :src="form.avatar || undefined"><el-icon :size="28"><UserFilled /></el-icon></el-avatar>
            <div>
              <el-button :loading="uploading" :disabled="saving" @click="fileInput?.click()">更换头像</el-button>
              <p>支持 JPG、PNG、GIF、BMP，最大 5 MB；上传后需点击保存生效</p>
            </div>
            <input ref="fileInput" class="file-input" type="file" accept=".jpg,.jpeg,.png,.gif,.bmp,image/jpeg,image/png,image/gif,image/bmp" @change="handleAvatar" />
          </div>
          <el-form label-position="top" class="profile-form" @submit.prevent="saveProfile">
            <el-form-item label="昵称">
              <el-input v-model="form.nickname" maxlength="30" show-word-limit :disabled="saving" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="form.bio" type="textarea" :rows="4" maxlength="200" show-word-limit :disabled="saving" placeholder="介绍一下自己" />
            </el-form-item>
            <div class="profile-actions">
              <el-button :disabled="saving || uploading" @click="resetForm">重置</el-button>
              <el-button type="primary" native-type="submit" :loading="saving" :disabled="uploading">保存修改</el-button>
            </div>
          </el-form>
        </section>

        <!-- ② 账号信息（只读） -->
        <section class="profile-section">
          <h2 class="section-title">账号信息</h2>
          <el-form label-position="top" class="readonly-form">
            <el-form-item label="手机号"><el-input :model-value="profile.phoneMasked || '—'" disabled /></el-form-item>
            <el-form-item label="注册时间"><el-input :model-value="registeredAtText" disabled /></el-form-item>
            <el-form-item label="账号状态">
              <el-tag :type="accountStatusTagType">{{ accountStatusText }}</el-tag>
            </el-form-item>
            <el-form-item label="账号类型"><el-input :model-value="userTypeText" disabled /></el-form-item>
            <el-form-item label="实名认证"><el-tag :type="realNameTag">{{ realNameText }}</el-tag></el-form-item>
          </el-form>
        </section>

        <!-- ③ 创作者资料（仅 authorCapability === true 展示，本次只读） -->
        <section v-if="pcUserStore.authorCapability" class="profile-section">
          <h2 class="section-title">创作者资料</h2>
          <el-form label-position="top" class="readonly-form">
            <el-form-item label="笔名"><el-input :model-value="creator.penName || '未填写'" disabled /></el-form-item>
            <el-form-item label="擅长创作类型">
              <span v-if="creator.specialties?.length" class="specialty-tags">
                <el-tag v-for="item in creator.specialties" :key="item.code" type="info">{{ item.name }}</el-tag>
              </span>
              <span v-else class="empty-text">暂未填写擅长类型</span>
            </el-form-item>
            <el-form-item label="创作者介绍">
              <p class="creator-intro">{{ creator.introduction || '未填写' }}</p>
            </el-form-item>
          </el-form>
        </section>

        <!-- ④ 账号安全 -->
        <section class="profile-section">
          <h2 class="section-title">账号安全</h2>

          <!-- 已有密码：修改密码 -->
          <el-form v-if="pcUserStore.hasPassword" label-position="top" class="security-form" @submit.prevent="submitPasswordChange">
            <el-form-item label="旧密码">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password autocomplete="current-password" :disabled="passwordSubmitting" placeholder="请输入旧密码" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="8–64 个字符，需包含字母和数字" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="再次输入新密码" />
            </el-form-item>
            <div class="profile-actions">
              <el-button type="primary" native-type="submit" :loading="passwordSubmitting">确认修改</el-button>
            </div>
          </el-form>

          <!-- 无密码账号：首次设置密码，不需要旧密码 -->
          <el-form v-else label-position="top" class="security-form" @submit.prevent="submitPasswordSet">
            <el-alert class="set-password-tip" title="当前账号尚未设置密码，设置后可使用密码登录" type="info" :closable="false" show-icon />
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="8–64 个字符，需包含字母和数字" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="再次输入新密码" />
            </el-form-item>
            <div class="profile-actions">
              <el-button type="primary" native-type="submit" :loading="passwordSubmitting">设置密码</el-button>
            </div>
          </el-form>
        </section>

        <!-- ⑤ 个人印章（A5 组件挂载区；组件交付前显示占位说明） -->
        <section class="profile-section">
          <h2 class="section-title">个人印章</h2>
          <div class="seal-placeholder">个人印章模块待接入</div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { getProfile, updateProfile, uploadAvatar, changePassword, setPassword } from '@/api/pcUser'
import { usePcUserStore } from '@/stores/pcUser'
import {
  userTypeLabel as userTypeTextOf,
  realNameStatusLabel,
  realNameTagType,
  accountStatusLabel,
  formatRegisteredTime,
  passwordPolicyError
} from '@/utils/pcFormat'

const router = useRouter()
const pcUserStore = usePcUserStore()

const profile = ref(null)
const form = reactive({ nickname: '', avatar: '', bio: '' })
const loading = ref(false)
const loadError = ref(false)
const profileLoaded = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const passwordSubmitting = ref(false)
const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })

// ---- 展示口径（pcFormat 纯函数，未知值显示「状态未知」，不兜底为正常） ----
const userTypeText = computed(() => userTypeTextOf(profile.value?.userType))
const realNameText = computed(() => realNameStatusLabel(profile.value?.realNameStatus))
// F06：模板绑定的必须是计算后的语义字符串，不能是函数本身
const realNameTag = computed(() => realNameTagType(profile.value?.realNameStatus))
const accountStatusText = computed(() => accountStatusLabel(profile.value?.accountStatus))
const accountStatusTagType = computed(() => ({ 0: 'success', 1: 'danger' })[profile.value?.accountStatus] || 'info')
const registeredAtText = computed(() => formatRegisteredTime(profile.value?.registeredAt))
const creator = computed(() => profile.value?.creatorProfile || {})

/** 必需身份字段缺失视为异常状态；可选字段（简介/头像/笔名等）为空正常显示 */
const profileInvalid = computed(() => profileLoaded.value && (!profile.value?.userId || !profile.value?.nickname))

function resetForm() {
  // 恢复最近一次成功获取/保存的资料，不能用默认空值覆盖已保存内容
  form.nickname = profile.value?.nickname || ''
  form.avatar = profile.value?.avatar || ''
  form.bio = profile.value?.bio || ''
}

async function loadProfile() {
  loading.value = true
  loadError.value = false
  try {
    profile.value = await getProfile() || {}
    profileLoaded.value = true
    resetForm()
  } catch {
    // 失败不当成无资料：保留错误态，等待重新加载
    loadError.value = true
  } finally {
    loading.value = false
  }
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
    // 上传成功只更新待保存头像，点击「保存修改」后才绑定资料；失败保留原头像
    if (result?.url) {
      form.avatar = result.url
      ElMessage.success('头像已上传，请点击保存修改生效')
    }
  } catch {
    // 请求封装已提示错误；保留原待保存头像，不发送资料保存请求
  } finally {
    uploading.value = false
  }
}

function applyProfileResult(result) {
  profile.value = result || profile.value
  // 只同步展示字段；authorCapability/hasPassword 等身份字段保留在 /auth/me 与 Store
  const current = pcUserStore.user || {}
  pcUserStore.user = {
    ...current,
    nickname: profile.value?.nickname ?? current.nickname,
    avatar: profile.value?.avatar ?? current.avatar,
    bio: profile.value?.bio ?? current.bio
  }
}

async function saveProfile() {
  if (saving.value) return
  const nickname = form.nickname.trim()
  if (!nickname) {
    ElMessage.warning('请输入昵称')
    return
  }
  if (nickname.length > 30) {
    ElMessage.warning('昵称不能超过 30 个字符')
    return
  }
  saving.value = true
  try {
    // bio 去首尾空白后提交（空串表示清空，与后端同一口径）
    const result = await updateProfile({ nickname, avatar: form.avatar, bio: form.bio.trim() })
    applyProfileResult(result)
    resetForm()
    ElMessage.success('个人资料已保存')
  } catch {
    // 保存失败保留输入以便重试，不伪造成功
  } finally {
    saving.value = false
  }
}

// ---- 账号安全 ----

function clearPasswordForm() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

function validateNewPassword() {
  const error = passwordPolicyError(passwordForm.newPassword)
  if (error) {
    ElMessage.warning(error)
    return false
  }
  if (pcUserStore.hasPassword && passwordForm.newPassword === passwordForm.oldPassword) {
    ElMessage.warning('新密码不能与旧密码相同')
    return false
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return false
  }
  return true
}

async function submitPasswordChange() {
  if (passwordSubmitting.value) return
  if (!passwordForm.oldPassword) {
    ElMessage.warning('请输入旧密码')
    return
  }
  if (!validateNewPassword()) return
  passwordSubmitting.value = true
  try {
    // 确认新密码只做前端校验，不传给接口；成功后服务端吊销全部会话
    await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
    clearPasswordForm()
    pcUserStore.resetSession()
    ElMessage.success('密码已修改，请重新登录')
    router.replace('/login')
  } catch {
    // 旧密码错误等服务端拒绝：保留输入可重试，不退出有效会话
  } finally {
    passwordSubmitting.value = false
  }
}

async function submitPasswordSet() {
  if (passwordSubmitting.value) return
  if (!validateNewPassword()) return
  passwordSubmitting.value = true
  try {
    // 无密码账号首次设置：不需要旧密码；成功保留当前会话、吊销其他会话
    await setPassword({ password: passwordForm.newPassword })
    clearPasswordForm()
    await pcUserStore.fetchMe()
    ElMessage.success('密码已设置')
  } catch (error) {
    // 状态冲突（服务端判定已有密码，40904）或其他失败：刷新身份同步入口，
    // 页面立即切换为「修改密码」，不要求用户手动重新进入
    try {
      await pcUserStore.fetchMe()
    } catch {
      // 刷新失败保留当前入口，可重试
    }
    if (error?.businessCode === 40904) {
      clearPasswordForm()
    }
  } finally {
    passwordSubmitting.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}
.profile-panel{max-width:780px;min-height:440px;background:#fff;border:1px solid #e7e9ec;border-radius:8px;padding:28px 34px}
.profile-section{padding-bottom:28px;margin-bottom:28px;border-bottom:1px solid #edf0f2}
.profile-section:last-child{padding-bottom:0;margin-bottom:0;border-bottom:0}
.section-title{font-size:16px;font-weight:600;color:#303133;padding-bottom:14px;border-bottom:1px solid #f2f4f6;margin-bottom:6px}
.avatar-row{display:flex;align-items:center;gap:18px;padding:20px 0 4px}.avatar-row p{font-size:12px;color:#a0a5ac;margin-top:8px}.file-input{display:none}
.profile-form,.readonly-form,.security-form{max-width:500px}
.profile-form :deep(.el-form-item),.readonly-form :deep(.el-form-item),.security-form :deep(.el-form-item){margin-bottom:22px}
.profile-form :deep(.el-form-item__label),.readonly-form :deep(.el-form-item__label),.security-form :deep(.el-form-item__label){color:#606266;font-size:13px}
.profile-form :deep(.el-input__inner),.readonly-form :deep(.el-input__inner),.security-form :deep(.el-input__inner){height:34px!important}
.profile-actions{display:flex;gap:10px;padding-top:8px}
.specialty-tags{display:flex;flex-wrap:wrap;gap:8px}
.creator-intro{color:#303133;font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
.empty-text{color:#8a8f99;font-size:14px}
.set-password-tip{margin-bottom:20px}
.seal-placeholder{display:flex;align-items:center;justify-content:center;min-height:110px;border:1px dashed #d3d7dd;border-radius:8px;color:#8a8f99;font-size:14px}
.load-error{display:flex;align-items:center;gap:16px;padding:24px 0}
@media(max-width:700px){.profile-panel{padding:20px}}
</style>
