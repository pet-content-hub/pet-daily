<template>
  <div class="cats-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>🐱 我的猫咪</h1>
        <p>管理你的猫咪档案和信息</p>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <div class="container">
        <!-- 登录提示 -->
        <div v-if="!userStore.isLoggedIn" class="login-required">
          <div class="login-card">
            <h3>需要登录</h3>
            <p>请先登录后管理你的猫咪档案</p>
            <UserAuth />
          </div>
        </div>

        <!-- 猫咪管理界面 -->
        <div v-else class="cats-container">
          <!-- 操作栏 -->
          <div class="actions-bar">
            <div class="stats-info">
              <span class="cats-count">共 {{ catsStore.activeCats.length }} 只猫咪</span>
              <span v-if="catsStore.inactiveCats.length > 0" class="inactive-count">
                ({{ catsStore.inactiveCats.length }} 只已归档)
              </span>
            </div>
            
            <div class="action-buttons">
              <button 
                @click="showArchivedCats = !showArchivedCats"
                v-if="catsStore.inactiveCats.length > 0"
                class="btn btn-ghost"
              >
                {{ showArchivedCats ? '隐藏' : '显示' }}已归档
              </button>
              <button @click="showAddForm = true" class="btn btn-primary">
                <span class="icon">➕</span>
                添加猫咪
              </button>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="catsStore.isLoading && catsStore.cats.length === 0" class="loading-state">
            <LoadingIndicator />
            <p>正在加载猫咪列表...</p>
          </div>

          <!-- 空状态 -->
          <div v-else-if="catsStore.cats.length === 0" class="empty-state">
            <div class="empty-icon">🐱</div>
            <h3>还没有猫咪档案</h3>
            <p>开始添加你的第一只猫咪吧！记录与它们的美好时光。</p>
            <button @click="showAddForm = true" class="btn btn-primary btn-large">
              <span class="icon">➕</span>
              添加第一只猫咪
            </button>
          </div>

          <!-- 活跃猫咪列表 -->
          <div v-else class="cats-grid">
            <div class="section-header" v-if="showArchivedCats && catsStore.inactiveCats.length > 0">
              <h2>活跃猫咪</h2>
            </div>
            
            <div class="cats-list active-cats">
              <div 
                v-for="cat in catsStore.activeCats" 
                :key="cat.id"
                class="cat-card"
              >
                <!-- 猫咪头像和基本信息 -->
                <div class="cat-header" @click="goToCatProfile(cat.id)">
                  <img 
                    :src="cat.avatar_url || '/images/default-cat-avatar.png'"
                    :alt="cat.name"
                    class="cat-avatar"
                  >
                  <div class="cat-info">
                    <h3 class="cat-name">{{ cat.name }}</h3>
                    <div class="cat-meta">
                      <span v-if="cat.breed" class="cat-breed">{{ cat.breed }}</span>
                      <span v-if="cat.birth_date" class="cat-age">{{ calculateAge(cat.birth_date) }}</span>
                    </div>
                  </div>
                  <div class="card-status active">
                    <span class="status-dot"></span>
                    活跃
                  </div>
                </div>

                <!-- 快捷统计 -->
                <div class="cat-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ getCatDiaryCount(cat.id) }}</span>
                    <span class="stat-label">篇日记</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ getDaysSinceLastDiary(cat.id) }}</span>
                    <span class="stat-label">天未更新</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="cat-actions">
                  <router-link 
                    :to="{ name: 'CreateDiary', query: { catId: cat.id } }"
                    class="btn btn-primary btn-sm"
                  >
                    📝 写日记
                  </router-link>
                  
                  <div class="action-group">
                    <button 
                      @click="editCat(cat)"
                      class="btn btn-outline btn-sm"
                    >
                      ✏️ 编辑
                    </button>
                    
                    <div class="dropdown" :class="{ open: activeDropdown === cat.id }">
                      <button 
                        @click="toggleDropdown(cat.id)"
                        class="btn btn-ghost btn-sm dropdown-trigger"
                      >
                        ⋮
                      </button>
                      <div class="dropdown-menu">
                        <button 
                          @click="toggleCatStatus(cat)"
                          class="dropdown-item"
                        >
                          📦 归档猫咪
                        </button>
                        <button 
                          @click="deleteCat(cat)"
                          class="dropdown-item danger"
                        >
                          🗑️ 删除档案
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已归档猫咪列表 -->
            <div v-if="showArchivedCats && catsStore.inactiveCats.length > 0" class="archived-section">
              <div class="section-header">
                <h2>已归档猫咪</h2>
                <p class="section-subtitle">这些猫咪档案已被归档，但数据仍然保留</p>
              </div>
              
              <div class="cats-list archived-cats">
                <div 
                  v-for="cat in catsStore.inactiveCats" 
                  :key="cat.id"
                  class="cat-card archived"
                >
                  <div class="cat-header" @click="goToCatProfile(cat.id)">
                    <img 
                      :src="cat.avatar_url || '/images/default-cat-avatar.png'"
                      :alt="cat.name"
                      class="cat-avatar"
                    >
                    <div class="cat-info">
                      <h3 class="cat-name">{{ cat.name }}</h3>
                      <div class="cat-meta">
                        <span v-if="cat.breed" class="cat-breed">{{ cat.breed }}</span>
                        <span v-if="cat.birth_date" class="cat-age">{{ calculateAge(cat.birth_date) }}</span>
                      </div>
                    </div>
                    <div class="card-status archived">
                      <span class="status-dot"></span>
                      已归档
                    </div>
                  </div>

                  <div class="cat-stats">
                    <div class="stat-item">
                      <span class="stat-value">{{ getCatDiaryCount(cat.id) }}</span>
                      <span class="stat-label">篇日记</span>
                    </div>
                  </div>

                  <div class="cat-actions">
                    <button 
                      @click="toggleCatStatus(cat)"
                      class="btn btn-outline btn-sm"
                    >
                      📤 恢复活跃
                    </button>
                    
                    <div class="dropdown" :class="{ open: activeDropdown === cat.id }">
                      <button 
                        @click="toggleDropdown(cat.id)"
                        class="btn btn-ghost btn-sm dropdown-trigger"
                      >
                        ⋮
                      </button>
                      <div class="dropdown-menu">
                        <button 
                          @click="editCat(cat)"
                          class="dropdown-item"
                        >
                          ✏️ 编辑档案
                        </button>
                        <button 
                          @click="deleteCat(cat)"
                          class="dropdown-item danger"
                        >
                          🗑️ 永久删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加猫咪模态框 -->
    <AddCatModal 
      v-if="showAddForm"
      @close="showAddForm = false"
      @added="handleCatAdded"
    />

    <!-- 编辑猫咪模态框 -->
    <EditCatModal 
      v-if="showEditForm && selectedCat"
      :cat="selectedCat"
      @close="showEditForm = false"
      @updated="handleCatUpdated"
    />

    <!-- 确认删除模态框 -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      :title="deleteConfirmData.title"
      :message="deleteConfirmData.message"
      :confirm-text="deleteConfirmData.confirmText"
      :is-danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useCatsStore } from '@/stores/cats'
