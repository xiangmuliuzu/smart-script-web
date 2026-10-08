<template>
  <div class="login-page">
    <!-- 左侧：登录表单 -->
    <div class="login-left">
      <div class="login-panel">
        <div class="brand-row">
          <div class="logo-icon">
            <el-icon :size="22"><Document /></el-icon>
          </div>
          <span class="brand-name">剧云策</span>
        </div>

        <div class="login-head">
          <h1 class="login-title">欢迎回来</h1>
          <p class="login-desc">智能剧本创作平台，请使用平台账号登录</p>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          label-position="top"
          size="large"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              autocomplete="username"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              autocomplete="current-password"
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item v-if="captchaEnabled" label="验证码" prop="code">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                maxlength="8"
                @keyup.enter="handleLogin"
              />
              <img
                v-if="codeUrl"
                :src="codeUrl"
                class="captcha-img"
                alt="验证码"
                title="点击刷新"
                @click="refreshCaptcha"
              />
              <div v-else class="captcha-img captcha-empty" @click="refreshCaptcha">刷新</div>
            </div>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberUsername">记住账号</el-checkbox>
            <a class="forgot-link" @click.prevent="handleForgot">忘记密码？</a>
          </div>

          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form>

        <div class="login-footer">
          账号由平台统一维护，如需开通或找回密码请联系管理员
        </div>
      </div>
    </div>

    <!-- 右侧：品牌视觉面板 -->
    <div class="login-right">
      <div class="visual-bg"></div>
      <img
        v-if="!imageFailed"
        :src="visualImage"
        class="visual-img"
        alt="品牌视觉图"
        @error="imageFailed = true"
      />
      <div class="visual-overlay"></div>
      <div class="visual-caption">
        <p class="visual-slogan">让每一个好故事，从这里开始</p>
        <p class="visual-sub">剧云策 · AI 驱动的智能剧本创作平台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePcUserStore } from '@/stores/pcUser'
import { usePermissionStore } from '@/stores/permission'
import { getCodeImg, unifiedLogin } from '@/api/login'
import { isUserType, safePortalRedirect } from '@/utils/account'
import { ElMessage } from 'element-plus'
import { Document, User, Lock } from '@element-plus/icons-vue'

const REMEMBER_KEY = 'login-remember-username'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pcUserStore = usePcUserStore()
const permissionStore = usePermissionStore()
const formRef = ref(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const codeUrl = ref('')
const uuid = ref('')
const rememberUsername = ref(false)
const imageFailed = ref(false)
// Unsplash 公开图片，加载失败时自动隐藏并回退为渐变视觉面板
const visualImage =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80'

const loginForm = reactive({
  username: '',
  password: '',
  code: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

function safeRedirectPath(accountType) {
  // 统一分流规则：站内路径 + 不跨账号域（见 utils/account.js）
  return safePortalRedirect(route.query?.redirect, accountType)
}

async function refreshCaptcha() {
  try {
    const data = await getCodeImg()
    captchaEnabled.value = data?.captchaEnabled !== false && !!data?.img
    uuid.value = data?.uuid || ''
    codeUrl.value = data?.img
      ? (data.img.startsWith('data:') ? data.img : `data:image/gif;base64,${data.img}`)
      : ''
    if (!captchaEnabled.value) {
      loginForm.code = ''
    }
  } catch (error) {
    captchaEnabled.value = false
    codeUrl.value = ''
    uuid.value = ''
  }
}

function handleForgot() {
  ElMessage.info('请联系系统管理员重置密码')
}

function loadRememberedUsername() {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      loginForm.username = saved
      rememberUsername.value = true
    }
  } catch (error) {
    /* localStorage 不可用时忽略 */
  }
}

watch(rememberUsername, (val) => {
  try {
    if (val && loginForm.username) {
      localStorage.setItem(REMEMBER_KEY, loginForm.username)
    } else if (!val) {
      localStorage.removeItem(REMEMBER_KEY)
    }
  } catch (error) {
    /* localStorage 不可用时忽略 */
  }
})

onMounted(() => {
  refreshCaptcha()
  loadRememberedUsername()
})

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (captchaEnabled.value && !loginForm.code) {
      ElMessage.warning('请输入验证码')
      return
    }
    loading.value = true
    try {
      // 切换账号前全量清理旧会话（含另一账号域的令牌与动态路由）
      userStore.resetSession()
      pcUserStore.resetSession()
      const result = await unifiedLogin({
        username: loginForm.username,
        password: loginForm.password,
        code: loginForm.code,
        uuid: uuid.value
      })
      const accountType = result?.accountType
      if (isUserType(accountType)) {
        // 01/02/03：App 凭证域令牌，进入 PC 用户门户
        pcUserStore.setSession(result.session, accountType)
        // 登录接口返回的 user 可能不含 authorCapability，补一次 /auth/me 确保能力字段就绪（否则“我的作品”菜单不显示）
        try { await pcUserStore.fetchMe() } catch (e) { /* 网络瞬断忽略，刷新后由路由守卫重试 */ }
        persistRememberedUsername()
        ElMessage.success('登录成功')
        await router.replace(safeRedirectPath(accountType))
        return
      }
      if (accountType === '00') {
        // 管理员：若依管理端令牌，维持原有动态路由初始化流程
        userStore.adoptAdminToken(result.token)
        await userStore.fetchUserInfo()
        // 登录后先注册动态路由，再进入目标页，避免 /dashboard 未匹配
        await permissionStore.generateRoutes({ force: true })
        persistRememberedUsername()
        ElMessage.success('登录成功')
        const target = safeRedirectPath(accountType)
        await router.replace(target)
        if (router.currentRoute.value.path === '/404' || router.currentRoute.value.path === '/login') {
          const first = permissionStore.sidebarRoutes?.[0]
          const firstLeaf = first?.children?.[0]?.path || first?.path || '/'
          await router.replace(firstLeaf)
        }
        return
      }
      throw new Error('登录返回的账号类型无法识别')
    } catch (error) {
      ElMessage.error(error?.message || '登录失败')
      await refreshCaptcha()
      loginForm.code = ''
    } finally {
      loading.value = false
    }
  })
}

