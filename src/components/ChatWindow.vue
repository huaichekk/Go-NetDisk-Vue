<template>
  <div class="chat-window">
    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContent">
      <transition-group name="message-fade">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <div class="message-header">
            <div class="message-sender-container">
              <div class="avatar" :class="message.type">{{ message.type === 'user' ? '您' : 'AI' }}</div>
              <span class="message-sender">{{ message.type === 'user' ? '您' : 'AI助手' }}</span>
            </div>
            <span class="message-time">{{ formatDate(message.timestamp) }}</span>
          </div>
          <div class="message-body">
            {{ message.content }}
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <el-input v-model="newMessage" type="textarea" :rows="3" placeholder="请输入消息..."
        @keyup.enter.native="sendMessage" />
      <div class="chat-input-actions">
        <el-button type="primary" @click="sendMessage" :disabled="!newMessage">发送</el-button>
        <el-upload class="-demoupload" action="" :show-file-list="false" accept=".png,.jpg,.jpeg,.gif"
          :before-upload="handleFileUpload">
          <el-button type="info" icon="el-icon-picture">发送图片</el-button>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['send-message'])

const newMessage = ref('')
const chatContent = ref(null)

// 发送消息
const sendMessage = () => {
  if (newMessage.value.trim()) {
    emit('send-message', newMessage.value)
    newMessage.value = ''
  } else {
    ElMessage.warning('请输入消息内容')
  }
}

// 处理文件上传
const handleFileUpload = (file) => {
  // 这里可以处理文件上传逻辑，然后调用 sendMessage 发送文件
  console.log('文件上传:', file)
  return false  //止默认上传行为
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  (newMessages) => {
    if (chatContent.value) {
      setTimeout(() => {
        chatContent.value.scrollTop = chatContent.value.scrollHeight
      }, 100)
    }
  },
  { deep: true }
)

onMounted(() => {
  // 初始时滚动到底部
  if (chatContent.value) {
    chatContent.value.scrollTop = chatContent.value.scrollHeight
  }
})
</script>

<style scoped>
.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f0f2f5;
  background-image: linear-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
  background-size: 20px 20px;
  scrollbar-width: thin;
}

.chat-content::-webkit-scrollbar {
  width: 6px;
}

.chat-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.message {
  margin-bottom: 24px;
  max-width: 80%;
  animation: appear 0.3s ease-out;
  position: relative;
}

.message.user {
  margin-left: auto;
}

.message.ai {
  margin-right: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.message-sender-container {
  display: flex;
  align-items: center;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-right: 8px;
}

.avatar.user {
  background: linear-gradient(135deg, #1890ff, #0050b3);
}

.avatar.ai {
  background: linear-gradient(135deg, #52c41a, #237804);
}

.message-sender {
  font-weight: bold;
}

.message-time {
  color: #999;
}

.message-body {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  line-height: 1.5;
  position: relative;
  transition: all 0.3s ease;
}

.message.user .message-body {
  background-color: #1890ff;
  color: white;
  border-top-right-radius: 4px;
}

.message.user .message-body::after {
  content: '';
  position: absolute;
  top: 0;
  right: -8px;
  width: 0;
  height: 0;
  border-left: 8px solid #1890ff;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.message.ai .message-body {
  background-color: white;
  border-top-left-radius: 4px;
}

.message.ai .message-body::after {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  width: 0;
  height: 0;
  border-right: 8px solid white;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #eee;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 20px;
  padding: 12px 16px;
  resize: none;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.chat-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chat-input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 12px;
}

.chat-input-actions .el-button {
  border-radius: 20px;
  padding: 8px 20px;
  transition: all 0.3s;
}

.chat-input-actions .el-button--primary {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border: none;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.chat-input-actions .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.chat-input-actions .el-button--info {
  background: linear-gradient(135deg, #909399, #606266);
  border: none;
  box-shadow: 0 2px 6px rgba(144, 147, 153, 0.3);
}

.chat-input-actions .el-button--info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.4);
}

/* 消息动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.5s;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>