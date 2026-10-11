<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | 'large' | 'small' | 'default'
}>(), {
  size: 'default'
})

const PALETTE = [
  '#5b5bd6',
  '#1677ff',
  '#13c2c2',
  '#52c41a',
  '#fa8c16',
  '#eb2f96',
  '#722ed1',
  '#2f54eb',
  '#08979c',
  '#d4380d'
] as const

const label = computed(() => props.name.trim())

const initial = computed(() => {
  const text = label.value
  return text ? Array.from(text)[0] : '?'
})

const background = computed(() => {
  const text = label.value || '?'
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = (Math.imul(hash, 31) + text.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
})
</script>

<template>
  <a-avatar class="initials" :size="size" :style="{ backgroundColor: background, color: '#fff' }">{{ initial }}</a-avatar>
</template>

<style scoped>
.initials { flex-shrink: 0; user-select: none; }
</style>
