#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网站地图生成脚本
自动生成sitemap.xml文件，包含所有页面和文章
"""

import os
import json
import datetime
from pathlib import Path
from typing import List, Dict

class SitemapGenerator:
    def __init__(self, base_url: str = None):
        # 自动检测域名：优先使用CNAME，否则使用config.json中的base_url
        if base_url is None:
            base_url = self.detect_base_url()
        self.base_url = base_url.rstrip('/')
        self.sitemap_urls = []
        self._seen_urls = set()
        print(f"🌐 使用域名: {self.base_url}")
        
    def detect_base_url(self) -> str:
        """自动检测base URL"""
        # 首先检查CNAME文件
        try:
            with open('CNAME', 'r', encoding='utf-8') as f:
                cname_domain = f.read().strip()
                if cname_domain:
                    print(f"📍 检测到CNAME域名: {cname_domain}")
                    return f"https://{cname_domain}"
        except FileNotFoundError:
            pass
        
        # 然后检查config.json
        try:
            with open('config.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                config_url = config.get('base_url')
                if config_url:
                    print(f"📍 使用config.json中的URL: {config_url}")
                    return config_url
        except FileNotFoundError:
            pass
        
        # 默认使用GitHub Pages URL
        default_url = 'https://pet-content-hub.github.io/pet-daily'
        print(f"📍 使用默认URL: {default_url}")
        return default_url
        
    def add_url(self, url: str, lastmod: str = None, changefreq: str = "weekly", priority: str = "0.8"):
        """添加URL到sitemap（同一个URL只会出现一次）"""
        if not url.startswith('http'):
            # 首页保留结尾斜杠，与 index.html 里的 canonical 一致
            url = self.base_url + '/' + url.lstrip('/')

        if url in self._seen_urls:
            return
        self._seen_urls.add(url)

        self.sitemap_urls.append({
            'url': url,
            'lastmod': lastmod or datetime.datetime.now().strftime('%Y-%m-%d'),
            'changefreq': changefreq,
            'priority': priority
        })
    
    def scan_articles(self) -> None:
        """扫描所有文章

        只收录真正可被抓取的静态文章页 /articles/<slug>.html。
        注意：不能用 /#/stories/<slug>，因为 # 之后是 fragment，
        搜索引擎不会把它当成独立 URL，全部会折叠成首页。
        """
        try:
            with open('articles.json', 'r', encoding='utf-8') as f:
                articles = json.load(f)
        except FileNotFoundError:
            print("articles.json 文件不存在，跳过文章扫描")
            return

        output_dir = 'articles'
        seen = set()
        missing = 0

        # articles.json 按新→旧排列，同一 slug 取第一条（最新的那次生成）
        for article in articles:
            slug = article.get('slug')
            if not slug or slug in seen:
                continue

            # 磁盘上没有对应 HTML 就不写进 sitemap，避免收录 404
            if not os.path.exists(os.path.join(output_dir, f"{slug}.html")):
                missing += 1
                continue

            seen.add(slug)
            self.add_url(
                f"/articles/{slug}.html",
                lastmod=article['date'],
                changefreq="monthly",
                priority="0.7"
            )

        print(f"📄 收录文章 {len(seen)} 篇（索引共 {len(articles)} 条，去重跳过 {len(articles) - len(seen) - missing} 条）")
        if missing:
            print(f"⚠️  有 {missing} 个 slug 在 articles/ 下找不到 HTML 文件，已跳过")

    def add_static_pages(self) -> None:
        """添加静态页面

        只列真实存在的路径。/about 之类的页面走的是哈希路由（/#/about），
        裸路径 /about 在静态托管上是 404，不能写进 sitemap。
        """
        # 主页（带结尾斜杠，与 index.html 里的 canonical 保持一致）
        self.add_url("/", changefreq="daily", priority="1.0")

        # 其他重要页面
        static_pages = [
            {"url": "/feed.xml", "changefreq": "daily", "priority": "0.5"},
        ]

        for page in static_pages:
            self.add_url(page["url"], changefreq=page["changefreq"], priority=page["priority"])
    
    def generate_xml(self) -> str:
        """生成sitemap XML内容"""
        xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
'''
        
        for url_info in self.sitemap_urls:
            xml_content += f'''  <url>
    <loc>{url_info['url']}</loc>
    <lastmod>{url_info['lastmod']}</lastmod>
    <changefreq>{url_info['changefreq']}</changefreq>
    <priority>{url_info['priority']}</priority>
  </url>
'''
        
        xml_content += '</urlset>'
        return xml_content
    
    def save_sitemap(self, filename: str = "sitemap.xml") -> None:
        """保存sitemap到文件"""
        xml_content = self.generate_xml()
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print(f"✅ Sitemap已生成：{filename}")
        print(f"📊 包含 {len(self.sitemap_urls)} 个URL")

def main():
    """主函数"""
    print("🗺️  开始生成网站地图...")
    
    # 自动切换到项目根目录
    current_dir = os.getcwd()
    if os.path.basename(current_dir) == 'scripts':
        os.chdir('..')
        print(f"📁 工作目录已切换到: {os.getcwd()}")
    
    # 创建sitemap生成器（自动检测域名）
    generator = SitemapGenerator()
    
    # 添加静态页面
    generator.add_static_pages()
    
    # 扫描文章
    generator.scan_articles()
    
    # 生成并保存sitemap
    generator.save_sitemap()
    
    print("🎉 网站地图生成完成")

if __name__ == "__main__":
    main()