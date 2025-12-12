<template>
  <div>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="待审核" name="pending"></el-tab-pane>
      <el-tab-pane label="已发布" name="published"></el-tab-pane>
      <el-tab-pane label="未通过" name="rejected"></el-tab-pane>
    </el-tabs>

    <div class="filter-container">
      <el-input v-model="searchQuery" placeholder="搜索文章标题" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchData" />
      <el-button type="primary" @click="fetchData">搜索</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="标题">
        <template #default="scope">
          <el-link type="primary" @click="handleView(scope.row)">
            {{ scope.row.publishedVersion?.title || scope.row.pendingVersion?.title || scope.row.draftVersion?.title || '无标题' }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="author.nickname" label="作者" width="120" />
      <el-table-column label="分类" width="120">
        <template #default="scope">
          {{ scope.row.publishedVersion?.category?.name || scope.row.pendingVersion?.category?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button v-if="activeTab === 'pending'" size="small" type="success" @click="handleAudit(scope.row, 'pass')">通过</el-button>
          <el-button v-if="activeTab === 'pending'" size="small" type="danger" @click="handleAudit(scope.row, 'reject')">拒绝</el-button>
          <el-button v-if="activeTab === 'published'" size="small" type="warning" @click="handleUnpublish(scope.row)">下架</el-button>
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

    <!-- Audit Reject Dialog -->
    <el-dialog v-model="auditDialogVisible" title="审核拒绝">
      <el-input v-model="auditReason" type="textarea" placeholder="请输入拒绝理由" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialogVisible" title="文章详情" width="70%">
      <div v-if="currentDetailNote">
        <h3>{{ currentDetailNote.title }}</h3>
        <div style="margin-bottom: 10px; color: #666;">
          <span>作者: {{ currentDetailNote.author }}</span>
          <span style="margin-left: 20px;">分类: {{ currentDetailNote.category }}</span>
          <span style="margin-left: 20px;">状态: {{ currentDetailNote.status }}</span>
        </div>
        <div v-if="currentDetailNote.cover" style="margin-bottom: 10px;">
          <img :src="currentDetailNote.cover" style="max-width: 100%; max-height: 300px;" />
        </div>
        <div style="border: 1px solid #eee; padding: 10px; min-height: 200px; white-space: pre-wrap;">
          {{ currentDetailNote.content }}
        </div>
        <div v-if="currentDetailNote.auditReason" style="margin-top: 10px; color: red;">
          拒绝理由: {{ currentDetailNote.auditReason }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('pending')
const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')

const auditDialogVisible = ref(false)
const auditReason = ref('')
const currentNote = ref(null)

const detailDialogVisible = ref(false)
const currentDetailNote = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/notes/admin/list', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        status: activeTab.value,
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

const handleTabClick = () => {
  currentPage.value = 1
  fetchData()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleView = (row) => {
  const version = row.pendingVersion || row.publishedVersion || row.draftVersion
  if (!version) {
    ElMessage.warning('无内容')
    return
  }
  currentDetailNote.value = {
    title: version.title,
    content: version.content_md,
    cover: version.cover_url,
    author: row.author?.nickname,
    category: version.category?.name || '未分类',
    status: row.status,
    auditReason: row.audit_reason
  }
  detailDialogVisible.value = true
}

const handleAudit = async (row, action) => {
  if (action === 'pass') {
    try {
      await request.post(`/notes/admin/audit/${row.id}`, {
        status: 'published'
      })
      ElMessage.success('审核通过')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  } else {
    currentNote.value = row
    auditReason.value = ''
    auditDialogVisible.value = true
  }
}

const confirmReject = async () => {
  if (!auditReason.value) {
    ElMessage.warning('请输入拒绝理由')
    return
  }
  try {
    await request.post(`/notes/admin/audit/${currentNote.value.id}`, {
      status: 'rejected',
      reason: auditReason.value
    })
    ElMessage.success('已拒绝')
    auditDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleUnpublish = async (row) => {
  try {
    await ElMessageBox.confirm('确定要下架该文章吗？', '提示', { type: 'warning' })
    await request.post(`/notes/${row.id}/unpublish`)
    ElMessage.success('下架成功')
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该文章吗？', '提示', { type: 'warning' })
    await request.delete(`/notes/${row.id}`)
    ElMessage.success('删除成功')
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