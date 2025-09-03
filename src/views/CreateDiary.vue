<template>
  <div class="create-diary">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1>📝 写日记</h1>
        <p>记录与猫咪的美好时光</p>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <div class="container">
        <!-- 登录提示 -->
        <div v-if="!userStore.isLoggedIn" class="login-required">
          <div class="login-card">
            <h3>需要登录</h3>
            <p>请先登录后再为你的猫咪写日记</p>
            <UserAuth />
          </div>
        </div>

        <!-- 日记表单 -->
        <form v-else @submit.prevent="handleSubmit" class="diary-form">
          <!-- 猫咪选择 -->
          <div class="form-section">
            <h3>选择猫咪</h3>
            <div v-if="catsStore.isLoading && catsStore.cats.length === 0" class="loading-cats">
              <LoadingIndicator />
              <p>正在加载猫咪列表...</p>
            </div>
            
            <div v-else-if="catsStore.activeCats.length === 0" class="no-cats">
              <div class="no-cats-icon">🐱</div>
              <h4>还没有猫咪档案</h4>
              <p>请先添加你的猫咪信息</p>
              <router-link to="/cats" class="btn btn-primary">
                添加猫咪档案
              </router-link>
            </div>
            
            <div v-else class="cat-selector">
              <div 
                v-for="cat in catsStore.activeCats" 
                :key="cat.id"
                @click="form.cat_id = cat.id"
                :class="{ selected: form.cat_id === cat.id }"
                class="cat-option"
              >
                <img 
                  :src="cat.avatar_url || '/images/default-cat-avatar.png'"
                  :alt="cat.name"
                  class="cat-avatar"
                >
                <span class="cat-name">{{ cat.name }}</span>
              </div>
              
              <router-link to="/cats" class="cat-option add-cat">
                <div class="add-cat-icon">+</div>
                <span class="add-cat-text">添加猫咪</span>
              </router-link>
            </div>
          </div>

          <!-- 表单内容 - 只在选择了猫咪后显示 -->
          <div v-if="form.cat_id" class="form-content">
            <!-- 日记标题 -->
            <div class="form-section">
              <label for="title" class="form-label">今天的标题 *</label>
              <input 
                id="title"
                v-model="form.title" 
                type="text" 
                placeholder="例如：小橘第一次洗澡、今天很开心"
                required
                class="form-input"
              >
            </div>

            <!-- 心情选择 -->
            <div class="form-section">
              <label class="form-label">今天的心情 *</label>
              <div class="mood-selector">
                <button 
                  type="button"
                  v-for="mood in moodOptions" 
                  :key="mood.value"
                  @click="form.mood = mood.value"
                  :class="{ selected: form.mood === mood.value }"
                  class="mood-btn"
                >
                  <span class="mood-emoji">{{ mood.emoji }}</span>
                  <span class="mood-label">{{ mood.label }}</span>
                </button>
              </div>
            </div>

            <!-- 健康指标 -->
            <div class="form-section">
              <label class="form-label">健康指标 (可选)</label>
              <div class="health-metrics">
                <div class="metrics-grid">
                  <div class="metric-item">
                    <label for="weight">体重 (kg)</label>
                    <input 
                      id="weight"
                      v-model="form.weight" 
                      type="number" 
                      step="0.1"
                      placeholder="例如：4.5"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="metric-item">
                    <label for="temperature">体温 (°C)</label>
                    <input 
                      id="temperature"
                      v-model="form.temperature" 
                      type="number" 
                      step="0.1"
                      placeholder="例如：38.5"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="metric-item">
                    <label for="food_amount">食欲</label>
                    <select 
                      id="food_amount"
                      v-model="form.food_amount" 
                      class="form-select"
                    >
                      <option value="">选择食欲状况</option>
                      <option value="poor">食欲不振</option>
                      <option value="normal">正常</option>
                      <option value="good">食欲旺盛</option>
                    </select>
                  </div>
                  
                  <div class="metric-item">
                    <label for="water_amount">饮水</label>
                    <input 
                      id="water_amount"
                      v-model="form.water_amount" 
                      type="text"
                      placeholder="例如：正常、偏少、较多"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="metric-item">
                    <label for="litter_box_times">如厕次数</label>
                    <input 
                      id="litter_box_times"
                      v-model="form.litter_box_times" 
                      type="number"
                      placeholder="例如：3"
                      class="form-input"
                    >
                  </div>
                  
                  <div class="metric-item">
                    <label for="activity_level">活跃度</label>
                    <select 
                      id="activity_level"
                      v-model="form.activity_level" 
                      class="form-select"
                    >
                      <option value="">选择活跃度</option>
                      <option value="low">较低</option>
                      <option value="medium">正常</option>
                      <option value="high">活跃</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 日记内容 -->
            <div class="form-section">
              <label for="content" class="form-label">记录今天 *</label>
              <textarea 
                id="content"
                v-model="form.content"
                rows="8"
                placeholder="记录今天与猫咪的美好时光，可以写下：
