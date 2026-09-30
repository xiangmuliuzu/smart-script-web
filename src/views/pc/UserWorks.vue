<template>
  <div class="works-page">
    <div class="page-heading"><h1>我的作品</h1><p>查看个人作品的创作与审核进度</p></div>
    <div class="works-panel">
      <nav class="works-tabs" aria-label="作品状态">
        <router-link v-for="item in tabs" :key="item.path" :to="item.path" :class="{ active: route.path === item.path }">{{ item.title }}</router-link>
      </nav>
      <el-empty :description="`${route.meta.title || '全部作品'}暂无可展示的作品`">
        <p class="empty-note">个人作品列表正在接入，后续可在这里查看作品详情与审核进度。</p>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const tabs = [
  { path: '/pc/user/works/all', title: '全部作品' },
  { path: '/pc/user/works/draft', title: '草稿' },
  { path: '/pc/user/works/review', title: '审核中' },
  { path: '/pc/user/works/revision', title: '待修改' },
  { path: '/pc/user/works/listed', title: '已上架' }
]
</script>

<style scoped>
.page-heading{margin-bottom:22px}.page-heading h1{font-size:22px;font-weight:600;color:#1f2329;margin-bottom:6px}.page-heading p{font-size:13px;color:#8a8f99}.works-panel{background:#fff;border:1px solid #e7e9ec;border-radius:8px;min-height:420px}.works-tabs{display:flex;gap:30px;padding:0 24px;border-bottom:1px solid #edf0f2;overflow-x:auto}.works-tabs a{display:block;padding:18px 0;color:#6b7078;text-decoration:none;white-space:nowrap;border-bottom:2px solid transparent}.works-tabs a.active{color:#1f2329;font-weight:600;border-color:#1f2329}.works-panel :deep(.el-empty){padding:65px 0}.empty-note{font-size:12px;color:#a0a5ac}
</style>
