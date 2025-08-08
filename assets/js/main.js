// 主要JavaScript功能
class CatWorldSite {
    constructor() {
        this.articles = [];
        this.currentPage = 1;
        this.articlesPerPage = 6;
        this.basePath = this.getBasePath();
        console.log('🐱 猫咪世界初始化完成');
        console.log('🔗 检测到的基础路径:', this.basePath || '根目录');
        console.log('🌐 当前域名:', window.location.hostname);
        // 异步初始化
        this.init().catch(error => {
            console.error('初始化失败:', error);
        });
    }

    async init() {
        await this.loadArticles();
        this.setupEventListeners();
        this.updateArticleCount();
        this.updateStaticLinks();
    }

    getBasePath() {
        // 自动检测base path，支持多域名
        const pathname = window.location.pathname;
        const hostname = window.location.hostname;
        
        // 如果是GitHub Pages项目路径 (/pet-daily/...)
        if (pathname.startsWith('/pet-daily/')) {
            return '/pet-daily';
        }
        
        // 如果是GitHub Pages，检查URL结构
        if (hostname.includes('github.io')) {
            // 如果URL是 username.github.io/project-name 格式
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length === 0 || pathname === '/') {
                // 对于pet-content-hub.github.io/pet-daily 这种情况
                // 尝试从当前URL推断项目名
                const currentUrl = window.location.href;
                if (currentUrl.includes('/pet-daily')) {
                    return '/pet-daily';
                }
                // 如果没有明确的项目路径，可能是直接部署到根目录
                return '';
            }
        }
        
