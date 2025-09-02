# Supabase 项目设置指南

## 第一步：注册并创建项目

### 1. 注册Supabase账户
1. 访问 https://app.supabase.com
2. 点击 "Start your project"
3. 选择登录方式：
   - **推荐**：使用GitHub账号登录
   - 或使用邮箱+密码注册

### 2. 创建新项目
1. 登录后点击 "New project"
2. 填写项目信息：
   ```
   Organization: [选择你的个人账户]
   Project name: cat-diary 或 mao-world
   Database Password: [设置一个强密码，请记住！]
   Region: Southeast Asia (Singapore) [推荐，延迟较低]
   Pricing Plan: Free [足够开发使用]
   ```
3. 点击 "Create new project"
4. **等待2-3分钟让项目初始化完成**

## 第二步：获取项目配置

### 1. 获取API配置信息
项目创建完成后：
1. 在项目仪表板，点击左侧菜单 "Settings"
2. 选择 "API" 
3. 你会看到以下信息：

```bash
Project URL: https://abcdefghijklmnop.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [保密！]
```

### 2. 更新本地环境配置
打开项目根目录的 `.env` 文件，替换以下内容：

```bash
# 将 "your-supabase-project-url" 替换为实际的 Project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# 将 "your-supabase-anon-key" 替换为实际的 anon public key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 重要：只使用 `anon public` key，不要使用 `service_role` key！**

## 第三步：创建数据库表结构

### 1. 运行数据库迁移脚本
在项目根目录运行：

```bash
# 启动Supabase本地CLI（如果已安装）
supabase start

# 应用数据库迁移
supabase db push
```

### 2. 或手动创建表（如果没有CLI）
1. 在Supabase Dashboard点击 "SQL Editor"
2. 点击 "New query"
3. 复制并运行 `supabase/migrations/20250101000000_initial_schema.sql` 中的SQL语句

### 3. 验证表创建
在 "Table Editor" 中应该能看到以下表：
- `user_profiles` - 用户档案
- `cats` - 猫咪信息  
- `cat_diaries` - 日记内容
- `diary_images` - 日记图片
- `medical_records` - 医疗记录
- `vaccination_records` - 疫苗记录

## 第四步：配置认证设置

### 1. 启用邮件认证
1. 进入 "Authentication" → "Settings"
2. 确保启用了 "Enable email confirmations"
3. 设置 "Site URL" 为：
   ```
   开发环境: http://localhost:3001
   生产环境: https://your-domain.com
   ```

### 2. 配置邮件服务（重要！）
参考 `docs/email-setup.md` 配置SMTP邮件服务

### 3. 自定义邮件模板（可选）
在 "Authentication" → "Email Templates" 中自定义：
- Magic Link 邮件模板
- 确认邮件模板

## 第五步：设置存储桶

### 1. 创建存储桶
1. 进入 "Storage"
2. 点击 "New bucket"
3. 创建以下桶：
   ```
   cat-avatars (Public bucket)
   diary-images (Public bucket)
   ```

### 2. 设置存储策略
SQL Editor中运行：
```sql
-- 允许用户上传头像
INSERT INTO storage.policies (bucket_id, name, definition, check, command) 
VALUES (
  'cat-avatars', 
  'Users can upload cat avatars', 
  'true'::jsonb, 
  'true'::jsonb, 
  'INSERT'
);

-- 允许用户上传日记图片
INSERT INTO storage.policies (bucket_id, name, definition, check, command) 
VALUES (
  'diary-images', 
  'Users can upload diary images', 
  'true'::jsonb, 
  'true'::jsonb, 
  'INSERT'
);
```

## 第六步：测试连接

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试功能
1. 访问 http://localhost:3001/#/diary
2. 尝试注册/登录
3. 检查邮箱是否收到Magic Link邮件
4. 完成登录流程

## 常见问题解决

### 1. 项目URL获取错误
确保复制的是 "Project URL"，格式应该是：
```
https://[project-id].supabase.co
```

### 2. API Key无效
- 确认复制的是 "anon public" key
- 不要在key前后添加空格
- key通常以 `eyJ` 开头

### 3. 邮件发送失败
- 检查SMTP配置是否正确
- 确认邮箱服务商已开启SMTP
- 查看Supabase Dashboard的日志

### 4. 数据库连接失败
- 确认项目已完全初始化（通常需要2-3分钟）
- 检查.env文件配置
- 重启开发服务器

## 生产环境部署

部署到生产环境时：
1. 更新 "Site URL" 为你的域名
2. 配置自定义SMTP邮件服务  
3. 设置环境变量保护
4. 启用RLS（Row Level Security）策略
5. 配置CDN加速（可选）

## 有用的链接

- [Supabase文档](https://supabase.com/docs)
- [认证指南](https://supabase.com/docs/guides/auth)
- [数据库指南](https://supabase.com/docs/guides/database)
- [存储指南](https://supabase.com/docs/guides/storage)