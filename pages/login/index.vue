<template>
  <view class="login-page">
    <view class="login-container">
      <view class="title">{{ isLogin ? '登录' : '注册' }}</view>

      <view class="form">
        <view class="form-item">
          <input v-model="formData.email" class="input" type="email" placeholder="请输入邮箱" :maxlength="20" />
        </view>

        <view class="form-item">
          <input v-model="formData.password" class="input" type="password" placeholder="请输入密码" :maxlength="20" />
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

        <!-- 分割线 -->
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>

        <!-- 微信登录 -->
        <button class="wechat-btn" :disabled="loading" open-type="getUserProfile" @getuserprofile="handleWechatLogin"
          @click="handleWechatLoginClick">
          <text class="wechat-icon">💬</text>
          <text class="wechat-text">微信快捷登录</text>
        </button>
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

// 微信登录处理标记（避免重复触发）
const isWechatLogging = ref(false)

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

/**
 * 微信登录（getUserProfile 回调）
 */
async function handleWechatLogin(e: any) {
  console.log('[TODO_DEBUG] 微信登录 getUserProfile 回调:', e)

  // 如果正在处理登录，则忽略
  if (isWechatLogging.value) {
    console.log('[TODO_DEBUG] 正在处理登录，忽略 getUserProfile 回调')
    return
  }

  // 检查用户是否授权
  if (e.detail && e.detail.errMsg && e.detail.errMsg.includes('deny')) {
    uni.showToast({
      title: '用户拒绝授权',
      icon: 'none',
    })
    return
  }

  // 执行登录流程
  await performWechatLogin(e.detail?.userInfo || {})
}

/**
 * 微信登录（点击事件，用于微信开发者工具测试）
 */
async function handleWechatLoginClick(e?: any) {
  console.log('[TODO_DEBUG] 微信登录按钮点击事件触发', e)

  // 如果正在处理登录，则忽略
  if (isWechatLogging.value || loading.value) {
    console.log('[TODO_DEBUG] 正在处理登录，忽略点击')
    return
  }

  // 阻止事件冒泡（如果 getUserProfile 也会触发，避免重复）
  if (e) {
    e.stopPropagation && e.stopPropagation()
  }

  // #ifdef MP-WEIXIN
  // 在微信小程序中，尝试获取用户信息
  // 如果 getUserProfile 没有触发，则使用点击事件手动获取
  try {
    const userProfile = await new Promise<any>((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: (res: any) => {
          console.log('[TODO_DEBUG] getUserProfile 成功:', res)
          resolve(res)
        },
        fail: (err: any) => {
          console.log('[TODO_DEBUG] getUserProfile 失败:', err)
          // 如果用户拒绝或失败，仍然可以使用 code 登录
          resolve(null)
        },
      })
    })

    // 如果获取到用户信息，继续登录流程
    if (userProfile && userProfile.userInfo) {
      await performWechatLogin(userProfile.userInfo)
      return
    }
  } catch (err: any) {
    console.log('[TODO_DEBUG] getUserProfile 异常，使用 code 登录:', err)
    // 如果获取用户信息失败，仍然可以使用 code 登录
  }
  // #endif

  // 直接使用 code 登录（不获取用户信息）
  console.log('[TODO_DEBUG] 使用 code 登录（不获取用户信息）')
  await performWechatLogin({})
}

/**
 * 执行微信登录流程
 */
async function performWechatLogin(userInfo: any) {
  if (isWechatLogging.value) {
    return
  }

  isWechatLogging.value = true
  loading.value = true
  errorMessage.value = ''

  try {
    // 获取微信登录 code
    const loginRes = await new Promise<{ code: string }>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res: any) => {
          console.log('[TODO_DEBUG] uni.login 成功:', res)
          if (res.code) {
            resolve({ code: res.code })
          } else {
            reject(new Error('获取微信登录 code 失败'))
          }
        },
        fail: (err: any) => {
          console.error('[TODO_DEBUG] uni.login 失败:', err)
          reject(new Error(err.errMsg || '微信登录失败'))
        },
      })
    })

    console.log('[TODO_DEBUG] 获取到 code，调用登录接口')

    // 调用微信登录接口
    await userStore.wechatLogin({
      code: loginRes.code,
      userInfo: userInfo,
    })

    // 成功后跳转到首页
    uni.switchTab({
      url: '/pages/home/index',
    })
  } catch (error: any) {
    console.error('[TODO_DEBUG] 微信登录错误:', error)
    errorMessage.value = error.message || '微信登录失败'
    uni.showToast({
      title: errorMessage.value,
      icon: 'none',
    })
  } finally {
    loading.value = false
    isWechatLogging.value = false
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

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: #e0e0e0;
}

.divider-text {
  margin: 0 24rpx;
  font-size: 24rpx;
  color: #999;
}

.wechat-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  background-color: #07c160;
  border-radius: 8rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.wechat-btn:disabled {
  background-color: #cccccc;
}

.wechat-icon {
  font-size: 36rpx;
}

.wechat-text {
  font-size: 32rpx;
}
</style>
