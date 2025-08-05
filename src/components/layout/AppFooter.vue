<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>猫咪世界社区</h4>
        <p>我们致力于分享专业的养猫知识，帮助更多人更好地照顾他们的毛孩子。</p>
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
      <p><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备19004658号</a></p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<!-- 移除 scoped 样式，使用全局样式 -->