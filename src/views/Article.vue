<template>
  <div class="article-page">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载文章中...</p>
    </div>
    
    <!-- 文章内容 -->
    <article v-else-if="article" class="article-content">
      <header class="article-header">
        <div class="article-meta">
          <span class="article-category">
            <RouterLink :to="`/categories/${encodeURIComponent(article.category)}`">
              {{ article.category }}
            </RouterLink>
          </span>
          <div class="article-info">
            <span class="article-date">📅 {{ formatDate(article.date) }}</span>
            <span class="read-time">⏱️ {{ article.readTime }}</span>
          </div>
        </div>
        
        <h1>{{ article.title }}</h1>
        
        <div class="article-excerpt">
          {{ article.excerpt }}
        </div>
        
        <div class="article-icon">
          {{ article.icon || '🐱' }}
        </div>
      </header>
      
      <div class="article-body">
        <div v-if="articleContent" v-html="articleContent"></div>
        <div v-else class="placeholder-content">
          <p>{{ article.excerpt }}</p>
          <p>这是一篇关于{{ article.category }}的专业文章。我们会持续为您提供高质量的养猫知识内容。</p>
          <p>如果您对此文章有任何疑问或建议，欢迎通过我们的联系方式与我们沟通。</p>
        </div>
      </div>
      
      <footer class="article-footer">
        <div class="article-tags">
          <span class="tag">{{ article.category }}</span>
          <span class="tag">养猫知识</span>
          <span class="tag">宠物护理</span>
        </div>
        
        <div class="article-actions">
          <button @click="openShareMenu" class="share-btn">
            📤 分享文章
          </button>
          <RouterLink to="/" class="back-btn">
            🏠 返回首页
          </RouterLink>
        </div>
      </footer>
    </article>
    
    <!-- 文章未找到 -->
    <div v-else class="not-found">
      <h2>文章未找到</h2>
      <p>抱歉，您要查看的文章不存在或已被删除。</p>
      <RouterLink to="/" class="back-btn">🏠 返回首页</RouterLink>
    </div>
    
    <!-- 相关文章推荐 -->
    <section v-if="relatedArticles.length > 0" class="related-articles">
      <h3>相关文章推荐</h3>
      <div class="related-grid">
        <ArticleCard
          v-for="relatedArticle in relatedArticles"
          :key="relatedArticle.slug"
          :article="relatedArticle"
        />
      </div>
    </section>
    
    <!-- 分享菜单 -->
    <ShareMenu 
      :article="article" 
      :is-visible="showShareMenu" 
      @close="closeShareMenu"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useArticlesStore } from '@/stores/articles'
import { useAppStore } from '@/stores/app'
import ArticleCard from '@/components/ui/ArticleCard.vue'
import ShareMenu from '@/components/ui/ShareMenu.vue'

const route = useRoute()
const articlesStore = useArticlesStore()
const appStore = useAppStore()

// 响应式数据
const isLoading = ref(true)
const article = ref(null)
const articleContent = ref('')
const showShareMenu = ref(false)

// 计算属性
const relatedArticles = computed(() => {
  if (!article.value) return []
  
  return articlesStore.articles
    .filter(a => a.slug !== article.value.slug && a.category === article.value.category)
    .slice(0, 3)
})

// 动态SEO配置
const seoMeta = computed(() => {
  if (!article.value) {
    return {
      title: '文章详情',
      description: '阅读专业的养猫知识文章'
    }
  }
  
  return {
    title: article.value.title,
    description: article.value.excerpt,
    keywords: `${article.value.category},猫咪,养猫,宠物护理`,
    ogTitle: `${article.value.title} - 猫咪世界`,
    ogDescription: article.value.excerpt,
    ogUrl: `https://www.mao.com.cn/#/stories/${article.value.slug}`
  }
})

// 使用动态SEO
useHead(() => ({
  title: seoMeta.value.title,
  meta: [
    { name: 'description', content: seoMeta.value.description },
    { name: 'keywords', content: seoMeta.value.keywords },
    { property: 'og:title', content: seoMeta.value.ogTitle },
    { property: 'og:description', content: seoMeta.value.ogDescription },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: seoMeta.value.ogUrl },
    { property: 'og:image', content: 'https://www.mao.com.cn/assets/images/logo.png' },
    { property: 'og:site_name', content: '猫咪世界' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoMeta.value.ogTitle },
    { name: 'twitter:description', content: seoMeta.value.ogDescription },
    { name: 'twitter:image', content: 'https://www.mao.com.cn/assets/images/logo.png' },
    // 微信分享专用meta标签
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    // 微信专用标签
    { itemprop: 'name', content: '猫咪世界 - 最全养猫知识' },
    { itemprop: 'image', content: 'https://www.mao.com.cn/assets/images/logo.png' }
  ]
}))

