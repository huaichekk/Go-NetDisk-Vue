<template>
  <div class="app-container">
    <el-container class="chat-container">
      <!--侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <div class="sidebar-header">
          <h2>AI 聊天助手</h2>
          <el-button type="primary" @click="createNewChat" :icon="Plus">新建对话</el-button>
        </div>
        <el-divider />
        <el-menu>
          <el-menu-item v-for="(chat, index) in chats" :key="index"
                        :class="{ active: activeChat === index }"
                        @click="switchChat(index)">
            <template #title>
              <span>{{ chat.title }}</span>
            </template>
          </el-menu-item>
        </el-menu>
        <el-button type="danger" plain @click="deleteActiveChat"
                   :disabled="chats.length === 0"
                   style="position: absolute; bottom: 20px; width: calc(100% - 40px);">
          删除当前对话
        </el-button>
      </el-aside>

      <!-- 聊天主窗口 -->
      <el-main class="chat-main">
        <ChatWindow v-if="chats.length > 0" :messages="chats[activeChat].messages"
                    @send-message="sendMessage" />
        <div v-else class="empty-chat">
          <el-empty description="暂无对话，请新建对话开始聊天" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ChatWindow from '../components/ChatWindow.vue'
import Chat from "@/views/Chat.vue";
import service from "@/utils/request.js";

// 聊天列表
const chats = reactive([
  {
    title: '新对话',
    messages: []
  }
])

// 当前活跃的聊天索引
const activeChat = ref(0)

//新 创建对话
const createNewChat = () => {
  chats.push({
    title: '新对话',
    messages: []
  })
  activeChat.value=chats.length - 1
}

// 切换对话
const switchChat = (index) => {
  activeChat.value = index
}

// 发送消息
const sendMessage =async (message) => {
  const currentChat = chats[activeChat.value]
  currentChat.messages.push({
    type: 'user',
    content: message,
    timestamp: new Date().toISOString()
  })
  const formData = new URLSearchParams()
  formData.append('message',message)
 const resp= await service.post("/chat",formData,{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  currentChat.messages.push({
    type: 'ai',
    content: resp.data.data,
    timestamp: new Date().toISOString()
  })
  // 模拟AI回复（实际应用中这里会调用AI API）
  // setTimeout(() => {
  //   currentChat.messages.push({
  //     type: 'ai',
  //     content: '这是一个AI生成的回复。在实际应用中这里，会调用AI API获取真实回复。',
  //     timestamp: new Date().toISOString()
  //   })
  // }, 1000)
}

// 删除当前对话
const deleteActiveChat = () => {
  chats.splice(activeChat.value, 1)
  if (chats.length > 0) {
    activeChat.value = Math.min(activeChat.value, chats.length - 1)
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
}

.chat-container {
  flex: 1;
  height: 100%;
}

.sidebar {
  background-color: #f5f7fa;
  padding: 20px;
  height: 100%;
  position : relative;
}

.sidebar-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.el-menu-item.active {
  background-color: #e6f7ff !important;
  color: #189ff0 !important;
}

.el-menu-item:hover {
  background-color: #e6f7ff;
}

.el-menu-item {
  margin-bottom: 01px;
}
</style>