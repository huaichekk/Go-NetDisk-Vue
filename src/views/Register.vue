<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">注册新账号</h2>

      <!-- 错误提示 -->
      <el-alert
          v-if="errorMsg"
          :title="errorMsg"
          type="error"
          :closable="false"
          show-icon
          class="mb-4"
      />

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名（3-20位）"
              :prefix-icon="User"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              show-password
              placeholder="请输入密码（6-20位）"
              :prefix-icon="Lock"
              clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              show-password
              placeholder="请确认密码"
              :prefix-icon="Lock"
              clearable
          />
        </el-form-item>

        <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="w-full submit-btn"
        >
          立即注册
        </el-button>

        <div class="mt-4 text-center">
          <span class="text-gray-500">已有账号？</span>
          <router-link to="/login" class="text-blue-500 hover:underline">
            立即登录
          </router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import service from '@/utils/request.js'
import router from '@/router/index.js'

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 验证规则
const registerRules = reactive({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '长度3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const errorMsg = ref('')
const loading = ref(false)
const registerFormRef = ref()

// 注册提交
const handleRegister = async () => {
  try {
    // 表单验证
    await registerFormRef.value.validate()
    errorMsg.value = ''
    loading.value = true

    // 组装表单数据
    const formData = new URLSearchParams()
    formData.append('username', registerForm.username)
    formData.append('password', registerForm.password)

    // 发送请求
    const { data } = await service.post('/register', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (data.code === 200) {
      ElMessage.success('注册成功')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      errorMsg.value = data.message || '注册失败'
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '网络连接异常'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  @apply flex justify-center items-center min-h-screen bg-gray-100;
}

.register-card {
  @apply w-[420px] p-8 rounded-xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.1);
}

.register-title {
  @apply text-2xl font-bold text-center mb-6;
  background: linear-gradient(45deg, #409eff, #79bbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.submit-btn {
  @apply h-12 text-base rounded-lg;
  background: linear-gradient(45deg, #409eff, #79bbff);
  transition: all 0.3s;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .register-container {
    background: #1a1a1a;
  }

  .register-card {
    background: rgba(40, 40, 40, 0.95);
    border: 1px solid #434343;
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: 0 0 0 1px #555 inset !important;
  }
}
</style>