<template>
  <div class="upload-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>图片上传</h1>
        <p class="page-description">
          上传和管理您的图片，支持多种格式，安全可靠的云存储
        </p>
      </div>

      <!-- 用户认证组件 -->
      <div class="auth-section">
        <h2>用户登录</h2>
        <UserAuth />
      </div>

      <!-- 图片上传组件 -->
      <div class="upload-section">
        <h2>图片上传</h2>
        <ImageUpload />
      </div>

      <!-- 使用说明 -->
      <div class="instructions">
        <h3>使用说明</h3>
        <div class="instruction-grid">
          <div class="instruction-item">
            <div class="instruction-icon">🔐</div>
            <h4>登录认证</h4>
            <p>使用匿名登录或微信登录来开始上传图片</p>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-icon">📁</div>
            <h4>上传图片</h4>
            <p>支持拖拽或点击选择多张图片，格式：JPEG、PNG、GIF、WebP</p>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-icon">☁️</div>
            <h4>云端存储</h4>
            <p>图片安全存储在腾讯云，单个文件最大 5MB</p>
          </div>
          
          <div class="instruction-item">
            <div class="instruction-icon">🔗</div>
            <h4>链接分享</h4>
            <p>上传成功后可复制链接、预览图片或删除文件</p>
          </div>
        </div>
      </div>

      <!-- 技术信息 -->
      <div class="tech-info">
        <h3>技术特性</h3>
        <ul>
          <li>✅ 腾讯云 CloudBase 云存储</li>
          <li>✅ 支持多文件并发上传</li>
          <li>✅ 实时上传进度显示</li>
          <li>✅ 图片预览和链接复制</li>
          <li>✅ 安全的用户认证</li>
          <li>✅ 移动端适配</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import UserAuth from '@/components/ui/UserAuth.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'

// 设置页面 meta 信息
useHead({
  title: '图片上传 - 猫咪世界',
  meta: [
    { name: 'description', content: '安全便捷的图片上传服务，支持多种格式，腾讯云存储，实时预览和分享' },
    { name: 'keywords', content: '图片上传,云存储,腾讯云,CloudBase,图片分享' },
    { property: 'og:title', content: '图片上传 - 猫咪世界' },
    { property: 'og:description', content: '安全便捷的图片上传服务，支持多种格式，腾讯云存储' },
    { property: 'og:type', content: 'website' }
  ]
})
</script>

<style scoped>
.upload-page {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 700;
}

.page-description {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.auth-section,
.upload-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.auth-section h2,
.upload-section h2 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.instructions {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.instructions h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.instruction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.instruction-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.instruction-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.instruction-item h4 {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.instruction-item p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.tech-info {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.tech-info h3 {
  color: #2c3e50;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.tech-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tech-info li {
  padding: 0.5rem 0;
  color: #4a5568;
  font-size: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.tech-info li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .upload-page {
    padding: 1rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .auth-section,
  .upload-section,
  .instructions,
  .tech-info {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .instruction-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .instruction-item {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .auth-section,
  .upload-section,
  .instructions,
  .tech-info {
    padding: 1rem;
  }
}
</style>