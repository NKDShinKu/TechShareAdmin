<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总用户数</template>
          <div class="card-value">{{ stats.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>总文章数</template>
          <div class="card-value">{{ stats.totalNotes }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>已发布文章</template>
          <div class="card-value">{{ stats.publishedNotes }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>待审核文章</template>
          <div class="card-value">{{ stats.pendingNotes }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../api/request'

const stats = ref({
  totalUsers: 0,
  totalNotes: 0,
  publishedNotes: 0,
  pendingNotes: 0,
  rejectedNotes: 0
})

const fetchStats = async () => {
  try {
    const res = await request.get('/users/admin/stats')
    if (res.data) {
      stats.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.card-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}
</style>