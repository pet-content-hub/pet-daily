import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppStore } from './app'

export const useArticlesStore = defineStore('articles', () => {
  // 状态
  const articles = ref([])
  const currentPage = ref(1)
  const articlesPerPage = ref(6)
  const isLoading = ref(false)
  const error = ref(null)

  // 依赖其他store
  const appStore = useAppStore()

  // 计算属性
  const totalArticles = computed(() => articles.value.length)
  
  const displayedArticles = computed(() => {
    const startIndex = 0
    const endIndex = currentPage.value * articlesPerPage.value
    return articles.value.slice(startIndex, endIndex)
  })

  const hasMoreArticles = computed(() => {
    return currentPage.value * articlesPerPage.value < articles.value.length
  })

  const articlesByCategory = computed(() => {
    const grouped = {}
    articles.value.forEach(article => {
      const category = article.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(article)
    })
    return grouped
  })

  // 示例文章数据
  const exampleArticles = [
    {
      title: "新手养猫完全指南：从选择到日常护理",
      category: "新手指南",
      excerpt: "想要养猫但不知道从何开始？这篇文章将为你详细介绍养猫的方方面面，从猫咪品种选择到日常护理技巧。",
      date: "2025-08-15",
      readTime: "8分钟",
      slug: "beginner-cat-care-guide",
      icon: "🐱"
    },
    {
      title: "英短、美短、布偶猫：热门品种特点对比",
      category: "品种介绍",
      excerpt: "详细对比三大热门猫咪品种的性格特点、护理需求和适合人群，帮你选择最适合的毛孩子。",
      date: "2025-08-14",
      readTime: "6分钟",
      slug: "popular-cat-breeds-comparison",
      icon: "🏆"
    },
    {
      title: "幼猫喂养时间表：2-12个月营养指南",
      category: "幼猫护理",
      excerpt: "科学的幼猫喂养计划，包括不同月龄的营养需求、喂食频率和注意事项。",
      date: "2025-08-13",
      readTime: "7分钟",
      slug: "kitten-feeding-schedule",
      icon: "🍼"
    },
    {
      title: "2025年猫粮测评：10款热门猫粮深度分析",
      category: "用品测评",
      excerpt: "从营养成分、性价比、适口性等维度，专业测评市面上热门猫粮品牌。",
      date: "2025-08-12",
      readTime: "12分钟",
      slug: "cat-food-review-2024",
      icon: "🥫"
    },
    {
      title: "猫咪疫苗接种全攻略：时间、种类、注意事项",
      category: "健康护理",
      excerpt: "详细解析猫咪疫苗接种的重要性、时间安排和接种后的护理要点。",
      date: "2025-08-11",
      readTime: "9分钟",
      slug: "cat-vaccination-guide",
      icon: "💉"
    },
    {
      title: "猫咪行为解读：读懂你家猫主子的小心思",
      category: "行为训练",
      excerpt: "从尾巴摆动到叫声含义，全面解读猫咪的各种行为表现和情绪信号。",
      date: "2025-08-10",
      readTime: "10分钟",
      slug: "understanding-cat-behavior",
      icon: "🧠"
    }
  ]

  // 方法
  async function loadArticles() {
    isLoading.value = true
    error.value = null
    
    try {
      const articlesUrl = `${appStore.basePath}/articles.json`
      const response = await fetch(articlesUrl)
      
      if (response.ok) {
        articles.value = await response.json()
      } else {
        // 使用示例数据
        articles.value = exampleArticles
      }
    } catch (err) {
      console.log('加载文章数据失败，使用示例数据')
      articles.value = exampleArticles
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  function loadMoreArticles() {
    if (hasMoreArticles.value) {
      currentPage.value++
    }
  }

  function getArticleBySlug(slug) {
    return articles.value.find(article => article.slug === slug)
  }

  function getArticlesByCategory(category) {
    return articles.value.filter(article => 
      article.category === category || 
      article.category.toLowerCase() === category.toLowerCase()
    )
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  return {
    // 状态
    articles,
    currentPage,
    articlesPerPage,
    isLoading,
    error,
    
    // 计算属性
    totalArticles,
    displayedArticles,
    hasMoreArticles,
    articlesByCategory,
    
    // 方法
    loadArticles,
    loadMoreArticles,
    getArticleBySlug,
    getArticlesByCategory,
    formatDate
  }
})