<template>
  <view class="login-page">
    <view class="login-container">
      <view class="title">{{ isLogin ? '登录' : '注册' }}</view>

      <view class="form">
        <view class="form-item">
          <input
            v-model="formData.email"
            class="input"
            type="email"
            placeholder="请输入邮箱"
            :maxlength="20"
          />
        </view>

        <view class="form-item">
          <input
            v-model="formData.password"
            class="input"
            type="password"
            placeholder="请输入密码"
            :maxlength="20"
          />
        </view>

        <view v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </view>

        <button class="submit-btn" :disabled="loading" @click="handleSubmit">
          {{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}
        </button>

        <view class="switch-mode" @click="toggleMode">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 表单数据
const formData = ref({
  email: '',
  password: '',
})

// 是否为登录模式
const isLogin = ref(true)

// 加载状态
const loading = ref(false)

// 错误信息
const errorMessage = ref('')

/**
 * 检查是否已登录，如果已登录则跳转到首页
 */
onMounted(() => {
  if (userStore.isAuthenticated) {
    uni.switchTab({
      url: '/pages/home/index',
    })
  }
})

/**
 * 切换登录/注册模式
 */
function toggleMode() {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  formData.value = {
    email: '',
    password: '',
  }
}

/**
 * 表单验证
 */
function validateForm(): boolean {
  errorMessage.value = ''

  if (!formData.value.email || !formData.value.email.trim()) {
    errorMessage.value = '请输入用户名'
    return false
  }

  if (!formData.value.password || !formData.value.password.trim()) {
    errorMessage.value = '请输入密码'
    return false
  }

  return true
}

/**
 * 提交表单
 */
async function handleSubmit() {
  // 表单验证
  if (!validateForm()) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    if (isLogin.value) {
      // 登录
      await userStore.login({
        email: formData.value.email.trim(),
        password: formData.value.password.trim(),
      })
    } else {
      // 注册
      await userStore.register({
        email: formData.value.email.trim(),
        password: formData.value.password.trim(),
      })
    }

    // 成功后跳转到首页
    uni.switchTab({
      url: '/pages/home/index',
    })
  } catch (error: any) {
    errorMessage.value =
      error.message || (isLogin.value ? '登录失败' : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-container {
  width: 100%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 60rpx;
  color: #333333;
}

.form {
  width: 100%;
}

.form-item {
  margin-bottom: 32rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #fafafa;
  box-sizing: border-box;
}

.input:focus {
  border-color: #3cc51f;
  background-color: #ffffff;
}

.error-message {
  margin-bottom: 24rpx;
  padding: 16rpx;
  font-size: 24rpx;
  color: #ff4d4f;
  background-color: #fff1f0;
  border-radius: 8rpx;
  text-align: center;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  background-color: #3cc51f;
  border-radius: 8rpx;
  border: none;
}

.submit-btn:disabled {
  background-color: #cccccc;
}

.switch-mode {
  margin-top: 32rpx;
  font-size: 26rpx;
  color: #3cc51f;
  text-align: center;
  cursor: pointer;
}
</style>
