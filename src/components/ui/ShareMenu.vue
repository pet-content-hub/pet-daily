<template>
  <div class="share-menu" v-if="isVisible" @click="closeMenu">
    <div class="share-overlay"></div>
    <div class="share-content" @click.stop>
      <div class="share-header">
        <h3>分享文章</h3>
        <button class="close-btn" @click="closeMenu">×</button>
      </div>
      
      <div class="share-options">
        <button class="share-option wechat" @click="shareToWeChat">
          <span class="icon">💬</span>
          <span class="label">微信</span>
        </button>
        
        <button class="share-option weibo" @click="shareToWeibo">
          <span class="icon">📱</span>
          <span class="label">微博</span>
        </button>
        
        <button class="share-option copy" @click="copyLink">
          <span class="icon">📋</span>
          <span class="label">复制链接</span>
        </button>
        
        <button class="share-option native" @click="nativeShare" v-if="supportsNativeShare">
          <span class="icon">📤</span>
          <span class="label">系统分享</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const supportsNativeShare = computed(() => {
  return navigator.share !== undefined
})

function closeMenu() {
  emit('close')
}

function shareToWeChat() {
  const articleUrl = window.location.href
  const title = props.article.title
  const description = props.article.excerpt
  
  const shareText = `${title}\n\n${description}\n\n阅读全文：${articleUrl}`
  
  // 检测是否在微信浏览器中
  const isWeixin = /micromessenger/i.test(navigator.userAgent)
  
  if (isWeixin && typeof WeixinJSBridge !== 'undefined') {
    // 在微信中，使用微信分享API
    WeixinJSBridge.invoke('shareTimeline', {
      title: title,
      desc: description,
      link: articleUrl,
      imgUrl: 'https://www.mao.com.cn/assets/images/logo.png'
    })
    showToast('正在分享到微信...')
  } else {
    // 不在微信中，复制到剪贴板
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('微信分享内容已复制到剪贴板！请在微信中粘贴分享。')
    }).catch(() => {
      showToast('请手动复制链接到微信分享')
    })
  }
  
  closeMenu()
}

function shareToWeibo() {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(props.article.title)
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`
  
  window.open(weiboUrl, '_blank')
  closeMenu()
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast('链接已复制到剪贴板！')
  }).catch(() => {
    showToast('复制失败，请手动复制')
  })
  
  closeMenu()
}

function nativeShare() {
  if (navigator.share) {
    navigator.share({
      title: props.article.title,
      text: props.article.excerpt,
      url: window.location.href
    }).catch(error => {
      console.log('分享失败:', error)
      showToast('分享失败，请尝试其他方式')
    })
  }
  
  closeMenu()
}

function showToast(message) {
  // 简单的toast提示
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    document.body.removeChild(toast)
  }, 2000)
}
</script>

<style lang="scss" scoped>
.share-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  /* 移除 backdrop-filter，避免立即模糊 */
}

.share-content {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.share-overlay {
  animation: fadeIn 0.2s ease-out;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-dark);
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f5f5f5;
      color: #666;
    }
  }
}

.share-options {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  border: none;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-dark);
  }
  
  &.wechat {
    background: linear-gradient(135deg, #07c160, #06ad56);
    color: white;
    
    .label {
      color: white;
    }
    
    &:hover {
      background: linear-gradient(135deg, #06ad56, #059a4b);
    }
  }
  
  &.weibo {
    background: linear-gradient(135deg, #e6162d, #c41230);
    color: white;
    
    .label {
      color: white;
    }
    
    &:hover {
      background: linear-gradient(135deg, #c41230, #a30f28);
    }
  }
  
  &.copy {
    background: linear-gradient(135deg, #6c757d, #5a6268);
    color: white;
    
    .label {
      color: white;
    }
    
    &:hover {
      background: linear-gradient(135deg, #5a6268, #495057);
    }
  }
  
  &.native {
    background: linear-gradient(135deg, var(--primary-color), #e55a5a);
    color: white;
    
    .label {
      color: white;
    }
    
    &:hover {
      background: linear-gradient(135deg, #e55a5a, #d44a4a);
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  z-index: 1001;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  20%, 80% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 480px) {
  .share-content {
    width: 95%;
    margin: 0 10px;
  }
  
  .share-options {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .share-option {
    padding: 1rem;
    
    .icon {
      font-size: 1.5rem;
    }
  }
}
</style> 