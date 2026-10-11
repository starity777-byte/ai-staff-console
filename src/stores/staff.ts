import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Staff } from '@/types'
import { mockStaff } from '@/mock'

export const useStaffStore = defineStore('staff', () => {
  const list = ref<Staff[]>(structuredClone(mockStaff))
  const onlineCount = computed(() => list.value.filter((s) => s.status !== 'offline').length)
  const modelStats = computed(() => {
    const map: Record<string, number> = {}
    list.value.forEach((s) => (map[s.model] = (map[s.model] || 0) + 1))
    return Object.entries(map).map(([model, count]) => ({ model, count })).sort((a, b) => b.count - a.count)
  })
  const getById = (id: number) => list.value.find((s) => s.id === id)
  function add(data: Omit<Staff, 'id' | 'createdAt' | 'avatar'>) {
    const id = Math.max(0, ...list.value.map((s) => s.id)) + 1
    list.value.unshift({
      ...data, id, createdAt: new Date().toISOString().slice(0, 10),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`
    })
  }
  function update(id: number, data: Partial<Staff>) {
    const s = getById(id)
    if (s) Object.assign(s, data)
  }
  function remove(id: number) { list.value = list.value.filter((s) => s.id !== id) }
  return { list, onlineCount, modelStats, getById, add, update, remove }
})
