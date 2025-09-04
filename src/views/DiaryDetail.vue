<template>
  <div class="diary-detail">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <LoadingIndicator />
      <p>正在加载日记详情...</p>
    </div>

    <!-- 错误状态/日记不存在 -->
    <div v-else-if="!diary && !isLoading" class="error-container">
      <div class="container">
        <div class="error-card">
          <div class="error-icon">😿</div>
          <h2>日记不存在</h2>
          <p>抱歉，您要查看的日记不存在或已被删除。</p>
          <div class="error-actions">
            <button @click="goBack" class="btn btn-primary">
              <span class="icon">←</span>
              返回上一页
            </button>
            <router-link to="/diary" class="btn btn-outline">
              <span class="icon">📖</span>
              浏览日记
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 日记内容 -->
    <div v-else-if="diary" class="diary-content">
      <div class="container">
        <!-- 返回导航 -->
        <div class="navigation-bar">
          <button @click="goBack" class="btn btn-ghost btn-sm">
            <span class="icon">←</span>
            返回
          </button>
          
          <div class="diary-actions" v-if="isOwner">
            <button @click="editDiary" class="btn btn-outline btn-sm">
              <span class="icon">✏️</span>
              编辑
            </button>
            <button @click="deleteDiary" class="btn btn-ghost btn-sm">
              <span class="icon">🗑️</span>
              删除
            </button>
          </div>
        </div>

        <!-- 日记头部 -->
        <div class="diary-header">
          <!-- 猫咪信息 -->
          <div class="cat-info" @click="goToCatProfile">
            <img 
              :src="diary.cats?.avatar_url || '/images/default-cat-avatar.png'"
              :alt="diary.cats?.name"
              class="cat-avatar"
            >
            <div class="cat-details">
              <h3 class="cat-name">{{ diary.cats?.name }}</h3>
              <p class="cat-meta">{{ diary.cats?.breed }} • {{ getCatAge(diary.cats?.birth_date) }}</p>
            </div>
          </div>

          <!-- 日记元信息 -->
          <div class="diary-meta">
            <div class="diary-date">
              <span class="date-main">{{ formatDate(diary.created_at) }}</span>
              <span class="date-time">{{ formatTime(diary.created_at) }}</span>
            </div>
            
            <div class="mood-display" :class="`mood-${diary.mood}`">
              <span class="mood-emoji">{{ getMoodEmoji(diary.mood) }}</span>
              <span class="mood-label">{{ getMoodLabel(diary.mood) }}</span>
            </div>
            
            <div v-if="!diary.is_private" class="privacy-status public">
              <span class="icon">🌍</span>
              公开日记
            </div>
            <div v-else class="privacy-status private">
              <span class="icon">🔒</span>
              私密日记
            </div>
          </div>
        </div>

        <!-- 日记标题 -->
        <h1 class="diary-title">{{ diary.title }}</h1>

        <!-- 健康数据卡片 -->
        <div v-if="hasHealthData" class="health-data-card">
          <h3>健康记录</h3>
          <div class="health-metrics">
            <div v-if="diary.weight" class="metric-item">
              <span class="metric-icon">⚖️</span>
              <span class="metric-label">体重</span>
              <span class="metric-value">{{ diary.weight }}kg</span>
            </div>
            
            <div v-if="diary.temperature" class="metric-item">
              <span class="metric-icon">🌡️</span>
              <span class="metric-label">体温</span>
              <span class="metric-value">{{ diary.temperature }}°C</span>
            </div>
            
            <div v-if="diary.food_amount" class="metric-item">
              <span class="metric-icon">🍽️</span>
              <span class="metric-label">食欲</span>
              <span class="metric-value">{{ getFoodAmountText(diary.food_amount) }}</span>
            </div>
            
            <div v-if="diary.water_amount" class="metric-item">
              <span class="metric-icon">💧</span>
              <span class="metric-label">饮水</span>
              <span class="metric-value">{{ diary.water_amount }}</span>
            </div>
            
            <div v-if="diary.litter_box_times" class="metric-item">
              <span class="metric-icon">🚽</span>
              <span class="metric-label">如厕</span>
              <span class="metric-value">{{ diary.litter_box_times }}次</span>
            </div>
            
            <div v-if="diary.activity_level" class="metric-item">
              <span class="metric-icon">🏃</span>
              <span class="metric-label">活跃度</span>
              <span class="metric-value">{{ getActivityLevelText(diary.activity_level) }}</span>
            </div>
          </div>
        </div>

        <!-- 日记内容 -->
        <div class="diary-body">
          <div class="content-text" v-html="formattedContent"></div>
        </div>

        <!-- 日记图片 -->
        <div v-if="diary.diary_images?.length" class="diary-images">
          <div class="images-grid">
            <div 
              v-for="(image, index) in diary.diary_images" 
              :key="image.id"
              class="image-item"
              @click="openImageModal(image, index)"
            >
              <img 
                :src="image.image_url"
                :alt="image.caption || `照片 ${index + 1}`"
                class="diary-image"
                loading="lazy"
              >
              <div v-if="image.caption" class="image-caption">
                {{ image.caption }}
              </div>
            </div>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div v-if="relatedDiaries.length > 0" class="related-diaries">
          <h3>{{ diary.cats?.name }}的其他日记</h3>
          <div class="related-list">
            <div 
              v-for="relatedDiary in relatedDiaries" 
              :key="relatedDiary.id"
              class="related-item"
              @click="goToDiary(relatedDiary.id)"
            >
              <div class="related-date">
                {{ formatShortDate(relatedDiary.created_at) }}
              </div>
              <div class="related-content">
                <h4 class="related-title">{{ relatedDiary.title }}</h4>
                <p class="related-excerpt">{{ truncateText(relatedDiary.content, 80) }}</p>
              </div>
              <div class="related-mood">
                {{ getMoodEmoji(relatedDiary.mood) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 分享按钮 -->
        <div v-if="!diary.is_private" class="share-section">
          <h4>分享这篇日记</h4>
          <div class="share-buttons">
            <button @click="copyDiaryLink" class="btn btn-outline">
              <span class="icon">🔗</span>
              复制链接
            </button>
            <button @click="shareToPlatform('weibo')" class="btn btn-outline">
              <span class="icon">📱</span>
              分享到微博
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 日记不存在或加载失败 -->
    <div v-else class="error-state">
      <div class="error-icon">😿</div>
      <h3>找不到这篇日记</h3>
      <p>日记可能不存在、已被删除或设为私密</p>
      <button @click="goBack" class="btn btn-primary">
        返回上一页
      </button>
    </div>

    <!-- 图片查看模态框 -->
    <ImageModal 
      v-if="selectedImage"
      :image="selectedImage"
      :images="diary?.diary_images || []"
      :current-index="selectedImageIndex"
      @close="closeImageModal"
      @navigate="navigateImage"
    />

    <!-- 编辑日记模态框 -->
    <EditDiaryModal 
      v-if="showEditModal"
      :diary="diary"
      @close="showEditModal = false"
      @updated="handleDiaryUpdated"
    />

    <!-- 删除确认模态框 -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="删除日记"
      :message="`确定要删除「${diary?.title}」这篇日记吗？删除后将无法恢复。`"
      confirm-text="删除"
      :is-danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useDiaryStore } from '@/stores/diary'
import { useCatsStore } from '@/stores/cats'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()
const catsStore = useCatsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 响应式状态
const isLoading = ref(true)
const selectedImage = ref(null)
const selectedImageIndex = ref(0)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

// 计算属性
const diary = computed(() => diaryStore.selectedDiary)

const isOwner = computed(() => {
  return userStore.isLoggedIn && 
         userStore.user?.id === diary.value?.user_id
})

const hasHealthData = computed(() => {
  if (!diary.value) return false
  return diary.value.weight || 
         diary.value.temperature || 
         diary.value.food_amount || 
         diary.value.water_amount || 
         diary.value.litter_box_times || 
         diary.value.activity_level
})

const formattedContent = computed(() => {
  if (!diary.value?.content) return ''
  
  // 简单的文本格式化：换行转换为<br>，保持段落结构
  return diary.value.content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
})

const relatedDiaries = computed(() => {
  if (!diary.value?.cat_id) return []
  
  return diaryStore.diaries
    .filter(d => 
      d.cat_id === diary.value.cat_id && 
      d.id !== diary.value.id && 
      (!d.is_private || isOwner.value)
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)
})

// 设置动态页面标题和meta
const pageTitle = computed(() => {
  return diary.value ? `${diary.value.title} - ${diary.value.cat?.name}的日记` : '日记详情'
})

const pageDescription = computed(() => {
  if (!diary.value) return '猫咪日记详情页面'
  const excerpt = diary.value.content.substring(0, 150).replace(/\n/g, ' ')
  return `${diary.value.cat?.name}的日记：${excerpt}...`
})

useHead({
  title: () => `${pageTitle.value} - 猫咪世界`,
  meta: [
    { name: 'description', content: () => pageDescription.value },
    { name: 'keywords', content: () => `猫咪日记,${diary.value?.cat?.name || '宠物'},日记详情,养猫记录` },
    // Open Graph meta tags for sharing
    { property: 'og:title', content: () => pageTitle.value },
    { property: 'og:description', content: () => pageDescription.value },
    { property: 'og:image', content: () => diary.value?.diary_images?.[0]?.image_url || diary.value?.cat?.avatar_url },
    { property: 'og:type', content: 'article' }
  ]
})

// 方法
function getCatAge(birthDate) {
  if (!birthDate) return ''
  
  const birth = new Date(birthDate)
  const today = new Date()
  const diffTime = Math.abs(today - birth)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}个月`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}岁`
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatShortDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

function getMoodEmoji(mood) {
  const moodMap = {
    happy: '😸',
    normal: '😐',
    worried: '😰',
    sick: '🤒'
  }
  return moodMap[mood] || '😸'
}

function getMoodLabel(mood) {
  const moodMap = {
    happy: '开心',
    normal: '正常',
    worried: '担心',
    sick: '生病'
  }
  return moodMap[mood] || '开心'
}

function getFoodAmountText(amount) {
  const amountMap = {
    poor: '食欲不振',
    normal: '正常',
    good: '食欲旺盛'
  }
  return amountMap[amount] || amount
}

function getActivityLevelText(level) {
  const levelMap = {
    low: '较低',
    medium: '正常',
    high: '活跃'
  }
  return levelMap[level] || level
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/diary')
  }
}

