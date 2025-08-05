<template>
  <div class="category-page">
    <header class="page-header">
      <h1>分类：{{ categoryName }}</h1>
      <p>浏览 <strong>{{ categoryName }}</strong> 相关的所有文章</p>
      <div class="category-stats">
        <span class="stat">
          📚 共 {{ categoryArticles.length }} 篇文章
        </span>
      </div>
    </header>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载分类文章中...</p>
    </div>
    
    <!-- 文章列表 -->
    <section v-else-if="categoryArticles.length > 0" class="articles-section">
      <div class="articles-grid">
        <ArticleCard
          v-for="article in categoryArticles"
          :key="article.slug"
          :article="article"
        />
      </div>
    </section>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>暂无文章</h3>
      <p>该分类下暂时没有文章，我们会持续更新内容。</p>
      <RouterLink to="/" class="back-btn">
        🏠 返回首页浏览其他内容
      </RouterLink>
    </div>
    
    <!-- 其他分类推荐 -->
    <section v-if="otherCategories.length > 0" class="other-categories">
      <h3>其他分类</h3>
      <div class="categories-grid">
        <div
          v-for="category in otherCategories"
          :key="category.name"
          class="category-card"
          @click="goToCategory(category.name)"
        >
          <div class="category-info">
            <h4>{{ category.name }}</h4>
            <p>{{ category.count }} 篇文章</p>
          </div>
          <div class="category-arrow">→</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useArticlesStore } from '@/stores/articles'
import ArticleCard from '@/components/ui/ArticleCard.vue'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

// 响应式数据
const isLoading = ref(true)

// 计算属性
const categoryName = computed(() => {
  return decodeURIComponent(route.params.category || '')
})

const categoryArticles = computed(() => {
  return articlesStore.getArticlesByCategory(categoryName.value)
})

const otherCategories = computed(() => {
  const categories = Object.entries(articlesStore.articlesByCategory)
    .filter(([name]) => name !== categoryName.value)
    .map(([name, articles]) => ({
      name,
      count: articles.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  
  return categories
})

// 动态SEO配置
const seoMeta = computed(() => ({
  title: `分类：${categoryName.value}`,
  description: `浏览${categoryName.value}分类下的所有专业养猫文章，共${categoryArticles.value.length}篇内容`,
  keywords: `${categoryName.value},猫咪,养猫,宠物护理,猫咪知识`,
  ogTitle: `${categoryName.value}分类文章 - 猫咪世界`,
  ogDescription: `浏览${categoryName.value}分类下的所有专业养猫文章`,
  ogUrl: `https://www.mao.com.cn/categories/${encodeURIComponent(categoryName.value)}`
}))

// 使用动态SEO
useHead(() => ({
  title: seoMeta.value.title,
  meta: [
    { name: 'description', content: seoMeta.value.description },
    { name: 'keywords', content: seoMeta.value.keywords },
    { property: 'og:title', content: seoMeta.value.ogTitle },
    { property: 'og:description', content: seoMeta.value.ogDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: seoMeta.value.ogUrl }
  ]
}))

// 方法
async function loadCategoryData() {
  isLoading.value = true
  
  try {
    // 确保文章数据已加载
    if (articlesStore.articles.length === 0) {
      await articlesStore.loadArticles()
    }
  } catch (error) {
    console.error('加载分类数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

function goToCategory(categoryName) {
  router.push(`/categories/${encodeURIComponent(categoryName)}`)
}

// 监听路由变化
watch(() => route.params.category, () => {
  loadCategoryData()
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadCategoryData()
})
</script>

<style lang="scss" scoped>
.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: var(--border-radius);
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
    
    strong {
      font-weight: 600;
    }
  }
  
  .category-stats {
    .stat {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
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

.articles-section {
  margin-bottom: 4rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 3rem;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    color: var(--text-dark);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-light);
    margin-bottom: 2rem;
    font-size: 1.1rem;
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
      box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
    }
  }
}

.other-categories {
  h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--text-dark);
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--bg-white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    
    .category-arrow {
      transform: translateX(5px);
    }
  }
  
  .category-info {
    h4 {
      font-size: 1.2rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--text-light);
      font-size: 0.9rem;
      margin: 0;
    }
  }
  
  .category-arrow {
    font-size: 1.5rem;
    color: var(--primary-color);
    transition: var(--transition);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .category-page {
    padding: 0 1rem;
  }
  
  .page-header {
    padding: 2rem 1rem;
    
    h1 {
      font-size: 2rem;
    }
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .category-card {
    padding: 1rem;
  }
}
</style>