<template>
  <el-container class="home-container">
    <!-- 侧边栏 -->
    <el-aside width="280px" class="sidebar">
      <div class="sidebar-header">
        <div class="app-logo">
          <div class="logo-icon">GN</div>
          <h2>Go-NetDisk</h2>
        </div>
      </div>
      <el-divider />
      <el-menu :default-active="activeMenu" class="sidebar-menu" @select="handleMenuSelect">
        <el-menu-item index="files">
          <el-icon>
            <Folder />
          </el-icon>
          <span>我的文件</span>
        </el-menu-item>
        <el-menu-item index="chat">
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <span>智能文件助手</span>
        </el-menu-item>
        <el-menu-item index="user">
          <el-icon>
            <User />
          </el-icon>
          <span>用户中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-main class="main-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-input v-model="input3" style="flex: 1; max-width: 600px" placeholder="搜索文件" class="search-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
          <template #append>
            <el-button type="primary">搜索</el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="dialogVisible = true" plain>
          <el-icon>
            <Upload />
          </el-icon>
          上传文件
        </el-button>
      </div>

      <!-- 上传对话框 -->
      <el-dialog v-model="dialogVisible" title="文件上传" width="30%" :before-close="handleClose">
        <div v-loading="isUploading" element-loading-text="文件上传中，请稍候..." element-loading-spinner="el-icon-loading"
          style="min-height: 200px; padding: 15px">
          <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileChange" :show-file-list="true"
            multiple :limit="5" :file-list="fileList">
            <el-icon class="el-icon--upload" style="font-size: 50px; color: #409eff"><upload-filled /></el-icon>
            <div class="el-upload__text" style="margin: 15px 0">
              拖拽文件到此处或<em>点击选择文件</em>
            </div>
            <template #tip>
              <div class="el-upload__tip" style="color: #666">
                支持格式：jpg/png/pdf/docx，单个文件不超过50MB
              </div>
            </template>
          </el-upload>
        </div>

        <template #footer>
          <el-button :disabled="isUploading" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="isUploading" @click="submitUpload">
            {{ isUploading ? '上传中...' : '开始上传' }}
          </el-button>
        </template>
      </el-dialog>

      <!-- 文件表格 -->
      <div class="file-table-container">
        <el-table :data="tableData" stripe style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#333' }" empty-text="暂无文件">
          <el-table-column prop="Name" label="文件名" width="320">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon v-if="row.type === 'folder'" color="#409eff">
                  <Folder />
                </el-icon>
                <el-icon v-else color="#666">
                  <Document />
                </el-icon>
                {{ row.Name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="Size" label="大小" width="180" />
          <el-table-column prop="type" label="类型" width="180">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon v-if="row.type === 0" color="#409EFF">
                  <Folder />
                </el-icon>
                <el-icon v-else color="#666">
                  <Document />
                </el-icon>
                <span>{{ row.type === 0 ? '文件夹' : '文件' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="UpdatedAt" label="修改时间" />
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row }">
              <el-button size="large" @click="handleDelete(row)" link>
                <el-icon color="#666">
                  <Delete />
                </el-icon>
              </el-button>
              <el-button size="large" @click="handleDownload(row)" link>
                <el-icon color="#666">
                  <Download />
                </el-icon>
              </el-button>
              <el-button size="large" link>
                <el-icon color="#666" @click="handleThinkFile(row)">
                  <Cpu />
                </el-icon>
              </el-button>
              <el-button size="large" link>
                <el-icon color="#666" @click="handleShare(row)">
                  <Share />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="fileDialog" v-loading="fileDialogLoading" title="AI文件概述" width="500" align-center>
        <span>{{ fileDialogMsg }}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="fileDialog = false">取消</el-button>
            <el-button type="primary" @click="fileDialog = false; fileDialogMsg = ''">
              好的
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 分享对话框 -->
      <el-dialog v-model="shareDialogVisible" title="分享文件" width="400px" align-center>
        <div class="share-dialog-content">
          <div class="share-info">
            <el-icon class="file-icon">
              <Document />
            </el-icon>
            <span class="file-name">{{ selectedFile?.Name }}</span>
          </div>
          <el-form :model="shareForm" label-width="80px">
            <el-form-item label="有效期">
              <el-select v-model="shareForm.expireTime" placeholder="请选择有效期">
                <el-option label="1天" value="1" />
                <el-option label="7天" value="7" />
                <el-option label="30天" value="30" />
                <el-option label="永久" value="-1" />
              </el-select>
            </el-form-item>
            <el-form-item label="提取码">
              <el-input v-model="shareForm.code" placeholder="请输入4位提取码" maxlength="4" />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="shareDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitShare" :loading="sharing">
              确认分享
            </el-button>
          </div>
        </template>
      </el-dialog>
    </el-main>

    <!-- 用户中心 -->
    <UserCenter v-if="activeMenu === 'user'" />
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search,
  Delete as DeleteIcon,
  Download,
  Document,
  Folder,
  UploadFilled,
  Delete,
  Cpu,
  ChatDotRound,
  Upload,
  User,
  Share
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import request from "@/utils/request.js"
import storage from "@/utils/storage.js"
import service from "@/utils/request.js"
import router from "@/router/index.js"
import UserCenter from '@/components/UserCenter.vue'

const input3 = ref('')
const tableData = ref([])
const dialogVisible = ref(false)
const fileList = ref([])
const uploadFile = ref(null)
const isUploading = ref(false)
const fileDialogLoading = ref(false)
const fileDialog = ref(false)
const fileDialogMsg = ref("")
const activeMenu = ref('files')

// 分享相关
const shareDialogVisible = ref(false)
const selectedFile = ref(null)
const sharing = ref(false)
const shareForm = ref({
  expireTime: '7',
  code: ''
})

// 分片大小：5MB
const CHUNK_SIZE = 5 * 1024 * 1024

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (index === 'chat') {
    router.push('/chat')
  } else if (index === 'user') {
    router.push('/user')
  }
}

// 获取文件列表
const fetchData = async () => {
  try {
    const path = storage.getCurPath()
    const response = await request.get(`/files?path=${path}`)
    tableData.value = response.data.data
  } catch (error) {
    ElMessage.error('文件加载失败')
    console.error(error)
  }
}

onMounted(() => {
  fetchData()
})

// 处理对话框关闭
const handleClose = (done) => {
  if (isUploading.value) {
    ElMessage.warning('文件上传中，请等待完成')
    return
  }
  ElMessage.confirm('确定要取消上传吗？')
    .then(() => {
      fileList.value = []
      done()
    })
    .catch(() => { })
}

// 创建文件分片
const createFileChunks = (file) => {
  const chunks = []
  let cur = 0
  while (cur < file.size) {
    chunks.push({
      index: chunks.length,
      file: file.slice(cur, cur + CHUNK_SIZE)
    })
    cur += CHUNK_SIZE
  }
  return chunks
}

// 上传单个分片
const uploadChunk = async (chunk, fileName, totalChunks, currentChunk) => {
  const formData = new FormData()
  formData.append('file', chunk.file)
  formData.append('file_name', fileName)
  formData.append('chunk_index', currentChunk)
  formData.append('total_chunks', totalChunks)

  try {
    const response = await request.post('/uploadfile/chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    throw new Error(`分片 ${currentChunk + 1}/${totalChunks} 上传失败: ${error.message}`)
  }
}

// 提交上传
const submitUpload = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  isUploading.value = true
  try {
    const base64Data = await fileToBase64(uploadFile.value)
    const payload = {
      file_name: uploadFile.value.name,
      file_type: uploadFile.value.type,
      file_size: uploadFile.value.size,
      file_data: base64Data.split(',')[1]
    }

    const response = await request.post('/uploadfile', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.data.code === 200) {
      ElMessage.success('上传成功')
      dialogVisible.value = false
      await fetchData()
    }
  } catch (error) {
    ElMessage.error(`上传失败: ${error.response?.data?.message || error.message}`)
  } finally {
    isUploading.value = false
    fileList.value = []
  }
}

// 文件选择处理
const handleFileChange = (file) => {
  uploadFile.value = file.raw
  fileList.value = [file]
  console.log('选择文件:', file.name, '大小:', file.size)
}

// 文件转 base64 辅助函数
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除【${row.Name}】吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await request.delete(`/files/delete?file_id=${row.ID}`)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      await fetchData()  // 刷新列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`删除失败: ${error.response?.data?.message || error.message}`)
    }
  }
}

