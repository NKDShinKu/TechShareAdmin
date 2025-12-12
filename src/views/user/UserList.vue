<template>
  <div>
    <div class="filter-container">
      <el-input v-model="searchQuery" placeholder="搜索用户名/昵称/邮箱" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchData" />
      <el-button type="primary" @click="fetchData">搜索</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'ADMIN' ? 'danger' : 'success'">{{ scope.row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="warning" @click="handleRole(scope.row)">角色</el-button>
          <el-button size="small" type="danger" @click="handleResetPassword(scope.row)">重置密码</el-button>
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

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑用户">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="editForm.bio" type="textarea" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar_url" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Role Dialog -->
    <el-dialog v-model="roleDialogVisible" title="修改角色">
      <el-select v-model="roleForm.role" placeholder="Select">
        <el-option label="USER" value="USER" />
        <el-option label="ADMIN" value="ADMIN" />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRole">确定</el-button>
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
const searchQuery = ref('')

const editDialogVisible = ref(false)
const editForm = ref({ id: '', nickname: '', bio: '', avatar_url: '' })

const roleDialogVisible = ref(false)
const roleForm = ref({ id: '', role: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/users/admin/list', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value
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

const handleEdit = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const confirmEdit = async () => {
  try {
    await request.put(`/users/admin/${editForm.value.id}/profile`, {
      nickname: editForm.value.nickname,
      bio: editForm.value.bio,
      avatar_url: editForm.value.avatar_url
    })
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleRole = (row) => {
  roleForm.value = { id: row.id, role: row.role }
  roleDialogVisible.value = true
}

const confirmRole = async () => {
  try {
    await request.put(`/users/admin/${roleForm.value.id}/role`, {
      role: roleForm.value.role
    })
    ElMessage.success('修改成功')
    roleDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleResetPassword = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.{6,}/,
      inputErrorMessage: '密码长度至少6位'
    })
    await request.post(`/users/admin/${row.id}/reset-password`, {
      password: value
    })
    ElMessage.success('重置成功')
  } catch (error) {
    if (error !== 'cancel') console.error(error)
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