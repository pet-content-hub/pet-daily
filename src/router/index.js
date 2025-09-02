import { createRouter, createWebHashHistory } from 'vue-router'
import { useHead } from '@vueuse/head'

// 路由组件懒加载
const Home = () => import('@/views/Home.vue')
const About = () => import('@/views/About.vue')
const Article = () => import('@/views/Article.vue')
const Category = () => import('@/views/Category.vue')
const Upload = () => import('@/views/Upload.vue')
const NotFound = () => import('@/views/NotFound.vue')

// 猫咪日记相关页面
const DiaryHome = () => import('@/views/DiaryHome.vue')
const CatProfile = () => import('@/views/CatProfile.vue')
const CreateDiary = () => import('@/views/CreateDiary.vue')
const DiaryDetail = () => import('@/views/DiaryDetail.vue')
const AuthCallback = () => import('@/views/AuthCallback.vue')
const CatsManagement = () => import('@/views/CatsManagement.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      description: '专业的养猫知识分享平台，每日更新猫咪护理、品种介绍、用品测评等专业内容'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们',
      description: '了解猫咪世界的创立初衷和专业团队，我们致力于为广大铲屎官提供最优质的养猫知识'
    }
  },
  {
    path: '/stories/:slug',
    name: 'Article',
    component: Article,
    meta: {
      title: '文章详情',
      description: '阅读专业的养猫知识文章'
    }
  },
  {
    path: '/categories/:category',
    name: 'Category', 
    component: Category,
    meta: {
      title: '分类文章',
      description: '浏览分类下的所有文章'
    }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: Upload,
    meta: {
      title: '图片上传',
      description: '安全便捷的图片上传服务，支持多种格式，腾讯云存储'
    }
  },
  {
    path: '/diary',
    name: 'DiaryHome',
    component: DiaryHome,
    meta: {
      title: '猫咪日记',
      description: '记录与猫咪的美好时光，浏览公开的猫咪日记，分享养猫心得'
    }
  },
  {
    path: '/cats/:catId',
    name: 'CatProfile',
    component: CatProfile,
    meta: {
      title: '猫咪档案',
      description: '查看猫咪详细档案信息，包括基本信息、健康记录和日记时间线'
    }
  },
  {
    path: '/diary/create',
    name: 'CreateDiary',
    component: CreateDiary,
    meta: {
      title: '写日记',
      description: '记录今天与猫咪的美好时光，上传照片，记录健康数据'
    }
  },
  {
    path: '/diary/:diaryId',
    name: 'DiaryDetail',
    component: DiaryDetail,
    meta: {
      title: '日记详情',
      description: '查看完整的猫咪日记内容'
    }
  },
  {
    path: '/cats',
    name: 'CatsManagement',
    component: CatsManagement,
    meta: {
      title: '我的猫咪',
      description: '管理我的猫咪档案，添加新的猫咪信息'
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: {
      title: '登录中...',
      description: '正在处理登录'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到',
      description: '您访问的页面不存在'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 添加错误处理
router.onError((error) => {
  console.warn('路由错误（已自动处理）:', error.message)
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 页面切换加载指示
  if (to.name !== from.name) {
    document.body.style.cursor = 'wait'
  }
  next()
})

// 全局后置钩子
router.afterEach((to) => {
  // 恢复光标
  document.body.style.cursor = ''
  
  // 更新页面 meta 信息
  const { title, description } = to.meta
  
  useHead({
    title: title || '猫咪世界',
    meta: [
      { name: 'description', content: description || '专业的养猫知识分享平台' },
      { property: 'og:title', content: title ? `${title} - 猫咪世界` : '猫咪世界 - 专业的养猫知识分享平台' },
      { property: 'og:description', content: description || '专业的养猫知识分享平台' },
      { property: 'og:url', content: window.location.href }
    ]
  })
})

export default router