import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import supabaseService from '@/utils/supabase'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const userProfile = ref(null)
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const userDisplayName = computed(() => {
    if (!user.value && !userProfile.value) return '未登录'
    return userProfile.value?.full_name || 
           userProfile.value?.username || 
           user.value?.email?.split('@')[0] || 
           '用户'
  })

  const userAvatar = computed(() => {
    return userProfile.value?.avatar_url || null
  })

  const userEmail = computed(() => {
    return user.value?.email || userProfile.value?.email || null
  })

  // 方法
  async function initAuth() {
    try {
      isLoading.value = true
      
      // 检查登录状态
      const currentUser = await supabaseService.getCurrentUser()
      if (currentUser) {
        user.value = currentUser
        isLoggedIn.value = true
        
        // 获取用户资料
        await fetchUserProfile(currentUser.id)
      }

      // 监听登录状态变化
      supabaseService.onAuthStateChanged(async ({ event, session, user: authUser }) => {
        if (event === 'SIGNED_IN' && authUser) {
          user.value = authUser
          isLoggedIn.value = true
          await fetchUserProfile(authUser.id)
          console.log('用户已登录:', authUser)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          userProfile.value = null
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

  async function signInWithMagicLink(email) {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await supabaseService.signInWithMagicLink(email)
      
      return result
    } catch (err) {
      console.error('Magic Link 发送失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function handleAuthCallback() {
    try {
      isLoading.value = true
      error.value = null
      
      const authUser = await supabaseService.handleAuthCallback()
      
      if (authUser) {
        user.value = authUser
        isLoggedIn.value = true
        await fetchUserProfile(authUser.id)
        return authUser
      }
      
      return null
    } catch (err) {
      console.error('认证回调处理失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserProfile(userId) {
    try {
      const profile = await supabaseService.getUserProfile(userId)
      userProfile.value = profile
      return profile
    } catch (err) {
      console.error('获取用户资料失败:', err)
      // 不抛出错误，因为可能是新用户还没有资料
      return null
    }
  }

  async function updateUserProfile(updates) {
    try {
      if (!user.value) throw new Error('用户未登录')
      
      isLoading.value = true
      error.value = null
      
      const updatedProfile = await supabaseService.updateUserProfile(user.value.id, updates)
      userProfile.value = { ...userProfile.value, ...updatedProfile }
      
      return updatedProfile
    } catch (err) {
      console.error('更新用户资料失败:', err)
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
      
      await supabaseService.signOut()
      user.value = null
      userProfile.value = null
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
    userProfile,
    isLoggedIn,
    isLoading,
    error,
    
    // 计算属性
    userDisplayName,
    userAvatar,
    userEmail,
    
    // 方法
    initAuth,
    signInWithMagicLink,
    handleAuthCallback,
    fetchUserProfile,
    updateUserProfile,
    signOut,
    clearError
  }
})