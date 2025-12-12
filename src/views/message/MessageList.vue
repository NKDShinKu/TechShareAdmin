<template>
  <div>
    <el-card>
      <template #header>发布系统消息</template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSend" :loading="loading">发送</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '../../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const form = ref({ title: '', content: '' })
const loading = ref(false)

const handleSend = async () => {
  if (!form.value.title || !form.value.content) {
    ElMessage.warning('请填写完整')
    return
  }
  try {
    await ElMessageBox.confirm('确定要发送系统消息给所有用户吗？', '提示', { type: 'warning' })
    loading.value = true
    await request.post('/notifications/admin/broadcast', form.value)
    ElMessage.success('发送成功')
    form.value = { title: '', content: '' }
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  } finally {
    loading.value = false
  }
}
</script>