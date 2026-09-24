<template>
  <el-tag :type="tagType" size="small" effect="light">{{ text }}</el-tag>
</template>

<script setup>
/**
 * 枚举驱动的状态标签：消除各页 getXxxStatusType / getXxxStatusText 重复函数。
 * 用法：<StatusTag type="order" :status="row.status" />
 * type 取值见 constants/tradeEnum.js 的 ENUM_REGISTRY：
 *   order / inquiry / quote / follow / partnerType / license / tradeWork / demand / submission
 * 颜色沿用 global.css 的 el-tag 皮肤，本组件只负责 value→label/type 映射。
 */
import { computed } from 'vue'
import { enumLabel, enumTagType } from '@/constants/tradeEnum'

defineOptions({ name: 'StatusTag' })
const props = defineProps({
  type: { type: String, required: true },
  status: { type: [String, Number], default: '' }
})

const text = computed(() => enumLabel(props.type, props.status))
const tagType = computed(() => enumTagType(props.type, props.status))
</script>
