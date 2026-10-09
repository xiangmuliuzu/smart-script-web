<template>
  <div class="profile-page">
    <div class="page-heading"><h1>个人资料</h1><p>完善个人信息，管理你的账户</p></div>

    <div v-loading="loading" class="profile-panel">
      <div v-if="loadError" class="load-error">
        <el-alert title="资料加载失败，请重试" type="error" :closable="false" show-icon />
        <el-button @click="loadProfile">重新加载</el-button>
      </div>
      <div v-else-if="profileInvalid" class="load-error">
        <el-alert title="账号基础资料异常，暂不能编辑" description="缺少必需的账号信息，请重新加载；若持续出现请联系管理员。" type="error" :closable="false" show-icon />
        <el-button @click="loadProfile">重新加载</el-button>
      </div>

      <template v-else-if="profileLoaded">
        <div class="profile-identity">
          <el-avatar :size="88" :src="form.avatar || undefined"><el-icon :size="36"><UserFilled /></el-icon></el-avatar>
          <div class="identity-copy">
            <h2>{{ profile.nickname }}</h2>
            <div class="identity-meta">
              <span>{{ userTypeText }}</span>
              <span class="identity-divider"></span>
              <el-tag :type="realNameTag" effect="plain" round size="small">{{ realNameText }}</el-tag>
            </div>
          </div>
          <div class="avatar-upload">
            <el-button :loading="uploading" :disabled="saving" :icon="Upload" @click="fileInput?.click()">更换头像</el-button>
            <p>JPG、PNG、GIF、BMP · 最大 5 MB</p>
            <span>上传后请在基本资料中保存修改</span>
          </div>
          <input ref="fileInput" class="file-input" type="file" accept=".jpg,.jpeg,.png,.gif,.bmp,image/jpeg,image/png,image/gif,image/bmp" @change="handleAvatar" />
        </div>

        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="基本资料" name="basic">
            <div class="basic-layout">
              <section class="profile-editor">
                <div class="section-heading"><h2>公开资料</h2><p>让其他用户更好地认识你</p></div>
                <el-form label-position="top" class="profile-form" @submit.prevent="saveProfile">
                  <el-form-item label="昵称">
                    <el-input v-model="form.nickname" maxlength="30" show-word-limit :disabled="saving" placeholder="请输入昵称" />
                  </el-form-item>
                  <el-form-item label="个人简介">
                    <el-input v-model="form.bio" type="textarea" :rows="4" maxlength="200" show-word-limit :disabled="saving" placeholder="聊聊你的经历、兴趣，或正在创作的故事" />
                  </el-form-item>
                  <div class="profile-actions">
                    <el-button :disabled="saving || uploading" @click="resetForm">重置</el-button>
                    <el-button type="primary" native-type="submit" :loading="saving" :disabled="uploading">保存修改</el-button>
                  </div>
                </el-form>
              </section>
              <section class="account-summary">
                <div class="section-heading"><h2>账号信息</h2><p>当前账户的基础信息</p></div>
                <dl class="account-details">
                  <div><dt>手机号</dt><dd>{{ profile.phoneMasked || '—' }}</dd></div>
                  <div><dt>账号类型</dt><dd>{{ userTypeText }}</dd></div>
                  <div><dt>账号状态</dt><dd><el-tag :type="accountStatusTagType" size="small">{{ accountStatusText }}</el-tag></dd></div>
                  <div><dt>实名认证</dt><dd><el-tag :type="realNameTag" size="small">{{ realNameText }}</el-tag></dd></div>
                  <div><dt>注册时间</dt><dd>{{ registeredAtText }}</dd></div>
                </dl>
              </section>
            </div>
          </el-tab-pane>

          <el-tab-pane label="账号安全" name="security">
            <div class="security-layout">
              <section class="security-editor">
                <div class="section-heading"><h2>{{ pcUserStore.hasPassword ? '修改密码' : '设置密码' }}</h2><p>为你的账户设置一个可靠的登录密码</p></div>
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
                  <div class="profile-actions"><el-button type="primary" native-type="submit" :loading="passwordSubmitting">确认修改</el-button></div>
                </el-form>
                <el-form v-else label-position="top" class="security-form" @submit.prevent="submitPasswordSet">
                  <el-alert class="set-password-tip" title="当前账号尚未设置密码，设置后可使用密码登录" type="info" :closable="false" show-icon />
                  <el-form-item label="新密码">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="8–64 个字符，需包含字母和数字" />
                  </el-form-item>
                  <el-form-item label="确认新密码">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="new-password" :disabled="passwordSubmitting" placeholder="再次输入新密码" />
                  </el-form-item>
                  <div class="profile-actions"><el-button type="primary" native-type="submit" :loading="passwordSubmitting">设置密码</el-button></div>
                </el-form>
              </section>
              <aside class="security-note">
                <div class="note-icon"><el-icon :size="23"><Lock /></el-icon></div>
                <h3>保护你的账户</h3>
                <p>密码需包含字母和数字，长度为 8–64 个字符。</p>
                <p v-if="pcUserStore.hasPassword">修改成功后需要重新登录，请记好你的新密码。</p>
                <p v-else>设置成功后，你可以使用手机号和密码登录。</p>
              </aside>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="pcUserStore.authorCapability" label="创作者资料" name="creator">
            <section class="creator-section">
              <div class="section-heading"><h2>创作者档案</h2><p>展示你的创作身份与擅长领域</p></div>
              <dl class="creator-details">
                <div><dt>笔名</dt><dd>{{ creator.penName || '未填写' }}</dd></div>
                <div>
                  <dt>擅长创作类型</dt>
                  <dd>
                    <span v-if="creator.specialties?.length" class="specialty-tags"><el-tag v-for="item in creator.specialties" :key="item.code" type="info" effect="plain">{{ item.name }}</el-tag></span>
                    <span v-else class="empty-text">暂未填写擅长类型</span>
                  </dd>
                </div>
                <div class="creator-introduction"><dt>创作者介绍</dt><dd>{{ creator.introduction || '未填写' }}</dd></div>
              </dl>
            </section>
          </el-tab-pane>

          <el-tab-pane label="个人印章" name="seal">
            <div class="seal-placeholder">
              <div class="note-icon"><el-icon :size="26"><Stamp /></el-icon></div>
              <h2>个人印章</h2>
              <p>个人印章模块待接入</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Upload, Lock, Stamp } from '@element-plus/icons-vue'
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

