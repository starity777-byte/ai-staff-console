<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import type { Task } from '@/types'
import { useStaffStore } from '@/stores/staff'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'submit', v: Omit<Task, 'id'>): void }>()
const staff = useStaffStore()
const formRef = ref<FormInstance>()
const empty = () => ({ title: '', assigneeId: undefined as number | undefined, priority: 'medium' as Task['priority'], deadline: undefined as Dayjs | undefined, progress: 0 })
const form = reactive(empty())
const rules = {
  title: [{ required: true, message: '请输入任务名称' }, { max: 30, message: '不超过 30 个字符' }],
  assigneeId: [{ required: true, message: '请选择负责人' }],
  deadline: [{ required: true, message: '请选择截止日期' }]
}
watch(() => props.open, (v) => { if (v) { Object.assign(form, empty()); formRef.value?.clearValidate() } })
async function onOk() {
  await formRef.value?.validate()
  const status: Task['status'] = form.progress >= 100 ? 'done' : form.progress > 0 ? 'doing' : 'todo'
  emit('submit', { title: form.title, assigneeId: form.assigneeId!, priority: form.priority, deadline: form.deadline!.format('YYYY-MM-DD'), progress: form.progress, status })
  emit('update:open', false)
}
</script>
<template>
  <a-modal :open="open" title="新建任务" ok-text="创建" cancel-text="取消" @ok="onOk" @cancel="emit('update:open', false)">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="任务名称" name="title"><a-input v-model:value="form.title" placeholder="请输入任务名称" /></a-form-item>
      <a-form-item label="负责人" name="assigneeId">
        <a-select v-model:value="form.assigneeId" placeholder="选择 AI 员工" :options="staff.list.map((s) => ({ value: s.id, label: `${s.name}（${s.model}）` }))" />
      </a-form-item>
      <a-form-item label="优先级" name="priority">
        <a-segmented v-model:value="form.priority" :options="[{ label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' }]" />
      </a-form-item>
      <a-form-item label="截止日期" name="deadline"><a-date-picker v-model:value="form.deadline" style="width: 100%" /></a-form-item>
      <a-form-item label="初始进度" name="progress"><a-slider v-model:value="form.progress" :step="5" /></a-form-item>
    </a-form>
  </a-modal>
</template>
