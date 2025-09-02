<template>
  <div class="auth-callback">
    <div class="callback-container">
      <!-- 处理中状态 -->
      <div v-if="isProcessing" class="processing-state">
        <div class="loading-animation">
          <div class="cat-loading">🐱</div>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <h2>正在登录...</h2>
        <p>请稍等，我们正在为你完成登录</p>
      </div>

      <!-- 成功状态 -->
      <div v-else-if="isSuccess" class="success-state">
        <div class="success-icon">✅</div>
        <h2>登录成功！</h2>
        <p>欢迎来到猫咪日记世界</p>
        <div class="success-actions">
          <router-link to="/diary" class="btn btn-primary">
            开始写日记
          </router-link>
          <router-link to="/cats" class="btn btn-outline">
            管理猫咪
          </router-link>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h2>登录失败</h2>
        <p class="error-message">{{ error }}</p>
        <div class="error-actions">
          <router-link to="/diary" class="btn btn-primary">
            返回首页
          </router-link>
          <button @click="retryAuth" class="btn btn-outline">
            重试登录
          </button>
        </div>
      </div>

      <!-- 默认加载状态（防止闪烁） -->
      <div v-else class="loading-fallback">
        <LoadingIndicator />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useUserStore } from '@/stores/user'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式状态
const isProcessing = ref(true)
const isSuccess = ref(false)
const error = ref(null)

// 设置页面 meta
useHead({
  title: '登录中... - 猫咪世界',
  meta: [
    { name: 'description', content: '正在处理登录，请稍候' }
  ]
})

// 处理认证回调
async function handleAuthCallback() {
  try {
    isProcessing.value = true
    error.value = null
    
    // 检查URL中是否有错误参数
    if (route.query.error) {
      throw new Error(route.query.error_description || '认证失败')
    }
    
    // 处理Supabase认证回调
    console.log('开始处理认证回调...')
    const user = await userStore.handleAuthCallback()
    console.log('认证回调返回用户:', user)
    
    if (user) {
      // 登录成功
      console.log('认证成功，用户:', user.email)
      isSuccess.value = true
      isProcessing.value = false
      
      // 3秒后自动跳转到日记页面
      setTimeout(() => {
        const redirectTo = route.query.redirect || '/diary'
        router.replace(redirectTo)
      }, 3000)
      
    } else {
      console.log('认证回调未返回用户信息')
      throw new Error('无法获取用户信息')
    }
    
  } catch (err) {
    console.error('认证回调处理失败:', err)
    error.value = err.message || '登录过程中出现错误'
    isProcessing.value = false
    isSuccess.value = false
  }
}

// 重试认证
async function retryAuth() {
  error.value = null
  await handleAuthCallback()
}

// 页面加载时处理认证
onMounted(async () => {
  // 稍微延迟以避免页面闪烁
  await new Promise(resolve => setTimeout(resolve, 500))
  await handleAuthCallback()
})
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.callback-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 处理中状态 */
.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.cat-loading {
  font-size: 4rem;
  animation: bounce 1.5s ease-in-out infinite;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-20px);
  }
  70% {
    transform: translateY(-10px);
  }
  90% {
    transform: translateY(-4px);
  }
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.processing-state h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.processing-state p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* 成功状态 */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.success-icon {
  font-size: 4rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-state h2 {
  font-size: 1.5rem;
  color: #16a34a;
  margin: 0;
}

.success-state p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  font-size: 4rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-state h2 {
  font-size: 1.5rem;
  color: #dc2626;
  margin: 0;
}

.error-message {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  background: #fef2f2;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 120px;
  justify-content: center;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.loading-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .auth-callback {
    padding: 1rem;
  }
  
  .callback-container {
    padding: 2rem 1.5rem;
  }
  
  .success-actions,
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
  }
}
</style>