<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useStaffStore } from '@/stores/staff'
import { useTaskStore } from '@/stores/task'
import { PRIORITY, STAFF_STATUS, TASK_STATUS, THEME_PRIMARY } from '@/mock/constants'
import { activityDotColor, activityRelatesTo } from '@/utils/activity'
import type { Task } from '@/types'

const route = useRoute()
const router = useRouter()
const staffStore = useStaffStore()
const taskStore = useTaskStore()
const modelColor: Record<string, string> = {
  'Grok Build': 'geekblue',
  'Gemini 3.1 Pro': 'blue',
  'Claude Sonnet 4.6': 'orange',
  'GPT-5': 'green',
  'DeepSeek V3': 'purple'
}

const person = computed(() => {
  const raw = route.params.id
  const text = Array.isArray(raw) ? raw[0] : raw
  const id = Number(text)
  if (!Number.isInteger(id)) return undefined
  return staffStore.getById(id)
})
const tasks = computed(() => {
  const current = person.value
  if (!current) return []
  return taskStore.list.filter((item) => item.assigneeId === current.id)
})
const activities = computed(() => {
  const current = person.value
  if (!current) return []
  return taskStore.activities.filter((item) => activityRelatesTo(item, current.id, current.name))
})
const columns = [
  { title: '任务名称', dataIndex: 'title', key: 'title' },
  { title: '优先级', key: 'priority', width: 90 },
  { title: '状态', key: 'status', width: 100 },
  { title: '进度', key: 'progress', width: 180 },
  { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 120 }
]

function goList() { router.push('/staff') }
</script>
<template>
  <a-card v-if="!person" :bordered="false">
    <a-result status="404" title="未找到该员工" sub-title="没有找到对应的 AI 员工，可能链接有误，或该员工已被删除。">
      <template #extra>
        <a-button type="primary" @click="goList">返回员工列表</a-button>
      </template>
    </a-result>
  </a-card>
  <div v-else class="page">
    <div class="toolbar">
      <a-button @click="goList"><template #icon><ArrowLeftOutlined /></template>返回列表</a-button>
    </div>
    <a-card :bordered="false">
      <div class="profile">
        <a-avatar :size="72" :src="person.avatar" class="avatar" />
        <div>
          <div class="name-row">
            <h2>{{ person.name }}</h2>
            <a-tag>{{ person.role }}</a-tag>
            <a-badge :status="STAFF_STATUS[person.status].color" :text="STAFF_STATUS[person.status].text" />
          </div>
          <div class="joined">入职日期：{{ person.createdAt }}</div>
        </div>
      </div>
      <a-divider />
      <div class="fields">
        <div class="field">
          <span class="label">使用模型</span>
          <a-tag :color="modelColor[person.model] || 'default'">{{ person.model }}</a-tag>
        </div>
        <div class="field">
          <span class="label">技能</span>
          <a-space wrap>
            <a-tag v-for="skill in person.skills" :key="skill">{{ skill }}</a-tag>
          </a-space>
        </div>
      </div>
    </a-card>
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :xl="15">
        <a-card :title="`负责的任务（${tasks.length}）`" :bordered="false">
          <a-table
            :columns="columns"
            :data-source="tasks"
            row-key="id"
            :pagination="{ pageSize: 5, hideOnSinglePage: true }"
            :locale="{ emptyText: '暂无负责的任务' }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'priority'">
                <a-tag :color="PRIORITY[(record as Task).priority].color">{{ PRIORITY[(record as Task).priority].text }}</a-tag>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="TASK_STATUS[(record as Task).status].color">{{ TASK_STATUS[(record as Task).status].text }}</a-tag>
              </template>
              <template v-else-if="column.key === 'progress'">
                <a-progress
                  :stroke-color="THEME_PRIMARY"
                  :percent="(record as Task).progress"
                  size="small"
                  :status="(record as Task).status === 'done' ? 'success' : (record as Task).status === 'doing' ? 'active' : 'normal'"
                />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="9">
        <a-card title="相关动态" :bordered="false">
          <a-empty v-if="activities.length === 0" description="暂无相关动态" />
          <a-timeline v-else>
            <a-timeline-item v-for="item in activities" :key="item.id" :color="activityDotColor(item)">
              <div>{{ item.content }}</div>
              <div class="time">{{ item.time }}</div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.profile { display: flex; align-items: center; gap: 16px; }
.avatar { background: #f0f0ff; flex-shrink: 0; }
.name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.name-row h2 { margin: 0; font-size: 20px; }
.joined { margin-top: 6px; color: #8c8c8c; }
.fields { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; align-items: flex-start; gap: 12px; }
.label { width: 72px; flex-shrink: 0; color: #8c8c8c; line-height: 24px; }
.time { color: #8c8c8c; font-size: 12px; }
</style>
