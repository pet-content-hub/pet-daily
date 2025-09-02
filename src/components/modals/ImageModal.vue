<template>
  <div class="modal-overlay" @click="$emit('close')" @keydown.esc="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <button @click="$emit('close')" class="close-btn" title="关闭">×</button>
      </div>
      
      <div class="modal-body">
        <div class="image-container">
          <img 
            :src="image.image_url" 
            :alt="image.caption || '图片'"
            class="modal-image"
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
        
        <!-- 图片说明 -->
        <div v-if="image.caption" class="image-caption">
          {{ image.caption }}
        </div>
        
        <!-- 图片信息 -->
        <div class="image-info">
          <span class="image-date">{{ formatDate(image.created_at) }}</span>
        </div>
      </div>
      
      <!-- 导航按钮 (如果有多张图片) -->
      <div v-if="images.length > 1" class="navigation">
        <button 
          @click="$emit('navigate', 'prev')"
          :disabled="currentIndex <= 0"
          class="nav-btn prev-btn"
          title="上一张"
        >
          ←
        </button>
        
        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
        
        <button 
          @click="$emit('navigate', 'next')"
          :disabled="currentIndex >= images.length - 1"
          class="nav-btn next-btn"
          title="下一张"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  image: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'navigate'])

const isLoading = ref(true)
const hasError = ref(false)

function handleImageLoad() {
  isLoading.value = false
  hasError.value = false
}

function handleImageError() {
  isLoading.value = false
  hasError.value = true
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}

.modal-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #f8fafc;
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

.error-icon {
  font-size: 3rem;
}

.image-caption {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  color: #4a5568;
  line-height: 1.5;
  text-align: center;
}

.image-info {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.image-date {
  font-size: 0.85rem;
  color: #64748b;
}

.navigation {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.7);
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

.image-counter {
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-image {
    max-height: 60vh;
  }
  
  .navigation {
    bottom: 1rem;
    padding: 0.5rem 1rem;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .image-counter {
    font-size: 0.8rem;
    min-width: 50px;
  }
}
</style>