import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import cloudbaseService from '@/utils/cloudbase'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const userDisplayName = computed(() => {
    if (!user.value) return '未登录'
    return user.value.nickName || user.value.uid || '用户'
  })

  const userAvatar = computed(() => {
    if (!user.value) return null
    return user.value.avatarUrl || null
  })

  // 方法
  async function initAuth() {
    try {
      isLoading.value = true
      
      // 检查登录状态
      if (cloudbaseService.isLoggedIn()) {
        const currentUser = cloudbaseService.getCurrentUser()
        if (currentUser) {
          user.value = currentUser
          isLoggedIn.value = true
        }
      }

      // 监听登录状态变化
      cloudbaseService.onAuthStateChanged((loginState) => {
        if (loginState) {
          user.value = loginState.user
          isLoggedIn.value = true
          console.log('用户已登录:', loginState.user)
        } else {
          user.value = null
          isLoggedIn.value = false
          console.log('用户已退出')
        }
      })

    } catch (err) {
      console.error('初始化用户认证失败:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function signInAnonymously() {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await cloudbaseService.signInAnonymously()
      user.value = result.user
      isLoggedIn.value = true
      
      return result
    } catch (err) {
      console.error('匿名登录失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function signInWithWechat() {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await cloudbaseService.signInWithWechat()
      user.value = result.user
      isLoggedIn.value = true
      
      return result
    } catch (err) {
      console.error('微信登录失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    try {
      isLoading.value = true
      error.value = null
      
      await cloudbaseService.signOut()
      user.value = null
      isLoggedIn.value = false
      
    } catch (err) {
      console.error('退出登录失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // 状态
    user,
    isLoggedIn,
    isLoading,
    error,
    
    // 计算属性
    userDisplayName,
    userAvatar,
    
    // 方法
    initAuth,
    signInAnonymously,
    signInWithWechat,
    signOut,
    clearError
  }
})