# 生产环境部署指南

## 1. 创建 Supabase 生产项目

### 步骤 1：注册并创建项目
1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 创建新项目：
   - Organization: 选择或创建组织
   - Project name: `mao-com-cn-prod`
   - Database password: 使用强密码（记录下来）
   - Region: 选择离用户最近的区域（推荐 Singapore 或 Tokyo）

### 步骤 2：获取项目配置
创建项目后，在项目设置页面获取：
```
Project URL: https://your-project-id.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步骤 3：运行数据库迁移
在 Supabase SQL Editor 中执行我们的迁移脚本：

1. 打开 SQL Editor
2. 复制并执行 `supabase/migrations/20250101000000_initial_schema.sql` 的内容
3. 确认所有表和策略都创建成功

### 步骤 4：配置环境变量
创建生产环境配置文件 `.env.production`：

```bash
# Supabase 生产环境配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 应用配置
VITE_APP_TITLE=猫咪世界
VITE_APP_DESCRIPTION=专业的养猫知识分享平台
```

## 2. 配置邮件发送服务

Supabase 默认使用内置的 SMTP 服务，但生产环境建议使用专业邮件服务。

### 方案 A：使用 Supabase 内置邮件服务
1. 在 Supabase Dashboard → Authentication → Settings
2. 配置 SMTP 设置：
   - SMTP Host: smtp.gmail.com (如果使用 Gmail)
   - SMTP Port: 587
   - SMTP User: your-email@gmail.com
   - SMTP Pass: your-app-password
   - Sender Name: 猫咪世界
   - Sender Email: your-email@gmail.com

### 方案 B：使用专业邮件服务（推荐）

#### 使用 SendGrid
1. 注册 [SendGrid](https://sendgrid.com)
2. 创建 API Key
3. 在 Supabase Dashboard → Authentication → Settings 配置：
   - Enable custom SMTP
   - SMTP Host: smtp.sendgrid.net
   - SMTP Port: 587
   - SMTP User: apikey
   - SMTP Pass: 你的 SendGrid API Key
   - Sender Name: 猫咪世界
   - Sender Email: noreply@yourdomain.com

#### 使用阿里云邮件推送
1. 开通阿里云邮件推送服务
2. 获取 SMTP 配置信息
3. 在 Supabase 中配置相应的 SMTP 设置

### 邮件模板自定义
在 Supabase Dashboard → Authentication → Email Templates 中自定义：

1. **Magic Link 邮件模板**：
```html
<h2>登录到猫咪世界</h2>
<p>点击下面的链接登录到您的账户：</p>
<p><a href="{{ .SiteURL }}/auth/callback{{ .TokenHash }}">登录</a></p>
<p>如果您没有请求此邮件，请忽略它。</p>
<p>此链接将在 {{ .RedirectTo }} 分钟后过期。</p>
```

## 3. 配置自定义域名的 Magic Link 重定向

### 步骤 1：设置域名
1. 在 Supabase Dashboard → Authentication → Settings
2. Site URL 设置为：`https://www.mao.com.cn`
3. Additional Redirect URLs 添加：
   ```
   https://www.mao.com.cn/auth/callback
   https://mao.com.cn/auth/callback
   ```

### 步骤 2：配置应用重定向逻辑
在 `src/utils/supabase.js` 中确保 Magic Link 重定向到正确的 URL：

```javascript
async signInWithMagicLink(email) {
  try {
    const redirectUrl = import.meta.env.PROD 
      ? 'https://www.mao.com.cn/#/auth/callback'
      : `${window.location.origin}/#/auth/callback`
    
    const { error } = await this.client.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          welcome: true
        }
      }
    })
    // ...
  }
}
```

## 4. 部署到静态托管服务

### 方案 A：Vercel（推荐）
1. 安装 Vercel CLI：`npm i -g vercel`
2. 在项目根目录运行：`vercel`
3. 配置环境变量：
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
4. 重新部署：`vercel --prod`

### 方案 B：Netlify
1. 连接 GitHub 仓库到 Netlify
2. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 环境变量设置：添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

### 方案 C：GitHub Pages
1. 安装 gh-pages：`npm install --save-dev gh-pages`
2. 在 `package.json` 添加：
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```
3. 运行：`npm run deploy`

## 5. 生产环境检查清单

### 安全检查
- [ ] Supabase RLS 策略已启用
- [ ] API Keys 使用 Anon Key（非 Service Role Key）
- [ ] 敏感信息不在代码中硬编码
- [ ] HTTPS 协议已启用

### 功能检查
- [ ] Magic Link 邮件发送正常
- [ ] 用户注册和登录流程正常
- [ ] 数据库读写操作正常
- [ ] 图片上传功能正常（如果使用）
- [ ] 响应式设计在移动设备上正常

### 性能优化
- [ ] 启用 Gzip 压缩
- [ ] 配置 CDN（如 Cloudflare）
- [ ] 设置合适的缓存策略
- [ ] 图片优化和懒加载

### SEO 优化
- [ ] 设置正确的 meta 标签
- [ ] 配置 sitemap.xml
- [ ] 设置 robots.txt
- [ ] 配置 Google Analytics（可选）

## 6. 监控和维护

### 错误监控
推荐集成 Sentry：
```bash
npm install @sentry/vue @sentry/tracing
```

### 数据备份
Supabase 自动备份，但建议：
1. 定期导出重要数据
2. 测试恢复流程
3. 监控数据库性能

### 更新流程
1. 在开发环境测试
2. 在暂存环境验证
3. 生产环境部署
4. 监控应用状态

## 常见问题解决

### Magic Link 邮件未收到
1. 检查垃圾邮件文件夹
2. 验证 SMTP 配置
3. 检查发送频率限制
4. 确认邮箱地址正确

### 数据库连接问题
1. 检查环境变量配置
2. 验证 API Key 有效性
3. 确认网络连接正常
4. 检查 Supabase 服务状态

### 部署失败
1. 检查构建日志
2. 验证环境变量设置
3. 确认依赖项完整
4. 检查内存和存储限制