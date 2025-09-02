<template>
  <div class="user-auth">
    <!-- 已登录状态 -->
    <div v-if="userStore.isLoggedIn" class="user-profile">
      <div class="user-info">
        <img 
          v-if="userStore.userAvatar" 
          :src="userStore.userAvatar" 
          :alt="userStore.userDisplayName"
          class="user-avatar"
        >
        <div v-else class="user-avatar-placeholder">
          {{ userStore.userDisplayName.charAt(0) }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ userStore.userDisplayName }}</span>
          <span class="user-email">{{ userStore.userEmail }}</span>
        </div>
      </div>
      
      <div class="user-actions">
        <router-link to="/cats" class="btn btn-outline btn-sm">
          <span class="icon">🐱</span>
          我的猫咪
        </router-link>
        <button 
          @click="handleSignOut" 
          class="btn btn-outline btn-sm"
          :disabled="userStore.isLoading"
        >
          <template v-if="userStore.isLoading">
            <span class="loading-spinner"></span>
            退出中...
          </template>
          <template v-else>
            退出登录
          </template>
        </button>
      </div>
    </div>
    
    <!-- 未登录状态 -->
    <div v-else class="login-form">
      <!-- Magic Link 登录表单 -->
      <div v-if="!emailSent" class="magic-link-form">
        <h3 class="form-title">邮箱登录</h3>
        <p class="form-subtitle">我们将向你的邮箱发送标题是Your Magic Link的登录链接</p>
        
        <form @submit.prevent="handleMagicLinkLogin" class="email-form">
          <div class="form-group">
            <input 
              v-model="email" 
              type="email" 
              placeholder="输入你的邮箱地址"
              required
              class="email-input"
              :disabled="userStore.isLoading"
            >
          </div>
          
          <button 
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="userStore.isLoading || !isValidEmail"
          >
            <template v-if="userStore.isLoading">
              <span class="loading-spinner"></span>
              发送中...
            </template>
            <template v-else>
              <span class="icon">📧</span>
              发送登录链接
            </template>
          </button>
        </form>
        
        <div class="login-hint">
          <p>没有账号？首次登录将自动创建账号</p>
        </div>
      </div>
      
      <!-- 邮件发送成功状态 -->
      <div v-else class="email-sent-state">
        <div class="success-icon">📧</div>
        <h3>查收邮件</h3>
        <p class="success-message">
          登录链接已发送到 <strong>{{ email }}</strong>
        </p>
        <p class="instruction">
          请点击邮件中的链接完成登录。如果没有收到邮件，请检查垃圾邮件箱。
        </p>
        
        <div class="email-actions">
          <button 
            @click="resendEmail" 
            class="btn btn-outline"
            :disabled="resendCooldown > 0"
          >
            {{ resendCooldown > 0 ? `重新发送 (${resendCooldown}s)` : '重新发送' }}
          </button>
          <button 
            @click="changeEmail" 
            class="btn btn-ghost"
          >
            更换邮箱
          </button>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="userStore.error" class="error-message">
      {{ userStore.error }}
      <button @click="userStore.clearError" class="error-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 响应式状态
const email = ref('')
const emailSent = ref(false)
const resendCooldown = ref(0)
let cooldownTimer = null

// 计算属性
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

// 页面初始化
onMounted(() => {
  userStore.initAuth()
})

// 清理定时器
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})

// Magic Link 登录
async function handleMagicLinkLogin() {
  if (!isValidEmail.value || userStore.isLoading) return
  
  try {
    await userStore.signInWithMagicLink(email.value)
    emailSent.value = true
    startResendCooldown()
  } catch (error) {
    console.error('发送登录链接失败:', error)
  }
}

// 重新发送邮件
async function resendEmail() {
  if (resendCooldown.value > 0) return
  
  try {
    await userStore.signInWithMagicLink(email.value)
    startResendCooldown()
  } catch (error) {
    console.error('重新发送失败:', error)
  }
}

// 更换邮箱
function changeEmail() {
  emailSent.value = false
  email.value = ''
  userStore.clearError()
  
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    resendCooldown.value = 0
  }
}

// 开始重发倒计时
function startResendCooldown() {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

// 退出登录
async function handleSignOut() {
  try {
    await userStore.signOut()
    // 重置本地状态
    emailSent.value = false
    email.value = ''
    if (cooldownTimer) {
      clearInterval(cooldownTimer)
      resendCooldown.value = 0
    }
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.user-auth {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.user-email {
  font-size: 0.8rem;
  color: #64748b;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.magic-link-form {
  text-align: center;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.email-form {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.email-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.email-input:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.email-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.login-hint {
  font-size: 0.85rem;
  color: #64748b;
  text-align: center;
}

.login-hint p {
  margin: 0;
}

.email-sent-state {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.email-sent-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 1rem;
}

.success-message {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.instruction {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.email-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff5252;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-ghost {
  background: none;
  color: #64748b;
  border: none;
  padding: 0.5rem;
}

.btn-ghost:hover:not(:disabled) {
  color: #2c3e50;
  text-decoration: underline;
}

.icon {
  font-size: 1em;
}

.error-message {
  padding: 0.75rem;
  background: #ffe6e6;
  color: #d63031;
  border: 1px solid #fab1a0;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  color: #d63031;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .user-profile {
    flex-direction: column;
    gap: 1rem;
  }
  
  .user-actions {
    justify-content: center;
  }
  
  .email-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
    min-height: 44px;
  }
}
</style>