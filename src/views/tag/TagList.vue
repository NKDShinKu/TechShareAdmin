<template>
  <div>
    <div class="filter-container">
      <el-button type="primary" @click="handleAdd">新增标签</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="slug" label="Slug" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, prev, pager, next"
      :total="total"
      style="margin-top: 20px; text-align: right;"
    />

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑标签' : '新增标签'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="form.slug" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const form = ref({ id: '', name: '', slug: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/tags', {
      params: {
        page: currentPage.value,
        limit: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleAdd = () => {
  form.value = { id: '', name: '', slug: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该标签吗？', '提示', { type: 'warning' })
    await request.delete(`/tags/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const confirmSubmit = async () => {
  try {
    if (form.value.id) {
      await request.put(`/tags/${form.value.id}`, form.value)
    } else {
      await request.post('/tags', form.value)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>