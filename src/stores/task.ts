import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '@/types'
import { mockTasks, mockActivities } from '@/mock'

export const useTaskStore = defineStore('task', () => {
  const list = ref<Task[]>(structuredClone(mockTasks))
  const activities = ref(structuredClone(mockActivities))
  const doingCount = computed(() => list.value.filter((t) => t.status === 'doing').length)
  const doneCount = computed(() => list.value.filter((t) => t.status === 'done').length)
  const completionRate = computed(() => list.value.length ? Math.round((doneCount.value / list.value.length) * 100) : 0)
  function add(data: Omit<Task, 'id'>) {
    const id = Math.max(0, ...list.value.map((t) => t.id)) + 1
    list.value.unshift({ ...data, id })
  }
  function remove(id: number) { list.value = list.value.filter((t) => t.id !== id) }
  function resetToSample() {
    list.value = structuredClone(mockTasks)
    activities.value = structuredClone(mockActivities)
  }
  return { list, activities, doingCount, doneCount, completionRate, add, remove, resetToSample }
}, {
  persist: { storage: localStorage }
})
