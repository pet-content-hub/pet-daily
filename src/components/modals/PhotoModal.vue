<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="photo-info">
          <h3 class="photo-title">{{ photo.title || '猫咪照片' }}</h3>
          <p class="photo-date">{{ formatDate(photo.created_at) }}</p>
        </div>
        <button @click="$emit('close')" class="close-btn" title="关闭">×</button>
      </div>
      
      <div class="modal-body">
        <div class="photo-container">
          <img 
            :src="photo.image_url" 
            :alt="photo.caption || '猫咪照片'"
            class="modal-photo"
            @load="handleImageLoad"
            @error="handleImageError"
          >
          
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-if="hasError" class="error-state">
            <span class="error-icon">❌</span>
            <p>图片加载失败</p>
          </div>
        </div>
        
        <!-- 照片描述 -->
        <div v-if="photo.caption" class="photo-caption">
          {{ photo.caption }}
        </div>
        
        <!-- 照片标签 -->
        <div v-if="photo.tags && photo.tags.length > 0" class="photo-tags">
          <span 
            v-for="tag in photo.tags" 
            :key="tag"
            class="photo-tag"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 照片详情 -->
        <div class="photo-details">
          <div class="detail-item" v-if="photo.camera_info">
            <span class="detail-label">设备:</span>
            <span class="detail-value">{{ photo.camera_info }}</span>
          </div>
          
          <div class="detail-item" v-if="photo.file_size">
            <span class="detail-label">大小:</span>
            <span class="detail-value">{{ formatFileSize(photo.file_size) }}</span>
          </div>
          
          <div class="detail-item" v-if="photo.dimensions">
            <span class="detail-label">尺寸:</span>
            <span class="detail-value">{{ photo.dimensions }}</span>
          </div>
        </div>
      </div>
      
      <!-- 导航按钮 (如果有多张照片) -->
      <div v-if="photos.length > 1" class="navigation">
        <button 
          @click="$emit('navigate', 'prev')"
          :disabled="currentIndex <= 0"
          class="nav-btn prev-btn"
          title="上一张"
        >
          ←
        </button>
        
        <div class="photo-counter">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
        
        <button 
          @click="$emit('navigate', 'next')"
          :disabled="currentIndex >= photos.length - 1"
          class="nav-btn next-btn"
          title="下一张"
        >
          →
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-bar">
        <button 
          @click="downloadPhoto"
          class="action-btn"
          title="下载照片"
        >
          📥 下载
        </button>
        
        <button 
          v-if="canEdit"
          @click="$emit('edit', photo)"
          class="action-btn"
          title="编辑信息"
        >
          ✏️ 编辑
        </button>
        
        <button 
          @click="sharePhoto"
          class="action-btn"
          title="分享照片"
        >
          📤 分享
        </button>
        
        <button 
          v-if="canDelete"
          @click="$emit('delete', photo)"
          class="action-btn delete-btn"
          title="删除照片"
        >
          🗑️ 删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  photo: {
    type: Object,
    required: true
  },
  photos: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  canEdit: {
    type: Boolean,
    default: true
  },
  canDelete: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'navigate', 'edit', 'delete'])

const isLoading = ref(true)
const hasError = ref(false)

const notificationStore = useNotificationStore()

function handleImageLoad() {
  isLoading.value = false
  hasError.value = false
}

function handleImageError() {
  isLoading.value = false
  hasError.value = true
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function downloadPhoto() {
  try {
    const response = await fetch(props.photo.image_url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `cat_photo_${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    notificationStore.showError('下载失败，请重试')
  }
}

async function sharePhoto() {
  try {
    if (navigator.share) {
      await navigator.share({
        title: props.photo.title || '猫咪照片',
        text: props.photo.caption || '来看看这张可爱的猫咪照片！',
        url: props.photo.image_url
      })
    } else {
      // 降级处理：复制链接到剪贴板
      await navigator.clipboard.writeText(props.photo.image_url)
      notificationStore.showSuccess('照片链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享失败:', error)
    // 最后的降级处理
    try {
      await navigator.clipboard.writeText(props.photo.image_url)
      notificationStore.showSuccess('照片链接已复制到剪贴板')
    } catch (clipboardError) {
      notificationStore.showError('分享失败，请手动复制链接')
    }
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  } else if (event.key === 'ArrowLeft') {
    emit('navigate', 'prev')
  } else if (event.key === 'ArrowRight') {
    emit('navigate', 'next')
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
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: white;
}

.photo-info {
  flex: 1;
  min-width: 0;
}

.photo-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-date {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 1rem;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #2c3e50;
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #f8fafc;
}

.photo-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #000;
}

.modal-photo {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.error-icon {
  font-size: 3rem;
}

.photo-caption {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  line-height: 1.5;
}

.photo-tags {
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.photo-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.photo-details {
  padding: 1rem 1.5rem;
  background: white;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.detail-label {
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
}

.navigation {
  position: absolute;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  color: white;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-counter {
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.actions-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.delete-btn {
  color: #dc2626;
  border-color: #fca5a5;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-photo {
    max-height: 50vh;
  }
  
  .navigation {
    bottom: 4rem;
    padding: 0.5rem 1rem;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .photo-counter {
    font-size: 0.8rem;
    min-width: 50px;
  }
  
  .actions-bar {
    padding: 0.75rem 1rem;
  }
  
  .action-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .photo-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>