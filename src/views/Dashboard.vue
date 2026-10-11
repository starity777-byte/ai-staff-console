<script setup lang="ts">
import { computed } from 'vue'
import { TeamOutlined, ThunderboltOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import StatCard from '@/components/StatCard.vue'
import { useStaffStore } from '@/stores/staff'
import { useTaskStore } from '@/stores/task'
import { TASK_STATUS, THEME_PRIMARY } from '@/mock/constants'
const staff = useStaffStore()
const task = useTaskStore()
const cards = computed(() => [
  { title: '员工数', value: staff.list.length, suffix: '人', color: '#5b5bd6', icon: TeamOutlined, desc: '本月新增 3 人' },
  { title: '在线员工', value: staff.onlineCount, suffix: '人', color: '#13c2c2', icon: ThunderboltOutlined, desc: `在线率 ${Math.round((staff.onlineCount / (staff.list.length || 1)) * 100)}%` },
  { title: '进行中任务', value: task.doingCount, suffix: '个', color: '#1677ff', icon: SyncOutlined, desc: `共 ${task.list.length} 个任务` },
  { title: '完成率', value: task.completionRate, suffix: '%', color: '#52c41a', icon: CheckCircleOutlined, desc: `已完成 ${task.doneCount} 个` }
])
const statusDist = computed(() => (Object.keys(TASK_STATUS) as (keyof typeof TASK_STATUS)[]).map((k) => ({ key: k, ...TASK_STATUS[k], count: task.list.filter((t) => t.status === k).length })))
</script>
<template>
  <a-row :gutter="[16, 16]">
    <a-col v-for="c in cards" :key="c.title" :xs="24" :sm="12" :xl="6"><StatCard v-bind="c" /></a-col>
    <a-col :xs="24" :lg="14">
      <a-card title="最近动态" :bordered="false">
        <a-timeline>
          <a-timeline-item v-for="a in task.activities" :key="a.id" :color="a.color || THEME_PRIMARY">
            <div>{{ a.content }}</div><div class="time">{{ a.time }}</div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </a-col>
    <a-col :xs="24" :lg="10">
      <a-card title="模型分布" :bordered="false" style="margin-bottom: 16px">
        <div v-for="m in staff.modelStats" :key="m.model" class="dist">
          <span class="label">{{ m.model }}</span>
          <a-progress :stroke-color="THEME_PRIMARY" :percent="Math.round((m.count / staff.list.length) * 100)" :format="() => `${m.count} 人`" />
        </div>
      </a-card>
      <a-card title="任务状态" :bordered="false">
        <a-row>
          <a-col v-for="s in statusDist" :key="s.key" :span="8" style="text-align: center">
            <a-progress type="circle" :stroke-color="THEME_PRIMARY" :size="80" :percent="Math.round((s.count / (task.list.length || 1)) * 100)" />
            <div style="margin-top: 8px"><a-tag :color="s.color">{{ s.text }}</a-tag>{{ s.count }}</div>
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
</template>
<style scoped>
.time { color: #8c8c8c; font-size: 12px; }
.dist { display: flex; align-items: center; gap: 12px; }
.label { width: 130px; flex-shrink: 0; }
</style>
