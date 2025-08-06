# 🚀 部署指南 - 解决模块解析错误

## ❌ 当前问题
服务器显示错误：`Failed to resolve module specifier "vue"`

## 🔍 错误原因
你部署了**源码文件**（src/目录），而不是**构建后的文件**（dist/目录）。

## ✅ 正确解决方案

### 立即修复（手动部署）

**1. 确认构建文件**
检查本地 `dist/` 目录包含以下文件：
```
dist/
├── index.html                 ← 这是入口文件
├── assets/
│   ├── main-CyYgdczf.js      ← 打包后的Vue应用
│   ├── main-B3freKoz.css     ← 打包后的样式
│   ├── Home-a3HRQiLa.js      ← 各页面组件
│   ├── About-BuzROpUg.js
│   ├── Article-CAE8MZmX.js
│   └── ... (其他文件)
├── manifest.webmanifest      ← PWA配置
├── registerSW.js            ← Service Worker
└── sw.js                    ← PWA缓存
```

**2. 服务器部署步骤**
1. **删除**服务器上的 `src/`、`node_modules/`、`package.json` 等开发文件
2. **上传** `dist/` 目录中的**所有文件**到服务器根目录
3. 确保服务器配置指向 `index.html`

**3. 服务器配置**
确保你的Web服务器：
- 入口文件指向 `index.html`
- 支持SPA路由（所有路径都返回index.html）
- 开启gzip压缩（提升性能）

### 自动部署（推荐）

**GitHub Actions会自动：**
1. 构建Vue应用 (`npm run build`)
2. 将 `dist/` 目录部署到 GitHub Pages
3. 无需手动操作

**触发自动部署：**
```bash
git add .
git commit -m "✅ 修复部署配置，添加LOGO支持"
git push origin main
```

## 🔧 服务器配置示例

### Apache (.htaccess)
```apache
RewriteEngine On
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**注意：** 项目使用 Hash 路由模式，无需特殊的服务器配置。所有路由都通过 `/#/` 前缀处理。

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Node.js (Express)
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

## ✅ 部署后验证

访问网站后，检查：
- [x] 页面正常显示
- [x] 导航栏有LOGO图片（如果已添加图片文件）
- [x] 路由切换正常（/about, /#/stories/xxx）
- [x] 控制台无错误
- [x] PWA功能可用

## 🎯 关键要点

1. **永远部署 `dist/` 目录的内容**
2. **不要部署 `src/`, `node_modules/`, `package.json`**
3. **Hash 路由模式无需特殊服务器配置**
4. **使用GitHub Actions自动部署更可靠**
5. **URL 格式：`https://your-domain.com/#/stories/xxx`**

## 📞 如果仍有问题

检查以下项目：
- 服务器是否正确指向了 `index.html`
- 文件路径是否正确
- 服务器是否支持现代JavaScript
- 网络控制台是否有其他错误信息