        // 对于自定义域名（如mao.com.cn）或其他情况，使用根路径
        return '';
    }

    updateStaticLinks() {
        // 更新页面中的静态链接，使其支持动态base path
        const staticLinks = [
            { selector: 'a[href="/sitemap.xml"]', path: '/sitemap.xml' },
            { selector: 'a[href="/feed.xml"]', path: '/feed.xml' },
            { selector: 'link[href="/feed.xml"]', path: '/feed.xml' }
        ];

        staticLinks.forEach(link => {
            const elements = document.querySelectorAll(link.selector);
            elements.forEach(element => {
                element.href = `${this.basePath}${link.path}`;
            });
        });
    }

    setupEventListeners() {
        // 加载更多按钮
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreArticles());
        }

        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async loadArticles() {
        try {
            // 使用动态base path加载articles.json
            const articlesUrl = `${this.basePath}/articles.json`;
            const response = await fetch(articlesUrl);
            if (response.ok) {
                this.articles = await response.json();
            } else {
                // 如果没有articles.json，使用示例数据
                this.articles = this.getExampleArticles();
            }
            this.renderArticles();
            this.updateArticleCount(); // 确保在文章加载完成后更新计数
        } catch (error) {
            console.log('加载文章数据失败，使用示例数据');
            this.articles = this.getExampleArticles();
            this.renderArticles();
            this.updateArticleCount(); // 确保在使用示例数据后也更新计数
        }
    }

    getExampleArticles() {
        return [
            {
                title: "新手养猫完全指南：从选择到日常护理",
                category: "新手指南",
                excerpt: "想要养猫但不知道从何开始？这篇文章将为你详细介绍养猫的方方面面，从猫咪品种选择到日常护理技巧。",
                date: "2025-07-15",
                readTime: "8分钟",
                slug: "beginner-cat-care-guide",
                icon: "🐱"
            },
            {
                title: "英短、美短、布偶猫：热门品种特点对比",
                category: "品种介绍",
                excerpt: "详细对比三大热门猫咪品种的性格特点、护理需求和适合人群，帮你选择最适合的毛孩子。",
                date: "2025-07-14",
                readTime: "6分钟",
                slug: "popular-cat-breeds-comparison",
                icon: "🏆"
            },
            {
                title: "幼猫喂养时间表：2-12个月营养指南",
                category: "幼猫护理",
                excerpt: "科学的幼猫喂养计划，包括不同月龄的营养需求、喂食频率和注意事项。",
                date: "2025-07-13",
                readTime: "7分钟",
                slug: "kitten-feeding-schedule",
                icon: "🍼"
            },
            {
                title: "2024年猫粮测评：10款热门猫粮深度分析",
                category: "用品测评",
                excerpt: "从营养成分、性价比、适口性等维度，专业测评市面上热门猫粮品牌。",
                date: "2025-07-12",
                readTime: "12分钟",
                slug: "cat-food-review-2024",
                icon: "🥫"
            },
            {
                title: "猫咪疫苗接种全攻略：时间、种类、注意事项",
                category: "健康护理",
                excerpt: "详细解析猫咪疫苗接种的重要性、时间安排和接种后的护理要点。",
                date: "2025-07-11",
                readTime: "9分钟",
                slug: "cat-vaccination-guide",
                icon: "💉"
            },
            {
                title: "猫咪行为解读：读懂你家猫主子的小心思",
                category: "行为训练",
                excerpt: "从尾巴摆动到叫声含义，全面解读猫咪的各种行为表现和情绪信号。",
                date: "2025-07-10",
                readTime: "10分钟",
                slug: "understanding-cat-behavior",
                icon: "🧠"
            }
        ];
    }

    renderArticles() {
        const container = document.getElementById('articles-container');
        if (!container) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.articlesPerPage;
        const articlesToShow = this.articles.slice(startIndex, endIndex);

        container.innerHTML = articlesToShow.map(article => this.createArticleCard(article)).join('');

        // 更新加载更多按钮状态
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            if (endIndex >= this.articles.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }

    createArticleCard(article) {
        return `
            <article class="article-card">
                <div class="article-image">
                    ${article.icon || '🐱'}
                </div>
                <div class="article-content">
                    <span class="article-category">
                        <a href="/categories/${article.category}">${article.category}</a>
                    </span>
                    <h3 class="article-title">
                        <a href="/articles/${article.slug}">${article.title}</a>
                    </h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="article-date">
                            📅 ${this.formatDate(article.date)}
                        </span>
                        <span class="read-time">
                            ⏱️ ${article.readTime}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    loadMoreArticles() {
        this.currentPage++;
        this.renderArticles();
    }

    updateArticleCount() {
        const countElement = document.getElementById('article-count');
        if (countElement) {
            // 添加数字动画效果
            this.animateNumber(countElement, 0, this.articles.length, 2000);
        }
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今天';
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// SEO和性能优化相关功能
class SEOOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.addStructuredData();
        this.optimizeImages();
        this.addSocialSharing();
    }

    addStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Website",
            "name": "猫咪世界",
            "description": "专业的养猫知识分享平台",
            "url": window.location.origin,
            "potentialAction": {
                "@type": "SearchAction",
                "target": window.location.origin + "/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    optimizeImages() {
        // 延迟加载图片
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    addSocialSharing() {
        // 添加社交分享功能
        if (navigator.share) {
            const shareButtons = document.querySelectorAll('.share-btn');
            shareButtons.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await navigator.share({
                            title: document.title,
                            text: document.querySelector('meta[name="description"]').content,
                            url: window.location.href
                        });
                    } catch (error) {
                        console.log('分享失败', error);
                    }
                });
            });
        }
    }
}

// 性能监控
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    console.log('页面加载时间:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
                }
            }, 0);
        });

        // 监控用户交互
        this.trackUserEngagement();
    }

    trackUserEngagement() {
        let startTime = Date.now();
        let isActive = true;

        // 检测用户是否活跃
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, () => {
                if (!isActive) {
                    startTime = Date.now();
                    isActive = true;
                }
            }, { passive: true });
        });

        // 检测用户离开
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isActive) {
                const sessionTime = Date.now() - startTime;
                console.log('用户活跃时间:', sessionTime / 1000, '秒');
                isActive = false;
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例
    window.catWorldSite = new CatWorldSite();
    window.seoOptimizer = new SEOOptimizer();
    window.performanceMonitor = new PerformanceMonitor();
    
    // 初始化SPA路由
    window.router = new SPARouter();
    window.router.init();
});

// 导出给其他脚本使用
window.CatWorldSite = CatWorldSite;