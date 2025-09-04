<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>添加猫咪档案</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="cat-form">
          <!-- 猫咪头像 -->
          <div class="form-section">
            <label class="form-label">猫咪头像</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img 
                  v-if="form.avatar_url || avatarPreview"
                  :src="avatarPreview || form.avatar_url"
                  alt="猫咪头像"
                  class="avatar-image"
                >
                <div v-else class="avatar-placeholder">
                  <span class="avatar-icon">🐱</span>
                  <span class="avatar-text">添加照片</span>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="avatar-input"
              >
              <button 
                type="button"
                @click="$refs.avatarInput.click()"
                class="btn btn-outline btn-sm"
              >
                选择照片
              </button>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">姓名 *</label>
                <input 
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="例如：小橘"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">品种</label>
                <input 
                  v-model="form.breed"
                  type="text"
                  placeholder="例如：橘猫、英短"
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">性别</label>
                <select v-model="form.gender" class="form-select">
                  <option value="">请选择</option>
                  <option value="male">公猫 ♂</option>
                  <option value="female">母猫 ♀</option>
                  <option value="unknown">未知</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">出生日期</label>
                <input 
                  v-model="form.birth_date"
                  type="date"
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">毛色</label>
                <input 
                  v-model="form.color"
                  type="text"
                  placeholder="例如：橘色、三花"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">体重 (kg)</label>
                <input 
                  v-model="form.weight"
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  placeholder="例如：4.5"
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">芯片ID</label>
              <input 
                v-model="form.microchip_id"
                type="text"
                placeholder="宠物芯片识别码"
                class="form-input"
              >
            </div>
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
          {{ isSubmitting ? '添加中...' : '添加猫咪' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCatsStore } from '@/stores/cats'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const emit = defineEmits(['close', 'added'])

const catsStore = useCatsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 响应式状态
const isSubmitting = ref(false)
const avatarPreview = ref(null)
const selectedAvatarFile = ref(null)

// 表单数据
const form = reactive({
  name: '',
  breed: '',
  gender: '',
  birth_date: '',
  color: '',
  weight: '',
  microchip_id: '',
  avatar_url: ''
})

// 计算属性
const canSubmit = computed(() => {
  return form.name.trim().length > 0
})

// 方法
function handleOverlayClick() {
  emit('close')
}

function handleAvatarChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedAvatarFile.value = file
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 准备猫咪数据
    const catData = {
      user_id: userStore.user.id,
      name: form.name.trim(),
      breed: form.breed.trim() || null,
      gender: form.gender || null,
      birth_date: form.birth_date || null,
      color: form.color.trim() || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      microchip_id: form.microchip_id.trim() || null,
      is_active: true
    }

    // 创建猫咪档案
    const newCat = await catsStore.createCat(catData)

    // 如果有头像文件，上传头像
    if (selectedAvatarFile.value && newCat) {
      try {
        const updatedCat = await catsStore.uploadCatAvatar(newCat.id, selectedAvatarFile.value)
        // 触发添加成功事件（带 avatar_url）
        emit('added', updatedCat)
        return
      } catch (avatarError) {
        console.warn('头像上传失败:', avatarError)
        // 头像上传失败不影响整体创建过程
      }
    }

    // 无头像或上传失败时回退为原对象
    emit('added', newCat)

  } catch (error) {
    console.error('添加猫咪失败:', error)
    showErrorMessage(error.message || '添加猫咪失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

function showErrorMessage(message) {
  notificationStore.showError(message)
}
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
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
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

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f8fafc;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.avatar-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.avatar-text {
  font-size: 0.75rem;
  color: #64748b;
}

.avatar-input {
  display: none;
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

.btn-sm {
  padding: 0.5rem 0.75rem;
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

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover:not(:disabled) {
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
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>