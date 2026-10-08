<template>
  <el-card class="filter-card" shadow="never">
    <el-form :inline="true" class="filter-form" @submit.prevent="onQuery">
      <slot />
      <el-form-item class="filter-actions">
        <el-button type="primary" class="black-button" @click="onQuery">{{ queryText }}</el-button>
        <el-button @click="onReset">{{ resetText }}</el-button>
        <slot name="extra" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
/**
 * 筛选栏卡片：inline 表单 + 查询/重置按钮。
 * #default 放 el-form-item 表单项；#extra 放追加按钮。
 * emit query / reset，由页面处理查询与重置逻辑。
 */
defineOptions({ name: 'FilterBar' })
defineProps({
  queryText: { type: String, default: '查询' },
  resetText: { type: String, default: '重置' }
})
const emit = defineEmits(['query', 'reset'])
const onQuery = () => emit('query')
const onReset = () => emit('reset')
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.filter-actions {
  margin-right: 0 !important;
}

.black-button {
  background-color: #1f2329 !important;
  border-color: #1f2329 !important;
  color: #ffffff !important;
}
</style>
