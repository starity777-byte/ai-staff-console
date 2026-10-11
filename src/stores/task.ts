import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Task, TaskStatus } from '@/types'
import { mockTasks, mockActivities } from '@/mock'
import { THEME_PRIMARY } from '@/mock/constants'
import { useStaffStore } from '@/stores/staff'

export const useTaskStore = defineStore('task', () => {
  const list = ref<Task[]>(structuredClone(mockTasks))
  const activities = ref(structuredClone(mockActivities))
  const doingCount = computed(() => list.value.filter((t) => t.status === 'doing').length)
  const doneCount = computed(() => list.value.filter((t) => t.status === 'done').length)
  const completionRate = computed(() => list.value.length ? Math.round((doneCount.value / list.value.length) * 100) : 0)

  function addActivity(content: string) {
    const id = activities.value.reduce((max, item) => Math.max(max, item.id), 0) + 1
    activities.value.unshift({ id, time: dayjs().format('MM-DD HH:mm'), content, color: THEME_PRIMARY })
  }

  function logStatusChange(taskItem: Task) {
    const name = useStaffStore().getById(taskItem.assigneeId)?.name
    const action = taskItem.status === 'done'
      ? `完成了「${taskItem.title}」`
      : taskItem.status === 'doing'
        ? `开始处理「${taskItem.title}」`
        : `将「${taskItem.title}」移至待开始`
    addActivity(name ? `${name} ${action}` : action)
  }

  function add(data: Omit<Task, 'id'>) {
    const id = Math.max(0, ...list.value.map((t) => t.id)) + 1
    list.value.unshift({ ...data, id })
  }
  function update(id: number, data: Partial<Omit<Task, 'id'>>) {
    const current = list.value.find((t) => t.id === id)
    if (!current) return
    const prevStatus = current.status
    Object.assign(current, data)
    if (data.status !== undefined && data.status !== prevStatus) logStatusChange(current)
  }
  function updateStatus(id: number, status: TaskStatus) {
    update(id, { status })
  }
  function remove(id: number) { list.value = list.value.filter((t) => t.id !== id) }
  function resetToSample() {
    list.value = structuredClone(mockTasks)
    activities.value = structuredClone(mockActivities)
  }
  return { list, activities, doingCount, doneCount, completionRate, add, update, updateStatus, remove, resetToSample }
}, {
  persist: { storage: localStorage }
})
