#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地测试脚本 - 无需API密钥
生成示例文章用于测试网站功能
"""

import os
import json
import datetime
import random

def setup_working_directory():
    """设置正确的工作目录"""
    current_dir = os.getcwd()
    
    if os.path.basename(current_dir) == 'scripts':
        os.chdir('..')
        print(f"工作目录已切换到: {os.getcwd()}")
    
    # 确保必要的目录存在
    os.makedirs('articles', exist_ok=True)
    os.makedirs('assets/images', exist_ok=True)

def generate_sample_article():
    """生成示例文章"""
    sample_articles = [
        {
            "title": "新手养猫指南：第一次养猫需要准备什么",
            "category": "新手指南",
            "content": """
# 新手养猫指南：第一次养猫需要准备什么

## 引言

想要成为一名合格的铲屎官？本文将为新手提供全面的养猫准备清单。

## 基本用品准备

### 必需品清单

- **猫粮**：选择适合年龄的优质猫粮
- **食盆和水碗**：不锈钢或陶瓷材质为佳
- **猫砂盆**：建议准备两个
- **猫砂**：膨润土或豆腐猫砂都可以
- **猫抓板**：保护家具的必需品

### 舒适用品

- **猫窝**：温暖舒适的休息场所
- **猫玩具**：羽毛棒、小球等
- **猫包**：外出必备

## 环境准备

> 💡 提示：为猫咪创造一个安全舒适的环境非常重要。

- 移除有毒植物
- 收纳小物品防止误食
- 准备躲避空间

## 健康管理

### 疫苗接种

1. **基础疫苗**：预防常见疾病
2. **狂犬疫苗**：法律要求
3. **定期体检**：建立健康档案

### 日常护理

- 定期梳毛
- 清洁耳朵
- 修剪指甲
- 口腔护理

## 总结

养猫是一个长期的承诺，做好充分准备才能给猫咪最好的生活。记住，爱心和耐心是最重要的"装备"。
            """,
            "slug": "beginner-cat-guide-test"
        },
        {
            "title": "布偶猫性格特点及饲养要点全解析",
            "category": "品种介绍", 
            "content": """
# 布偶猫性格特点及饲养要点全解析

## 品种介绍

布偶猫因其温顺的性格和美丽的外表而备受喜爱，被誉为"仙女猫"。

## 外观特征

### 体型特点
- **大型猫种**：成年雄猫可达7-10公斤
- **毛发**：半长毛，质地柔软
- **眼睛**：蓝色，椭圆形
- **耳朵**：中等大小，圆润

### 毛色图案
- **双色**：面部有倒V形白色
- **重点色**：耳朵、面部、尾巴颜色较深
- **手套色**：四肢有白色"手套"

## 性格特点

> 💡 提示：布偶猫的性格温和，特别适合家庭饲养。

- **温顺友善**：很少攻击行为
- **粘人程度高**：喜欢跟随主人
- **适应性强**：容易融入新环境
- **叫声轻柔**：不会过度喧闹

## 饲养要点

### 日常护理
- **每日梳毛**：防止毛发打结
- **定期洗澡**：保持毛发光泽
- **清洁眼部**：避免泪痕

### 营养需求
- 高蛋白质猫粮
- 适量omega-3脂肪酸
- 充足的水分摄入

## 健康注意事项

- 心脏病筛查
- 肾脏功能监测
- 关节保护

## 总结

