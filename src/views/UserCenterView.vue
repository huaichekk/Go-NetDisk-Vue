<template>
  <el-container class="user-center-container">
    <!-- 侧边栏 -->
    <el-aside width="280px" class="sidebar">
      <div class="sidebar-header">
        <div class="app-logo">
          <div class="logo-icon">GN</div>
          <h2>Go-NetDisk</h2>
        </div>
      </div>
      <el-divider />
      <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
      >
        <el-menu-item index="files">
          <el-icon><Folder /></el-icon>
          <span>我的文件</span>
        </el-menu-item>
        <el-menu-item index="chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>智能文件助手</span>
        </el-menu-item>
        <el-menu-item index="user">
          <el-icon><User /></el-icon>
          <span>用户中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-main class="main-content">
      <div class="user-center-content">
        <div class="user-info" v-loading="loading">
          <div class="avatar-container">
            <el-avatar :size="100" :icon="UserFilled" />
            <div class="vip-badge" v-if="userInfo.IsVIP">
              <el-tag type="warning" effect="dark">VIP</el-tag>
            </div>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ userInfo.Username }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ formatDate(userInfo.CreatedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">会员状态：</span>
              <span class="value">
                <el-tag :type="userInfo.IsVIP ? 'warning' : 'info'" size="small">
                  {{ userInfo.IsVIP ? 'VIP会员' : '普通用户' }}
                </el-tag>
              </span>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="handleUpgrade" v-if="!userInfo.IsVIP">
              升级VIP
            </el-button>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserFilled, Folder, ChatDotRound, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import service from "@/utils/request.js"
import router from "@/router/index.js"

const loading = ref(false)
const activeMenu = ref('user')
const userInfo = ref({
  ID: null,
  CreatedAt: '',
  Username: '',
  IsVIP: false
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await service.get('/userInfo')
    if (response.data.code === 200) {
      userInfo.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 升级VIP
const handleUpgrade = () => {
  ElMessage.info('VIP功能开发中...')
}

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (index === 'files') {
    router.push('/home')
  } else if (index === 'chat') {
    router.push('/chat')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-center-container {
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

.user-center-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 40px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.avatar-container {
  position: relative;
  margin-bottom: 20px;
}

.vip-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
}

.info-list {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #666;
  width: 100px;
  font-weight: 500;
}

.info-item .value {
  color: #333;
  flex: 1;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.action-buttons .el-button {
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

@media (max-width: 768px) {
  .user-center-content {
    padding: 20px;
  }

  .info-list {
    padding: 15px;
  }

  .info-item {
    font-size: 14px;
  }

  .info-item .label {
    width: 80px;
  }
}
</style> 