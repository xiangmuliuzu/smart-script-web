<template>
  <div class="error-page">
    <h1>401</h1>
    <p>未授权或会话已过期</p>
    <el-button type="primary" @click="goLogin">返回登录</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goLogin = () => router.replace('/login')
</script>

<style scoped>
.error-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #1f2329;
}
.error-page h1 { font-size: 48px; margin: 0; }
.error-page p { color: #8c8c8c; margin: 0; }
</style>
