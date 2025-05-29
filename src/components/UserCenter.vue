<template>
  <div class="user-center-container">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import service from "@/utils/request.js"

const loading = ref(false)
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

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-center-container {
  height: 100%;
  padding: 20px;
  background-color: #f3f8f6;
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