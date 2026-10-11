<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance } from 'ant-design-vue'
import type { Staff } from '@/types'
import { MODELS, ROLES } from '@/mock'

const props = defineProps<{ open: boolean; record?: Staff | null }>()
const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'submit', v: Omit<Staff, 'id' | 'createdAt' | 'avatar'>): void }>()
const formRef = ref<FormInstance>()
const empty = () => ({ name: '', model: undefined as string | undefined, role: undefined as string | undefined, status: 'online' as Staff['status'], skills: [] as string[] })
const form = reactive(empty())
const rules = {
  name: [{ required: true, message: '请输入员工名称' }, { min: 2, max: 12, message: '名称长度为 2-12 个字符' }],
  model: [{ required: true, message: '请选择底层模型' }],
  role: [{ required: true, message: '请选择职位' }],
  skills: [{ required: true, type: 'array' as const, min: 1, message: '至少添加一项技能' }]
}
watch(() => props.open, (v) => {
  if (!v) return
  Object.assign(form, empty(), props.record ? { ...props.record, skills: [...props.record.skills] } : {})
  formRef.value?.clearValidate()
})
async function onSubmit() {
  await formRef.value?.validate()
  emit('submit', { name: form.name, model: form.model!, role: form.role!, status: form.status, skills: form.skills })
  emit('update:open', false)
}
</script>
<template>
  <a-drawer :open="open" :title="record ? '编辑员工' : '新增员工'" width="440" @close="emit('update:open', false)">
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="员工名称" name="name"><a-input v-model:value="form.name" placeholder="例如：小智" /></a-form-item>
      <a-form-item label="底层模型" name="model">
        <a-select v-model:value="form.model" placeholder="请选择模型" :options="MODELS.map((m) => ({ value: m, label: m }))" />
      </a-form-item>
      <a-form-item label="职位" name="role">
        <a-select v-model:value="form.role" placeholder="请选择职位" :options="ROLES.map((m) => ({ value: m, label: m }))" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="form.status">
          <a-radio value="online">在线</a-radio><a-radio value="busy">忙碌</a-radio><a-radio value="offline">离线</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="技能标签" name="skills">
        <a-select v-model:value="form.skills" mode="tags" placeholder="输入后回车添加" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space style="float: right"><a-button @click="emit('update:open', false)">取消</a-button><a-button type="primary" @click="onSubmit">保存</a-button></a-space>
    </template>
  </a-drawer>
</template>
