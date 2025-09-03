import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const nextId = ref(1)

  function addNotification(options) {
    const notification = {
      id: nextId.value++,
      type: options.type || 'info', // 'success', 'error', 'warning', 'info'
      title: options.title || '',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : 4000,
      persistent: options.persistent || false
    }

    notifications.value.push(notification)

    // 自动移除通知（除非设置为永久显示）
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }

    return notification.id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAll() {
    notifications.value = []
  }

  // 便捷方法
  function showSuccess(message, title = '成功') {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 3000
    })
  }

  function showError(message, title = '错误') {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 5000
    })
  }

  function showWarning(message, title = '警告') {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 4000
    })
  }

  function showInfo(message, title = '提示') {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 3000
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})