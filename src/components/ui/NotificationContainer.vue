<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div" class="notifications-list">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          :class="[
            'notification',
            `notification-${notification.type}`
          ]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification-icon">
            <span v-if="notification.type === 'success'">✓</span>
            <span v-else-if="notification.type === 'error'">✕</span>
            <span v-else-if="notification.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </div>
          
          <div class="notification-content">
            <div v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
          </div>
          
          <button
            class="notification-close"
            @click.stop="removeNotification(notification.id)"
            aria-label="关闭通知"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

function removeNotification(id) {
  notificationStore.removeNotification(id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 400px;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.notification-error {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.notification-warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.notification-info {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  color: white;
}

.notification-success .notification-icon {
  background: #10b981;
}

.notification-error .notification-icon {
  background: #ef4444;
}

.notification-warning .notification-icon {
  background: #f59e0b;
}

.notification-info .notification-icon {
  background: #3b82f6;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.notification-message {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.4;
  word-break: break-word;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification {
    max-width: none;
  }
}
</style>