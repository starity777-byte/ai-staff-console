import type { Activity, ActivityType } from '@/types'
import { THEME_PRIMARY } from '@/mock/constants'

/** Timeline dot colors. One map so the dashboard and staff detail stay in sync. */
const ACTIVITY_DOT_COLOR: Record<ActivityType, string> = {
  task_completed: '#52c41a',
  task_started: THEME_PRIMARY,
  task_urgent: '#ff4d4f',
  staff_joined: '#9254de',
  other: '#8c8c8c'
}

type ActivityLike = { type?: ActivityType; content: string }

function isActivityType(value: string | undefined): value is ActivityType {
  return value != null && Object.prototype.hasOwnProperty.call(ACTIVITY_DOT_COLOR, value)
}

/** Prefer the stored type. Fall back to the wording used by mock data and store actions. */
export function activityTypeOf(activity: ActivityLike): ActivityType {
  if (isActivityType(activity.type)) return activity.type
  const text = activity.content
  if (text.includes('加入团队') || text.includes('新员工')) return 'staff_joined'
  if (text.includes('高优先级') || text.includes('紧急')) return 'task_urgent'
  if (text.includes('完成了')) return 'task_completed'
  if (text.includes('开始处理')) return 'task_started'
  return 'other'
}

export function activityDotColor(activity: ActivityLike): string {
  return ACTIVITY_DOT_COLOR[activityTypeOf(activity)]
}

export function activityRelatesTo(activity: Pick<Activity, 'content' | 'staffId'>, staffId: number, name: string): boolean {
  if (activity.staffId != null) return activity.staffId === staffId
  return name !== '' && activity.content.includes(name)
}
