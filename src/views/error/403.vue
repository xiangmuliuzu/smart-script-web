<template>
  <div class="error-page">
    <h1>403</h1>
    <p>没有权限访问该资源</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => router.replace('/dashboard')
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
