# 🚀 快速部署指南

## 1. 准备工作 (5分钟)

### 复制项目
1. 创建免费Organization：https://github.com/organizations/new
2. 组织名建议：`pet-content-hub`
3. 在组织下Fork这个仓库，命名为 `pet-daily`

### 获取API密钥
选择一个AI服务提供商：

**推荐：OpenAI (最稳定)**
- 访问 https://platform.openai.com/api-keys
- 创建新的API密钥
- 复制密钥备用

**国内选择：智谱AI (便宜稳定)**
- 访问 https://open.bigmodel.cn/
- 注册并获取API密钥

## 2. 配置GitHub (3分钟)

### 设置API密钥
1. 进入你Fork的仓库
2. 点击 `Settings` > `Secrets and variables` > `Actions`
3. 点击 `New repository secret`
4. 添加密钥：
   - Name: `OPENAI_API_KEY`
   - Secret: 你的API密钥

### 开启GitHub Pages
1. 仍在 `Settings` 页面，找到 `Pages`
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `gh-pages`
4. 点击 `Save`

## 3. 自定义配置 (2分钟)

### 修改基本信息
编辑仓库中的 `config.json`：

```json
{
  "base_url": "https://你的域名.com",
  "ai_provider": "openai"
}
```

**注意：** 使用你的实际域名，不要包含路径。

### 更新网站信息
编辑 `robots.txt`，替换URL：
```
Sitemap: https://你的域名.com/sitemap.xml
```

## 4. 测试运行 (1分钟)

### 本地测试（无需API密钥）
```bash
cd scripts
python test_local.py
```

### GitHub Actions测试
1. 进入 `Actions` 标签页
2. 选择 `Daily Article Generation`  
3. 点击 `Run workflow` > `Run workflow`
4. 等待约2-3分钟完成

## 5. 查看结果

访问：`https://你的域名.com`

**URL 格式：**
- 首页：`https://你的域名.com/`
- 文章：`https://你的域名.com/#/stories/xxx`
- 关于：`https://你的域名.com/#/about`

## 🎯 常见问题

**Q: API调用失败怎么办？**
A: 检查API密钥是否正确，确认账户有足够额度

**Q: 网站无法访问？**  
A: 等待5-10分钟，GitHub Pages需要时间部署

**Q: Hash 路由是什么？**
A: URL 中的 `#` 部分，如 `/#/stories/xxx`，确保与 GitHub Pages 完全兼容

**Q: 文章质量不满意？**
A: 修改 `scripts/generate_article.py` 中的提示词

## 💰 申请AdSense (可选)

1. 网站运行1-2周后申请 Google AdSense
2. 获得批准后，替换HTML中的 `ca-pub-YOUR_ADSENSE_ID`
3. 开始获得广告收入

## 🔄 自动化运行

系统将在每天上午10点（北京时间）自动生成新文章。

---

**🎉 恭喜！你的猫猫博客已经成功部署！**