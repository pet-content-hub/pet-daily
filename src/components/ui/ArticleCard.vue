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
        <RouterLink :to="`/stories/${article.slug}`">
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

<!-- 移除 scoped 样式，使用全局样式 -->