function goToCatProfile() {
  if (diary.value?.cat_id) {
    router.push(`/cat/${diary.value.cat_id}`)
  }
}

function goToDiary(diaryId) {
  router.push(`/diary/${diaryId}`)
}

function openImageModal(image, index) {
  selectedImage.value = image
  selectedImageIndex.value = index
}

function closeImageModal() {
  selectedImage.value = null
  selectedImageIndex.value = 0
}

function navigateImage(direction) {
  const images = diary.value?.diary_images || []
  if (direction === 'prev' && selectedImageIndex.value > 0) {
    selectedImageIndex.value--
  } else if (direction === 'next' && selectedImageIndex.value < images.length - 1) {
    selectedImageIndex.value++
  }
  selectedImage.value = images[selectedImageIndex.value]
}

function editDiary() {
  showEditModal.value = true
}

function deleteDiary() {
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!diary.value) return

  try {
    await diaryStore.deleteDiary(diary.value.id)
    showDeleteConfirm.value = false
    
    // 显示成功消息并返回上一页
    showSuccessMessage('日记已删除')
    setTimeout(() => {
      goBack()
    }, 1000)
    
  } catch (error) {
    console.error('删除日记失败:', error)
    showErrorMessage('删除失败，请重试')
  }
}

function handleDiaryUpdated(updatedDiary) {
  diaryStore.selectedDiary = updatedDiary
  showEditModal.value = false
  showSuccessMessage('日记已更新')
}

