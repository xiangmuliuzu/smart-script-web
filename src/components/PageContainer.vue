<template>
  <div class="page-container tc-page">
    <slot />
  </div>
</template>

<script setup>
/**
 * 页面根容器：统一内边距与背景。
 * 复用 global.css 的 .page-container，叠加交易模块背景色 #f7f8fa。
 */
defineOptions({ name: 'PageContainer' })
</script>

<style scoped>
.tc-page {
  background-color: #f7f8fa;
}
</style>
