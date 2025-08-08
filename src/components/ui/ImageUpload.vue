<template>
  <div class="image-upload">
    <!-- 上传区域 -->
    <div 
      class="upload-zone"
      :class="{ 
        'drag-over': isDragOver,
        'disabled': !userStore.isLoggedIn
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileSelect"
    >
      <input 
        ref="fileInput"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        @change="handleFileSelect"
        style="display: none"
      >
      
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p v-if="userStore.isLoggedIn" class="upload-text">
          点击或拖拽图片到此处上传
        </p>
        <p v-else class="upload-text disabled-text">
          请先登录后再上传图片
        </p>
        <p class="upload-hint">
          支持 JPEG、PNG、GIF、WebP 格式，单个文件不超过 5MB
        </p>
      </div>
    </div>

    <!-- 上传任务列表 -->
    <div v-if="uploadStore.uploadCount > 0" class="upload-tasks">
      <h4>上传任务</h4>
      
      <div 
        v-for="[uploadId, task] in uploadStore.uploads"
        :key="uploadId"
        class="upload-task"
      >
        <div class="task-info">
          <span class="file-name">{{ task.file.name }}</span>
          <span class="file-size">({{ formatFileSize(task.file.size) }})</span>
        </div>
        
        <div class="task-status">
          <div v-if="task.status === 'uploading'" class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: task.progress + '%' }"
            ></div>
          </div>
          
          <div class="status-badge" :class="'status-' + task.status">
            <template v-if="task.status === 'pending'">等待中</template>
            <template v-else-if="task.status === 'uploading'">
              上传中 {{ task.progress }}%
            </template>
            <template v-else-if="task.status === 'success'">✅ 完成</template>
            <template v-else-if="task.status === 'error'">❌ 失败</template>
          </div>
          
          <button 
            v-if="task.status === 'success' || task.status === 'error'"
            @click="uploadStore.removeUploadTask(uploadId)"
            class="remove-task"
          >
            ×
          </button>
        </div>
        
        <!-- 成功后显示图片和链接 -->
        <div v-if="task.status === 'success' && task.result" class="task-result">
          <div class="result-actions">
            <button @click="copyImageUrl(task.result)" class="btn-copy">
              复制链接
            </button>
            <button @click="previewImage(task.result)" class="btn-preview">
              预览
            </button>
            <button @click="deleteImage(task.result)" class="btn-delete">
              删除
            </button>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="task.status === 'error' && task.error" class="task-error">
          {{ task.error }}
        </div>
      </div>
      
      <div class="task-actions">
        <button @click="uploadStore.clearCompletedTasks" class="btn btn-outline">
          清除已完成
        </button>
      </div>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="uploadStore.error" class="error-message">
      {{ uploadStore.error }}
      <button @click="uploadStore.clearError" class="error-close">×</button>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewUrl" class="image-preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <img :src="previewUrl" alt="预览图片" class="preview-image">
        <button @click="closePreview" class="close-preview">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUploadStore } from '@/stores/upload'

const userStore = useUserStore()
const uploadStore = useUploadStore()

const fileInput = ref(null)
const isDragOver = ref(false)
const previewUrl = ref(null)

onMounted(() => {
  userStore.initAuth()
})

// 文件选择处理
function triggerFileSelect() {
  if (!userStore.isLoggedIn) return
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    uploadFiles(files)
  }
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

// 拖拽处理
function handleDrop(event) {
  event.preventDefault()
  isDragOver.value = false
  
  if (!userStore.isLoggedIn) return
  
  const files = Array.from(event.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  )
  
  if (files.length > 0) {
    uploadFiles(files)
  }
}

function handleDragOver(event) {
  event.preventDefault()
  if (userStore.isLoggedIn) {
    isDragOver.value = true
  }
}

function handleDragLeave(event) {
  event.preventDefault()
  isDragOver.value = false
}

// 上传文件
async function uploadFiles(files) {
  for (const file of files) {
    try {
      await uploadStore.uploadImage(file)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }
}

// 辅助函数
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function copyImageUrl(result) {
  try {
    if (result.fileID) {
      const downloadURL = await uploadStore.getImageDownloadURL(result.fileID)
      await navigator.clipboard.writeText(downloadURL)
      alert('图片链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('复制链接失败:', error)
    alert('复制链接失败: ' + error.message)
  }
}

async function previewImage(result) {
  try {
    if (result.fileID) {
      previewUrl.value = await uploadStore.getImageDownloadURL(result.fileID)
    }
  } catch (error) {
    console.error('预览失败:', error)
    alert('预览失败: ' + error.message)
  }
}

async function deleteImage(result) {
  if (confirm('确定要删除这张图片吗？')) {
    try {
      await uploadStore.deleteImage(result.fileID)
      alert('图片删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败: ' + error.message)
    }
  }
}

function closePreview() {
  previewUrl.value = null
}
</script>

<style scoped>
.image-upload {
  max-width: 600px;
  margin: 0 auto;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-zone:hover:not(.disabled) {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.upload-zone.drag-over {
  border-color: #ff6b6b;
  background: #fff0f0;
  transform: scale(1.02);
}

.upload-zone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.disabled-text {
  color: #9ca3af;
}

.upload-hint {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.upload-tasks {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
}

.upload-tasks h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
}

.upload-task {
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  margin-bottom: 1rem;
  background: #fafafa;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  color: #374151;
}

.file-size {
  color: #6b7280;
  font-size: 0.9rem;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff6b6b;
  transition: width 0.3s ease;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-uploading {
  background: #dbeafe;
  color: #2563eb;
}

.status-success {
  background: #d1fae5;
  color: #059669;
}

.status-error {
  background: #fee2e2;
  color: #dc2626;
}

.remove-task {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
}

.task-result {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-actions button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy {
  background: #3b82f6;
  color: white;
}

.btn-copy:hover {
  background: #2563eb;
}

.btn-preview {
  background: #10b981;
  color: white;
}

.btn-preview:hover {
  background: #059669;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.task-error {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.9rem;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
}

.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.close-preview {
  position: absolute;
  top: -10px;
  right: -10px;
  background: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .upload-zone {
    padding: 2rem 1rem;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions button {
    justify-self: stretch;
  }
}
</style>