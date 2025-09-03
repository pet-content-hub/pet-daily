<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>更换猫咪头像</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 当前头像预览 -->
        <div class="current-avatar-section" v-if="currentAvatar">
          <h4 class="section-title">当前头像</h4>
          <div class="avatar-preview">
            <img 
              :src="currentAvatar" 
              :alt="`${catName}的头像`"
              class="current-avatar-image"
            >
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="upload-section">
          <h4 class="section-title">选择新头像</h4>
          
          <div 
            class="upload-zone"
            :class="{ 
              'drag-over': isDragOver,
              'has-file': selectedFile
            }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @click="triggerFileSelect"
          >
            <input 
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              @change="handleFileSelect"
              style="display: none"
            >
            
            <div v-if="!selectedFile" class="upload-content">
              <div class="upload-icon">📷</div>
              <p class="upload-text">点击或拖拽图片到此处</p>
              <p class="upload-hint">
                支持 JPEG、PNG、GIF、WebP 格式<br>
                推荐尺寸：400x400px，文件不超过 2MB
              </p>
            </div>
            
            <!-- 文件预览 -->
            <div v-else class="file-preview">
              <img 
                :src="previewUrl" 
                alt="新头像预览"
                class="preview-image"
              >
              <div class="file-info">
                <p class="file-name">{{ selectedFile.name }}</p>
                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
              <button 
                @click.stop="clearSelection"
                class="clear-file-btn"
                title="清除选择"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 上传选项 -->
        <div v-if="selectedFile" class="upload-options">
          <label class="option-label">
            <input 
              v-model="cropImage"
              type="checkbox"
              class="option-checkbox"
            >
            <span class="option-text">自动裁剪为正方形</span>
          </label>
        </div>

        <!-- 上传进度 -->
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-info">
            <span class="progress-text">正在上传...</span>
            <span class="progress-percent">{{ uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
          <button @click="clearError" class="error-close">×</button>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          type="button" 
          @click="$emit('close')"
          :disabled="isUploading"
          class="btn btn-secondary"
        >
          取消
        </button>
        <button 
          @click="handleUpload"
          :disabled="!selectedFile || isUploading"
          class="btn btn-primary"
        >
          <span v-if="isUploading" class="loading-spinner"></span>
          {{ isUploading ? `上传中 ${uploadProgress}%` : '上传头像' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  catId: {
    type: String,
    required: true
  },
  catName: {
    type: String,
    default: '猫咪'
  },
  currentAvatar: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'uploaded'])

// 响应式状态
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const cropImage = ref(true)

// 方法
function handleOverlayClick() {
  if (!isUploading.value) {
    emit('close')
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
  // 清空input值，允许重复选择同一文件
  event.target.value = ''
}

function handleDrop(event) {
  event.preventDefault()
  isDragOver.value = false
  
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    validateAndSetFile(file)
  }
}

function handleDragOver(event) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(event) {
  event.preventDefault()
  isDragOver.value = false
}

function validateAndSetFile(file) {
  clearError()
  
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    showError('不支持的文件格式，请选择 JPEG、PNG、GIF 或 WebP 格式的图片')
    return
  }
  
  // 检查文件大小 (2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    showError('文件太大，请选择小于 2MB 的图片')
    return
  }
  
  selectedFile.value = file
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function clearSelection() {
  selectedFile.value = null
  previewUrl.value = null
  clearError()
}

async function handleUpload() {
  if (!selectedFile.value || isUploading.value) return
  
  try {
    isUploading.value = true
    uploadProgress.value = 0
    clearError()
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)
    
    // 这里应该调用实际的上传服务
    // 现在模拟上传过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 模拟上传结果
    const uploadResult = {
      url: previewUrl.value, // 在实际应用中，这应该是服务器返回的URL
      fileId: `avatar_${Date.now()}`,
      fileName: selectedFile.value.name
    }
    
    // 触发上传完成事件
    emit('uploaded', uploadResult)
    
  } catch (error) {
    console.error('上传失败:', error)
    showError(error.message || '上传失败，请重试')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

function showError(message) {
  errorMessage.value = message
}

function clearError() {
  errorMessage.value = ''
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 键盘事件处理
function handleKeydown(event) {
  if (event.key === 'Escape' && !isUploading.value) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  // 防止页面滚动
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // 恢复页面滚动
  document.body.style.overflow = 'auto'
  
  // 清理预览URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8fafc;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.current-avatar-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.section-title {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.avatar-preview {
  display: inline-block;
}

.current-avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f5f9;
}

.upload-section {
  margin-bottom: 1.5rem;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  position: relative;
}

.upload-zone:hover {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.upload-zone.drag-over {
  border-color: #ff6b6b;
  background: #fff0f0;
  transform: scale(1.02);
}

.upload-zone.has-file {
  border-color: #10b981;
  background: #f0fdf4;
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

.upload-hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.preview-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  word-break: break-all;
}

.file-size {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.clear-file-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-file-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.upload-options {
  margin-bottom: 1.5rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
}

.option-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #ff6b6b;
}

.upload-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  color: #2c3e50;
  font-weight: 500;
}

.progress-percent {
  color: #64748b;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ff8a80);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-text {
  color: #dc2626;
  font-size: 0.9rem;
  flex: 1;
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
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

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
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #f5f5f5;
}

.loading-spinner {
  width: 16px;
  height: 16px;
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
  .modal-container {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }
  
  .upload-zone {
    padding: 1.5rem;
  }
  
  .file-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>