布偶猫是理想的家庭伴侣，只要给予适当的护理和关爱，它们会成为你最忠实的朋友。
            """,
            "slug": "ragdoll-cat-guide-test"
        }
    ]
    
    # 随机选择一篇文章
    article = random.choice(sample_articles)
    
    return article

def create_article_html(title, category, content, date, slug):
    """创建文章HTML"""
    read_time = f"{max(1, round(len(content) / 250))}分钟"
    excerpt = content.split('\n\n')[1][:120] + "..." if len(content.split('\n\n')) > 1 else "示例文章内容"
    base_url = "https://www.mao.com.cn"
    og_image = f"{base_url}/assets/images/logo.png"
    
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 猫咪世界</title>
    <meta name="description" content="{excerpt}">
    <meta name="keywords" content="养猫,猫咪,{category}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{base_url}/#/stories/{slug}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{excerpt}">
    <meta property="og:image" content="{og_image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="猫咪世界">
    <meta property="og:locale" content="zh_CN">
    <meta property="article:published_time" content="{date}T00:00:00+08:00">
    <meta property="article:section" content="{category}">
    <meta property="article:tag" content="养猫">
    <meta property="article:tag" content="猫咪">
    <meta property="article:tag" content="{category}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{base_url}/#/stories/{slug}">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{excerpt}">
    <meta name="twitter:image" content="{og_image}">
    
    <!-- WeChat specific -->
    <meta name="apple-mobile-web-app-title" content="猫咪世界">
    <meta name="application-name" content="猫咪世界">
    
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="canonical" href="{base_url}/#/stories/{slug}">
</head>
<body>
    <header class="site-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <h1><a href="../index.html">🐱 猫咪世界</a></h1>
                </div>
                <ul class="nav-menu">
                    <li><a href="../index.html">首页</a></li>
                    <li><a href="../index.html#articles">文章</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <article class="article-page">
            <header class="article-header">
                <div class="article-meta-top">
                    <span class="article-category">{category}</span>
                    <span class="article-date">📅 {date}</span>
                    <span class="read-time">⏱️ {read_time}</span>
                </div>
                <h1>{title}</h1>
            </header>

            <div class="article-body">
{markdown_to_html(content)}
            </div>

            <footer class="article-footer">
                <div class="article-tags">
                    <span class="tag">{category}</span>
                    <span class="tag">测试文章</span>
                </div>
            </footer>
        </article>
    </main>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>猫咪世界</h4>
                <p>专业的养猫知识分享平台</p>
            </div>
        </div>
    </footer>
</body>
</html>"""
    
    return html_content

def markdown_to_html(markdown_text):
    """简单的Markdown转HTML"""
    import re
    
    html = markdown_text
    
    # 标题转换
    html = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # 加粗文本
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    
    # 提示框
    html = re.sub(r'^> 💡 提示：(.*$)', r'<div class="tip-box">💡 <strong>提示：</strong>\1</div>', html, flags=re.MULTILINE)
    
    # 列表转换
    lines = html.split('\n')
    in_ul = False
    result_lines = []
    
    for line in lines:
        if line.strip().startswith('- '):
            if not in_ul:
                result_lines.append('<ul>')
                in_ul = True
            result_lines.append(f'  <li>{line.strip()[2:]}</li>')
        else:
            if in_ul:
                result_lines.append('</ul>')
                in_ul = False
            if line.strip():
                result_lines.append(f'<p>{line}</p>')
            else:
                result_lines.append('')
    
    if in_ul:
        result_lines.append('</ul>')
    
    return '\n'.join(result_lines)

def update_articles_index(article_info):
    """更新文章索引"""
    try:
        with open('articles.json', 'r', encoding='utf-8') as f:
            articles = json.load(f)
    except FileNotFoundError:
        articles = []
    
    # 添加新文章到列表开头
    articles.insert(0, article_info)
    
    with open('articles.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)

def main():
    """主函数"""
    print("🧪 开始生成测试文章...")
    
    # 设置工作目录
    setup_working_directory()
    
    # 生成示例文章
    article = generate_sample_article()
    
    # 生成文章信息
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # 创建HTML文件
    html_content = create_article_html(
        article['title'],
        article['category'],
        article['content'],
        date,
        article['slug']
    )
    
    # 保存HTML文件
    html_file_path = f"articles/{article['slug']}.html"
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    # 文章信息
    article_info = {
        "title": article['title'],
        "category": article['category'],
        "excerpt": article['content'].split('\n\n')[1][:120] + "..." if len(article['content'].split('\n\n')) > 1 else "测试文章内容",
        "date": date,
        "readTime": f"{max(1, round(len(article['content']) / 250))}分钟",
        "slug": article['slug'],
        "icon": "🧪"
    }
    
    # 更新文章索引
    update_articles_index(article_info)
    
    print(f"✅ 测试文章生成完成：{html_file_path}")
    print(f"📖 文章标题：{article['title']}")
    print(f"🏷️  分类：{article['category']}")
    print("🎉 测试完成！现在可以打开 index.html 查看效果")

if __name__ == "__main__":
    main()