import { useDiaryStore } from '@/stores/diary'
import { useUserStore } from '@/stores/user'
import UserAuth from '@/components/ui/UserAuth.vue'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'

// 设置页面 meta - 必须在其他任何异步操作之前调用
useHead({
  title: '我的猫咪 - 猫咪世界',
  meta: [
    { name: 'description', content: '管理你的猫咪档案，记录每只猫咪的详细信息和成长历程' },
    { name: 'keywords', content: '猫咪管理,宠物档案,猫咪信息,宠物记录' }
  ]
})

const router = useRouter()
const catsStore = useCatsStore()
const diaryStore = useDiaryStore()
const userStore = useUserStore()

// 响应式状态
const showAddForm = ref(false)
const showEditForm = ref(false)
const showDeleteConfirm = ref(false)
const showArchivedCats = ref(false)
const selectedCat = ref(null)
const activeDropdown = ref(null)
const deleteConfirmData = ref({
  cat: null,
  title: '',
  message: '',
  confirmText: ''
})

// 计算属性
const catDiaryCounts = computed(() => {
  const counts = {}
  if (diaryStore.diaries && Array.isArray(diaryStore.diaries)) {
    diaryStore.diaries.forEach(diary => {
      if (diary.cat_id) {
        counts[diary.cat_id] = (counts[diary.cat_id] || 0) + 1
      }
    })
  }
  return counts
})

// 方法
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

function getCatDiaryCount(catId) {
  return catDiaryCounts.value[catId] || 0
}

