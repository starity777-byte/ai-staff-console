/** Brand purple used by layout, progress, and timeline. */
export const THEME_PRIMARY = '#5b5bd6'

export const STAFF_STATUS = {
  online: { text: '在线', color: 'success' },
  busy: { text: '忙碌', color: 'processing' },
  offline: { text: '离线', color: 'default' }
} as const
export const TASK_STATUS = {
  todo: { text: '待开始', color: 'default' },
  doing: { text: '进行中', color: 'blue' },
  done: { text: '已完成', color: 'green' }
} as const
export const PRIORITY = {
  high: { text: '高', color: 'red' },
  medium: { text: '中', color: 'orange' },
  low: { text: '低', color: 'cyan' }
} as const
