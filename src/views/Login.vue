<template>
  <div class="login-container">
    <Particles
        id="tsparticles"
        :options="particleOptions"
        class="particles-layer"
    />

    <el-card class="login-card">
      <div class="login-header">
        <div class="brand-wrapper">
          <img src="@/assets/logo.svg" class="brand-logo" alt="logo">
          <h2 class="brand-title">Go-NetDisk</h2>
        </div>
        <div class="divider-line"></div>
      </div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"
          label-width="80px"
      >
        <el-form-item label="账号" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item class="button-group">
          <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-btn"
          >
            立即登录
          </el-button>
          <el-button
              class="register-btn"
              @click="handleRegister"
          >
            注册账号
          </el-button>
        </el-form-item>

        <el-alert
            v-if="errorMsg"
            :title="errorMsg"
            type="error"
            :closable="false"
            show-icon
        />
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import router from "@/router/index.js"
import storage  from "@/utils/storage.js"
import service from "@/utils/request.js";
// 粒子效果配置
const particleOptions = {
  particles: {
    number: { value: 60 },
    color: { value: '#409eff' },
    opacity: { value: 0.5 },
    size: { value: 3 },
    move: {
      enable: true,
      speed: 1
    }
  }
}

// 登录表单逻辑（保持不变）
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 20, message: '长度3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度6-20个字符', trigger: 'blur' }
  ]
})

const errorMsg = ref('')
const loading = ref(false)
const loginFormRef = ref()

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    errorMsg.value = ''
    loading.value = true

    const formData = new URLSearchParams()
    formData.append('username', loginForm.username)
    formData.append('password', loginForm.password)

    const { data } = await service.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (data.code === 200) {
      const token = data.data['X-Token']
      storage.setToken(token)
      storage.setCurPath("/")
      router.push('/home')
    } else {
      errorMsg.value = data.message || '登录失败'
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || '网络连接异常'
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(-45deg, #e8f4ff, #f0f9ff, #f0f2f5, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

.particles-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-card {
  width: 420px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(64, 158, 255, 0.1);
  animation: cardEnter 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1;
}

.login-header {
  margin-bottom: 32px;
  text-align: center;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 2px 4px rgba(64,158,255,.2));
}

.brand-title {
  font-size: 28px;
  background: linear-gradient(45deg, #409eff, #79bbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.divider-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
  margin: 0 auto;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.submit-btn {
  width: 60%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 1px;
  border-radius: 8px;
  background: linear-gradient(45deg, #409eff, #79bbff);
  transition: all 0.3s;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.register-btn {
  width: 35%;
  height: 44px;
  border: 1px solid #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.register-btn:hover {
  background: rgba(64, 158, 255, 0.1);
}

:deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
  padding-bottom: 8px !important;
}

/* 修改输入框样式 */
:deep(.el-input__wrapper) {
  background-color: transparent !important;
  border-radius: 8px;
  padding: 8px 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #409eff inset,
  0 4px 12px rgba(64,158,255,0.2) !important;
}

:deep(.el-alert) {
  margin-top: 20px;
  border-radius: 8px;
  border: 1px solid #fde2e2;
  animation: fadeIn 0.4s ease;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 24px;
  }

  .brand-title {
    font-size: 22px;
  }

  .submit-btn {
    width: 100%;
    margin-bottom: 12px;
  }

  .button-group {
    flex-direction: column;
  }
}

@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(-45deg, #1a1a1a, #2d2d2d, #333, #2a2a2a);
  }

  .login-card {
    background: rgba(40, 40, 40, 0.95);
    border: 1px solid #434343;
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: 0 0 0 1px #555 inset !important;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #409eff inset,
    0 4px 12px rgba(64,158,255,0.2) !important;
  }

  .brand-title {
    background: linear-gradient(45deg, #79bbff, #409eff);
  }
}
</style>