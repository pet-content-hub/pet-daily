#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性回填脚本：给已有的静态文章页补上内联样式

背景：文章模板一直引用 ../assets/css/style.css，但这个文件在仓库里
从来没有存在过，线上 404，所有文章页都是无样式的裸 HTML。
把 sitemap 指向这些页面之后它们就是搜索流量的落地页，必须能看。

顺带修掉同一批文件里所有指向 /#/stories/<slug> 的地址。这类 fragment
地址搜索引擎不认，尤其是有 9 个旧文件的 <link rel="canonical"> 就指向它——
等于告诉 Google"我的规范地址是首页"，页面永远不会被单独收录。

脚本可以重复运行，已经处理过的文件会跳过。

用法：
    python scripts/backfill_article_style.py            # 实际写入
    python scripts/backfill_article_style.py --dry-run  # 只看会改什么
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from article_style import ARTICLE_STYLE

# 原来那行指向不存在文件的样式表引用
STYLESHEET_LINK = re.compile(r'[ \t]*<link rel="stylesheet" href="\.\./assets/css/style\.css">\n?')
# 判断是否已经回填过
STYLE_MARKER = '--accent: #ff6b6b;'
# 任何指向 /#/stories/<slug> 的地址：canonical、og:url、微博分享 …
HASH_STORY_URL = re.compile(r'(https?://[^\s"\'<>]*?)/#/stories/([A-Za-z0-9_-]+)')


def backfill(path: str, dry_run: bool = False) -> dict:
    """处理单个文件，返回本次做了哪些改动"""
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    changes = {'style': False, 'urls': 0}

    # 1) 去掉失效的外链样式表
    html, removed = STYLESHEET_LINK.subn('', html)

    # 2) 插入内联样式（已经有就不重复插）
    if STYLE_MARKER not in html:
        if '</head>' in html:
            html = html.replace('</head>', f'    {ARTICLE_STYLE}\n</head>', 1)
            changes['style'] = True
        else:
            print(f"⚠️  {path} 找不到 </head>，跳过样式注入")
    elif removed:
        changes['style'] = True

    # 3) 把所有 hash 地址改成真实的静态页地址
    html, n = HASH_STORY_URL.subn(r'\1/articles/\2.html', html)
    changes['urls'] = n

    if html != original and not dry_run:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)

    return changes


def main():
    dry_run = '--dry-run' in sys.argv

    # 允许从 scripts/ 或项目根目录运行
    if os.path.basename(os.getcwd()) == 'scripts':
        os.chdir('..')

    articles_dir = 'articles'
    if not os.path.isdir(articles_dir):
        print(f"❌ 找不到目录 {articles_dir}/")
        return 1

    files = sorted(f for f in os.listdir(articles_dir) if f.endswith('.html'))
    styled = url_files = url_total = 0

    for name in files:
        result = backfill(os.path.join(articles_dir, name), dry_run)
        styled += result['style']
        if result['urls']:
            url_files += 1
            url_total += result['urls']

    prefix = '[dry-run] ' if dry_run else ''
    print(f"{prefix}共扫描 {len(files)} 个文章页")
    print(f"{prefix}注入内联样式：{styled} 个")
    print(f"{prefix}修正 hash 地址：{url_total} 处，涉及 {url_files} 个文件")
    return 0


if __name__ == '__main__':
    sys.exit(main())
