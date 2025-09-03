import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import supabaseService from '@/utils/supabase'

export const useDiaryStore = defineStore('diary', () => {
  // 状态
  const diaries = ref([])
  const publicDiaries = ref([])
  const selectedDiary = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // 分页状态
  const currentPage = ref(1)
  const hasMorePublic = ref(true)
  const hasMoreUser = ref(true)

  // 计算属性
  const diaryCount = computed(() => diaries.value.length)
  
  const publicDiaryCount = computed(() => publicDiaries.value.length)

  const getDiaryById = computed(() => {
    return (diaryId) => {
      return [...diaries.value, ...publicDiaries.value]
        .find(diary => diary.id === diaryId)
    }
  })

  // 按心情过滤日记
  const getDiariesByMood = computed(() => {
    return (mood) => diaries.value.filter(diary => diary.mood === mood)
  })

  // 按猫咪过滤日记
  const getDiariesByCat = computed(() => {
    return (catId) => diaries.value.filter(diary => diary.cat_id === catId)
  })

  // 方法
  async function fetchPublicDiaries(options = {}) {
    try {
      console.log('DiaryStore: fetchPublicDiaries 开始，选项:', options)
      isLoading.value = true
      error.value = null
      
      const { page = 1, limit = 20, reset = false } = options
      
      const diariesData = await supabaseService.getPublicDiaries({
        page,
        limit,
        ...options
      })
      
      console.log('DiaryStore: 从 supabase 获取到数据:', diariesData)
      
      if (reset || page === 1) {
        publicDiaries.value = diariesData
        currentPage.value = 1
      } else {
        publicDiaries.value = [...publicDiaries.value, ...diariesData]
      }
      
      console.log('DiaryStore: 设置后的 publicDiaries:', publicDiaries.value)
      
      currentPage.value = page
      hasMorePublic.value = diariesData.length === limit
      
      return diariesData
    } catch (err) {
      console.error('获取公开日记失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserDiaries(userId, options = {}) {
    try {
      isLoading.value = true
      error.value = null
      
      const { page = 1, limit = 20, reset = false } = options
      
      const diariesData = await supabaseService.getUserDiaries(userId, {
        page,
        limit,
        ...options
      })
      
      if (reset || page === 1) {
        diaries.value = diariesData
      } else {
        diaries.value = [...diaries.value, ...diariesData]
      }
      
      hasMoreUser.value = diariesData.length === limit
      
      return diariesData
    } catch (err) {
      console.error('获取用户日记失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createDiary(diaryData) {
    try {
      isLoading.value = true
      error.value = null
      
      const newDiary = await supabaseService.createDiary(diaryData)
      
      // 添加到本地状态（如果是当前用户的日记）
      diaries.value.unshift(newDiary)
      
      // 如果是公开日记，也添加到公开列表
      if (!newDiary.is_private) {
        publicDiaries.value.unshift(newDiary)
      }
      
      return newDiary
    } catch (err) {
      console.error('创建日记失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getDiaryDetail(diaryId) {
    try {
      isLoading.value = true
      error.value = null
      
      const diary = await supabaseService.getDiary(diaryId)
      selectedDiary.value = diary
      
      return diary
    } catch (err) {
      console.error('获取日记详情失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateDiary(diaryId, updates) {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedDiary = await supabaseService.updateDiary(diaryId, updates)
      
      // 更新本地状态
      const updateLocalDiary = (diaryList) => {
        const index = diaryList.findIndex(diary => diary.id === diaryId)
        if (index !== -1) {
          diaryList[index] = { ...diaryList[index], ...updatedDiary }
        }
      }
      
      updateLocalDiary(diaries.value)
      updateLocalDiary(publicDiaries.value)
      
      if (selectedDiary.value?.id === diaryId) {
        selectedDiary.value = { ...selectedDiary.value, ...updatedDiary }
      }
      
      return updatedDiary
    } catch (err) {
      console.error('更新日记失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteDiary(diaryId) {
    try {
      isLoading.value = true
      error.value = null
      
      await supabaseService.deleteDiary(diaryId)
      
      // 从本地状态中移除
      diaries.value = diaries.value.filter(diary => diary.id !== diaryId)
      publicDiaries.value = publicDiaries.value.filter(diary => diary.id !== diaryId)
      
      if (selectedDiary.value?.id === diaryId) {
        selectedDiary.value = null
      }
      
    } catch (err) {
      console.error('删除日记失败:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function uploadDiaryImages(files, diaryId) {
    try {
      const imageRecords = await supabaseService.uploadDiaryImages(files, diaryId)
      
      // 更新对应日记的图片列表
      const updateDiaryImages = (diaryList) => {
        const diary = diaryList.find(d => d.id === diaryId)
        if (diary) {
          if (!diary.diary_images) diary.diary_images = []
          diary.diary_images = [...diary.diary_images, ...imageRecords]
        }
      }
      
      updateDiaryImages(diaries.value)
      updateDiaryImages(publicDiaries.value)
      
      if (selectedDiary.value?.id === diaryId) {
        if (!selectedDiary.value.diary_images) selectedDiary.value.diary_images = []
        selectedDiary.value.diary_images = [
          ...selectedDiary.value.diary_images, 
          ...imageRecords
        ]
      }
      
      return imageRecords
    } catch (err) {
      console.error('上传日记图片失败:', err)
      error.value = err.message
      throw err
    }
  }

  // 加载更多公开日记
  async function loadMorePublicDiaries(options = {}) {
    if (!hasMorePublic.value || isLoading.value) return
    
    return await fetchPublicDiaries({
      ...options,
      page: currentPage.value + 1,
      reset: false
    })
  }

  function clearError() {
    error.value = null
  }

  function clearSelectedDiary() {
    selectedDiary.value = null
  }

  function clearDiaries() {
    diaries.value = []
    publicDiaries.value = []
    currentPage.value = 1
    hasMorePublic.value = true
    hasMoreUser.value = true
  }

  return {
    // 状态
    diaries,
    publicDiaries,
    selectedDiary,
    isLoading,
    error,
    currentPage,
    hasMorePublic,
    hasMoreUser,
    
    // 计算属性
    diaryCount,
    publicDiaryCount,
    getDiaryById,
    getDiariesByMood,
    getDiariesByCat,
    
    // 方法
    fetchPublicDiaries,
    fetchUserDiaries,
    createDiary,
    getDiaryDetail,
    updateDiary,
    deleteDiary,
    uploadDiaryImages,
    loadMorePublicDiaries,
    clearError,
    clearSelectedDiary,
    clearDiaries
  }
})