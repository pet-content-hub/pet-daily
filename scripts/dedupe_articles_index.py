#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性清洗脚本：把 articles.json 里的重复记录去掉

背景：generate_slug() 用标题的 md5 当 slug，而标题模板组合有限，
同一个标题被反复生成时 articles/<slug>.html 会被覆盖，
但 update_articles_index() 只管往索引里追加，于是出现
"一个 URL 对应十几条索引记录"。sitemap 和 RSS 都跟着重复。

清洗规则：
  1. articles.json 是新→旧排列，同一个 slug 只保留第一条（最新那次生成），
     它和磁盘上现存的 HTML 内容一致；
  2. 保留下来的条目若标题和磁盘 HTML 的 <title> 对不上，以 HTML 为准
     （线上真正被访问到的是 HTML）；
  3. 磁盘上找不到 HTML 的条目直接丢弃，避免索引里留下死链。

用法：
    python scripts/dedupe_articles_index.py            # 实际写入
    python scripts/dedupe_articles_index.py --dry-run  # 只看会改什么
"""

import json
import os
import re
import sys

TITLE_RE = re.compile(r'<title>(.*?) - 猫咪世界</title>', re.S)


def html_title(path: str):
    """读取静态页里的文章标题"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            head = f.read(4000)
    except OSError:
        return None
    m = TITLE_RE.search(head)
    return m.group(1).strip() if m else None


def main():
    dry_run = '--dry-run' in sys.argv

    # 允许从 scripts/ 或项目根目录运行
    if os.path.basename(os.getcwd()) == 'scripts':
        os.chdir('..')

    with open('articles.json', 'r', encoding='utf-8') as f:
        articles = json.load(f)

    kept = []
    seen = set()
    missing = []
    retitled = []

    for article in articles:
        slug = article.get('slug')
        if not slug or slug in seen:
            continue
        seen.add(slug)

        path = os.path.join('articles', f'{slug}.html')
        if not os.path.exists(path):
            missing.append(slug)
            continue

        actual = html_title(path)
        if actual and actual != article.get('title'):
            retitled.append((slug, article.get('title'), actual))
            article = {**article, 'title': actual}

        kept.append(article)

    print(f"原有 {len(articles)} 条 → 去重后 {len(kept)} 条（删掉 {len(articles) - len(kept)} 条重复记录）")
    if retitled:
        print(f"以磁盘 HTML 为准修正了 {len(retitled)} 个标题：")
        for slug, old, new in retitled:
            print(f"  {slug}: {old!r} → {new!r}")
    if missing:
        print(f"丢弃 {len(missing)} 个在 articles/ 下没有 HTML 的条目：{missing[:10]}")

    if dry_run:
        print("[dry-run] 未写入 articles.json")
        return 0

    with open('articles.json', 'w', encoding='utf-8') as f:
        json.dump(kept, f, indent=2, ensure_ascii=False)
    print("✅ 已写入 articles.json")
    return 0


if __name__ == '__main__':
    sys.exit(main())
