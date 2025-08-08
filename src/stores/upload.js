import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import cloudbaseService from '@/utils/cloudbase'

export const useUploadStore = defineStore('upload', () => {
  // 状态
  const uploads = ref(new Map()) // 使用Map来跟踪多个上传任务
  const isUploading = ref(false)
  const error = ref(null)

  // 计算属性
  const uploadCount = computed(() => uploads.value.size)
  const hasActiveUploads = computed(() => {
    return Array.from(uploads.value.values()).some(upload => upload.status === 'uploading')
  })

  // 方法
  function generateUploadId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  function createUploadTask(file, path) {
    const uploadId = generateUploadId()
    const task = {
      id: uploadId,
      file,
      path,
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date()
    }
    
    uploads.value.set(uploadId, task)
    return uploadId
  }

  async function uploadImage(file, customPath = null) {
    if (!file) {
      throw new Error('文件不能为空')
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('只支持 JPEG, PNG, GIF, WebP 格式的图片')
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('文件大小不能超过 5MB')
    }

    // 生成存储路径
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`
    const storagePath = customPath || `images/${fileName}`

    // 创建上传任务
    const uploadId = createUploadTask(file, storagePath)
    const task = uploads.value.get(uploadId)

    try {
      // 更新状态
      task.status = 'uploading'
      task.progress = 0
      isUploading.value = true
      error.value = null

      // 执行上传
      const result = await cloudbaseService.uploadImage(file, storagePath)
      
      // 更新任务状态
      task.status = 'success'
      task.progress = 100
      task.result = result
      
      console.log('图片上传成功:', result)
      return {
        uploadId,
        result,
        task
      }

    } catch (err) {
      // 更新错误状态
      task.status = 'error'
      task.error = err.message
      error.value = err.message
      
      console.error('图片上传失败:', err)
      throw err

    } finally {
      // 检查是否还有其他上传任务
      isUploading.value = hasActiveUploads.value
    }
  }

  async function getImageDownloadURL(fileId) {
    try {
      const downloadURL = await cloudbaseService.getDownloadURL(fileId)
      return downloadURL
    } catch (err) {
      console.error('获取图片下载链接失败:', err)
      error.value = err.message
      throw err
    }
  }

  async function deleteImage(fileId) {
    try {
      const result = await cloudbaseService.deleteFile(fileId)
      console.log('图片删除成功:', result)
      return result
    } catch (err) {
      console.error('删除图片失败:', err)
      error.value = err.message
      throw err
    }
  }

  function getUploadTask(uploadId) {
    return uploads.value.get(uploadId)
  }

  function removeUploadTask(uploadId) {
    return uploads.value.delete(uploadId)
  }

  function clearCompletedTasks() {
    const completed = ['success', 'error']
    for (const [id, task] of uploads.value) {
      if (completed.includes(task.status)) {
        uploads.value.delete(id)
      }
    }
  }

  function clearError() {
    error.value = null
  }

  // 批量上传
  async function uploadMultipleImages(files, customPathPrefix = null) {
    const uploadPromises = []
    
    for (const file of files) {
      const customPath = customPathPrefix 
        ? `${customPathPrefix}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`
        : null
      
      uploadPromises.push(uploadImage(file, customPath))
    }

    try {
      const results = await Promise.allSettled(uploadPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value)
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason)
      
      return {
        successful,
        failed,
        total: files.length
      }
    } catch (err) {
      console.error('批量上传失败:', err)
      throw err
    }
  }

  return {
    // 状态
    uploads,
    isUploading,
    error,
    
    // 计算属性
    uploadCount,
    hasActiveUploads,
    
    // 方法
    uploadImage,
    uploadMultipleImages,
    getImageDownloadURL,
    deleteImage,
    getUploadTask,
    removeUploadTask,
    clearCompletedTasks,
    clearError
  }
})