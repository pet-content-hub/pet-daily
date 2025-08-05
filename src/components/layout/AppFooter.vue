<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>猫咪世界致力于分享专业的养猫知识，帮助更多人更好地照顾他们的毛孩子。</p>
      </div>
      
      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><RouterLink to="/about">关于我们</RouterLink></li>
          <li><a href="/sitemap.xml" target="_blank">网站地图</a></li>
          <li><a href="/feed.xml" target="_blank">RSS订阅</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>关注我们</h4>
        <div class="social-links">
          <a href="#" class="social-link">微信</a>
          <a href="#" class="social-link">微博</a>
          <a href="#" class="social-link">小红书</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} 猫咪世界. All rights reserved.</p>
      <p class="tech-info">Built with Vue 3 & Vite</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.site-footer {
  background: var(--text-dark);
  color: #ffffff;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section {
  h4 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  p {
    line-height: 1.6;
    color: #b0b0b0;
    margin-bottom: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 0.5rem;
      
      a {
        color: #b0b0b0;
        text-decoration: none;
        transition: var(--transition);
        
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
}

.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 107, 0.1);
  color: var(--primary-color);
  text-decoration: none;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: var(--transition);
  
  &:hover {
    background: var(--primary-color);
    color: white;
  }
}

.footer-bottom {
  border-top: 1px solid #404040;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  
  p {
    margin: 0.25rem 0;
  }
  
  .tech-info {
    opacity: 0.7;
    font-size: 0.8rem;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .footer-content {
    padding: 2rem 1rem 1rem;
    gap: 1.5rem;
  }
  
  .footer-bottom {
    padding: 1rem;
  }
  
  .social-links {
    justify-content: flex-start;
  }
}
</style>