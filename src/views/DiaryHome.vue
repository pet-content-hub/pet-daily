<template>
  <div class="diary-home">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">🐱 猫咪日记</h1>
        <p class="page-subtitle">记录与猫咪的美好时光，分享养猫心得</p>
        
        <!-- 操作按钮 -->
        <div class="header-actions" v-if="userStore.isLoggedIn">
          <router-link to="/cats" class="btn btn-outline">
            <span class="icon">🏠</span>
            我的猫咪
          </router-link>
          <router-link to="/diary/create" class="btn btn-primary">
            <span class="icon">✍️</span>
            写日记
          </router-link>
        </div>
        
        <!-- 登录提示 -->
        <div class="login-prompt" v-else>
          <p>登录后即可为你的猫咪写日记 📝</p>
          <UserAuth />
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="container">
        <!-- 筛选和搜索 -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button 
              @click="currentFilter = 'all'"
              :class="{ active: currentFilter === 'all' }"
              class="filter-tab"
            >
              全部日记
            </button>
            <button 
              @click="currentFilter = 'happy'"
              :class="{ active: currentFilter === 'happy' }"
              class="filter-tab"
            >
              😸 开心
            </button>
            <button 
              @click="currentFilter = 'normal'"
              :class="{ active: currentFilter === 'normal' }"
              class="filter-tab"
            >
              😐 正常
            </button>
            <button 
              @click="currentFilter = 'worried'"
              :class="{ active: currentFilter === 'worried' }"
              class="filter-tab"
            >
              😰 担心
            </button>
            <button 
              @click="currentFilter = 'sick'"
              :class="{ active: currentFilter === 'sick' }"
              class="filter-tab"
            >
              🤒 生病
            </button>
          </div>
        </div>

        <!-- 日记时间轴 -->
        <div class="diary-timeline">
          <div class="loading-indicator" v-if="diaryStore.isLoading && filteredDiaries.length === 0">
            <LoadingIndicator />
            <p>正在加载日记...</p>
          </div>
          
          <div 
            v-for="diary in filteredDiaries" 
            :key="diary.id"
            class="diary-card"
            @click="goToDiaryDetail(diary.id)"
          >
            <!-- 卡片头部 -->
            <div class="diary-header">
              <div class="cat-info">
                <img 
                  :src="diary.cats?.avatar_url || '/images/default-cat-avatar.png'"
                  :alt="diary.cats?.name"
                  class="cat-avatar"
                >
                <div class="cat-details">
                  <h3 class="cat-name">{{ diary.cats?.name }}</h3>
                  <p class="diary-date">{{ formatDate(diary.created_at) }}</p>
                </div>
              </div>
              
              <div class="mood-indicator" :class="`mood-${diary.mood}`">
                <span class="mood-emoji">{{ getMoodEmoji(diary.mood) }}</span>
              </div>
            </div>

            <!-- 日记内容 -->
            <div class="diary-content">
              <h4 class="diary-title">{{ diary.title }}</h4>
              <p class="diary-excerpt">{{ truncateText(diary.content, 120) }}</p>
              
              <!-- 健康指标 -->
              <div class="health-metrics" v-if="hasHealthData(diary)">
                <span class="metric" v-if="diary.weight">
                  ⚖️ {{ diary.weight }}kg
                </span>
                <span class="metric" v-if="diary.temperature">
                  🌡️ {{ diary.temperature }}°C
                </span>
                <span class="metric" v-if="diary.food_amount">
                  🍽️ {{ getFoodAmountText(diary.food_amount) }}
                </span>
                <span class="metric" v-if="diary.activity_level">
                  🏃 {{ getActivityLevelText(diary.activity_level) }}
                </span>
              </div>
            </div>

            <!-- 日记图片 -->
            <div class="diary-images" v-if="diary.diary_images && diary.diary_images.length > 0">
              <div class="image-grid" :class="`grid-${Math.min(diary.diary_images.length, 3)}`">
                <img 
                  v-for="(image, index) in diary.diary_images.slice(0, 3)" 
                  :key="image.id"
                  :src="image.image_url"
                  :alt="image.caption || `日记图片 ${index + 1}`"
                  class="diary-image"
                >
                <div 
                  v-if="diary.diary_images.length > 3" 
                  class="more-images"
                >
                  +{{ diary.diary_images.length - 3 }}
                </div>
              </div>
            </div>

            <!-- 卡片底部 -->
            <div class="diary-footer">
              <div class="author-info" v-if="diary.user_profiles">
                <span class="author-name">{{ diary.user_profiles.full_name || diary.user_profiles.username }}</span>
              </div>
              
              <div class="diary-actions">
                <button class="action-btn" @click.stop="likeDiary(diary.id)">
                  ❤️ 喜欢
                </button>
                <button class="action-btn" @click.stop="shareDiary(diary.id)">
                  📤 分享
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-if="!diaryStore.isLoading && filteredDiaries.length === 0">
            <div class="empty-icon">📖</div>
            <h3>还没有日记</h3>
            <p>成为第一个分享猫咪日记的人吧！</p>
            <router-link 
              to="/diary/create" 
              class="btn btn-primary" 
              v-if="userStore.isLoggedIn"
            >
              写第一篇日记
            </router-link>
          </div>

          <!-- 加载更多按钮 -->
          <div class="load-more" v-if="diaryStore.hasMorePublic && !diaryStore.isLoading">
            <button 
              @click="loadMore" 
              class="btn btn-outline btn-block"
            >
              加载更多日记
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useDiaryStore } from '@/stores/diary'
import { useUserStore } from '@/stores/user'
import UserAuth from '@/components/ui/UserAuth.vue'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const diaryStore = useDiaryStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 响应式状态
const currentFilter = ref('all')

