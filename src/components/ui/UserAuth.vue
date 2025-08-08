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
        <span class="user-name">{{ userStore.userDisplayName }}</span>
      </div>
      
      <button 
        @click="handleSignOut" 
        class="btn btn-outline"
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
    
    <!-- 未登录状态 -->
    <div v-else class="login-options">
      <button 
        @click="handleAnonymousLogin" 
        class="btn btn-primary"
        :disabled="userStore.isLoading"
      >
        <template v-if="userStore.isLoading">
          <span class="loading-spinner"></span>
          登录中...
        </template>
        <template v-else>
          匿名登录
        </template>
      </button>
      
      <button 
        @click="handleWechatLogin" 
        class="btn btn-success"
        :disabled="userStore.isLoading"
      >
        微信登录
      </button>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="userStore.error" class="error-message">
      {{ userStore.error }}
      <button @click="userStore.clearError" class="error-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.initAuth()
})

async function handleAnonymousLogin() {
  try {
    await userStore.signInAnonymously()
  } catch (error) {
    console.error('匿名登录失败:', error)
  }
}

async function handleWechatLogin() {
  try {
    await userStore.signInWithWechat()
  } catch (error) {
    console.error('微信登录失败:', error)
  }
}

async function handleSignOut() {
  try {
    await userStore.signOut()
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

.login-options {
  display: flex;
  gap: 0.5rem;
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
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff5252;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #45a049;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
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
    align-items: stretch;
  }
  
  .login-options {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>