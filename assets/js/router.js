// SPA路由管理器
class SPARouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.basePath = this.getBasePath();
        this.mainContent = null;
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化路由配置
        this.setupRoutes();
        
        console.log('🚀 SPA路由器初始化完成');
    }

    getBasePath() {
        const pathname = window.location.pathname;
        const hostname = window.location.hostname;
        
        if (pathname.startsWith('/pet-daily/')) {
            return '/pet-daily';
        }
        
        if (hostname.includes('github.io')) {
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length === 0 || pathname === '/') {
                const currentUrl = window.location.href;
                if (currentUrl.includes('/pet-daily')) {
                    return '/pet-daily';
                }
                return '';
            }
        }
        
        return '';
    }

    setupRoutes() {
        // 定义路由配置
        this.addRoute('/', {
            title: '猫咪世界 - 专业的养猫知识分享平台',
            component: 'home',
            handler: () => this.renderHomePage()
        });

        this.addRoute('/about', {
            title: '关于我们 - 猫咪世界',
            component: 'about',
            handler: () => this.renderAboutPage()
        });

        this.addRoute('/articles/:slug', {
            title: '文章详情 - 猫咪世界',
            component: 'article',
            handler: (params) => this.renderArticlePage(params.slug)
        });

        this.addRoute('/categories/:category', {
            title: '分类文章 - 猫咪世界',
            component: 'category',
            handler: (params) => this.renderCategoryPage(params.category)
        });
    }

    addRoute(path, config) {
        this.routes.set(path, config);
    }

    bindEvents() {
        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname + window.location.search, false);
        });

        // 拦截所有链接点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldHandleLink(link)) {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.navigate(href);
            }
        });
    }

    shouldHandleLink(link) {
        const href = link.getAttribute('href');
        
        // 跳过外部链接、锚点链接、RSS等特殊链接
        if (!href || 
            href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.includes('.xml') ||
            href.includes('.json') ||
            href.startsWith('#')) {
            return false;
        }

        return true;
    }

    navigate(path, pushState = true) {
        if (pushState) {
            history.pushState({}, '', this.basePath + path);
        }
        this.handleRoute(path);
    }

    addPageTransition() {
        const mainContent = this.ensureMainContent();
        mainContent.classList.add('fade-out');
        
        return new Promise(resolve => {
            setTimeout(() => {
                mainContent.classList.remove('fade-out');
                resolve();
            }, 150);
        });
    }

    async handleRoute(path, updateHistory = true) {
        // 移除base path前缀
        const cleanPath = path.replace(this.basePath, '') || '/';
        
        // 查找匹配的路由
        const routeMatch = this.findRoute(cleanPath);
        
        if (routeMatch) {
            this.currentRoute = routeMatch.route;
            
            // 添加页面切换动画
            await this.addPageTransition();
            
            // 更新页面标题
            document.title = routeMatch.config.title;
            
            // 更新导航状态
            this.updateNavigation(cleanPath);
            
            // 执行路由处理器
            routeMatch.config.handler(routeMatch.params);
            
            // 滚动到顶部
            window.scrollTo(0, 0);
            
        } else {
            // 404处理
            await this.addPageTransition();
            this.render404();
        }
    }

    findRoute(path) {
        for (const [routePath, config] of this.routes) {
            const match = this.matchRoute(routePath, path);
            if (match) {
                return { route: routePath, config, params: match.params };
            }
        }
        return null;
    }

    matchRoute(routePath, currentPath) {
        // 处理参数路由 (如 /articles/:slug)
        const routeSegments = routePath.split('/');
        const pathSegments = currentPath.split('/');

        if (routeSegments.length !== pathSegments.length) {
            return null;
        }

        const params = {};
        
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathSegment = pathSegments[i];

            if (routeSegment.startsWith(':')) {
                // 参数匹配
                params[routeSegment.slice(1)] = pathSegment;
            } else if (routeSegment !== pathSegment) {
                // 不匹配
                return null;
            }
        }

        return { params };
    }

    updateNavigation(currentPath) {
        // 更新导航菜单的活跃状态
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '#home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    ensureMainContent() {
        if (!this.mainContent) {
            this.mainContent = document.querySelector('.main-content');
            if (!this.mainContent) {
                this.mainContent = document.createElement('main');
                this.mainContent.className = 'main-content';
                document.querySelector('header').after(this.mainContent);
            }
        }
        return this.mainContent;
    }

    renderHomePage() {
        const mainContent = this.ensureMainContent();
        
        mainContent.innerHTML = `
            <section id="hero" class="hero-section">
                <div class="hero-content">
                    <h2>专业的养猫知识分享平台</h2>
                    <p>每日更新猫咪护理、品种介绍、用品测评等专业内容，助您成为更好的铲屎官</p>
                    <div class="hero-stats">
                        <div class="stat">
                            <span class="stat-number" id="article-count">0</span>
                            <span class="stat-label">篇文章</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">50+</span>
                            <span class="stat-label">个品种</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">10000+</span>
                            <span class="stat-label">位铲屎官</span>
                        </div>
                    </div>
                </div>
            </section>

            <div class="ad-container">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-YOUR_ADSENSE_ID"
                     data-ad-slot="1234567890"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <section id="latest-articles" class="articles-section">
                <h3>最新文章</h3>
                <div class="articles-grid" id="articles-container">
                    <!-- 文章将通过JavaScript动态加载 -->
                </div>
                <div class="load-more">
                    <button id="load-more-btn" class="btn-primary">加载更多</button>
                </div>
            </section>

            <section id="categories" class="categories-section">
                <h3>热门分类</h3>
                <div class="categories-grid">
                    <div class="category-card">
                        <div class="category-icon">🐾</div>
                        <h4>猫咪品种</h4>
                        <p>详细介绍各种猫咪品种的特点和护理要点</p>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">🍼</div>
                        <h4>幼猫护理</h4>
                        <p>从出生到成年，全方位的幼猫护理指南</p>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">🥫</div>
                        <h4>猫粮测评</h4>
                        <p>专业的猫粮成分分析和性价比评测</p>
                    </div>
                    <div class="category-card">
                        <div class="category-icon">🏥</div>
                        <h4>健康护理</h4>
                        <p>猫咪常见疾病预防和日常健康管理</p>
                    </div>
                </div>
            </section>
        `;

        // 重新初始化首页功能
        if (window.catWorldSite) {
            window.catWorldSite.renderArticles();
            window.catWorldSite.updateArticleCount();
        }
    }

    renderAboutPage() {
        const mainContent = this.ensureMainContent();
        
        mainContent.innerHTML = `
            <article class="article-page">
                <header class="article-header">
                    <h1>关于猫咪世界</h1>
                    <p style="font-size: 1.1rem; opacity: 0.9; margin-top: 1rem;">
                        专业的养猫知识分享平台 🐾
                    </p>
                </header>

                <div class="article-body">
                    <section>
                        <h2>🌟 我们的使命</h2>
                        <p>猫咪世界创立于2024年，我们的使命是为广大铲屎官提供最专业、最实用的养猫知识。我们相信，每一只猫咪都值得最好的照顾，每一位铲屎官都应该成为更专业的猫奴。</p>
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
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
                            <div style="background: var(--bg-light); padding: 1.5rem; border-radius: var(--border-radius); border-left: 4px solid var(--primary-color);">
                                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">🐱 新手友好</h3>
                                <p style="margin: 0; font-size: 0.95rem;">从零开始的养猫指南，帮助新手快速上手</p>
                            </div>
                            <div style="background: var(--bg-light); padding: 1.5rem; border-radius: var(--border-radius); border-left: 4px solid var(--secondary-color);">
                                <h3 style="color: var(--secondary-color); margin-bottom: 0.5rem;">🔬 科学严谨</h3>
                                <p style="margin: 0; font-size: 0.95rem;">基于科学研究的专业知识，拒绝民间偏方</p>
                            </div>
                            <div style="background: var(--bg-light); padding: 1.5rem; border-radius: var(--border-radius); border-left: 4px solid var(--accent-color);">
                                <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">💡 实用性强</h3>
                                <p style="margin: 0; font-size: 0.95rem;">注重实战应用，解决养猫中的实际问题</p>
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
                            <li><strong>RSS订阅</strong>: <a href="/feed.xml">获取最新文章</a></li>
                            <li><strong>网站地图</strong>: <a href="/sitemap.xml">查看所有内容</a></li>
                        </ul>
                    </section>

                    <section style="background: var(--bg-light); padding: 2rem; border-radius: var(--border-radius); margin-top: 2rem; text-align: center;">
                        <h2 style="color: var(--primary-color);">💝 感谢您的支持</h2>
                        <p style="margin-bottom: 1.5rem;">猫咪世界的成长离不开每一位铲屎官的支持和信任。让我们一起为猫咪们创造更美好的生活！</p>
                        <a href="/" style="display: inline-block; background: var(--primary-color); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: var(--border-radius); font-weight: bold;">
                            🏠 返回首页继续阅读
                        </a>
                    </section>
                </div>
            </article>
        `;
    }

    async renderArticlePage(slug) {
        const mainContent = this.ensureMainContent();
        
        try {
            // 尝试加载文章内容
            const articleResponse = await fetch(`${this.basePath}/articles/${slug}.html`);
            
            if (articleResponse.ok) {
                const articleHtml = await articleResponse.text();
                // 提取文章主体内容（移除完整HTML结构）
                const parser = new DOMParser();
                const doc = parser.parseFromString(articleHtml, 'text/html');
                const articleContent = doc.querySelector('.article-page') || doc.querySelector('main') || doc.body;
                
                mainContent.innerHTML = articleContent.innerHTML;
            } else {
                throw new Error('文章未找到');
            }
        } catch (error) {
            this.render404();
        }
    }

    renderCategoryPage(category) {
        const mainContent = this.ensureMainContent();
        
        mainContent.innerHTML = `
            <section class="category-page">
                <header class="page-header">
                    <h1>分类：${category}</h1>
                    <p>浏览 ${category} 相关的所有文章</p>
                </header>
                
                <div class="articles-grid" id="category-articles">
                    <!-- 分类文章将在这里显示 -->
                </div>
            </section>
        `;

        // 加载并过滤分类文章
        this.loadCategoryArticles(category);
    }

    async loadCategoryArticles(category) {
        try {
            const response = await fetch(`${this.basePath}/articles.json`);
            if (response.ok) {
                const articles = await response.json();
                const categoryArticles = articles.filter(article => 
                    article.category === category || 
                    article.category.toLowerCase() === category.toLowerCase()
                );
                
                const container = document.getElementById('category-articles');
                if (container && window.catWorldSite) {
                    container.innerHTML = categoryArticles
                        .map(article => window.catWorldSite.createArticleCard(article))
                        .join('');
                }
            }
        } catch (error) {
            console.error('加载分类文章失败:', error);
        }
    }

    render404() {
        const mainContent = this.ensureMainContent();
        
        mainContent.innerHTML = `
            <section class="error-page">
                <div class="error-content">
                    <h1>404</h1>
                    <h2>页面未找到</h2>
                    <p>抱歉，您访问的页面不存在。</p>
                    <a href="/" class="btn-primary">返回首页</a>
                </div>
            </section>
        `;
        
        // 更新页面标题
        document.title = '页面未找到 - 猫咪世界';
    }

    // 初始化路由
    init() {
        const currentPath = window.location.pathname + window.location.search;
        this.handleRoute(currentPath, false);
    }
}

// 导出给其他脚本使用
window.SPARouter = SPARouter;