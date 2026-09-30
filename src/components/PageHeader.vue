<template>
  <div class="page-header">
    <div class="page-heading">
      <h2 class="page-title">{{ title }}</h2>
      <p v-if="description" class="page-desc">{{ description }}</p>
    </div>
    <div class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
/**
 * 页头：左侧标题（+可选描述），右侧操作区（#actions 放按钮/搜索框）。
 * 替代各页重复的 .page-header / .page-title / .header-actions。
 */
defineOptions({ name: 'PageHeader' })
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.page-desc {
  margin: 6px 0 0;
  color: #8a8f99;
  font-size: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}
</style>