async function copyDiaryLink() {
  const url = window.location.href
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      notificationStore.showSuccess('链接已复制到剪贴板')
    } else {
      // 兼容旧浏览器
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      notificationStore.showSuccess('链接已复制')
    }
  } catch (error) {
    console.error('复制链接失败:', error)
    showErrorMessage('复制失败，请手动复制地址栏链接')
  }
}

function shareToPlatform(platform) {
  const url = window.location.href
  const title = `${diary.value.cat?.name}的日记：${diary.value.title}`
  
  if (platform === 'weibo') {
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }
}

function showSuccessMessage(message) {
  notificationStore.showSuccess(message)
}

function showErrorMessage(message) {
  notificationStore.showError(message)
}

// 页面初始化
onMounted(async () => {
  const diaryId = route.params.diaryId
  
  if (!diaryId) {
    console.error('缺少日记ID参数')
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    
    // 获取日记详情
    await diaryStore.getDiaryDetail(diaryId)
    
    if (!diary.value) {
      console.error('日记不存在:', diaryId)
      return
    }
    
    // 如果是私密日记且不是所有者，则无法查看
    if (diary.value.is_private && !isOwner.value) {
      console.log('无权访问私密日记')
      diaryStore.selectedDiary = null
      return
    }
    
    // 加载相关日记
    if (diary.value.cat_id) {
      try {
        if (isOwner.value) {
          await diaryStore.fetchUserDiaries(diary.value.user_id, { catId: diary.value.cat_id })
        } else {
          await diaryStore.fetchPublicDiaries({ catId: diary.value.cat_id })
        }
      } catch (relatedError) {
        console.warn('加载相关日记失败:', relatedError)
        // 相关日记加载失败不影响主日记显示
      }
    }
    
  } catch (error) {
    console.error('加载日记详情失败:', error)
    // 确保在错误时清空选中的日记
    diaryStore.selectedDiary = null
  } finally {
    isLoading.value = false
  }
})

