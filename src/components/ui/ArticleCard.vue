<template>
  <article class="article-card">
    <div class="article-image">
      {{ article.icon || '🐱' }}
    </div>
    
    <div class="article-content">
      <span class="article-category">
        <RouterLink :to="`/categories/${encodeURIComponent(article.category)}`">
          {{ article.category }}
        </RouterLink>
      </span>
      
      <h3 class="article-title">
        <RouterLink :to="`/articles/${article.slug}`">
          {{ article.title }}
        </RouterLink>
      </h3>
      
      <p class="article-excerpt">{{ article.excerpt }}</p>
      
      <div class="article-meta">
        <span class="article-date">
          📅 {{ formatDate(article.date) }}
        </span>
        <span class="read-time">
          ⏱️ {{ article.readTime }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useArticlesStore } from '@/stores/articles'

// Props
const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

// Store
const articlesStore = useArticlesStore()

// 方法
function formatDate(dateString) {
  return articlesStore.formatDate(dateString)
}
</script>

<style lang="scss" scoped>
.article-card {
  background: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
}

.article-image {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.article-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-category {
  display: inline-block;
  margin-bottom: 1rem;
  
  a {
    background: var(--accent-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 15px;
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
    transition: var(--transition);
    
    &:hover {
      background: darken(#45b7d1, 10%);
      transform: translateY(-1px);
    }
  }
}

.article-title {
  margin-bottom: 1rem;
  flex-shrink: 0;
  
  a {
    text-decoration: none;
    color: var(--text-dark);
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.4;
    transition: var(--transition);
    display: block;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.article-excerpt {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
  border-top: 1px solid var(--border-light);
  padding-top: 1rem;
  margin-top: auto;
}

.article-date,
.read-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

// 响应式设计
@media (max-width: 480px) {
  .article-content {
    padding: 1rem;
  }
  
  .article-title a {
    font-size: 1.1rem;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>