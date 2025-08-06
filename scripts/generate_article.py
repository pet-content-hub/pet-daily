#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI文章自动生成脚本
支持使用多种AI API（OpenAI, Claude, 国内API等）生成高质量宠物文章
"""

import os
import json
import random
import datetime
from typing import Dict, List, Optional
import requests
import time
import re
from pathlib import Path

import os
from dotenv import load_dotenv

load_dotenv()  # 加载 .env 文件
openai_key = os.getenv("OPENAI_API_KEY")
claude_key = os.getenv("CLAUDE_API_KEY")
zhipu_key = os.getenv("ZHIPU_API_KEY")
qwen_key = os.getenv("QWEN_API_KEY")

class ArticleGenerator:
    def __init__(self, config_file: str = "config.json"):
        """初始化文章生成器"""
        # 自动检测并切换到项目根目录
        self.setup_working_directory()
        self.config = self.load_config(config_file)
        self.article_templates = self.load_article_templates()
        self.used_topics = self.load_used_topics()
    
    def setup_working_directory(self):
        """设置正确的工作目录"""
        current_dir = os.getcwd()
        
        # 如果当前在scripts目录，切换到上级目录
        if os.path.basename(current_dir) == 'scripts':
            os.chdir('..')
            print(f"工作目录已切换到: {os.getcwd()}")
        
        # 确保必要的目录存在
        os.makedirs('articles', exist_ok=True)
        os.makedirs('assets/images', exist_ok=True)
        
    def load_config(self, config_file: str) -> Dict:
        """加载配置文件"""
        default_config = {
            "ai_provider": "openai",  # openai, claude, zhipu, qwen
            "article_length": "medium",  # short, medium, long
            "articles_per_day": 1,
            "output_dir": "articles",
            "images_dir": "assets/images",
            "base_url": "https://yourusername.github.io/mao.com.cn"
        }
        
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        except FileNotFoundError:
            print(f"配置文件 {config_file} 不存在，使用默认配置")
            # 创建默认配置文件
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)
        
        return default_config
    
    def load_article_templates(self) -> List[Dict]:
        """加载文章模板"""
        return [
            {
                "category": "品种介绍",
                "title_patterns": [
                    "{breed}猫品种详解：性格特点与饲养指南",
                    "深度解析{breed}猫：从历史到现代饲养",
                    "{breed}猫全面指南：选择、护理与训练",
                    "认识{breed}猫：品种特征与饲养要点"
                ],
                "content_structure": [
                    "品种起源与历史",
                    "外观特征描述", 
                    "性格特点分析",
                    "饲养环境要求",
                    "日常护理要点",
                    "健康注意事项",
                    "适合人群推荐"
                ],
                "breeds": ["英国短毛猫", "美国短毛猫", "布偶猫", "波斯猫", "暹罗猫", "缅因猫", "俄罗斯蓝猫", "苏格兰折耳猫", "挪威森林猫", "土耳其安哥拉猫"]
            },
            {
                "category": "幼猫护理",
                "title_patterns": [
                    "{age}幼猫护理完全指南",
                    "新生幼猫{topic}的专业建议",
                    "{age}幼猫{topic}：科学方法与注意事项",
                    "幼猫{topic}常见问题解答"
                ],
                "content_structure": [
                    "幼猫发育特点",
                    "营养需求分析",
                    "喂养时间安排",
                    "环境布置要求",
                    "健康监测指标",
                    "常见问题处理",
                    "成长里程碑"
                ],
                "ages": ["2-4周", "1-2个月", "2-3个月", "3-6个月", "6-12个月"],
                "topics": ["喂养", "疫苗接种", "社会化训练", "健康检查", "环境适应"]
            },
            {
                "category": "用品测评",
                "title_patterns": [
                    "2024年{product}深度测评：{count}款产品对比",
                    "{product}选购指南：性价比分析与推荐",
                    "专业测评：{product}品牌横向对比",
                    "{product}使用体验：真实用户反馈汇总"
                ],
                "content_structure": [
                    "产品类型介绍",
                    "评测标准说明",
                    "主要品牌对比",
                    "性能测试结果",
                    "用户体验分析",
                    "性价比评估",
                    "购买建议总结"
                ],
                "products": ["猫粮", "猫砂", "猫玩具", "猫窝", "猫抓板", "自动喂食器", "饮水机", "猫包", "猫爬架"],
                "counts": ["5", "8", "10", "12"]
            },
            {
                "category": "健康护理",
                "title_patterns": [
                    "猫咪{condition}预防与治疗指南",
                    "{condition}在猫咪中的表现与应对",
                    "专业解析：猫咪{condition}的全面护理",
                    "猫咪{condition}：症状识别与处理方法"
                ],
                "content_structure": [
                    "病症基本介绍",
                    "症状识别要点",
                    "发病原因分析",
                    "预防措施详解",
                    "治疗方法介绍",
                    "护理注意事项",
                    "康复期管理"
                ],
                "conditions": ["口炎", "皮肤病", "泌尿系统疾病", "消化不良", "呼吸道感染", "寄生虫", "肥胖症", "关节炎", "心脏病"]
            },
            {
                "category": "行为训练",
                "title_patterns": [
                    "解决猫咪{behavior}问题的有效方法",
                    "猫咪{behavior}训练：从基础到进阶",
                    "理解与纠正猫咪的{behavior}行为",
                    "专业训练师教你处理猫咪{behavior}"
                ],
                "content_structure": [
                    "行为产生原因",
                    "正常与异常界定",
                    "训练基本原则",
                    "具体训练步骤",
                    "工具与环境准备",
                    "常见错误避免",
                    "进度评估方法"
                ],
                "behaviors": ["不使用猫砂盆", "抓家具", "咬人", "夜间吵闹", "挑食", "攻击性", "分离焦虑", "过度舔毛"]
            }
        ]
    
    def load_used_topics(self) -> List[str]:
        """加载已使用的话题，避免重复"""
        try:
            with open('used_topics.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def save_used_topics(self) -> None:
        """保存已使用的话题"""
        with open('used_topics.json', 'w', encoding='utf-8') as f:
            json.dump(self.used_topics, f, indent=2, ensure_ascii=False)
    
    def generate_article_idea(self) -> Dict:
        """生成文章创意"""
        template = random.choice(self.article_templates)

        # 根据模板类型生成具体内容
        if template["category"] == "品种介绍":
            breed = random.choice(template["breeds"])
            title_pattern = random.choice(template["title_patterns"])
            title = title_pattern.format(breed=breed)
            topic_key = f"{template['category']}_{breed}"

        elif template["category"] == "幼猫护理":
            age = random.choice(template["ages"])
            topic = random.choice(template["topics"])
            title_pattern = random.choice(template["title_patterns"])
            title = title_pattern.format(age=age, topic=topic)
            topic_key = f"{template['category']}_{age}_{topic}"

        elif template["category"] == "用品测评":
            product = random.choice(template["products"])
            count = random.choice(template["counts"])
            title_pattern = random.choice(template["title_patterns"])
            title = title_pattern.format(product=product, count=count)
            topic_key = f"{template['category']}_{product}"

        elif template["category"] == "健康护理":
            condition = random.choice(template["conditions"])
            title_pattern = random.choice(template["title_patterns"])
            title = title_pattern.format(condition=condition)
            topic_key = f"{template['category']}_{condition}"

        elif template["category"] == "行为训练":
            behavior = random.choice(template["behaviors"])
            title_pattern = random.choice(template["title_patterns"])
            title = title_pattern.format(behavior=behavior)
            topic_key = f"{template['category']}_{behavior}"

        else:
            # fallback
            title = "猫咪博文"
            topic_key = "unknown"

        # 检查是否已经使用过这个话题
        if topic_key in self.used_topics:
            return self.generate_article_idea()  # 递归重新生成

        return {
            "title": title,
            "category": template["category"],
            "content_structure": template["content_structure"],
            "topic_key": topic_key
        }
    
    def call_ai_api(self, prompt: str, max_tokens: int = 2000) -> str:
        """调用AI API生成内容"""
        provider = self.config["ai_provider"]

        api_key = os.getenv(f"{provider.upper()}_API_KEY", "")
        if not api_key:
            raise ValueError(f"未配置 {provider} API密钥")
        
        if provider == "openai":
            return self._call_openai_api(prompt, api_key, max_tokens)
        elif provider == "claude":
            return self._call_claude_api(prompt, api_key, max_tokens)
        elif provider == "zhipu":
            return self._call_zhipu_api(prompt, api_key, max_tokens)
        else:
            raise ValueError(f"不支持的AI提供商: {provider}")
    
    def _call_openai_api(self, prompt: str, api_key: str, max_tokens: int) -> str:
        """调用OpenAI API"""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4o",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"OpenAI API调用失败: {response.status_code} - {response.text}")
    
    def _call_zhipu_api(self, prompt: str, api_key: str, max_tokens: int) -> str:
        """调用智谱AI API (GLM-4)"""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "glm-4",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"智谱AI API调用失败: {response.status_code} - {response.text}")
    
    def generate_article_content(self, article_idea: Dict) -> str:
        """生成文章内容"""
        length_map = {
            "short": "800-1200字",
            "medium": "1500-2000字", 
            "long": "2500-3000字"
        }
        
        target_length = length_map[self.config.get("article_length", "medium")]
        
        prompt = f"""