// 计算属性
const filteredDiaries = computed(() => {
  if (currentFilter.value === 'all') {
    return diaryStore.publicDiaries
  }
  return diaryStore.publicDiaries.filter(diary => diary.mood === currentFilter.value)
})

// 设置页面 meta
useHead({
  title: '猫咪日记 - 猫咪世界',
  meta: [
    { name: 'description', content: '记录与猫咪的美好时光，浏览公开的猫咪日记，分享养猫心得' },
    { name: 'keywords', content: '猫咪日记,养猫心得,宠物记录,猫咪档案' },
    { property: 'og:title', content: '猫咪日记 - 猫咪世界' },
    { property: 'og:description', content: '记录与猫咪的美好时光，分享养猫心得' }
  ]
})

// 方法
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    })
  }
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

function goToDiaryDetail(diaryId) {
  router.push(`/diary/${diaryId}`)
}

async function loadMore() {
  try {
    await diaryStore.loadMorePublicDiaries()
  } catch (error) {
    console.error('加载更多日记失败:', error)
  }
}

function likeDiary(diaryId) {
  // TODO: 实现点赞功能
  console.log('点赞日记:', diaryId)
}

function shareDiary(diaryId) {
  // TODO: 实现分享功能
  console.log('分享日记:', diaryId)
  
  // 简单的分享实现
  if (navigator.share) {
    navigator.share({
      title: '猫咪日记分享',
      text: '来看看这篇有趣的猫咪日记！',
      url: `${window.location.origin}/#/diary/${diaryId}`
    })
  } else {
    // 复制链接到剪贴板
    const url = `${window.location.origin}/#/diary/${diaryId}`
    navigator.clipboard.writeText(url).then(() => {
      notificationStore.showSuccess('链接已复制到剪贴板')
    })
  }
}

// 监听筛选条件变化
watch(currentFilter, async (newFilter) => {
  if (newFilter !== 'all') {
    // 如果是按心情筛选，可以重新加载数据或使用现有数据
    // 这里我们使用现有数据的客户端筛选
    console.log('筛选心情:', newFilter)
  }
})

// 页面初始化
onMounted(async () => {
  try {
    console.log('DiaryHome: 开始加载公开日记')
    // 加载公开日记
    await diaryStore.fetchPublicDiaries({ reset: true })
    console.log('DiaryHome: 加载完成，公开日记数量:', diaryStore.publicDiaries.length)
    console.log('DiaryHome: 公开日记数据:', diaryStore.publicDiaries)
  } catch (error) {
    console.error('初始化页面失败:', error)
  }
})
</script>

<style scoped>
.diary-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  padding: 2rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 700;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
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
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.login-prompt {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.login-prompt p {
  margin-bottom: 1rem;
  color: #64748b;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-tab:hover {
  border-color: #ff6b6b;
}

.filter-tab.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.diary-timeline {
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.diary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.diary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f1f5f9;
}

.cat-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.diary-date {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.mood-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
}

.mood-happy { background: #fef3c7; }
.mood-normal { background: #f3f4f6; }
.mood-worried { background: #fef3c7; }
.mood-sick { background: #fee2e2; }

.diary-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.diary-excerpt {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.health-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.diary-images {
  margin-bottom: 1rem;
}

.image-grid {
  display: grid;
  gap: 0.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

.diary-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
}

.more-images {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-weight: 500;
  border-radius: 6px;
}

.diary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.author-name {
  font-size: 0.9rem;
  color: #64748b;
}

.diary-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8fafc;
  color: #ff6b6b;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  color: #64748b;
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

.load-more {
  margin-top: 2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .filter-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .diary-card {
    padding: 1rem;
  }
  
  .diary-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .diary-actions {
    justify-content: center;
  }
}
</style>