function getDaysSinceLastDiary(catId) {
  if (!diaryStore.diaries || !Array.isArray(diaryStore.diaries)) {
    return '从未'
  }
  
  const catDiaries = diaryStore.diaries.filter(diary => diary.cat_id === catId)
  if (catDiaries.length === 0) return '从未'
  
  const latestDiary = catDiaries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  const lastDate = new Date(latestDiary.created_at)
  const today = new Date()
  const diffTime = Math.abs(today - lastDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays === 0 ? '今天' : diffDays
}

function goToCatProfile(catId) {
  router.push(`/cat/${catId}`)
}

function editCat(cat) {
  selectedCat.value = cat
  showEditForm.value = true
  closeDropdown()
}

function deleteCat(cat) {
  deleteConfirmData.value = {
    cat,
    title: '删除猫咪档案',
    message: `确定要删除 ${cat.name} 的档案吗？此操作会永久删除所有相关数据，包括日记记录，且无法恢复。`,
    confirmText: '永久删除'
  }
  showDeleteConfirm.value = true
  closeDropdown()
}

async function toggleCatStatus(cat) {
  try {
    await catsStore.updateCat(cat.id, {
      is_active: !cat.is_active
    })
    
    showSuccessMessage(cat.is_active ? `${cat.name} 已归档` : `${cat.name} 已恢复活跃`)
  } catch (error) {
    console.error('更新猫咪状态失败:', error)
    showErrorMessage('更新状态失败，请重试')
  }
  closeDropdown()
}

async function confirmDelete() {
  const cat = deleteConfirmData.value.cat
  if (!cat) return

  try {
    await catsStore.deleteCat(cat.id)
    showSuccessMessage(`${cat.name} 的档案已删除`)
  } catch (error) {
    console.error('删除猫咪失败:', error)
    showErrorMessage('删除失败，请重试')
  }
  
  showDeleteConfirm.value = false
  deleteConfirmData.value = { cat: null, title: '', message: '', confirmText: '' }
}

function toggleDropdown(catId) {
  activeDropdown.value = activeDropdown.value === catId ? null : catId
}

function closeDropdown() {
  activeDropdown.value = null
}

function handleCatAdded(newCat) {
  showAddForm.value = false
  showSuccessMessage(`${newCat.name} 的档案已创建`)
  
  // 询问是否立即写第一篇日记
  if (confirm(`要为 ${newCat.name} 写第一篇日记吗？`)) {
    router.push({ name: 'CreateDiary', query: { catId: newCat.id } })
  }
}

function handleCatUpdated(updatedCat) {
  showEditForm.value = false
  selectedCat.value = null
  showSuccessMessage(`${updatedCat.name} 的档案已更新`)
}

function showSuccessMessage(message) {
  // 简单的成功提示，可以后续替换为更好的提示组件
  alert(message)
}

function showErrorMessage(message) {
  // 简单的错误提示，可以后续替换为更好的提示组件
  alert(message)
}

// 点击外部关闭下拉菜单
function handleClickOutside(event) {
  if (!event.target.closest('.dropdown')) {
    closeDropdown()
  }
}

// 页面初始化
onMounted(async () => {
  if (!userStore.isLoggedIn) return

  try {
    // 加载用户的猫咪列表
    await catsStore.fetchUserCats(userStore.user.id)
    
    // 加载用户的日记数据以计算统计信息
    await diaryStore.fetchUserDiaries(userStore.user.id)
    
  } catch (error) {
    console.error('初始化猫咪管理页面失败:', error)
  }

  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 静态导入模态框组件
import AddCatModal from '@/components/modals/AddCatModal.vue'
import EditCatModal from '@/components/modals/EditCatModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
</script>

<style scoped>
.cats-management {
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

.page-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: 700;
}

.page-header p {
  color: #64748b;
  text-align: center;
  font-size: 1.1rem;
}

.main-content {
  padding-bottom: 3rem;
}

.login-required {
  display: flex;
  justify-content: center;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 400px;
}

.login-card h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.login-card p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.cats-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cats-count {
  font-weight: 600;
  color: #2c3e50;
}

.inactive-count {
  color: #64748b;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.empty-state h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.cats-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.cats-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.cat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.cat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.cat-card.archived {
  opacity: 0.8;
  background: #f8fafc;
}

.cat-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.cat-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f1f5f9;
}

.cat-info {
  flex: 1;
  min-width: 0;
}

.cat-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.cat-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
}

.cat-breed,
.cat-age {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  white-space: nowrap;
}

.card-status.active {
  background: #dcfce7;
  color: #166534;
}

.card-status.archived {
  background: #f3f4f6;
  color: #4b5563;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.cat-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.cat-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.dropdown {
  position: relative;
}

.dropdown-trigger {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 140px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 10;
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: #4a5568;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item.danger {
  color: #dc2626;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
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

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
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
  padding: 0.5rem;
}

.btn-ghost:hover:not(:disabled) {
  color: #2c3e50;
  background: #f8fafc;
}

.icon {
  font-size: 1em;
}

.archived-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .actions-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .cats-list {
    grid-template-columns: 1fr;
  }
  
  .cat-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .cat-actions {
    justify-content: center;
  }
  
  .dropdown-menu {
    right: auto;
    left: 0;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1rem 0;
  }
  
  .cat-card {
    padding: 1rem;
  }
  
  .cat-stats {
    grid-template-columns: 1fr;
  }
}
</style>