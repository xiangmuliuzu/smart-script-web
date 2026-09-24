<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="48"><Document /></el-icon>
        </div>
        <h1 class="platform-name">剧云策</h1>
        <p class="platform-subtitle">管理员后台</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            autocomplete="current-password"
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
              @click="refreshCaptcha"
            />
            <div v-else class="captcha-img captcha-empty" @click="refreshCaptcha">刷新</div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        账号由若依系统管理模块统一维护
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { getCodeImg } from '@/api/login'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const formRef = ref(null)
const loading = ref(false)
const captchaEnabled = ref(false)
const codeUrl = ref('')
const uuid = ref('')

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

function safeRedirectPath() {
  const raw = route.query?.redirect
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/dashboard'
  }
  return raw
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

onMounted(() => {
  refreshCaptcha()
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
      await userStore.login({
        username: loginForm.username,
        password: loginForm.password,
        code: loginForm.code,
        uuid: uuid.value
      })
      await userStore.fetchUserInfo()
      // 登录后先注册动态路由，再进入目标页，避免 /dashboard 未匹配
      await permissionStore.generateRoutes({ force: true })
      ElMessage.success('登录成功')
      const target = safeRedirectPath()
      await router.replace(target)
      if (router.currentRoute.value.path === '/404' || router.currentRoute.value.path === '/login') {
        const first = permissionStore.sidebarRoutes?.[0]
        const firstLeaf = first?.children?.[0]?.path || first?.path || '/dashboard'
        await router.replace(firstLeaf)
      }
    } catch (error) {
      ElMessage.error(error?.message || '登录失败')
      await refreshCaptcha()
      loginForm.code = ''
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  padding: 20px;
}

.login-card {
  width: 420px;
  padding: 48px 40px 32px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1f2329 0%, #3a3f47 100%);
  border-radius: 16px;
  color: #ffffff;
}

.platform-name {
  font-size: 28px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.platform-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  letter-spacing: 1px;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #595959;
  font-weight: 500;
  padding-bottom: 0;
  line-height: 40px;
  text-align: right;
  padding-right: 12px;
}

.login-form :deep(.el-form-item__content) {
  line-height: 40px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 4px;
  border-color: #d9d9d9;
  padding: 10px 12px;
  box-shadow: none;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #1f2329;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #1f2329;
  box-shadow: 0 0 0 2px rgba(31, 35, 41, 0.1);
}

.login-form :deep(.el-input__inner) {
  font-size: 14px;
  color: #262626;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #bfbfbf;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.captcha-row .el-input {
  flex: 1;
}

.captcha-img {
  width: 120px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: contain;
  background: #f5f6f8;
  border: 1px solid #e8e8e8;
}

.captcha-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #8c8c8c;
}

.login-button {
  width: 100%;
  height: 44px;
  background-color: #1f2329;
  border-color: #1f2329;
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 8px;
}

.login-button:hover {
  background-color: #000000;
  border-color: #000000;
}

.login-button:active {
  background-color: #000000;
  border-color: #000000;
}

.login-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
}
</style>