function persistRememberedUsername() {
  try {
    if (rememberUsername.value) {
      localStorage.setItem(REMEMBER_KEY, loginForm.username)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }
  } catch (error) {
    /* localStorage 不可用时忽略 */
  }
}
</script>

<style scoped>
/* ==================== 页面布局：左右分屏 ==================== */
.login-page {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;
}

.login-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 40px 24px;
}

.login-right {
  position: relative;
  display: none;
  width: 50%;
  overflow: hidden;
}

@media (min-width: 992px) {
  .login-left {
    width: 50%;
  }

  .login-right {
    display: block;
  }
}

/* ==================== 左侧表单区 ==================== */
.login-panel {
  width: 100%;
  max-width: 400px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1f2329 0%, #3a3f47 100%);
  border-radius: 10px;
  color: #ffffff;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
  letter-spacing: 2px;
}

.login-head {
  margin-bottom: 32px;
}

.login-title {
  font-size: 26px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 10px 0;
  letter-spacing: 1px;
}

.login-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.6;
}

/* ==================== 表单样式 ==================== */
.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 6px;
  padding-bottom: 0;
}

.login-form :deep(.el-input__wrapper) {
  height: 44px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d9d9d9 inset;
  padding: 0 14px;
  transition: box-shadow 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #1f2329 inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(31, 35, 41, 0.18) inset;
}

.login-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #262626;
  height: 100%;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}

.login-form :deep(.el-input__prefix) {
  color: #8c8c8c;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 44px;
  border-radius: 8px;
  cursor: pointer;
  object-fit: contain;
  background: #f5f6f8;
  box-shadow: 0 0 0 1px #e8e8e8 inset;
}

.captcha-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.form-options :deep(.el-checkbox__label) {
  font-size: 13px;
  color: #595959;
}

.forgot-link {
  font-size: 13px;
  color: #1f2329;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 44px;
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 6px;
  border-radius: 8px;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.login-button:hover,
.login-button:focus {
  background-color: #000000;
  border-color: #000000;
  color: #ffffff;
}

.login-button:active {
  background-color: #000000;
  border-color: #000000;
  transform: scale(0.99);
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 12px;
  color: #bfbfbf;
  line-height: 1.5;
}

/* ==================== 右侧视觉面板 ==================== */
.visual-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(80% 60% at 20% 10%, rgba(255, 255, 255, 0.14) 0%, transparent 60%),
    radial-gradient(60% 50% at 85% 90%, rgba(255, 255, 255, 0.1) 0%, transparent 55%),
    linear-gradient(150deg, #2b3038 0%, #1f2329 55%, #12151a 100%);
}

.visual-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.08) 45%, rgba(0, 0, 0, 0.12) 100%);
}

.visual-caption {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 48px;
  color: #ffffff;
}

.visual-slogan {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.visual-sub {
  font-size: 14px;
  opacity: 0.82;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

/* ==================== 入场动画 ==================== */
@media (prefers-reduced-motion: no-preference) {
  .brand-row,
  .login-head,
  .login-form,
  .login-footer {
    animation: fade-up 0.5s ease both;
  }

  .login-head {
    animation-delay: 0.08s;
  }

  .login-form {
    animation-delay: 0.16s;
  }

  .login-footer {
    animation-delay: 0.24s;
  }

  .visual-caption {
    animation: fade-up 0.7s ease 0.2s both;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
