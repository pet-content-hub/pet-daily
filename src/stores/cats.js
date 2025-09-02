import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import supabaseService from '@/utils/supabase'

export const useCatsStore = defineStore('cats', () => {
  // 状态
  const cats = ref([])
  const selectedCat = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 计算属性
  const activeCats = computed(() => {
    return cats.value.filter(cat => cat.is_active)
  })

  const inactiveCats = computed(() => {
    return cats.value.filter(cat => !cat.is_active)
  })

  const catCount = computed(() => activeCats.value.length)

  const getCatById = computed(() => {
    return (catId) => cats.value.find(cat => cat.id === catId)
  })

  // 方法
  async function fetchUserCats(userId) {
    try {
      isLoading.value = true
      error.value = null
      
      const userCats = await supabaseService.getUserCats(userId)
      cats.value = userCats
      
      return userCats
    } catch (err) {
      console.error('获取猫咪列表失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createCat(catData) {
    try {
      isLoading.value = true
      error.value = null
      
      const newCat = await supabaseService.createCat(catData)
      cats.value.unshift(newCat)
      
      return newCat
    } catch (err) {
      console.error('创建猫咪档案失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCat(catId, updates) {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedCat = await supabaseService.updateCat(catId, updates)
      
      // 更新本地状态
      const index = cats.value.findIndex(cat => cat.id === catId)
      if (index !== -1) {
        cats.value[index] = { ...cats.value[index], ...updatedCat }
      }
      
      return updatedCat
    } catch (err) {
      console.error('更新猫咪信息失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getCatDetail(catId) {
    try {
      isLoading.value = true
      error.value = null
      
      const cat = await supabaseService.getCat(catId)
      selectedCat.value = cat
      
      return cat
    } catch (err) {
      console.error('获取猫咪详情失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function uploadCatAvatar(catId, file) {
    try {
      const user = await supabaseService.getCurrentUser()
      if (!user) throw new Error('用户未登录')

      // 生成文件路径
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || 'jpg'
      const fileName = `avatar_${timestamp}.${extension}`
      const path = `${user.id}/${catId}/${fileName}`

      // 上传到cat-photos存储桶
      const uploadResult = await supabaseService.uploadImage(file, 'cat-photos', path)
      
      // 更新猫咪头像URL
      const updatedCat = await updateCat(catId, { 
        avatar_url: uploadResult.publicUrl 
      })
      
      return updatedCat
    } catch (err) {
      console.error('上传猫咪头像失败:', err)
      error.value = err.message
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  function clearSelectedCat() {
    selectedCat.value = null
  }

  return {
    // 状态
    cats,
    selectedCat,
    isLoading,
    error,
    
    // 计算属性
    activeCats,
    inactiveCats,
    catCount,
    getCatById,
    
    // 方法
    fetchUserCats,
    createCat,
    updateCat,
    getCatDetail,
    uploadCatAvatar,
    clearError,
    clearSelectedCat
  }
})