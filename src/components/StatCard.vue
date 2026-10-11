<script setup lang="ts">
import { theme } from 'ant-design-vue'
defineProps<{ title: string; value: number | string; suffix?: string; color: string; icon: any; desc?: string }>()
const { token } = theme.useToken()
</script>
<template>
  <a-card :bordered="false" class="stat">
    <div class="row">
      <a-statistic :title="title" :value="value" :suffix="suffix" />
      <div class="icon" :style="{ background: color + '1a', color }"><component :is="icon" /></div>
    </div>
    <div v-if="desc" class="desc">{{ desc }}</div>
  </a-card>
</template>
<style scoped>
.row { display: flex; justify-content: space-between; align-items: center; }
.icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.desc { margin-top: 8px; color: v-bind('token.colorTextDescription'); font-size: 12px; }
</style>
