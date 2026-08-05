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

from article_style import ARTICLE_STYLE

load_dotenv()  # 加载 .env 文件
openai_key = os.getenv("OPENAI_API_KEY")
claude_key = os.getenv("CLAUDE_API_KEY")
zhipu_key = os.getenv("ZHIPU_API_KEY")
qwen_key = os.getenv("QWEN_API_KEY")

class TopicExhaustedError(Exception):
    """标题模板组合已经用尽，再生成只会和已发布文章重名"""
    pass


class ArticleGenerator:
    def __init__(self, config_file: str = "config.json"):
        """初始化文章生成器"""
        # 自动检测并切换到项目根目录
        self.setup_working_directory()
        self.config = self.load_config(config_file)
        self.article_templates = self.load_article_templates()
        self.used_topics = self.load_used_topics()
        # articles.json 才是"已发布"的权威记录：used_topics.json 可能因为
        # 没被 CI 提交而丢状态，只靠它去重会导致标题撞车、文章互相覆盖
        self.published_titles = self.load_published_titles()
    
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
                    "认识{breed}猫：品种特征与饲养要点",
                    "{breed}猫饲养全攻略：新手必读",
                    "揭秘{breed}猫：你不知道的品种秘密",
                    "{breed}猫适合你吗？完整分析报告",
                    "专业解读{breed}猫：从选购到护理"
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
                    "幼猫{topic}常见问题解答",
                    "{age}幼猫{topic}全攻略：专家建议",
                    "幼猫{topic}必读指南：避免常见错误",
                    "{age}幼猫{topic}详解：从理论到实践",
                    "幼猫{topic}实用技巧：新手也能轻松上手"
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
                    "2025年{product}深度测评：{count}款产品对比",
                    "{product}选购指南：性价比分析与推荐",
                    "专业测评：{product}品牌横向对比",
                    "{product}使用体验：真实用户反馈汇总",
                    "{product}购买攻略：避坑指南与推荐",
                    "2025年{product}排行榜：{count}款热门产品测评",
                    "{product}选购全攻略：从入门到精通",
                    "{product}深度解析：{count}款产品真实体验"
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
                "products": ["猫粮", "猫砂", "猫玩具", "猫窝", "猫抓板", "自动喂食器", "宠物饮水机", "猫包", "猫爬架"],
                "counts": ["5", "8", "10", "12"]
            },
            {
                "category": "健康护理",
                "title_patterns": [
                    "猫咪{condition}预防与治疗指南",
                    "{condition}在猫咪中的表现与应对",
                    "专业解析：猫咪{condition}的全面护理",
                    "猫咪{condition}：症状识别与处理方法",
                    "猫咪{condition}完全指南：预防、识别、治疗",
                    "{condition}猫咪护理手册：专家建议",
                    "猫咪{condition}应对策略：从预防到康复",
                    "专业解读猫咪{condition}：症状、原因、治疗"
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
                    "专业训练师教你处理猫咪{behavior}",
                    "猫咪{behavior}行为矫正：科学方法详解",
                    "{behavior}猫咪训练指南：实用技巧分享",
                    "专业解析猫咪{behavior}：原因与解决方案",
                    "猫咪{behavior}问题解决手册：从理论到实践"
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
            },
            {
                "category": "营养饮食",
                "title_patterns": [
                    "猫咪{nutrition}营养指南：科学喂养方法",
                    "{nutrition}猫咪饮食全攻略：专家建议",
                    "猫咪{nutrition}营养解析：从理论到实践",
                    "{nutrition}猫咪喂养指南：避免常见误区",
                    "专业营养师解读猫咪{nutrition}：完整方案",
                    "猫咪{nutrition}营养手册：实用技巧分享",
                    "{nutrition}猫咪饮食详解：科学方法与注意事项",
                    "猫咪{nutrition}营养攻略：新手必读指南"
                ],
                "content_structure": [
                    "营养需求分析",
                    "食材选择要点",
                    "喂养时间安排",
                    "营养搭配原则",
                    "常见问题解答",
                    "注意事项提醒",
                    "专家建议总结"
                ],
                "nutrition": ["蛋白质", "维生素", "矿物质", "脂肪", "碳水化合物", "水分", "膳食纤维", "益生菌"]
            }
        ]
    
    def load_used_topics(self) -> Dict[str, List[str]]:
        """加载已使用的话题，避免重复"""
        try:
            with open('used_topics.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 兼容旧格式
                if isinstance(data, list):
                    return {"topics": data, "titles": [], "categories": {}}
                return data
        except FileNotFoundError:
            return {"topics": [], "titles": [], "categories": {}}
    
    def save_used_topics(self) -> None:
        """保存已使用的话题"""
        with open('used_topics.json', 'w', encoding='utf-8') as f:
            json.dump(self.used_topics, f, indent=2, ensure_ascii=False)

    def load_published_titles(self) -> set:
        """从 articles.json 读取所有已发布的标题"""
        try:
            with open('articles.json', 'r', encoding='utf-8') as f:
                articles = json.load(f)
            titles = {a['title'] for a in articles if a.get('title')}
            print(f"📚 已发布 {len(titles)} 个不同标题，将避免重复")
            return titles
        except FileNotFoundError:
            return set()

    def count_available_titles(self) -> int:
        """粗略统计还剩多少个没用过的标题组合"""
        import itertools
        all_titles = set()
        for t in self.article_templates:
            option_lists = {k: v for k, v in t.items()
                            if k not in ('category', 'title_patterns', 'content_structure')}
            for pattern in t['title_patterns']:
                names = sorted(set(re.findall(r'\{(\w+)\}', pattern)))
                pools = []
                for name in names:
                    pool = option_lists.get(name) or option_lists.get(name + 's') \
                        or next((v for k, v in option_lists.items() if k.rstrip('s') == name), None)
                    pools.append(pool or [])
                for combo in itertools.product(*pools):
                    all_titles.add(pattern.format(**dict(zip(names, combo))))
        return len(all_titles - self.published_titles)
    
    def generate_article_idea(self) -> Dict:
        """生成文章创意"""
        # 随机抽取，剩余可用标题越少越需要多试几次，避免误判"已用尽"
        max_attempts = 500
        attempts = 0
        
        while attempts < max_attempts:
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

            elif template["category"] == "营养饮食":
                nutrition = random.choice(template["nutrition"])
                title_pattern = random.choice(template["title_patterns"])
                title = title_pattern.format(nutrition=nutrition)
                topic_key = f"{template['category']}_{nutrition}"

            else:
                # fallback
                title = "猫咪博文"
                topic_key = "unknown"

            # 检查是否已经使用过这个话题或标题
            # published_titles 来自 articles.json，是跨运行持久的去重依据；
            # 少了它，标题撞车会让 articles/<slug>.html 被静默覆盖
            if (title not in self.published_titles and
                topic_key not in self.used_topics.get("topics", []) and
                title not in self.used_topics.get("titles", []) and
                self._check_category_balance(template["category"])):
                return {
                    "title": title,
                    "category": template["category"],
                    "content_structure": template["content_structure"],
                    "topic_key": topic_key
                }
            
            attempts += 1
        
        # 抽不到没用过的标题 = 模板组合已经用尽。
        # 这里绝不能退回 _generate_fallback_idea()：那 3 个写死的标题同样会重名，
        # 只会用另一种方式重新制造"文章互相覆盖"的问题。宁可失败，也不要静默覆盖。
        remaining = self.count_available_titles()
        raise TopicExhaustedError(
            f"试了 {max_attempts} 次都抽不到没用过的标题（剩余可用组合约 {remaining} 个）。"
            f"请在 load_article_templates() 里扩充 breeds / ages / topics / products / "
            f"conditions / behaviors / nutrition 词表或 title_patterns 后再运行。"
        )

    def _check_category_balance(self, category: str) -> bool:
        """检查分类平衡，避免某个分类过多"""
        category_counts = self.used_topics.get("categories", {})
        current_count = category_counts.get(category, 0)
        
        # 如果某个分类已经有3篇以上文章，减少该分类的选择概率
        if current_count >= 3:
            return random.random() > 0.7  # 30%的概率仍然选择
        
        return True
    
    def _generate_fallback_idea(self) -> Dict:
        """生成备用文章创意"""
        # 使用更通用的标题模板
        fallback_templates = [
            {
                "title": "猫咪日常护理小贴士",
                "category": "健康护理",
                "content_structure": ["基础护理", "营养需求", "运动建议", "健康检查", "常见问题"]
            },
            {
                "title": "新手养猫必备知识",
                "category": "幼猫护理", 
                "content_structure": ["准备工作", "基础护理", "训练要点", "注意事项", "成长里程碑"]
            },
            {
                "title": "猫咪用品选购指南",
                "category": "用品测评",
                "content_structure": ["选购原则", "品牌推荐", "性价比分析", "使用技巧", "维护保养"]
            }
        ]
        
        template = random.choice(fallback_templates)
        return {
            "title": template["title"],
            "category": template["category"],
            "content_structure": template["content_structure"],
            "topic_key": f"fallback_{template['category']}_{random.randint(1000, 9999)}"
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
        
        # 生成文章图片URL（使用网站logo）
        og_image = f"{self.config['base_url']}/assets/images/logo.png"
        
        html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 猫咪世界</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="养猫,猫咪,{category},{title.split('：')[0] if '：' in title else title}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{self.config['base_url']}/articles/{slug}.html">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
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
    <meta name="twitter:url" content="{self.config['base_url']}/articles/{slug}.html">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{og_image}">
    
    <!-- WeChat specific -->
    <meta name="apple-mobile-web-app-title" content="猫咪世界">
    <meta name="application-name" content="猫咪世界">
    <link rel="canonical" href="{self.config['base_url']}/articles/{slug}.html">
    {ARTICLE_STYLE}
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
                        <a href="https://service.weibo.com/share/share.php?url={self.config['base_url']}/articles/{slug}.html&title={title}" target="_blank" class="social-share weibo">微博</a>
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
        text = re.sub(r'#+\s*', '', content)  # 移除标题标记
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # 移除加粗标记
        text = re.sub(r'[*>-]', '', text)  # 移除其他标记
        text = re.sub(r'\n+', ' ', text).strip()  # 合并换行
        
        # 获取第一段有意义的内容
        sentences = [s.strip() for s in text.split('。') if s.strip() and len(s.strip()) > 10]
        if sentences:
            first_sentence = sentences[0] + '。'
            if len(first_sentence) <= max_length:
                return first_sentence
            else:
                return first_sentence[:max_length-3] + '...'
        
        # 如果没有合适的句子，截取前部分内容
        return text[:max_length-3] + '...' if len(text) > max_length else text
    
    def generate_slug(self, title: str, category: str) -> str:
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
            '行为训练': 'behavior-training',
            '营养饮食': 'nutrition'
        }

        return f"{slug_map.get(category, 'article')}-{hash_value}"
    
    def update_articles_index(self, article_info: Dict) -> None:
        """更新文章索引"""
        articles_file = 'articles.json'
        
        try:
            with open(articles_file, 'r', encoding='utf-8') as f:
                articles = json.load(f)
        except FileNotFoundError:
            articles = []
        
        # 同一个 slug 只保留一条：磁盘上 articles/<slug>.html 会被覆盖，
        # 索引里再追加一条就会出现"一个 URL 对应多条记录"，
        # sitemap 和 RSS 都会跟着重复。
        articles = [a for a in articles if a.get('slug') != article_info['slug']]

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
        slug = self.generate_slug(article_idea['title'], article_idea['category'])
        
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
        if "topics" not in self.used_topics:
            self.used_topics["topics"] = []
        if "titles" not in self.used_topics:
            self.used_topics["titles"] = []
        if "categories" not in self.used_topics:
            self.used_topics["categories"] = {}
        
        self.used_topics["topics"].append(article_idea['topic_key'])
        self.used_topics["titles"].append(article_idea['title'])
        
        # 更新分类计数
        category = article_idea['category']
        self.used_topics["categories"][category] = self.used_topics["categories"].get(category, 0) + 1
        
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
            "行为训练": "🧠",
            "营养饮食": "🍽️"
        }
        return icons.get(category, "🐱")

def main():
    """主函数"""
    print("🐱 开始生成猫咪文章...")
    
    generator = ArticleGenerator()
    
    print(f"🧮 剩余可用标题组合：约 {generator.count_available_titles()} 个")

    generated = 0
    try:
        # 生成文章
        article_count = generator.config.get('articles_per_day', 1)
        for i in range(article_count):
            try:
                article_info = generator.generate_article()
            except TopicExhaustedError as e:
                # 标题用尽：保留已经生成的部分，不要为了凑数去覆盖旧文章
                print(f"🛑 标题已用尽，停止生成：{e}")
                break
            generated += 1
            print(f"✅ 第{generated}篇文章生成成功：{article_info['title']}")

            # 避免API调用过频繁
            if i < article_count - 1:
                time.sleep(3)  # 减少等待时间，因为文章数量较多

        print(f"🎉 今日文章生成完成，共生成 {generated} 篇文章")

        if generated == 0:
            raise TopicExhaustedError(
                "本次一篇文章都没生成出来：标题模板组合已经用尽，"
                "请扩充 load_article_templates() 里的词表后再运行。"
            )

    except Exception as e:
        print(f"❌ 文章生成失败：{str(e)}")
        raise

if __name__ == "__main__":
    main()