请写一篇关于"{article_idea['title']}"的专业文章。

要求：
1. 文章长度：{target_length}
2. 分类：{article_idea['category']}
3. 文章结构应包含以下要点：
   {chr(10).join([f"   - {point}" for point in article_idea['content_structure']])}

4. 写作要求：
   - 内容专业、准确、实用
   - 语言通俗易懂，适合普通猫主人阅读
   - 包含具体的操作建议和注意事项
   - 结构清晰，使用适当的小标题
   - 避免过度营销性语言
   - 注重科学性和权威性

5. 格式要求：
   - 使用Markdown格式
   - 适当使用二级标题(##)和三级标题(###)
   - 重要信息使用加粗(**文字**)
   - 列表使用- 或数字格式
   - 在适当位置添加提示框(> 💡 提示：...)

请开始写作：
"""
        
        return self.call_ai_api(prompt, max_tokens=3000)
    
    def create_article_html(self, title: str, category: str, content: str, date: str, slug: str) -> str:
        """创建文章HTML页面"""
        # 估算阅读时间（假设每分钟250字）
        word_count = len(content)
        read_time = max(1, round(word_count / 250))
        
        # 生成SEO描述
        description = self.extract_description(content)
        
        html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 猫咪世界</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="养猫,猫咪,{category},{title.split('：')[0] if '：' in title else title}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{self.config['base_url']}/#/stories/{slug}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="canonical" href="{self.config['base_url']}/#/stories/{slug}">
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADSENSE_ID"
     crossorigin="anonymous"></script>
</head>
<body>
    <header class="site-header">
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <h1><a href="/">🐱 猫咪世界</a></h1>
                </div>
                <ul class="nav-menu">
                    <li><a href="/">首页</a></li>
                    <li><a href="/#articles">文章</a></li>
                    <li><a href="/#breeds">品种</a></li>
                    <li><a href="/#care">护理</a></li>
                    <li><a href="/#products">用品</a></li>
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
                    <span class="read-time">⏱️ {read_time}分钟阅读</span>
                </div>
                <h1>{title}</h1>
            </header>

            <!-- 广告位 -->
            <div class="ad-container">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-YOUR_ADSENSE_ID"
                     data-ad-slot="1234567890"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <div class="article-body">
                {self.markdown_to_html(content)}
                
                <!-- 文章内广告 -->
                <div class="ad-container" style="margin: 2rem 0;">
                    <ins class="adsbygoogle"
                         style="display:block; text-align:center;"
                         data-ad-layout="in-article"
                         data-ad-format="fluid"
                         data-ad-client="ca-pub-YOUR_ADSENSE_ID"
                         data-ad-slot="0987654321"></ins>
                </div>
            </div>

            <footer class="article-footer">
                <div class="article-tags">
                    <span class="tag">{category}</span>
                    <span class="tag">养猫知识</span>
                    <span class="tag">宠物护理</span>
                </div>
                
                <div class="article-share">
                    <h4>分享这篇文章</h4>
                    <div class="share-buttons">
                        <button class="share-btn" onclick="shareArticle()">分享</button>
                        <a href="https://service.weibo.com/share/share.php?url={self.config['base_url']}/#/stories/{slug}&title={title}" target="_blank" class="social-share weibo">微博</a>
                        <a href="javascript:void(0)" onclick="copyLink()" class="social-share copy">复制链接</a>
                    </div>
                </div>
            </footer>
        </article>

        <section class="related-articles">
            <h3>相关文章推荐</h3>
            <div class="related-grid" id="related-articles">
                <!-- 相关文章将通过JavaScript加载 -->
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h4>猫咪世界</h4>
                <p>专业的养猫知识分享平台，帮助铲屎官更好地照顾毛孩子。</p>
            </div>
            <div class="footer-section">
                <h4>快速链接</h4>
                <ul>
                    <li><a href="/">返回首页</a></li>
                    <li><a href="/sitemap.xml">网站地图</a></li>
                    <li><a href="/feed.xml">RSS订阅</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 猫咪世界. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // 分享功能
        function shareArticle() {{
            if (navigator.share) {{
                navigator.share({{
                    title: '{title}',
                    text: '{description}',
                    url: window.location.href
                }});
            }} else {{
                copyLink();
            }}
        }}
        
        function copyLink() {{
            navigator.clipboard.writeText(window.location.href).then(() => {{
                alert('链接已复制到剪贴板');
            }});
        }}
        
        // AdSense
        (adsbygoogle = window.adsbygoogle || []).push({{}});
        (adsbygoogle = window.adsbygoogle || []).push({{}});
    </script>
</body>
</html>"""
        
        return html_template
    
    def markdown_to_html(self, markdown_text: str) -> str:
        """简单的Markdown到HTML转换"""
        html = markdown_text
        
        # 标题转换
        html = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        
        # 加粗文本
        html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
        
        # 提示框
        html = re.sub(r'^> 💡 提示：(.*$)', r'<div class="tip-box">💡 <strong>提示：</strong>\1</div>', html, flags=re.MULTILINE)
        html = re.sub(r'^> (.*$)', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
        
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
                result_lines.append(line)
        
        if in_ul:
            result_lines.append('</ul>')
        
        html = '\n'.join(result_lines)
        
        # 段落转换
        paragraphs = html.split('\n\n')
        html_paragraphs = []
        for p in paragraphs:
            p = p.strip()
            if p and not p.startswith('<'):
                html_paragraphs.append(f'<p>{p}</p>')
            else:
                html_paragraphs.append(p)
        
        return '\n\n'.join(html_paragraphs)
    
    def extract_description(self, content: str, max_length: int = 160) -> str:
        """从内容中提取SEO描述"""
        # 移除Markdown标记
        text = re.sub(r'[#*>-]', '', content)
        text = re.sub(r'\n+', ' ', text).strip()
        
        if len(text) <= max_length:
            return text
        
        # 在句号处截断
        sentences = text.split('。')
        description = ""
        for sentence in sentences:
            if len(description + sentence + '。') <= max_length:
                description += sentence + '。'
            else:
                break
        
        return description or text[:max_length] + '...'
    
    def generate_slug(self, title: str) -> str:
        """生成URL友好的slug"""
        import hashlib
        # 使用标题的哈希值确保唯一性
        hash_value = hashlib.md5(title.encode('utf-8')).hexdigest()[:8]
        
        # 简化的slug生成
        slug_map = {
            '品种介绍': 'breed',
            '幼猫护理': 'kitten-care',
            '用品测评': 'product-review',
            '健康护理': 'health-care',
            '行为训练': 'behavior-training'
        }
        
        return f"{slug_map.get('品种介绍', 'article')}-{hash_value}"
    
    def update_articles_index(self, article_info: Dict) -> None:
        """更新文章索引"""
        articles_file = 'articles.json'
        
        try:
            with open(articles_file, 'r', encoding='utf-8') as f:
                articles = json.load(f)
        except FileNotFoundError:
            articles = []
        
        # 添加新文章到列表开头
        articles.insert(0, article_info)
        
        # 保存更新后的索引
        with open(articles_file, 'w', encoding='utf-8') as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)
    
    def generate_article(self) -> Dict:
        """生成一篇完整的文章"""
        # 生成文章创意
        article_idea = self.generate_article_idea()
        print(f"正在生成文章：{article_idea['title']}")
        
        # 生成文章内容
        content = self.generate_article_content(article_idea)
        
        # 生成文章信息
        date = datetime.datetime.now().strftime("%Y-%m-%d")
        slug = self.generate_slug(article_idea['title'])
        
        # 创建HTML文件
        html_content = self.create_article_html(
            article_idea['title'],
            article_idea['category'],
            content,
            date,
            slug
        )
        
        # 确保输出目录存在
        os.makedirs(self.config['output_dir'], exist_ok=True)
        
        # 保存HTML文件
        html_file_path = f"{self.config['output_dir']}/{slug}.html"
        with open(html_file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # 文章信息
        article_info = {
            "title": article_idea['title'],
            "category": article_idea['category'],
            "excerpt": self.extract_description(content, 120),
            "date": date,
            "readTime": f"{max(1, round(len(content) / 250))}分钟",
            "slug": slug,
            "icon": self.get_category_icon(article_idea['category'])
        }
        
        # 更新文章索引
        self.update_articles_index(article_info)
        
        # 记录已使用的话题
        self.used_topics.append(article_idea['topic_key'])
        self.save_used_topics()
        
        print(f"文章生成完成：{html_file_path}")
        return article_info
    
    def get_category_icon(self, category: str) -> str:
        """根据分类获取图标"""
        icons = {
            "品种介绍": "🏆",
            "幼猫护理": "🍼", 
            "用品测评": "🥫",
            "健康护理": "🏥",
            "行为训练": "🧠"
        }
        return icons.get(category, "🐱")

def main():
    """主函数"""
    print("🐱 开始生成猫咪文章...")
    
    generator = ArticleGenerator()
    
    try:
        # 生成文章
        article_count = generator.config.get('articles_per_day', 1)
        for i in range(article_count):
            article_info = generator.generate_article()
            print(f"✅ 第{i+1}篇文章生成成功：{article_info['title']}")
            
            # 避免API调用过频繁
            if i < article_count - 1:
                time.sleep(3)  # 减少等待时间，因为文章数量较多
        
        print(f"🎉 今日文章生成完成，共生成 {article_count} 篇文章")
        
    except Exception as e:
        print(f"❌ 文章生成失败：{str(e)}")
        raise

if __name__ == "__main__":
    main()