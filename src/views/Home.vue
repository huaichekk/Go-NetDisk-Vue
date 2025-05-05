<template>
  <!-- 头部 -->
  <div style="height: 60px; background-color: #409eff">
    <div style="height: 60px; display: flex; justify-content: center; align-items: center">
      <h2 style="margin: 0; color: white">Go-NetDisk</h2>
    </div>
  </div>

  <!-- 主体内容 -->
  <div style="min-height: calc(100vh - 60px); background-color: #f3f8f6; padding: 30px 20px">
    <!-- 操作栏 -->
    <div style="max-width: 1200px; margin: 0 auto 20px; display: flex; gap: 15px; align-items: center">
      <el-input
          v-model="input3"
          style="flex: 1; max-width: 600px"
          placeholder="搜索文件"
          class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary">搜索</el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="dialogVisible = true" plain>上传文件</el-button>
      <el-button type="primary" @click="goChat" plain>智能文件助手</el-button>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="文件上传"
        width="30%"
        :before-close="handleClose"
    >
      <div
          v-loading="isUploading"
          element-loading-text="文件上传中，请稍候..."
          element-loading-spinner="el-icon-loading"
          style="min-height: 200px; padding: 15px"
      >
        <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="true"
            multiple
            :limit="5"
            :file-list="fileList"
        >
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
        <el-button
            type="primary"
            :disabled="isUploading"
            @click="submitUpload"
        >
          {{ isUploading ? '上传中...' : '开始上传' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 文件表格 -->
    <div style="max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08)">
      <el-table
          :data="tableData"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#333' }"
          empty-text="暂无文件"
      >
        <el-table-column prop="Name" label="文件名" width="320">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-icon v-if="row.type === 'folder'" color="#409eff"><Folder /></el-icon>
              <el-icon v-else color="#666"><Document /></el-icon>
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
              <el-icon color="#666"><Delete/></el-icon>
            </el-button>
            <el-button size="large" @click="handleDownload(row)" link>
              <el-icon color="#666"><Download /></el-icon>
            </el-button>
            <el-button size="large" link>
              <el-icon color="#666" @click="handleThinkFile(row)"><Cpu /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
          v-model="fileDialog"
          v-loading="fileDialogLoading"
          title="AI文件概述"
          width="500"
          align-center
      >
        <span>{{fileDialogMsg}}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="fileDialog = false">取消</el-button>
            <el-button type="primary" @click="fileDialog = false;fileDialogMsg=''">
              好的
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Search,
  Delete as DeleteIcon,
  Download,
  Document,
  Folder,
  UploadFilled, Delete, Cpu, MagicStick
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox,ElLoading } from 'element-plus' // 添加 ElMessageBox
import request from "@/utils/request.js"
import storage from "@/utils/storage.js";
import service from "@/utils/request.js";
import router from "@/router/index.js";

const input3 = ref('')
const tableData = ref([])
const dialogVisible = ref(false)
const fileList = ref([])
const uploadFile = ref(null)
const isUploading = ref(false)
const fileDialogLoading=ref(false)
const fileDialog=ref(false)
const fileDialogMsg=ref("")
// 获取文件列表
const fetchData = async () => {
  try {
    const path=storage.getCurPath()
    const response = await request.get(`/files?path=${ path }`)
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
      .catch(() => {})
}

// 文件选择处理
const handleFileChange = (file) => {
  uploadFile.value = file.raw
}

// 文件转Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
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

    const response = await request.get(`/files/download?file_id=${row.ID}`, {
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const link = document.createElement('a')
    const url = window.URL.createObjectURL(blob)

    const filename = getFileNameFromHeaders(response.headers) || row.Name
    link.href = url
    link.download = decodeURIComponent(filename)

    document.body.appendChild(link)
    link.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    ElMessage.success('文件下载成功')

  } catch (error) {
    if (error.response) {
      // ...错误处理逻辑保持不变...
    }
  } finally {
    if (loading) {
      loading.close()
    }
  }
}

// 从headers提取文件名工具函数
const getFileNameFromHeaders = (headers) => {
  const disposition = headers['content-disposition']
  if (!disposition) return null

  // 处理UTF-8编码的文件名
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:;?|$)/i
  const matches = utf8FilenameRegex.exec(disposition)
  if (matches && matches[1]) {
    return decodeURIComponent(matches[1])
  }

  // 处理普通文件名
  const filenameRegex = /filename="?([^"]+)"?/i
  return filenameRegex.exec(disposition)?.[1]
}


const handleThinkFile=async (row)=>{

  fileDialog.value=true
  fileDialogLoading.value=true
  try {
    const resp=await service.get(`/files/think?file_id=${ row.ID }`)
    fileDialogMsg.value=resp.data.data
    fileDialogLoading.value=false
  }catch (error) {
    ElMessage.error('文件加载失败',error)
    console.error(error)
  }
}


const goChat=()=>{
  router.push("/chat")
}




</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:hover {
  box-shadow: 0 2px 8px rgba(64,158,255,0.1);
}

.el-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}

@media (max-width: 768px) {
  .el-table-column {
    min-width: 100px;
  }

  .el-dialog {
    width: 90% !important;
  }
}
</style>