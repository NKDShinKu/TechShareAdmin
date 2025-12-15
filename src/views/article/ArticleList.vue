<template>
  <div>
    <el-tabs v-model="activeTab">
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
          <!-- 待审核：通过、拒绝 -->
          <template v-if="activeTab === 'pending'">
            <el-button size="small" type="success" @click="handleAudit(scope.row, 'pass')">通过</el-button>
            <el-button size="small" type="danger" @click="handleAudit(scope.row, 'reject')">拒绝</el-button>
          </template>
          <!-- 已发布：下架 -->
          <template v-else-if="activeTab === 'published'">
            <el-button size="small" type="warning" @click="handleUnpublish(scope.row)">下架</el-button>
            <el-button size="small" @click="handleViewVersions(scope.row)">历史版本</el-button>
          </template>
          <!-- 未通过：通过、打回 -->
          <template v-else-if="activeTab === 'rejected'">
            <el-button size="small" type="success" @click="handleAudit(scope.row, 'pass')">通过</el-button>
            <el-button size="small" type="warning" @click="handCancelPending(scope.row)">删除提交</el-button>
          </template>
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
        <div v-if="currentDetailNote.tags && currentDetailNote.tags.length" style="margin-bottom: 10px;">
          <span style="color: #666;">标签: </span>
          <el-tag v-for="tag in currentDetailNote.tags" :key="tag" style="margin-right: 5px;">{{ tag }}</el-tag>
        </div>
        <div v-if="currentDetailNote.excerpt" style="margin-bottom: 10px; padding: 10px; background: #f5f7fa; border-left: 3px solid #409eff;">
          <strong>摘要:</strong> {{ currentDetailNote.excerpt }}
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

    <!-- Version History Dialog -->
    <el-dialog v-model="versionHistoryDialogVisible" title="历史版本" width="80%">
      <el-table :data="versionHistory" style="width: 100%">
        <el-table-column prop="id" label="版本ID" width="100" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleViewVersionDetail(scope.row)">查看详情</el-button>
            <el-button size="small" type="danger" @click="handleUnpublishVersion(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import request from '../../api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getImageUrl } from '../../utils/image'

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
const versionHistoryDialogVisible = ref(false)
const versionHistory = ref([])
const currentNoteForVersions = ref(null)

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

watch(activeTab, () => {
  currentPage.value = 1
  fetchData()
})

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleView = (row) => {
  // 直接从列表数据中获取版本信息
  const version = row.pendingVersion || row.publishedVersion || row.draftVersion
  
  if (!version) {
    ElMessage.warning('无内容')
    return
  }
  
  currentDetailNote.value = {
    title: version.title,
    content: version.content_md,
    cover: getImageUrl(version.cover_url),
    author: row.author?.nickname,
    category: version.category?.name || '未分类',
    status: row.status,
    auditReason: row.audit_reason,
    excerpt: version.excerpt,
    tags: version.noteVersionTags?.map(t => t.tag.name) || []
  }
  detailDialogVisible.value = true
}

const handleAudit = async (row, action) => {
  if (action === 'pass') {
    try {
      await request.post(`/notes/admin/audit/${row.id}`, {
        audit_status: 'approved'
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
      audit_status: 'rejected',
      audit_reason: auditReason.value
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

const handCancelPending = async (row) => {
  try {
    await ElMessageBox.confirm('确定要打回该文章吗？', '提示', { type: 'warning' })
    await request.post(`/notes/${row.id}/cancel-pending`)
    ElMessage.success('操作成功')
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleViewVersions = async (row) => {
  currentNoteForVersions.value = row
  try {
    const res = await request.get(`/notes/${row.id}/versions`)
    console.log('历史版本数据:', res)
    // 后端返回的是数组
    versionHistory.value = Array.isArray(res.data) ? res.data : []
    versionHistoryDialogVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('获取历史版本失败')
  }
}

const handleViewVersionDetail = (versionData) => {
  // 直接从历史版本数据显示详情，不需要调用接口
  currentDetailNote.value = {
    title: versionData.title,
    content: versionData.content_md,
    cover: getImageUrl(versionData.cover_url),
    author: currentNoteForVersions.value.author?.nickname,
    category: versionData.category?.name || '未分类',
    status: versionData.is_current ? '当前版本' : '历史版本',
    auditReason: null,
    excerpt: versionData.excerpt,
    tags: versionData.noteVersionTags?.map(t => t.tag.name) || []
  }
  detailDialogVisible.value = true
}

const handleUnpublishVersion = async (versionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个历史版本吗？', '提示', { type: 'warning' })
    await request.delete(`/notes/${currentNoteForVersions.value.id}/versions/${versionId}`)
    ElMessage.success('删除成功')
    // 重新获取历史版本列表
    handleViewVersions(currentNoteForVersions.value)
    // 刷新文章列表
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
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