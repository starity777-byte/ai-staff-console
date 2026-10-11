<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { FormInstance } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import type { Task } from '@/types'
import { useStaffStore } from '@/stores/staff'
import { TASK_STATUS } from '@/mock/constants'

const props = defineProps<{ open: boolean; record?: Task | null }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'submit', v: Omit<Task, 'id'>): void }>()
const staff = useStaffStore()
const formRef = ref<FormInstance>()
const empty = () => ({
  title: '',
  assigneeId: undefined as number | undefined,
  priority: 'medium' as Task['priority'],
  deadline: undefined as Dayjs | undefined,
  progress: 0,
  status: 'todo' as Task['status']
})
const form = reactive(empty())
const statusOptions = (Object.keys(TASK_STATUS) as Task['status'][]).map((k) => ({ label: TASK_STATUS[k].text, value: k }))
const rules = {
  title: [{ required: true, message: '请输入任务名称' }, { max: 30, message: '不超过 30 个字符' }],
  assigneeId: [{ required: true, message: '请选择负责人' }],
  deadline: [{ required: true, message: '请选择截止日期' }]
}
watch(() => props.open, (v) => {
  if (!v) return
  if (props.record) {
    Object.assign(form, empty(), {
      title: props.record.title,
      assigneeId: props.record.assigneeId,
      priority: props.record.priority,
      deadline: dayjs(props.record.deadline),
      progress: props.record.progress,
      status: props.record.status
    })
  } else {
    Object.assign(form, empty())
  }
  formRef.value?.clearValidate()
})
async function onOk() {
  await formRef.value?.validate()
  const status: Task['status'] = props.record
    ? form.status
    : form.progress >= 100 ? 'done' : form.progress > 0 ? 'doing' : 'todo'
  emit('submit', {
    title: form.title,
    assigneeId: form.assigneeId!,
    priority: form.priority,
    deadline: form.deadline!.format('YYYY-MM-DD'),
    progress: form.progress,
    status
  })
  emit('update:open', false)
}
</script>
<template>
  <a-modal :open="open" :title="record ? '编辑任务' : '新建任务'" :ok-text="record ? '保存' : '创建'" cancel-text="取消" @ok="onOk" @cancel="emit('update:open', false)">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="任务名称" name="title"><a-input v-model:value="form.title" placeholder="请输入任务名称" /></a-form-item>
      <a-form-item label="负责人" name="assigneeId">
        <a-select v-model:value="form.assigneeId" placeholder="选择 AI 员工" :options="staff.list.map((s) => ({ value: s.id, label: `${s.name}（${s.model}）` }))" />
      </a-form-item>
      <a-form-item label="优先级" name="priority">
        <a-segmented v-model:value="form.priority" :options="[{ label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' }]" />
      </a-form-item>
      <a-form-item v-if="record" label="状态" name="status">
        <a-segmented v-model:value="form.status" :options="statusOptions" />
      </a-form-item>
      <a-form-item label="截止日期" name="deadline"><a-date-picker v-model:value="form.deadline" style="width: 100%" /></a-form-item>
      <a-form-item :label="record ? '进度' : '初始进度'" name="progress"><a-slider v-model:value="form.progress" :step="5" /></a-form-item>
    </a-form>
  </a-modal>
</template>
