<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>编辑日记</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="diary-form">
          <!-- 日记标题 -->
          <div class="form-group">
            <label class="form-label">日记标题 *</label>
            <input 
              v-model="form.title"
              type="text"
              required
              placeholder="今天和猫咪做了什么有趣的事情？"
              class="form-input"
            >
          </div>

          <!-- 选择猫咪 -->
          <div class="form-group">
            <label class="form-label">选择猫咪 *</label>
            <select v-model="form.cat_id" required class="form-select">
              <option value="">请选择一只猫咪</option>
              <option 
                v-for="cat in catsStore.activeCats" 
                :key="cat.id" 
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- 心情选择 -->
          <div class="form-group">
            <label class="form-label">今天心情</label>
            <div class="mood-selector">
              <label 
                v-for="mood in moods" 
                :key="mood.value"
                class="mood-option"
                :class="{ active: form.mood === mood.value }"
              >
                <input 
                  type="radio" 
                  :value="mood.value" 
                  v-model="form.mood"
                  class="mood-radio"
                >
                <span class="mood-emoji">{{ mood.emoji }}</span>
                <span class="mood-label">{{ mood.label }}</span>
              </label>
            </div>
          </div>

          <!-- 日记内容 -->
          <div class="form-group">
            <label class="form-label">日记内容 *</label>
            <textarea 
              v-model="form.content"
              required
              placeholder="详细记录今天的故事..."
              class="form-textarea"
              rows="6"
            ></textarea>
          </div>

          <!-- 健康数据 -->
          <div class="form-section">
            <h4 class="section-title">健康记录</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">体重 (kg)</label>
                <input 
                  v-model="form.weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="4.5"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">体温 (°C)</label>
                <input 
                  v-model="form.temperature"
                  type="number"
                  step="0.1"
                  min="35"
                  max="42"
                  placeholder="38.5"
                  class="form-input"
                >
              </div>
            </div>
          </div>

          <!-- 可见性设置 -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="form.is_public"
                type="checkbox"
                class="form-checkbox"
              >
              <span class="checkbox-text">公开分享此日记</span>
            </label>
            <p class="form-hint">
              公开的日记将在日记广场展示，其他用户可以浏览
            </p>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button 
          type="button" 
          @click="$emit('close')"
          class="btn btn-secondary"
        >
          取消
        </button>
        <button 
          @click="handleSubmit"
          :disabled="isSubmitting || !canSubmit"
          class="btn btn-primary"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? '保存中...' : '保存更改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCatsStore } from '@/stores/cats'
import { useDiaryStore } from '@/stores/diary'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const catsStore = useCatsStore()
const diaryStore = useDiaryStore()
const notificationStore = useNotificationStore()

// 响应式状态
const isSubmitting = ref(false)

// 心情选项
const moods = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'playful', label: '活泼', emoji: '😸' },
  { value: 'sleepy', label: '困倦', emoji: '😴' },
  { value: 'curious', label: '好奇', emoji: '🤔' },
  { value: 'calm', label: '平静', emoji: '😌' }
]

// 表单数据
const form = reactive({
  title: '',
  cat_id: '',
  mood: 'happy',
  content: '',
  weight: '',
  temperature: '',
  is_public: false
})

// 计算属性
const canSubmit = computed(() => {
  return form.title.trim().length > 0 && 
         form.cat_id && 
         form.content.trim().length > 0
})

// 方法
function handleOverlayClick() {
  emit('close')
}

async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 准备更新数据
    const updateData = {
      title: form.title.trim(),
      cat_id: form.cat_id,
      mood: form.mood,
      content: form.content.trim(),
      is_public: form.is_public
    }

    // 添加健康数据（如果有）
    if (form.weight) {
      updateData.health_data = {
        ...(props.diary.health_data || {}),
        weight: parseFloat(form.weight)
      }
    }

    if (form.temperature) {
      updateData.health_data = {
        ...(updateData.health_data || {}),
        temperature: parseFloat(form.temperature)
      }
    }

    // 更新日记
    const updatedDiary = await diaryStore.updateDiary(props.diary.id, updateData)

    // 触发更新成功事件
    emit('updated', updatedDiary)

  } catch (error) {
    console.error('更新日记失败:', error)
    showErrorMessage(error.message || '更新日记失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

function showErrorMessage(message) {
  notificationStore.showError(message)
}

// 初始化表单数据
onMounted(() => {
  if (props.diary) {
    form.title = props.diary.title || ''
    form.cat_id = props.diary.cat_id || ''
    form.mood = props.diary.mood || 'happy'
    form.content = props.diary.content || ''
    form.weight = props.diary.health_data?.weight?.toString() || ''
    form.temperature = props.diary.health_data?.temperature?.toString() || ''
    form.is_public = props.diary.is_public !== false
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
  background: rgba(0, 0, 0, 0.5);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
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

.form-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.section-title {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
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
  font-family: inherit;
  line-height: 1.5;
}

.mood-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.mood-option:hover {
  border-color: #ff6b6b;
  background: #fff5f5;
}

.mood-option.active {
  border-color: #ff6b6b;
  background: #fff0f0;
}

.mood-radio {
  display: none;
}

.mood-emoji {
  font-size: 1.5rem;
}

.mood-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a5568;
  text-align: center;
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

.form-hint {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.5rem;
  margin-bottom: 0;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .mood-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>