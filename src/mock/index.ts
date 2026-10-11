import type { Staff, Task, Activity } from '@/types'
import { THEME_PRIMARY } from './constants'

export const MODELS = ['Grok Build', 'Gemini 3.1 Pro', 'Claude Sonnet 4.6', 'GPT-5', 'DeepSeek V3']
export const ROLES = ['前端工程师', '后端工程师', '数据分析师', '客服专员', '内容运营', '测试工程师']

const av = (seed: string) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`

export const mockStaff: Staff[] = [
  { id: 1, name: '小智', model: 'Grok Build', role: '前端工程师', status: 'online', skills: ['Vue', 'TypeScript'], createdAt: '2026-08-02' },
  { id: 2, name: '星河', model: 'Gemini 3.1 Pro', role: '数据分析师', status: 'busy', skills: ['SQL', 'Python'], createdAt: '2026-08-15' },
  { id: 3, name: '墨言', model: 'Claude Sonnet 4.6', role: '内容运营', status: 'online', skills: ['文案', '翻译'], createdAt: '2026-08-21' },
  { id: 4, name: '阿码', model: 'Grok Build', role: '后端工程师', status: 'busy', skills: ['Go', 'Redis'], createdAt: '2026-09-01' },
  { id: 5, name: '小慧', model: 'GPT-5', role: '客服专员', status: 'offline', skills: ['售后', '工单'], createdAt: '2026-09-08' },
  { id: 6, name: '青柠', model: 'Claude Sonnet 4.6', role: '测试工程师', status: 'online', skills: ['E2E', 'Playwright'], createdAt: '2026-09-19' },
  { id: 7, name: '深蓝', model: 'DeepSeek V3', role: '后端工程师', status: 'online', skills: ['Java', 'MySQL'], createdAt: '2026-09-30' },
  { id: 8, name: '云舒', model: 'Gemini 3.1 Pro', role: '内容运营', status: 'offline', skills: ['小红书', '剪辑'], createdAt: '2026-10-05' }
].map((s) => ({ ...s, avatar: av(s.name) })) as Staff[]

export const mockTasks: Task[] = [
  { id: 1, title: '重构登录页组件', assigneeId: 1, progress: 70, status: 'doing', priority: 'high', deadline: '2026-10-15' },
  { id: 2, title: '九月用户留存分析报告', assigneeId: 2, progress: 100, status: 'done', priority: 'medium', deadline: '2026-10-08' },
  { id: 3, title: '双十一活动文案撰写', assigneeId: 3, progress: 45, status: 'doing', priority: 'high', deadline: '2026-10-20' },
  { id: 4, title: '订单服务接口限流', assigneeId: 4, progress: 30, status: 'doing', priority: 'high', deadline: '2026-10-18' },
  { id: 5, title: '整理常见问题知识库', assigneeId: 5, progress: 0, status: 'todo', priority: 'low', deadline: '2026-10-30' },
  { id: 6, title: '支付流程回归测试', assigneeId: 6, progress: 100, status: 'done', priority: 'medium', deadline: '2026-10-10' },
  { id: 7, title: '数据库慢查询优化', assigneeId: 7, progress: 60, status: 'doing', priority: 'medium', deadline: '2026-10-22' },
  { id: 8, title: '品牌短视频脚本', assigneeId: 8, progress: 0, status: 'todo', priority: 'low', deadline: '2026-10-28' },
  { id: 9, title: '组件库暗色主题适配', assigneeId: 1, progress: 100, status: 'done', priority: 'low', deadline: '2026-10-06' }
]

export const mockActivities: Activity[] = [
  { id: 1, time: '10-11 09:32', content: '小智 完成了「组件库暗色主题适配」', color: THEME_PRIMARY },
  { id: 2, time: '10-11 09:10', content: '深蓝 开始处理「数据库慢查询优化」', color: THEME_PRIMARY },
  { id: 3, time: '10-10 18:45', content: '青柠 完成了「支付流程回归测试」', color: THEME_PRIMARY },
  { id: 4, time: '10-10 15:20', content: '新员工 云舒（Gemini 3.1 Pro）加入团队', color: THEME_PRIMARY },
  { id: 5, time: '10-10 11:02', content: '阿码 的任务「订单服务接口限流」被标记为高优先级', color: THEME_PRIMARY },
  { id: 6, time: '10-09 17:30', content: '星河 提交了「九月用户留存分析报告」', color: THEME_PRIMARY }
]