• 猫咪今天做了什么有趣的事情
• 健康状况和行为变化
• 一起度过的温馨时刻
• 需要注意的问题或担忧
• 任何想要记住的小细节..."
                required
                class="form-textarea"
              ></textarea>
              <div class="character-count">
                {{ form.content.length }} / 2000 字
              </div>
            </div>

            <!-- 图片上传 -->
            <div class="form-section">
              <label class="form-label">添加照片</label>
              <div class="image-upload-section">
                <ImageUpload 
                  ref="imageUploadRef"
                  @files-selected="handleFilesSelected"
                  :multiple="true"
                  :max-files="9"
                  :preview="true"
                />
                <p class="upload-hint">
                  最多可上传9张照片，支持 JPG、PNG、GIF 格式，单张图片不超过5MB
                </p>
              </div>
            </div>

            <!-- 隐私设置 -->
            <div class="form-section">
              <div class="privacy-settings">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="form.is_private"
                    class="form-checkbox"
                  >
                  <span class="checkbox-text">
                    设为私密日记 (只有自己可见)
                  </span>
                </label>
                <p class="privacy-hint">
                  {{ form.is_private ? '这篇日记只有你可以看到' : '这篇日记将公开显示在时间轴上' }}
                </p>
              </div>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                type="button" 
                @click="saveDraft" 
                :disabled="isSubmitting || !canSave"
                class="btn btn-secondary"
              >
                <span v-if="isSavingDraft" class="loading-spinner"></span>
                {{ isSavingDraft ? '保存中...' : '保存草稿' }}
              </button>
              
              <button 
                type="submit" 
                :disabled="isSubmitting || !canSubmit"
                class="btn btn-primary btn-large"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? '发布中...' : '发布日记' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useDiaryStore } from '@/stores/diary'
import { useCatsStore } from '@/stores/cats'
import { useUserStore } from '@/stores/user'
import UserAuth from '@/components/ui/UserAuth.vue'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const route = useRoute()
const diaryStore = useDiaryStore()
const catsStore = useCatsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 响应式状态
const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const selectedFiles = ref([])
const imageUploadRef = ref(null)

// 表单数据
const form = reactive({
  cat_id: '',
  title: '',
  content: '',
  mood: 'happy',
  weight: '',
  temperature: '',
  food_amount: '',
  water_amount: '',
  litter_box_times: '',
  activity_level: '',
  is_private: false
})

// 心情选项
const moodOptions = [
  { value: 'happy', emoji: '😸', label: '开心' },
  { value: 'normal', emoji: '😐', label: '正常' },
  { value: 'worried', emoji: '😰', label: '担心' },
  { value: 'sick', emoji: '🤒', label: '生病' }
]

// 计算属性
const canSave = computed(() => {
  return form.cat_id && (form.title.trim() || form.content.trim())
})

const canSubmit = computed(() => {
  return form.cat_id && 
         form.title.trim() && 
         form.content.trim() && 
         form.mood &&
         form.content.length <= 2000
})

// 设置页面 meta
useHead({
  title: '写日记 - 猫咪世界',
  meta: [
    { name: 'description', content: '记录今天与猫咪的美好时光，上传照片，记录健康数据' },
    { name: 'keywords', content: '猫咪日记,写日记,宠物记录,养猫心得' }
  ]
})

// 方法
function handleFilesSelected(files) {
  selectedFiles.value = files
}