// 方法
function formatDate(dateString) {
  return articlesStore.formatDate(dateString)
}

async function loadArticle(slug) {
  isLoading.value = true
  
  try {
    // 确保文章数据已加载
    if (articlesStore.articles.length === 0) {
      await articlesStore.loadArticles()
    }
    
    // 从store中获取文章
    const foundArticle = articlesStore.getArticleBySlug(slug)
    
    if (foundArticle) {
      article.value = foundArticle
      
      // 尝试加载完整的文章内容
      try {
        const response = await fetch(`${appStore.basePath}/articles/${slug}.html`)
        if (response.ok) {
          const html = await response.text()
          // 简单的HTML内容提取（在实际项目中可能需要更复杂的处理）
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          const content = doc.querySelector('.article-body') || doc.querySelector('main') || doc.body
          if (content) {
            articleContent.value = content.innerHTML
          }
        }
      } catch (error) {
        console.log('无法加载完整文章内容，使用摘要')
      }
    } else {
      // 如果文章不存在，尝试从静态文件加载
      try {
        const response = await fetch(`${appStore.basePath}/articles/${slug}.html`)
        if (response.ok) {
          const html = await response.text()
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')
          
          // 从HTML中提取文章信息
          const title = doc.querySelector('h1')?.textContent || '文章详情'
          const excerpt = doc.querySelector('meta[name="description"]')?.content || '专业的养猫知识文章'
          const category = doc.querySelector('.article-category')?.textContent || '养猫知识'
          
          article.value = {
            slug,
            title,
            excerpt,
            category,
            date: new Date().toISOString().split('T')[0],
            readTime: '5分钟',
            icon: '🐱'
          }
          
          const content = doc.querySelector('.article-body') || doc.querySelector('main') || doc.body
          if (content) {
            articleContent.value = content.innerHTML
          }
        } else {
          article.value = null
        }
      } catch (error) {
        console.log('无法加载文章:', error)
        article.value = null
      }
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    article.value = null
  } finally {
    isLoading.value = false
  }
}

function openShareMenu() {
  if (!article.value) {
    alert('文章信息未加载完成')
    return
  }
  showShareMenu.value = true
}

function closeShareMenu() {
  showShareMenu.value = false
}

function fallbackShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    alert('文章链接已复制到剪贴板！')
  }).catch(() => {
    // 如果剪贴板API也不可用，显示链接
    prompt('请复制以下链接进行分享：', url)
  })
}



// 监听路由变化
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    loadArticle(newSlug)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (route.params.slug) {
    loadArticle(route.params.slug)
  }
})
</script>

<style lang="scss" scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 0;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-light);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  p {
    color: var(--text-light);
  }
}

.article-content {
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
  position: relative;
  
  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .article-category a {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--transition);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  .article-info {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
  }
  
  .article-excerpt {
    font-size: 1.1rem;
    opacity: 0.9;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
  
  .article-icon {
    font-size: 4rem;
    margin-top: 1rem;
  }
}

.article-body {
  padding: 3rem 2rem;
  line-height: 1.8;
  color: var(--text-dark);
  
  :deep(h2) {
    color: var(--text-dark);
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-color);
  }
  
  :deep(h3) {
    color: var(--text-dark);
    margin: 1.5rem 0 1rem;
  }
  
  :deep(p) {
    margin-bottom: 1.5rem;
  }
  
  :deep(ul), :deep(ol) {
    margin: 1.5rem 0;
    padding-left: 2rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
  
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .placeholder-content {
    p {
      margin-bottom: 1.5rem;
      line-height: 1.8;
    }
  }
}

.article-footer {
  padding: 2rem;
  background: var(--bg-light);
  border-top: 1px solid var(--border-light);
}

.article-tags {
  margin-bottom: 2rem;
  
  .tag {
    display: inline-block;
    background: var(--accent-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.article-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  .share-btn, .back-btn {
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  .share-btn {
    background: var(--secondary-color);
    color: white;
    border: none;
  }
  
  .back-btn {
    background: var(--primary-color);
    color: white;
  }
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  
  h2 {
    color: var(--text-dark);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-light);
    margin-bottom: 2rem;
  }
  
  .back-btn {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    text-decoration: none;
    border-radius: var(--border-radius);
    font-weight: 500;
    transition: var(--transition);
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}

.related-articles {
  margin-top: 4rem;
  
  h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--text-dark);
  }
  
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .article-page {
    padding: 0 1rem;
  }
  
  .article-header {
    padding: 2rem 1rem;
    
    .article-meta {
      flex-direction: column;
      align-items: flex-start;
    }
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .article-body {
    padding: 2rem 1rem;
  }
  
  .article-footer {
    padding: 1.5rem 1rem;
  }
  
  .article-actions {
    justify-content: center;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>