<template>
  <div class="cat-profile">
    <!-- 加载状态 -->
    <div v-if="isLoading && !cat" class="loading-container">
      <LoadingIndicator />
      <p>正在加载猫咪档案...</p>
    </div>

    <!-- 猫咪档案内容 -->
    <div v-else-if="cat" class="profile-content">
      <!-- 猫咪基本信息卡片 -->
      <div class="cat-info-card">
        <div class="cat-header">
          <div class="cat-avatar-section">
            <img 
              :src="cat.avatar_url || '/images/default-cat-avatar.png'"
              :alt="cat.name"
              class="cat-avatar"
            >
            <button 
              v-if="isOwner"
              @click="showAvatarUpload = true"
              class="edit-avatar-btn"
              title="更换头像"
            >
              📷
            </button>
          </div>
          
          <div class="cat-basic-info">
            <h1 class="cat-name">{{ cat.name }}</h1>
            <div class="cat-details">
              <span class="detail-item" v-if="cat.breed">
                <span class="label">品种:</span>
                <span class="value">{{ cat.breed }}</span>
              </span>
              <span class="detail-item" v-if="cat.gender">
                <span class="label">性别:</span>
                <span class="value">{{ getGenderText(cat.gender) }}</span>
              </span>
              <span class="detail-item" v-if="cat.birth_date">
                <span class="label">年龄:</span>
                <span class="value">{{ calculateAge(cat.birth_date) }}</span>
              </span>
              <span class="detail-item" v-if="cat.color">
                <span class="label">毛色:</span>
                <span class="value">{{ cat.color }}</span>
              </span>
              <span class="detail-item" v-if="cat.weight">
                <span class="label">体重:</span>
                <span class="value">{{ cat.weight }}kg</span>
              </span>
            </div>
          </div>
          
          <div class="cat-actions" v-if="isOwner">
            <button @click="showEditForm = true" class="btn btn-outline">
              <span class="icon">✏️</span>
              编辑档案
            </button>
            <router-link 
              :to="{ name: 'CreateDiary', query: { catId: cat.id } }"
              class="btn btn-primary"
            >
              <span class="icon">📝</span>
              写日记
            </router-link>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="cat-stats">
          <div class="stat-item">
            <span class="stat-number">{{ diaryCount }}</span>
            <span class="stat-label">篇日记</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ daysSinceAdoption }}</span>
            <span class="stat-label">天相伴</span>
          </div>
          <div class="stat-item" v-if="lastDiaryDate">
            <span class="stat-number">{{ daysSinceLastDiary ?? 0 }}</span>
            <span class="stat-label">天未更新</span>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tab-navigation">
        <button 
          @click="activeTab = 'diaries'"
          :class="{ active: activeTab === 'diaries' }"
          class="tab-btn"
        >
          📖 日记时间轴
        </button>
        <button 
          @click="activeTab = 'health'"
          :class="{ active: activeTab === 'health' }"
          class="tab-btn"
        >
          🏥 健康记录
        </button>
        <button 
          @click="activeTab = 'photos'"
          :class="{ active: activeTab === 'photos' }"
          class="tab-btn"
        >
          📷 照片集
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 日记时间轴 -->
        <div v-if="activeTab === 'diaries'" class="diaries-tab">
          <div v-if="catDiaries.length === 0 && !diaryStore.isLoading" class="empty-state">
            <div class="empty-icon">📖</div>
            <h3>还没有日记记录</h3>
            <p v-if="isOwner">开始记录与{{ cat.name }}的美好时光吧！</p>
            <p v-else>{{ cat.name }}的主人还没有分享日记哦</p>
            <router-link 
              v-if="isOwner"
              :to="{ name: 'CreateDiary', query: { catId: cat.id } }"
              class="btn btn-primary"
            >
              写第一篇日记
            </router-link>
          </div>
          
          <div v-else class="diary-timeline">
            <div 
              v-for="diary in catDiaries" 
              :key="diary.id"
              class="diary-item"
              @click="goToDiaryDetail(diary.id)"
            >
              <div class="diary-date">
                {{ formatDiaryDate(diary.created_at) }}
              </div>
              <div class="diary-card">
                <div class="diary-header">
                  <h4 class="diary-title">{{ diary.title }}</h4>
                  <div class="mood-indicator" :class="`mood-${diary.mood}`">
                    {{ getMoodEmoji(diary.mood) }}
                  </div>
                </div>
                
                <p class="diary-excerpt">{{ truncateText(diary.content, 100) }}</p>
                
                <!-- 健康数据 -->
                <div class="health-data" v-if="hasHealthData(diary)">
                  <span v-if="diary.weight" class="health-metric">
                    ⚖️ {{ diary.weight }}kg
                  </span>
                  <span v-if="diary.temperature" class="health-metric">
                    🌡️ {{ diary.temperature }}°C
                  </span>
                </div>
                
                <!-- 日记图片预览 -->
                <div v-if="diary.diary_images?.length" class="diary-preview-images">
                  <img 
                    v-for="image in diary.diary_images.slice(0, 2)" 
                    :key="image.id"
                    :src="image.image_url"
                    :alt="image.caption"
                    class="preview-image"
                  >
                  <div v-if="diary.diary_images.length > 2" class="more-images-count">
                    +{{ diary.diary_images.length - 2 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 健康记录 -->
        <div v-if="activeTab === 'health'" class="health-tab">
          <div class="health-charts">
            <!-- 体重趋势图 -->
            <div class="chart-card" v-if="weightData.length > 1">
              <h3>体重趋势</h3>
              <div class="weight-chart">
                <!-- 简单的体重趋势显示 -->
                <div 
                  v-for="(weight, index) in weightData" 
                  :key="index"
                  class="weight-point"
                  :style="{ 
                    left: `${(index / (weightData.length - 1)) * 100}%`,
                    bottom: `${((weight.value - minWeight) / (maxWeight - minWeight)) * 100}%` 
                  }"
                  :title="`${weight.date}: ${weight.value}kg`"
                >
                  <span class="weight-value">{{ weight.value }}kg</span>
                </div>
              </div>
            </div>
            
            <!-- 最近健康数据 -->
            <div class="recent-health-data">
              <h3>最近健康数据</h3>
              <div class="health-metrics-grid">
                <div class="metric-card" v-if="latestWeight">
                  <div class="metric-icon">⚖️</div>
                  <div class="metric-info">
                    <span class="metric-value">{{ latestWeight }}kg</span>
                    <span class="metric-label">最新体重</span>
                  </div>
                </div>
                
                <div class="metric-card" v-if="latestTemperature">
                  <div class="metric-icon">🌡️</div>
                  <div class="metric-info">
                    <span class="metric-value">{{ latestTemperature }}°C</span>
                    <span class="metric-label">最新体温</span>
                  </div>
                </div>
                
                <div class="metric-card" v-if="latestActivityLevel">
                  <div class="metric-icon">🏃</div>
                  <div class="metric-info">
                    <span class="metric-value">{{ getActivityLevelText(latestActivityLevel) }}</span>
                    <span class="metric-label">活跃度</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 照片集 -->
        <div v-if="activeTab === 'photos'" class="photos-tab">
          <div v-if="allPhotos.length === 0" class="empty-state">
            <div class="empty-icon">📷</div>
            <h3>还没有照片</h3>
            <p v-if="isOwner">在日记中添加{{ cat.name }}的美照吧！</p>
          </div>
          
          <div v-else class="photo-gallery">
            <div 
              v-for="photo in allPhotos" 
              :key="photo.id"
              class="photo-item"
              @click="openPhotoModal(photo)"
            >
              <img :src="photo.image_url" :alt="photo.caption" class="gallery-photo">
              <div class="photo-overlay">
                <span class="photo-date">{{ formatPhotoDate(photo.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 猫咪不存在或加载失败 -->
    <div v-else class="error-state">
      <div class="error-icon">😿</div>
      <h3>找不到这只猫咪</h3>
      <p>可能猫咪档案不存在或已被设为私密</p>
      <router-link to="/diary" class="btn btn-primary">
        返回日记首页
      </router-link>
    </div>

    <!-- 编辑档案模态框 -->
    <EditCatModal 
      v-if="showEditForm && cat"
      :cat="cat"
      @close="showEditForm = false"
      @updated="handleCatUpdated"
    />

    <!-- 头像上传模态框 -->
    <AvatarUploadModal 
      v-if="showAvatarUpload && cat"
      :cat-id="cat.id"
      @close="showAvatarUpload = false"
      @uploaded="handleAvatarUploaded"
    />

    <!-- 照片查看模态框 -->
    <PhotoModal 
      v-if="selectedPhoto"
      :photo="selectedPhoto"
      @close="selectedPhoto = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useCatsStore } from '@/stores/cats'
import { useDiaryStore } from '@/stores/diary'
import { useUserStore } from '@/stores/user'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'

const route = useRoute()
const router = useRouter()
const catsStore = useCatsStore()
const diaryStore = useDiaryStore()
const userStore = useUserStore()

// 响应式状态
const isLoading = ref(true)
const activeTab = ref('diaries')
const showEditForm = ref(false)
const showAvatarUpload = ref(false)
const selectedPhoto = ref(null)

// 计算属性
const cat = computed(() => catsStore.selectedCat)

const isOwner = computed(() => {
  return userStore.isLoggedIn && 
         userStore.user?.id === cat.value?.user_id
})

const catDiaries = computed(() => {
  return diaryStore.diaries.filter(diary => 
    diary.cat_id === route.params.catId
  )
})

const diaryCount = computed(() => catDiaries.value.length)

const daysSinceAdoption = computed(() => {
  if (!cat.value?.created_at) return 0
  const adoptionDate = new Date(cat.value.created_at)
  const today = new Date()
  const diffTime = Math.abs(today - adoptionDate)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

const lastDiaryDate = computed(() => {
  if (catDiaries.value.length === 0) return null
  return catDiaries.value[0]?.created_at
})

const daysSinceLastDiary = computed(() => {
  if (!lastDiaryDate.value) return 0
  const lastDate = new Date(lastDiaryDate.value)
  const today = new Date()
  const diffTime = Math.abs(today - lastDate)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) ?? 0
})

const weightData = computed(() => {
  return catDiaries.value
    .filter(diary => diary.weight)
    .map(diary => ({
      date: diary.created_at,
      value: parseFloat(diary.weight)
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const minWeight = computed(() => {
  return weightData.value.length > 0 
    ? Math.min(...weightData.value.map(w => w.value)) 
    : 0
})

const maxWeight = computed(() => {
  return weightData.value.length > 0 
    ? Math.max(...weightData.value.map(w => w.value)) 
    : 0
})

const latestWeight = computed(() => {
  const recentDiary = catDiaries.value.find(diary => diary.weight)
  return recentDiary?.weight
})

const latestTemperature = computed(() => {
  const recentDiary = catDiaries.value.find(diary => diary.temperature)
  return recentDiary?.temperature
})

const latestActivityLevel = computed(() => {
  const recentDiary = catDiaries.value.find(diary => diary.activity_level)
  return recentDiary?.activity_level
})

const allPhotos = computed(() => {
  const photos = []
  catDiaries.value.forEach(diary => {
    if (diary.diary_images) {
      photos.push(...diary.diary_images)
    }
  })
  return photos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// 设置动态页面标题
const pageTitle = computed(() => {
  return cat.value ? `${cat.value.name}的档案` : '猫咪档案'
})

useHead({
  title: () => `${pageTitle.value} - 猫咪世界`,
  meta: [
    { name: 'description', content: () => 
      cat.value 
        ? `查看${cat.value.name}的详细档案，包括基本信息、日记时间轴和健康记录`
        : '猫咪详细档案页面'
    }
  ]
})

// 方法
function getGenderText(gender) {
  const genderMap = {
    male: '公猫 ♂',
    female: '母猫 ♀',
    unknown: '未知'
  }
  return genderMap[gender] || gender
}

function calculateAge(birthDate) {
  if (!birthDate) return '未知'
  
  const birth = new Date(birthDate)
  const today = new Date()
  const diffTime = Math.abs(today - birth)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays}天`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}个月`
  } else {
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`
  }
}

function formatDiaryDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatPhotoDate(dateString) {
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

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function hasHealthData(diary) {
  return diary.weight || diary.temperature || diary.food_amount || diary.activity_level
}

function getActivityLevelText(level) {
  const levelMap = {
    low: '较低',
    medium: '正常',
    high: '活跃'
  }
  return levelMap[level] || level
}

function goToDiaryDetail(diaryId) {
  router.push(`/diary/${diaryId}`)
}

function openPhotoModal(photo) {
  selectedPhoto.value = photo
}

function handleCatUpdated(updatedCat) {
  catsStore.selectedCat = updatedCat
  showEditForm.value = false
}

function handleAvatarUploaded(updatedCat) {
  catsStore.selectedCat = updatedCat
  showAvatarUpload.value = false
}

// 页面初始化
onMounted(async () => {
  const catId = route.params.catId
  
  try {
    isLoading.value = true
    
    // 获取猫咪详情
    await catsStore.getCatDetail(catId)
    
    if (!cat.value) {
      console.error('猫咪不存在')
      return
    }
    
    // 如果是猫咪主人，加载该猫咪的所有日记
    if (isOwner.value) {
      await diaryStore.fetchUserDiaries(cat.value.user_id, { catId })
    } else {
      // 如果不是主人，只加载公开日记
      await diaryStore.fetchPublicDiaries({ catId })
    }
    
  } catch (error) {
    console.error('加载猫咪档案失败:', error)
  } finally {
    isLoading.value = false
  }
})

// 动态导入模态框组件（延迟加载）
const EditCatModal = ref(null)
const AvatarUploadModal = ref(null)
const PhotoModal = ref(null)

// 懒加载模态框组件
watch(showEditForm, async (show) => {
  if (show && !EditCatModal.value) {
    const { default: component } = await import('@/components/modals/EditCatModal.vue')
    EditCatModal.value = component
  }
})

watch(showAvatarUpload, async (show) => {
  if (show && !AvatarUploadModal.value) {
    const { default: component } = await import('@/components/modals/AvatarUploadModal.vue')
    AvatarUploadModal.value = component
  }
})

watch(selectedPhoto, async (photo) => {
  if (photo && !PhotoModal.value) {
    const { default: component } = await import('@/components/modals/PhotoModal.vue')
    PhotoModal.value = component
  }
})
</script>

<style scoped>
.cat-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #64748b;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cat-info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.cat-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.cat-avatar-section {
  position: relative;
}

.cat-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f1f5f9;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  transform: scale(1.05);
}

.cat-name {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.cat-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  color: #2c3e50;
  font-weight: 600;
}

.cat-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background: #ff5252;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.cat-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.tab-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  gap: 0.25rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #64748b;
}

.tab-btn.active {
  background: #ff6b6b;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #f8fafc;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.diary-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.diary-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  cursor: pointer;
}

.diary-date {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  padding-top: 0.5rem;
  text-align: right;
}

.diary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.diary-item:hover .diary-card {
  transform: translateX(4px);
  border-color: #ff6b6b;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.diary-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.mood-indicator {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.mood-happy { background: #fef3c7; }
.mood-normal { background: #f3f4f6; }
.mood-worried { background: #fef3c7; }
.mood-sick { background: #fee2e2; }

.diary-excerpt {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.health-data {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.health-metric {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.diary-preview-images {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.more-images-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
}

.health-charts {
  display: grid;
  gap: 2rem;
}

.chart-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.chart-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.weight-chart {
  position: relative;
  height: 200px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.weight-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.weight-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.health-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.metric-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 12px;
}

.metric-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.metric-label {
  font-size: 0.85rem;
  color: #64748b;
}

.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.photo-item:hover {
  transform: scale(1.02);
}

.gallery-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
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

@media (max-width: 768px) {
  .cat-header {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }
  
  .cat-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .tab-navigation {
    flex-direction: column;
  }
  
  .diary-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .diary-date {
    text-align: left;
    padding-top: 0;
    font-size: 0.8rem;
  }
  
  .photo-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>