async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 准备日记数据
    const diaryData = {
      user_id: userStore.user.id,
      cat_id: form.cat_id,
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      is_private: form.is_private
    }

    // 添加健康数据（如果填写了）
    if (form.weight) diaryData.weight = parseFloat(form.weight)
    if (form.temperature) diaryData.temperature = parseFloat(form.temperature)
    if (form.food_amount) diaryData.food_amount = form.food_amount
    if (form.water_amount) diaryData.water_amount = form.water_amount
    if (form.litter_box_times) diaryData.litter_box_times = parseInt(form.litter_box_times)
    if (form.activity_level) diaryData.activity_level = form.activity_level

    // 创建日记
    const newDiary = await diaryStore.createDiary(diaryData)

    // 如果有图片，上传图片
    if (selectedFiles.value.length > 0) {
      await diaryStore.uploadDiaryImages(selectedFiles.value, newDiary.id)
    }

    // 成功提示
    showSuccessMessage()

    // 跳转到日记详情页
    router.push(`/diary/${newDiary.id}`)

  } catch (error) {
    console.error('发布日记失败:', error)
    showErrorMessage(error.message || '发布日记失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

async function saveDraft() {
  if (!canSave.value || isSavingDraft.value) return

  try {
    isSavingDraft.value = true

    // 保存草稿到本地存储
    const draftData = {
      ...form,
      selectedFiles: selectedFiles.value.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      timestamp: new Date().toISOString()
    }

    localStorage.setItem('diary-draft', JSON.stringify(draftData))
    
    showSuccessMessage('草稿已保存')

  } catch (error) {
    console.error('保存草稿失败:', error)
    showErrorMessage('保存草稿失败')
  } finally {
    isSavingDraft.value = false
  }
}

function loadDraft() {
  try {
    const draftData = localStorage.getItem('diary-draft')
    if (draftData) {
      const draft = JSON.parse(draftData)
      
      // 恢复表单数据
      Object.keys(form).forEach(key => {
        if (draft[key] !== undefined && draft[key] !== '') {
          form[key] = draft[key]
        }
      })

      console.log('草稿已加载')
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
}

function clearDraft() {
  localStorage.removeItem('diary-draft')
}

function resetForm() {
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'boolean') {
      form[key] = false
    } else if (typeof form[key] === 'string') {
      form[key] = ''
    }
  })
  
  form.mood = 'happy' // 重置为默认心情
  selectedFiles.value = []
  
  if (imageUploadRef.value) {
    imageUploadRef.value.clearFiles()
  }
}

function showSuccessMessage(message = '操作成功') {
  notificationStore.showSuccess(message)
}

function showErrorMessage(message) {
  notificationStore.showError(message)
}

// 监听路由参数，如果指定了猫咪ID则自动选择
watch(() => route.query.catId, (catId) => {
  if (catId && catsStore.cats.length > 0) {
    const cat = catsStore.cats.find(c => c.id === catId)
    if (cat) {
      form.cat_id = catId
    }
  }
}, { immediate: true })

// 页面初始化
onMounted(async () => {
  // 确保用户已登录
  if (!userStore.isLoggedIn) {
    return
  }

  try {
    // 加载用户的猫咪列表
    await catsStore.fetchUserCats(userStore.user.id)

    // 如果URL中指定了猫咪ID，自动选择该猫咪
    if (route.query.catId) {
      const cat = catsStore.cats.find(c => c.id === route.query.catId)
      if (cat) {
        form.cat_id = route.query.catId
      }
    }

    // 加载草稿
    loadDraft()

  } catch (error) {
    console.error('初始化页面失败:', error)
  }
})

// 页面离开前的提醒
window.addEventListener('beforeunload', (event) => {
  if (canSave.value && !isSubmitting.value) {
    event.preventDefault()
    event.returnValue = '你有未保存的日记内容，确定要离开吗？'
  }
})

// 组件卸载时清理事件监听器
import { onUnmounted } from 'vue'

onUnmounted(() => {
  window.removeEventListener('beforeunload', () => {})
})
</script>

<style scoped>
.create-diary {
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
  max-width: 800px;
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

.diary-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.form-label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.loading-cats {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-cats {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.no-cats-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-cats h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-cats p {
  margin-bottom: 1.5rem;
}

.cat-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.cat-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #4a5568;
}

.cat-option:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
}

.cat-option.selected {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.cat-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
  border: 2px solid #f1f5f9;
}

.cat-name {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.add-cat {
  border-style: dashed;
  color: #64748b;
}

.add-cat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
  font-size: 2rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.add-cat-text {
  font-size: 0.9rem;
}

.form-content {
  border-top: 1px solid #f1f5f9;
  padding-top: 2rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.form-textarea {
  resize: vertical;
  line-height: 1.6;
  font-family: inherit;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.mood-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-btn:hover {
  border-color: #ff6b6b;
  transform: translateY(-1px);
}

.mood-btn.selected {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.mood-emoji {
  font-size: 2rem;
}

.mood-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
}

.health-metrics {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-item label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.image-upload-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.upload-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.privacy-settings {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #ff6b6b;
}

.privacy-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
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
  transform: translateY(-1px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
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

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .diary-form {
    padding: 1rem;
  }
  
  .cat-selector {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .mood-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>