export type StaffStatus = 'online' | 'busy' | 'offline'
export interface Staff {
  id: number; name: string; avatar: string; model: string; role: string
  status: StaffStatus; skills: string[]; createdAt: string
}
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Priority = 'high' | 'medium' | 'low'
export interface Task {
  id: number; title: string; assigneeId: number; progress: number
  status: TaskStatus; priority: Priority; deadline: string
}
export type ActivityType = 'task_completed' | 'task_started' | 'task_urgent' | 'staff_joined' | 'other'
export interface Activity {
  id: number; time: string; content: string
  type: ActivityType
  staffId?: number
}
