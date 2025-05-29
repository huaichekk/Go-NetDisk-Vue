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

    <!-- 聊天主窗口 -->
    <el-main class="main-content">
      <div class="chat-container">
        <div class="chat-header">
          <h2>AI 聊天助手</h2>
          <el-button type="primary" @click="createNewChat" :icon="Plus" class="new-chat-btn">新建对话</el-button>
        </div>
        <el-divider />
        <div class="chat-list-container">
          <transition-group name="chat-list" tag="div" class="chat-list">
            <el-menu :default-active="activeChat.toString()">
              <el-menu-item v-for="(chat, index) in chats" :key="index" :class="{ active: activeChat === index }"
                :index="index.toString()" @click="switchChat(index)">
                <template #title>
                  <div class="chat-item">
                    <i class="el-icon-chat-dot-round chat-icon"></i>
                    <span class="chat-title">{{ chat.title }}</span>
                  </div>
                </template>
              </el-menu-item>
            </el-menu>
          </transition-group>
        </div>
        <el-button type="danger" @click="deleteActiveChat" :disabled="chats.length === 0" class="delete-chat-btn">
          <i class="el-icon-delete"></i> 删除当前对话
        </el-button>
      </div>

      <!-- 聊天窗口 -->
      <div class="chat-window-container">
        <ChatWindow v-if="chats.length > 0" :messages="chats[activeChat].messages" @send-message="sendMessage" />
        <div v-else class="empty-chat">
          <el-empty description="暂无对话，请新建对话开始聊天" />
        </div>
      </div>
    </el-main>

    <!-- 用户中心 -->
    <UserCenter v-if="activeMenu === 'user'" />
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Folder, ChatDotRound, User } from '@element-plus/icons-vue'
import ChatWindow from '../components/ChatWindow.vue'
import UserCenter from '@/components/UserCenter.vue'
import service from "@/utils/request.js"
import router from "@/router/index.js"

// 聊天列表
const chats = reactive([
  {
    title: '新对话',
    messages: []
  }
])

// 当前活跃的聊天索引
const activeChat = ref(0)
const activeMenu = ref('chat')

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (index === 'files') {
    router.push('/home')
  } else if (index === 'user') {
    router.push('/user')
  }
}

// 创建新对话
const createNewChat = () => {
  chats.push({
    title: '新对话',
    messages: []
  })
  activeChat.value = chats.length - 1
}

// 切换对话
const switchChat = (index) => {
  activeChat.value = index
}

// 发送消息
const sendMessage = async (message) => {
  const currentChat = chats[activeChat.value]
  currentChat.messages.push({
    type: 'user',
    content: message,
    timestamp: new Date().toISOString()
  })
  const formData = new URLSearchParams()
  formData.append('message', message)
  const resp = await service.post("/chat", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  currentChat.messages.push({
    type: 'ai',
    content: resp.data.data,
    timestamp: new Date().toISOString()
  })
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
  display: flex;
  gap: 20px;
  height: 100vh;
  overflow: hidden;
}

.chat-container {
  width: 280px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 20px;
  position: relative;
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chat-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.new-chat-btn {
  background: linear-gradient(135deg, #409eff, #2c7be5);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.chat-list-container {
  flex: 1;
  overflow-y: auto;
  margin: 10px 0;
}

.chat-list {
  margin-top: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.chat-icon {
  font-size: 16px;
  color: #409eff;
}

.chat-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-chat-btn {
  margin-top: auto;
  width: 100%;
  border-radius: 6px;
  background: rgba(245, 34, 45, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(245, 34, 45, 0.2);
  transition: all 0.3s;
}

.delete-chat-btn:hover:not(:disabled) {
  background: rgba(245, 34, 45, 0.2);
  border-color: rgba(245, 34, 45, 0.3);
}

.delete-chat-btn:disabled {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
  border-color: transparent;
}

.chat-window-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  height: calc(100vh - 40px);
}

.empty-chat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #8c8c8c;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.empty-chat :deep(.el-empty__description) {
  margin-top: 16px;
  font-size: 16px;
  color: #8c8c8c;
}

.empty-chat :deep(.el-empty__image) {
  width: 120px;
  height: 120px;
}

/* 动画效果 */
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.3s ease;
}

.chat-list-enter-from,
.chat-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.el-divider {
  background-color: rgba(0, 0, 0, 0.1);
  margin: 0;
}
</style>