<template>
  <el-button type="primary" class="black-button" v-bind="$attrs">
    <slot />
  </el-button>
</template>

<script setup>
/**
 * 黑色主按钮：替代散落在各页的 .black-button 重复 CSS。
 * 透传 el-button 全部属性（size、disabled、loading、@click 等）。
 */
defineOptions({ name: 'BlackButton', inheritAttrs: false })
</script>

<style scoped>
.black-button,
.black-button:hover,
.black-button:focus {
  background-color: #1f2329 !important;
  border-color: #1f2329 !important;
  color: #ffffff !important;
}

.black-button:hover {
  background-color: #000000 !important;
  border-color: #000000 !important;
}
</style>
