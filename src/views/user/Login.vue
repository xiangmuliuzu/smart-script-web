<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="48"><Document /></el-icon>
        </div>
        <h1 class="platform-name">剧云策</h1>
        <p class="platform-subtitle">管理员后台</p>
      </div>

      <!-- 登录/注册切换标签 -->
      <div class="tab-switcher">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          登录
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          注册
        </div>
      </div>

      <!-- 登录表单 -->
      <el-form 
        v-if="activeTab === 'login'"
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
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
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

      <!-- 注册表单 -->
      <el-form 
        v-else
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="login-form"
        label-width="80px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="用于登录后台"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入11位手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="不少于6位"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item>
          <div class="agreement-wrapper">
            <el-checkbox v-model="registerForm.agreedToTerms" class="agreement-checkbox">
              <span class="agreement-text">我已阅读并同意《用户协议》和《隐私政策》</span>
            </el-checkbox>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleRegister"
            class="login-button"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部提示 -->
      <div class="login-footer">
        默认账号: admin / 123456
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const activeTab = ref('login')

// 登录表单数据
const loginForm = reactive({
  username: 'admin',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  nickname: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false
})

// 登录表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度在2到30个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 自定义验证器：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 注册表单验证规则
const registerRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理登录：默认调用若依后台接口；只有显式开启 VITE_USE_MOCK=true 时才使用演示账号。
const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        if (loginForm.username !== 'admin' || loginForm.password !== '123456') {
          throw new Error('用户名或密码错误')
        }
        const mockToken = 'mock_token_' + Date.now()
        userStore.token = mockToken
        userStore.userInfo = {
          username: 'admin',
          roles: ['admin']
        }
        localStorage.setItem('admin_token', mockToken)
      } else {
        await userStore.login(loginForm)
        await userStore.fetchUserInfo().catch(() => {
          // 部分后端在登录接口中已经返回用户信息，获取失败不阻断跳转。
        })
      }
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

// 管理员注册按后端接口实现；开发阶段可用 VITE_USE_MOCK=true 保留演示流程。
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  // 检查是否同意协议
  if (!registerForm.agreedToTerms) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    
    try {
      if (import.meta.env.VITE_USE_MOCK !== 'true') {
        ElMessage.info('管理员注册由若依后台统一管理，请联系超级管理员创建账号')
        return
      }
      ElMessage.success('注册成功，请登录')
      
      // 清空注册表单
      registerForm.nickname = ''
      registerForm.email = ''
      registerForm.phone = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.agreedToTerms = false
      
      // 切换到登录标签
      activeTab.value = 'login'
    } catch (error) {
      ElMessage.error('注册失败')
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

/* Logo 和标题区 */
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

/* 标签切换 */
.tab-switcher {
  display: flex;
  margin-bottom: 28px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 15px;
  color: #8c8c8c;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tab-item.active {
  color: #1f2329;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1f2329;
}

/* 登录表单 */
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

/* 登录按钮 */
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

/* 注册占位 */
.register-placeholder {
  padding: 60px 20px;
  text-align: center;
}

.register-placeholder p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* 协议勾选区 */
.agreement-wrapper {
  width: 100%;
}

.agreement-checkbox {
  width: 100%;
}

.agreement-checkbox :deep(.el-checkbox__label) {
  display: inline;
  white-space: normal;
  line-height: 1.6;
}

.agreement-text {
  font-size: 13px;
  color: #8c8c8c;
  user-select: none;
}

/* 底部提示 */
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
