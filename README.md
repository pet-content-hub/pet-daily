# 🐱 猫咪世界 - AI自动化宠物博客

专业的养猫知识分享平台，使用AI每日自动生成高质量宠物文章，支持SEO优化和广告变现。

## ✨ 特性

- 🤖 **AI自动生成内容** - 支持OpenAI、Claude、智谱AI等多种API
- 📅 **每日定时发布** - GitHub Actions自动化工作流
- 🎯 **SEO优化** - 完整的meta标签、sitemap、RSS订阅
- 💰 **广告变现** - 预集成Google AdSense代码
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🚀 **零成本托管** - 基于GitHub Pages

## 🛠️ 快速开始

### 1. 项目设置

1. Fork 这个仓库到你的GitHub账户
2. 在仓库设置中开启GitHub Pages（选择gh-pages分支）
3. 克隆仓库到本地：

```bash
git clone https://github.com/pet-content-hub/pet-daily.git
cd pet-daily
```

### 2. 配置API密钥

在GitHub仓库的Settings > Secrets and variables > Actions中添加以下密钥：

- `OPENAI_API_KEY` - OpenAI API密钥
- `CLAUDE_API_KEY` - Claude API密钥（可选）
- `ZHIPU_API_KEY` - 智谱AI API密钥（可选）
- `QWEN_API_KEY` - 阿里通义千问API密钥（可选）

### 3. 修改配置

编辑 `config.json` 文件：

```json
{
  "ai_provider": "openai",
  "base_url": "https://pet-content-hub.github.io/pet-daily",
  "ads": {
    "google_adsense_id": "ca-pub-YOUR_ADSENSE_ID"
  }
}
```

### 4. 自定义内容

- 修改 `index.html` 中的站点信息
- 更新 `robots.txt` 中的网站URL
- 替换广告位的AdSense ID

### 5. 手动测试

本地测试文章生成：

```bash
# 从项目根目录运行
python -m pip install requests
export OPENAI_API_KEY="your-api-key"
python scripts/generate_article.py

# 或者从scripts目录运行（推荐）
cd scripts
python generate_article.py
```

**注意：** 脚本会自动检测运行目录并切换到正确的工作路径，确保文件生成在项目根目录。

### 无API密钥测试

如果暂时没有API密钥，可以使用测试脚本生成示例文章：

```bash
cd scripts
python test_local.py
```

这会生成一篇示例文章，用于测试网站功能。

## 📁 项目结构

```
mao.com.cn/
├── index.html              # 主页
├── articles.json           # 文章索引
├── config.json            # 配置文件
├── robots.txt             # 搜索引擎爬虫规则
├── sitemap.xml            # 网站地图（自动生成）
├── feed.xml               # RSS订阅（自动生成）
├── assets/                # 静态资源
│   ├── css/style.css      # 样式文件
│   └── js/main.js         # JavaScript
├── articles/              # 文章HTML文件（自动生成）
├── scripts/               # 生成脚本
│   ├── generate_article.py
│   ├── generate_sitemap.py
│   └── generate_rss.py
└── .github/workflows/     # GitHub Actions
    └── daily-article.yml
```

## 🤖 AI文章生成系统

### 支持的文章类型

- **品种介绍** - 各种猫咪品种的详细介绍
- **幼猫护理** - 从出生到成年的护理指南
- **用品测评** - 猫粮、猫砂、玩具等产品评测
- **健康护理** - 疾病预防和治疗指南
- **行为训练** - 猫咪行为问题解决方案

### 文章质量保证

- 内容结构化，包含多个章节
- 专业术语准确，通俗易懂
- 包含实用建议和注意事项
- 自动生成SEO友好的标题和描述
- 避免重复话题，智能选择新内容

## 📈 SEO优化功能

- **Meta标签** - 自动生成title、description、keywords
- **Open Graph** - 社交媒体分享优化
- **结构化数据** - Schema.org标记
- **网站地图** - 自动更新sitemap.xml
- **RSS订阅** - 自动生成feed.xml
- **内部链接** - 相关文章推荐
- **响应式设计** - 移动端友好

## 💰 变现策略

### 1. Google AdSense
- 头部横幅广告
- 文章内插入广告
- 侧边栏广告位
- 自适应广告单元

### 2. 扩展变现
- 联盟营销（猫粮、用品推荐）  
- 付费咨询服务
- 电子书/课程销售
- 品牌合作推广

## 🚀 部署和维护

### GitHub Actions自动化

- **每日定时运行** - 北京时间上午10点自动生成文章
- **失败重试机制** - 如果生成失败，1小时后自动重试  
- **自动部署** - 生成完成后自动部署到GitHub Pages
- **手动触发** - 支持手动运行工作流

### 监控和优化

1. **Google Analytics** - 添加跟踪代码监控流量
2. **Google Search Console** - 提交sitemap，监控搜索表现
3. **内容质量** - 定期检查生成的文章质量
4. **关键词优化** - 根据搜索数据调整文章方向

## 🔧 故障排除

### 常见问题

1. **API调用失败**
   - 检查API密钥是否正确设置
   - 确认API额度是否充足
   - 查看GitHub Actions日志

2. **文章生成质量不佳**
   - 调整`config.json`中的文章长度设置
   - 修改文章模板和结构
   - 尝试不同的AI提供商

3. **GitHub Pages部署失败**
   - 检查仓库权限设置
   - 确认gh-pages分支是否正确创建
   - 查看Actions执行日志

### 日志查看

在GitHub仓库的Actions标签页可以查看每次运行的详细日志。

## 📊 性能优化

- **图片优化** - 使用WebP格式，添加懒加载
- **CSS/JS压缩** - 减小文件大小
- **CDN加速** - 使用jsDelivr加载静态资源
- **缓存策略** - 设置合适的缓存头

## 🔮 未来规划

- [ ] 视频内容生成（结合AI视频工具）
- [ ] 小红书内容同步发布
- [ ] 微信公众号自动推送
- [ ] 用户评论系统
- [ ] 搜索功能
- [ ] 多语言支持

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

---

**开始你的AI内容创业之旅吧！** 🚀