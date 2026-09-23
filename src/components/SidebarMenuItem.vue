<template>
  <el-sub-menu
    v-if="hasChildren"
    :index="item.path"
    :class="depthClass"
    :style="indentStyle"
  >
    <template #title>
      <el-icon v-if="depth > 0 && icon"><component :is="icon" /></el-icon>
      <span>{{ title }}</span>
    </template>
    <SidebarMenuItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :depth="depth + 1"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="item.path" :class="depthClass" :style="indentStyle">
    <el-icon v-if="icon"><component :is="icon" /></el-icon>
    <span>{{ title }}</span>
  </el-menu-item>
</template>

<script setup>
/**
 * 侧边栏菜单节点（递归）。菜单树来自 /getRouters，层级不固定，因此不写死层数。
 *
 * 视觉规则对齐参考设计：一级分组标题是无图标的小节标题，叶子项带图标，
 * 缩进随层级递增（由 --menu-indent 交给 MainLayout 的样式消费）。
 */
import { computed } from 'vue'
import { resolveMenuIcon } from '@/utils/menu-icon'

defineOptions({ name: 'SidebarMenuItem' })

const props = defineProps({
  item: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

/** 层级越深缩进越大；超过 3 层按 3 层处理，避免菜单被挤到不可读。 */
const INDENTS = [20, 30, 60, 80]

const depth = computed(() => Math.min(Math.max(props.depth, 0), INDENTS.length - 1))
const depthClass = computed(() => `menu-depth-${depth.value}`)
const indentStyle = computed(() => ({ '--menu-indent': `${INDENTS[depth.value]}px` }))

const title = computed(() => props.item?.meta?.title || props.item?.path || '')
const icon = computed(() => resolveMenuIcon(props.item?.meta?.icon))
const hasChildren = computed(
  () => Array.isArray(props.item?.children) && props.item.children.length > 0
)
</script>
