<template>
  <div class="about-page">
    <article class="article-page">
      <header class="article-header">
        <h1>关于猫咪世界</h1>
        <p class="subtitle">
          专业的养猫知识分享平台 🐾
        </p>
      </header>

      <div class="article-body">
        <section>
          <h2>🌟 我们的使命</h2>
          <p>猫咪世界创立于2025年，我们的使命是为广大铲屎官提供最专业、最实用的养猫知识。我们相信，每一只猫咪都值得最好的照顾，每一位铲屎官都应该成为更专业的猫奴。</p>
        </section>

        <section>
          <h2>👥 专业团队</h2>
          <p>我们的内容团队由以下专业人士组成：</p>
          <ul>
            <li><strong>宠物医生</strong> - 提供健康护理专业指导</li>
            <li><strong>动物行为学专家</strong> - 解读猫咪行为心理</li>
            <li><strong>资深铲屎官</strong> - 分享实战养猫经验</li>
            <li><strong>宠物营养师</strong> - 制定科学喂养方案</li>
          </ul>
        </section>

        <section>
          <h2>📚 内容特色</h2>
          <div class="features-grid">
            <div class="feature-card">
              <h3>🐱 新手友好</h3>
              <p>从零开始的养猫指南，帮助新手快速上手</p>
            </div>
            <div class="feature-card">
              <h3>🔬 科学严谨</h3>
              <p>基于科学研究的专业知识，拒绝民间偏方</p>
            </div>
            <div class="feature-card">
              <h3>💡 实用性强</h3>
              <p>注重实战应用，解决养猫中的实际问题</p>
            </div>
          </div>
        </section>

        <section>
          <h2>🎯 主要内容领域</h2>
          <ul>
            <li><strong>品种介绍</strong> - 详细介绍各种猫咪品种的特点和护理要求</li>
            <li><strong>健康护理</strong> - 疾病预防、日常护理、疫苗接种等医疗知识</li>
            <li><strong>营养喂养</strong> - 科学的猫粮选择和喂养方案</li>
            <li><strong>行为训练</strong> - 猫咪行为解读和日常训练技巧</li>
            <li><strong>用品测评</strong> - 客观评测各类猫咪用品的性价比</li>
            <li><strong>生活技巧</strong> - 实用的日常养猫小窍门和经验分享</li>
          </ul>
        </section>

        <section>
          <h2>🔄 更新频率</h2>
          <p>我们承诺每日更新优质内容，确保铲屎官们能够持续获得最新、最有用的养猫知识。我们的AI辅助系统会根据用户需求和行业趋势，智能生成相关主题内容。</p>
        </section>

        <section>
          <h2>📞 联系我们</h2>
          <p>如果您有任何问题、建议或想要投稿，欢迎通过以下方式联系我们：</p>
          <ul>
            <li><strong>邮箱</strong>: contact@mao.com.cn</li>
            <li><strong>RSS订阅</strong>: <a href="/feed.xml" target="_blank">获取最新文章</a></li>
            <li><strong>网站地图</strong>: <a href="/sitemap.xml" target="_blank">查看所有内容</a></li>
          </ul>
        </section>

        <section class="cta-section">
          <h2>💝 感谢您的支持</h2>
          <p>猫咪世界的成长离不开每一位铲屎官的支持和信任。让我们一起为猫咪们创造更美好的生活！</p>
          <RouterLink to="/" class="cta-button">
            🏠 返回首页继续阅读
          </RouterLink>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'

// SEO配置
useHead({
  title: '关于我们',
  meta: [
    { name: 'description', content: '了解猫咪世界的创立初衷和专业团队，我们致力于为广大铲屎官提供最优质的养猫知识' },
    { name: 'keywords', content: '关于猫咪世界,养猫专家,宠物护理,猫咪知识,铲屎官' },
    { property: 'og:title', content: '关于我们 - 猫咪世界' },
    { property: 'og:description', content: '了解猫咪世界的创立初衷和专业团队，我们致力于为广大铲屎官提供最优质的养猫知识' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.mao.com.cn/about' }
  ]
})
</script>

<style lang="scss" scoped>
.about-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.article-page {
  background: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.article-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
}

.article-body {
  padding: 3rem 2rem;
  
  section {
    margin-bottom: 3rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h2 {
      color: var(--text-dark);
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 0.5rem;
    }
    
    p {
      line-height: 1.8;
      color: var(--text-dark);
      margin-bottom: 1.5rem;
    }
    
    ul {
      margin-left: 1.5rem;
      
      li {
        margin-bottom: 0.8rem;
        line-height: 1.6;
        color: var(--text-dark);
        
        strong {
          color: var(--primary-color);
        }
      }
    }
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      transition: var(--transition);
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.feature-card {
  background: var(--bg-light);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
  
  h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-dark);
    line-height: 1.6;
  }
}

.cta-section {
  background: var(--bg-light);
  padding: 2rem;
  border-radius: var(--border-radius);
  text-align: center;
  
  h2 {
    color: var(--primary-color);
    border: none;
    padding-bottom: 0;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
}

.cta-button {
  display: inline-block;
  background: var(--primary-color);
  color: white !important;
  padding: 1rem 2rem;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: bold;
  transition: var(--transition);
  
  &:hover {
    background: darken(#ff6b6b, 10%);
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .about-page {
    padding: 0 1rem;
  }
  
  .article-header {
    padding: 2rem 1rem;
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .article-body {
    padding: 2rem 1rem;
    
    section h2 {
      font-size: 1.5rem;
    }
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .feature-card {
    padding: 1rem;
  }
}
</style>