const activeTab = ref('basic')
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
.profile-page {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}
.page-heading { margin-bottom: 16px; }
.page-heading h1 { margin: 0 0 8px; font-size: 28px; font-weight: 600; color: #1f2329; letter-spacing: .5px; }
.page-heading p { font-size: 15px; color: #8a8f99; }
.profile-panel {
  min-height: 560px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7e9ec;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(31, 35, 41, .025);
}
.profile-identity {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 32px 40px;
  background: linear-gradient(110deg, #f7f8f7, #fcfcfc);
  border-bottom: 1px solid #eef0ee;
}
.profile-identity :deep(.el-avatar) { flex-shrink: 0; background: #a6b0a9; box-shadow: 0 0 0 4px #fff; }
.identity-copy { flex: 1; min-width: 0; }
.identity-copy h2 { margin: 0 0 12px; font-size: 26px; font-weight: 600; color: #252a27; overflow-wrap: anywhere; }
.identity-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; font-size: 15px; color: #747b76; }
.identity-divider { width: 1px; height: 12px; background: #d5dad6; }
.avatar-upload { flex-shrink: 0; text-align: right; }
.avatar-upload p { margin-top: 10px; font-size: 13px; color: #909690; }
.avatar-upload>span { display: block; margin-top: 4px; font-size: 13px; color: #909690; }
.file-input { display: none; }
.profile-tabs { padding: 0 40px; --el-color-primary: #303632; }
.profile-tabs :deep(.el-tabs__header) { margin: 0; }
.profile-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #eceeec; }
.profile-tabs :deep(.el-tabs__item) { height: 68px; padding: 0 28px; font-size: 16px; color: #858b87; }
.profile-tabs :deep(.el-tabs__item.is-active) { font-weight: 600; color: #252a27; }
.profile-tabs :deep(.el-tabs__active-bar) { height: 3px; border-radius: 3px 3px 0 0; background: #303632; }
.profile-tabs :deep(.el-tabs__content) { padding: 32px 0; }
.basic-layout, .security-layout { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 48px; align-items: start; }
.profile-editor, .security-editor { min-width: 0; }
.section-heading { margin-bottom: 26px; }
.section-heading h2 { margin: 0 0 6px; font-size: 19px; font-weight: 600; color: #303632; }
.section-heading p { font-size: 14px; color: #939994; }
.profile-form :deep(.el-form-item), .security-form :deep(.el-form-item) { margin-bottom: 18px; }
.profile-form :deep(.el-form-item__label), .security-form :deep(.el-form-item__label) { margin-bottom: 10px; font-size: 15px!important; color: #565e58; }
.profile-form :deep(.el-input__wrapper), .security-form :deep(.el-input__wrapper) { min-height: 48px; border-radius: 8px!important; }
.profile-form :deep(.el-input__inner), .security-form :deep(.el-input__inner) { height: 36px!important; line-height: 36px!important; font-size: 15px!important; }
.profile-form :deep(.el-textarea__inner) { min-height: 150px; padding: 14px 16px!important; font-size: 15px!important; border-radius: 8px; line-height: 1.8; }
.profile-panel :deep(.el-button) { height: 40px!important; padding: 0 18px!important; font-size: 14px!important; border-radius: 7px!important; }
.profile-panel :deep(.el-tag) { padding: 4px 10px!important; font-size: 13px!important; border-radius: 5px!important; }
.profile-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f1f0; }
.profile-actions :deep(.el-button) { min-width: 96px; }
.profile-actions :deep(.el-button + .el-button) { margin-left: 0; }
.account-summary { padding: 28px; border: 1px solid #edf0ed; border-radius: 10px; background: #f8f9f8; }
.account-summary .section-heading { margin-bottom: 20px; }
.account-details { margin: 0; }
.account-details>div { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 16px 0; border-bottom: 1px solid #e9ece9; }
.account-details>div:first-child { padding-top: 0; }
.account-details>div:last-child { padding-bottom: 0; border: 0; }
.account-details dt { flex-shrink: 0; font-size: 14px; color: #89908a; }
.account-details dd { margin: 0; text-align: right; font-size: 15px; color: #444c46; overflow-wrap: anywhere; }
.security-note { margin-top: 2px; padding: 28px; background: #f8f9f8; border: 1px solid #edf0ed; border-radius: 10px; }
.note-icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-bottom: 18px; border-radius: 14px; background: #edf0ed; color: #68796c; }
.security-note h3 { margin-bottom: 12px; font-size: 18px; font-weight: 600; color: #444c46; }
.security-note p { margin-top: 10px; font-size: 15px; line-height: 1.9; color: #8a928b; }
.set-password-tip { margin-bottom: 22px; }
.creator-section { max-width: 1120px; }
.creator-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 32px; margin: 0; }
.creator-details>div { min-width: 0; }
.creator-details dt { margin-bottom: 10px; font-size: 14px; color: #89908a; }
.creator-details dd { margin: 0; font-size: 16px; line-height: 1.8; color: #444c46; overflow-wrap: anywhere; }
.creator-introduction { grid-column: 1 / -1; padding-top: 22px; border-top: 1px solid #f0f1f0; }
.creator-introduction dd { white-space: pre-wrap; }
.specialty-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.empty-text { color: #929992; }
.seal-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; }
.seal-placeholder .note-icon { width: 60px; height: 60px; border-radius: 18px; }
.seal-placeholder h2 { margin-bottom: 8px; font-size: 20px; font-weight: 600; color: #444c46; }
.seal-placeholder p { font-size: 15px; color: #929992; }
.load-error { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; padding: 32px; }
@media (max-width: 1200px) {
  .basic-layout, .security-layout { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 28px; }
  .account-details>div { flex-wrap: wrap; gap: 6px; }
}
@media (max-width: 1000px) {
  .profile-identity { flex-wrap: wrap; }
  .avatar-upload { margin-left: 114px; text-align: left; }
  .basic-layout, .security-layout { grid-template-columns: minmax(0, 1fr); }
  .account-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; }
  .account-details>div { display: block; padding: 0; border: 0; }
  .account-details dd { margin-top: 6px; text-align: left; }
}
@media (max-width: 600px) {
  .page-heading { margin-bottom: 18px; }
  .page-heading h1 { font-size: 22px; }
  .profile-identity { padding: 24px 20px; gap: 18px; }
  .profile-identity :deep(.el-avatar) { width: 72px; height: 72px; }
  .identity-copy h2 { font-size: 20px; }
  .avatar-upload { margin-left: 90px; }
  .profile-tabs { padding: 0 20px; }
  .profile-tabs :deep(.el-tabs__item) { height: 54px; padding: 0 15px; font-size: 13px; }
  .profile-tabs :deep(.el-tabs__content) { padding: 24px 0; }
  .account-summary, .security-note { padding: 20px; }
  .creator-details { grid-template-columns: minmax(0, 1fr); }
}
</style>