const handleDownload = async (row) => {
  let loading = null
  try {
    loading = ElLoading.service({
      lock: true,
      text: '文件下载准备中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    console.log('开始下载文件:', row.ID)

    // 使用fetch API来处理流式下载
    const response = await fetch(`${import.meta.env.VITE_API_URL}/files/download?file_id=${row.ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storage.getToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition')
    const filename = contentDisposition
      ? decodeURIComponent(contentDisposition.split('filename=')[1]?.replace(/"/g, ''))
      : row.Name

    // 创建可读流
    const reader = response.body.getReader()
    const contentLength = +response.headers.get('Content-Length')

    // 创建Blob数组
    let receivedLength = 0
    const chunks = []

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      chunks.push(value)
      receivedLength += value.length

      // 更新进度
      if (contentLength) {
        const percentCompleted = Math.round((receivedLength * 100) / contentLength)
        loading.setText(`文件下载中... ${percentCompleted}%`)
      }
    }

    // 合并所有chunks
    const blob = new Blob(chunks)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('文件下载成功')

  } catch (error) {
    console.error('下载错误:', error)
    if (error.message.includes('429')) {
      ElMessage.error('下载速度过快，请稍后再试')
    } else {
      ElMessage.error(`下载失败: ${error.message}`)
    }
  } finally {
    if (loading) {
      loading.close()
    }
  }
}

const handleThinkFile = async (row) => {
  fileDialog.value = true
  fileDialogLoading.value = true
  try {
    const resp = await service.get(`/files/think?file_id=${row.ID}`)
    fileDialogMsg.value = resp.data.data
    fileDialogLoading.value = false
  } catch (error) {
    ElMessage.error('文件加载失败', error)
    console.error(error)
  }
}

// 处理分享
const handleShare = (row) => {
  selectedFile.value = row
  shareDialogVisible.value = true
}

// 提交分享
const submitShare = async () => {
  if (!shareForm.value.code || shareForm.value.code.length !== 4) {
    ElMessage.warning('请输入4位提取码')
    return
  }

  sharing.value = true
  try {
    const response = await request.post('/files/shared', {
      file_id: selectedFile.value.ID,
      expire_time: parseInt(shareForm.value.expireTime),
      code: shareForm.value.code
    })

    if (response.data.code === 200) {
      ElMessage.success('分享成功')
      shareDialogVisible.value = false
      // 重置表单
      shareForm.value = {
        expireTime: '7',
        code: ''
      }
    }
  } catch (error) {
    ElMessage.error(`分享失败: ${error.response?.data?.message || error.message}`)
  } finally {
    sharing.value = false
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background-color: #f3f8f6;
  display: flex;
  overflow: hidden;
}

.sidebar {
  background: linear-gradient(180deg, #409eff 0%, #2c7be5 100%);
  color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
  height: 50px;
  line-height: 50px;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f3f8f6;
  overflow-y: auto;
  height: 100vh;
}

.action-bar {
  max-width: 1200px;
  margin: 0 auto 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  transition: all 0.3s ease;
}

.search-input:hover {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-table-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  height: calc(100vh - 140px);
  overflow-y: auto;
}

.el-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

@media (max-width: 768px) {
  .el-table-column {
    min-width: 100px;
  }

  .el-dialog {
    width: 90% !important;
  }
}

.share-dialog-content {
  padding: 20px 0;
}

.share-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
}

.file-name {
  font-size: 16px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>