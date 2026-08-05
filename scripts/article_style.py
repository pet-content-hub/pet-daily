# -*- coding: utf-8 -*-
"""静态文章页的内联样式

这些页面是搜索引擎唯一能抓到的落地页，不能依赖外部 CSS：
原来引用的 ../assets/css/style.css 在仓库里根本不存在（线上 404），
导致 479 个文章页全部是无样式的裸 HTML。内联样式没有额外请求，
也不会因为构建配置改动而再次失效。

generate_article.py 生成新文章、backfill_article_style.py 回填旧文章，
都用这里的同一份内容。
"""

# <style> 标签的完整内容（含标签本身），可直接插入 <head>
ARTICLE_STYLE = """<style>
    :root {
        --accent: #ff6b6b;
        --text: #23282d;
        --muted: #6b7280;
        --line: #e6e8eb;
        --bg: #f8f9fa;
    }
    * { box-sizing: border-box; }
    body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
                     "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
        font-size: 17px;
        line-height: 1.85;
        -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }

    /* 顶部导航 */
    .site-header { background: #fff; border-bottom: 1px solid var(--line); }
    .nav-container {
        max-width: 860px; margin: 0 auto; padding: 0 20px;
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 8px; min-height: 64px;
    }
    .nav-logo h1 { font-size: 1.25rem; margin: 0; }
    .nav-logo a { color: var(--text); }
    .nav-menu { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
    .nav-menu a { color: var(--muted); font-size: 0.95rem; }

    /* 正文容器 */
    .main-content { max-width: 860px; margin: 0 auto; padding: 32px 20px 8px; }
    .article-page { background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 32px 28px; }
    .article-header { border-bottom: 1px solid var(--line); padding-bottom: 20px; margin-bottom: 8px; }
    .article-header h1 { font-size: 1.9rem; line-height: 1.4; margin: 12px 0 0; }
    .article-meta-top { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.85rem; color: var(--muted); }
    .article-category {
        background: rgba(255, 107, 107, 0.12); color: var(--accent);
        padding: 2px 10px; border-radius: 999px; font-weight: 600;
    }

    /* 文章正文 */
    .article-body { padding-top: 8px; }
    .article-body h2 {
        font-size: 1.35rem; margin: 2em 0 0.6em;
        padding-left: 12px; border-left: 4px solid var(--accent);
    }
    .article-body h3 { font-size: 1.12rem; margin: 1.6em 0 0.5em; }
    .article-body p { margin: 0 0 1.15em; }
    .article-body ul, .article-body ol { padding-left: 1.5em; margin: 0 0 1.15em; }
    .article-body li { margin-bottom: 0.4em; }
    .article-body blockquote {
        margin: 1.4em 0; padding: 12px 18px;
        background: #fafbfc; border-left: 3px solid var(--line); color: var(--muted);
    }
    .article-body code {
        background: #f2f3f5; padding: 2px 6px; border-radius: 4px;
        font-size: 0.9em; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .article-body table { width: 100%; border-collapse: collapse; margin: 1.4em 0; }
    .article-body th, .article-body td { border: 1px solid var(--line); padding: 8px 12px; text-align: left; }
    .article-body th { background: #fafbfc; }

    /* 文末：标签与分享 */
    .article-footer { border-top: 1px solid var(--line); margin-top: 32px; padding-top: 24px; }
    .article-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .tag {
        background: #f2f3f5; color: var(--muted);
        padding: 4px 12px; border-radius: 999px; font-size: 0.85rem;
    }
    .article-share h4 { margin: 0 0 12px; font-size: 0.95rem; color: var(--muted); font-weight: 600; }
    .share-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
    .share-btn, .social-share {
        display: inline-block; padding: 7px 16px; border-radius: 6px;
        border: 1px solid var(--line); background: #fff; color: var(--muted);
        font-size: 0.9rem; cursor: pointer; font-family: inherit;
    }
    .share-btn:hover, .social-share:hover {
        border-color: var(--accent); color: var(--accent); text-decoration: none;
    }

    /* 相关文章 */
    .related-articles { margin-top: 32px; }
    .related-articles h3 { font-size: 1.1rem; margin: 0 0 16px; }
    .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .related-grid:empty { display: none; }

    /* 广告位：没有填充时不要留下大片空白 */
    .ad-container { margin: 20px 0; text-align: center; }
    .ad-container:empty { display: none; }

    /* 页脚 */
    .site-footer { background: #23282d; color: #b6bcc4; margin-top: 48px; padding: 36px 20px 20px; }
    .footer-content {
        max-width: 860px; margin: 0 auto;
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px;
    }
    .footer-section h4 { color: #fff; margin: 0 0 10px; font-size: 1rem; }
    .footer-section p { margin: 0; font-size: 0.9rem; }
    .footer-section ul { list-style: none; padding: 0; margin: 0; }
    .footer-section a { color: #b6bcc4; font-size: 0.9rem; }
    .footer-bottom {
        max-width: 860px; margin: 24px auto 0; padding-top: 16px;
        border-top: 1px solid #3a4046; font-size: 0.85rem; text-align: center;
    }

    @media (max-width: 600px) {
        body { font-size: 16px; }
        .main-content { padding: 20px 14px 8px; }
        .article-page { padding: 22px 18px; border-radius: 0; }
        .article-header h1 { font-size: 1.5rem; }
    }
</style>"""