// 组件卸载时清理状态
onUnmounted(() => {
  // 清空选中的日记，避免状态污染
  if (diaryStore.selectedDiary) {
    diaryStore.selectedDiary = null
  }
})

// 动态导入模态框组件
const ImageModal = ref(null)
const EditDiaryModal = ref(null)
const ConfirmModal = ref(null)

// 懒加载模态框组件
watch(selectedImage, async (image) => {
  if (image && !ImageModal.value) {
    const { default: component } = await import('@/components/modals/ImageModal.vue')
    ImageModal.value = component
  }
})

watch(showEditModal, async (show) => {
  if (show && !EditDiaryModal.value) {
    const { default: component } = await import('@/components/modals/EditDiaryModal.vue')
    EditDiaryModal.value = component
  }
})

watch(showDeleteConfirm, async (show) => {
  if (show && !ConfirmModal.value) {
    const { default: component } = await import('@/components/modals/ConfirmModal.vue')
    ConfirmModal.value = component
  }
})
</script>

<style scoped>
.diary-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #64748b;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 0;
}

.error-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-card h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.error-card p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.diary-content {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.navigation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.diary-actions {
  display: flex;
  gap: 0.5rem;
}

.diary-header {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.cat-info:hover {
  background: #f8fafc;
}

.cat-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f5f9;
}

.cat-details {
  flex: 1;
}

.cat-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.cat-meta {
  color: #64748b;
  font-size: 0.9rem;
}

.diary-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.diary-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-main {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.date-time {
  font-size: 0.85rem;
  color: #64748b;
}

.mood-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.mood-happy { background: #fef3c7; color: #92400e; }
.mood-normal { background: #f3f4f6; color: #4b5563; }
.mood-worried { background: #fef3c7; color: #92400e; }
.mood-sick { background: #fee2e2; color: #991b1b; }

.mood-emoji {
  font-size: 1.2rem;
}

.privacy-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.privacy-status.public {
  background: #dcfce7;
  color: #166534;
}

.privacy-status.private {
  background: #fef3c7;
  color: #92400e;
}

.diary-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
  line-height: 1.2;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.health-data-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.health-data-card h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.health-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.metric-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.metric-label {
  flex: 1;
  color: #64748b;
  font-size: 0.9rem;
}

.metric-value {
  font-weight: 600;
  color: #2c3e50;
}

.diary-body {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
}

.content-text :deep(p) {
  margin-bottom: 1.5rem;
}

.content-text :deep(p:last-child) {
  margin-bottom: 0;
}

.diary-images {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.image-item {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
}

.diary-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1rem;
  font-size: 0.9rem;
}

.related-diaries {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.related-diaries h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.related-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
}

.related-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.related-date {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-align: center;
}

.related-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.related-excerpt {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.related-mood {
  font-size: 1.2rem;
}

.share-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.share-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.share-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #64748b;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.btn-ghost {
  background: none;
  color: #64748b;
  border: none;
}

.btn-ghost:hover:not(:disabled) {
  color: #2c3e50;
  background: #f8fafc;
}

.icon {
  font-size: 1em;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .navigation-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .diary-header,
  .diary-body,
  .health-data-card,
  .diary-images,
  .related-diaries,
  .share-section {
    padding: 1.5rem 1rem;
  }
  
  .diary-title {
    font-size: 1.8rem;
    padding: 1.5rem 1rem;
  }
  
  .diary-meta {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .health-metrics {
    grid-template-columns: 1fr;
  }
  
  .images-grid {
    grid-template-columns: 1fr;
  }
  
  .related-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .share-buttons {
    justify-content: center;
  }
  
  .content-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .diary-title {
    font-size: 1.5rem;
  }
  
  .cat-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>