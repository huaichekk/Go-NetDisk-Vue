<template>
  <div class="chat-window">
    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContent">
      <div v-for="(message, index) in messages" :key="index"
           :class="['message', message.type]">
        <div class="message-header">
          <span class="message-sender">{{ message.type === 'user' ? '您' : 'AI助手' }}</span>
          <span class="message-time">{{ formatDate(message.timestamp) }}</span>
          span        </div>
        <div class="message-body">
          {{ message.content }}
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <el-input
          v-model="newMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入消息..."
          @keyup.enter.native="sendMessage"
      />
      <div class="chat-input-actions">
        <el-button type="primary" @click="sendMessage" :disabled="!newMessage">发送</el-button>
        <el-upload
            class="-demoupload"
            action=""
            :show-file-list="false"
            accept=".png,.jpg,.jpeg,.gif"
            :before-upload="handleFileUpload"
        >
          <el-button type="info" icon="el-icon-picture">发送图片</el-button>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
  } else    {
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
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f8f9fa;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
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
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.message-sender {
  font-weight: bold;
}

.message-time {
  color: #999;
}

.message-body {
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.user .message-body {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.message.ai .message-body {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #fff;
}

.chat-input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}
</style>