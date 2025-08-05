#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RSS Feed 生成脚本
自动生成feed.xml文件，用于RSS订阅
"""

import os
import json
import datetime
from typing import List, Dict
import html

class RSSGenerator:
    def __init__(self, base_url: str = None):
        # 自动检测域名：优先使用CNAME，否则使用config.json中的base_url
        if base_url is None:
            base_url = self.detect_base_url()
        self.base_url = base_url.rstrip('/')
        self.site_title = "猫咪世界"
        self.site_description = "专业的养猫知识分享平台，每日更新猫咪护理、品种介绍、用品测评等内容"
        self.site_language = "zh-CN"
        self.site_author = "猫咪世界编辑团队"
        print(f"🌐 RSS使用域名: {self.base_url}")
        
    def detect_base_url(self) -> str:
        """自动检测base URL"""
        # 首先检查CNAME文件
        try:
            with open('CNAME', 'r', encoding='utf-8') as f:
                cname_domain = f.read().strip()
                if cname_domain:
                    print(f"📍 RSS检测到CNAME域名: {cname_domain}")
                    return f"https://{cname_domain}"
        except FileNotFoundError:
            pass
        
        # 然后检查config.json
        try:
            with open('config.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                config_url = config.get('base_url')
                if config_url:
                    print(f"📍 RSS使用config.json中的URL: {config_url}")
                    return config_url
        except FileNotFoundError:
            pass
        
        # 默认使用GitHub Pages URL
        default_url = 'https://pet-content-hub.github.io/pet-daily'
        print(f"📍 RSS使用默认URL: {default_url}")
        return default_url
        
    def load_articles(self) -> List[Dict]:
        """加载文章数据"""
        try:
            with open('articles.json', 'r', encoding='utf-8') as f:
                articles = json.load(f)
                # 按日期排序，最新的在前面
                articles.sort(key=lambda x: x['date'], reverse=True)
                # 只返回最近20篇文章
                return articles[:20]
        except FileNotFoundError:
            print("articles.json 文件不存在")
            return []
    
    def format_rfc822_date(self, date_str: str) -> str:
        """将日期转换为RFC822格式"""
        try:
            date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
            return date_obj.strftime('%a, %d %b %Y 10:00:00 +0800')
        except ValueError:
            # 如果日期格式不正确，使用当前日期
            return datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0800')
    
    def escape_xml(self, text: str) -> str:
        """转义XML特殊字符"""
        return html.escape(text, quote=True)
    
    def generate_rss_xml(self, articles: List[Dict]) -> str:
        """生成RSS XML内容"""
        build_date = datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0800')
        
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{self.escape_xml(self.site_title)}</title>
    <link>{self.base_url}/</link>
    <description>{self.escape_xml(self.site_description)}</description>
    <language>{self.site_language}</language>
    <managingEditor>noreply@example.com ({self.escape_xml(self.site_author)})</managingEditor>
    <webMaster>noreply@example.com ({self.escape_xml(self.site_author)})</webMaster>
    <lastBuildDate>{build_date}</lastBuildDate>
    <pubDate>{build_date}</pubDate>
    <ttl>1440</ttl>
    <atom:link href="{self.base_url}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <title>{self.escape_xml(self.site_title)}</title>
      <url>{self.base_url}/assets/images/logo.png</url>
      <link>{self.base_url}/</link>
      <width>144</width>
      <height>144</height>
      <description>{self.escape_xml(self.site_description)}</description>
    </image>
'''
        
        for article in articles:
            pub_date = self.format_rfc822_date(article['date'])
            article_url = f"{self.base_url}/#/stories/{article['slug']}"
            
            # 构建内容描述
            content_description = f"""
            <p><strong>分类：</strong>{self.escape_xml(article['category'])}</p>
            <p><strong>阅读时间：</strong>{self.escape_xml(article['readTime'])}</p>
            <p>{self.escape_xml(article['excerpt'])}</p>
            <p><a href="{article_url}">阅读全文 →</a></p>
            """
            
            xml_content += f'''    <item>
      <title>{self.escape_xml(article['title'])}</title>
      <link>{article_url}</link>
      <description><![CDATA[{content_description.strip()}]]></description>
      <pubDate>{pub_date}</pubDate>
      <guid>{article_url}</guid>
      <category>{self.escape_xml(article['category'])}</category>
      <author>noreply@example.com ({self.escape_xml(self.site_author)})</author>
    </item>
'''
        
        xml_content += '''  </channel>
</rss>'''
        
        return xml_content
    
    def save_rss_feed(self, filename: str = "feed.xml") -> None:
        """保存RSS feed到文件"""
        articles = self.load_articles()
        
        if not articles:
            print("⚠️  没有找到文章，生成空的RSS feed")
        
        xml_content = self.generate_rss_xml(articles)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print(f"✅ RSS Feed已生成：{filename}")
        print(f"📰 包含 {len(articles)} 篇文章")

def main():
    """主函数"""
    print("📡 开始生成RSS Feed...")
    
    # 自动切换到项目根目录
    current_dir = os.getcwd()
    if os.path.basename(current_dir) == 'scripts':
        os.chdir('..')
        print(f"📁 工作目录已切换到: {os.getcwd()}")
    
    # 创建RSS生成器（自动检测域名）
    generator = RSSGenerator()
    generator.save_rss_feed()
    
    print("🎉 RSS Feed生成完成")

if __name__ == "__main__":
    main()