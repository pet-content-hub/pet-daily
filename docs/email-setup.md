# 邮件服务配置指南

## QQ邮箱SMTP配置步骤

### 1. 开启QQ邮箱SMTP服务
1. 登录QQ邮箱 (mail.qq.com)
2. 点击左上角"设置" → "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"IMAP/SMTP服务"
5. 根据提示发送短信验证
6. **保存生成的16位授权码**（这是SMTP密码，不是QQ密码）

### 2. Supabase邮件配置
在Supabase Dashboard中配置：

```
Authentication → Settings → SMTP Settings

Host: smtp.qq.com
Port: 587
Username: your-qq-email@qq.com
Password: 16位授权码
Sender name: 猫咪世界
Sender email: your-qq-email@qq.com
```

### 3. 邮件模板自定义（可选）
在 Authentication → Email Templates 中可以自定义：
- Magic Link邮件模板
- 确认邮件模板
- 重置密码邮件模板

## 其他邮件服务配置

### 网易163邮箱
```
Host: smtp.163.com
Port: 465 (SSL) 或 25
Username: your-email@163.com
Password: 邮箱授权码
```

### Gmail (需要科学上网)
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: 应用专用密码
```

### SendGrid (推荐用于生产环境)
1. 注册SendGrid账户
2. 创建API Key
3. 验证发送域名

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
```

## 测试邮件发送

配置完成后，可以通过以下方式测试：

1. 在你的应用中尝试Magic Link登录
2. 在Supabase Dashboard的Authentication → Users中手动邀请用户
3. 查看Supabase Dashboard的日志确认邮件发送状态

## 常见问题解决

### 1. 邮件发送失败
- 检查SMTP配置是否正确
- 确认授权码是否正确（不是邮箱登录密码）
- 检查防火墙是否阻止SMTP端口

### 2. 邮件进入垃圾箱
- 配置SPF记录：`v=spf1 include:spf.supabase.io ~all`
- 使用专业邮件服务（SendGrid、Mailgun等）
- 避免使用个人邮箱域名

### 3. 发送频率限制
- QQ邮箱：每天500封
- 163邮箱：每天200封
- SendGrid：免费版每月100封
- Mailgun：免费版每月5000封

## 生产环境建议

1. **使用专业邮件服务**：SendGrid、Mailgun、AWS SES
2. **配置自定义域名**：提高邮件送达率
3. **设置SPF/DKIM记录**：防止进入垃圾箱
4. **监控邮件发送状态**：设置邮件发送失败告警

## 本地开发测试

如果只是本地开发测试，可以：

1. 使用Supabase默认邮件服务（限制3封/小时）
2. 使用MailHog等本地邮件测试工具
3. 配置开发环境专用的测试邮箱