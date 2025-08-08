# 腾讯云 CloudBase 集成指南

## 概述

项目已集成腾讯云开发 CloudBase，提供用户认证、图片上传、云存储等功能。

## 功能特性

- ✅ **用户认证**: 匿名登录、微信登录
- ✅ **图片上传**: 拖拽上传、多文件并发、进度显示
- ✅ **云存储**: 安全的文件存储和管理
- ✅ **实时预览**: 图片预览和链接分享
- ✅ **移动端适配**: 完美支持移动设备

## 配置步骤

### 1. 创建 CloudBase 环境

1. 访问 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 创建新环境或选择现有环境
3. 记录环境ID（格式如：`your-env-12345`）

### 2. 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_CLOUDBASE_ENV=your-actual-env-id
```

### 3. 开启服务

在 CloudBase 控制台开启以下服务：

#### 云存储
- 进入"云存储"页面
- 开启云存储服务
- 配置安全规则（可选）

#### 身份认证  
- 进入"身份认证"页面
- 开启"匿名登录"
- 配置微信登录（可选）

#### 安全规则示例

**云存储安全规则**：
```javascript
{
  "read": "auth != null",
  "write": "auth != null"
}
```

**数据库安全规则**（如需使用）：
```javascript
{
  "read": "auth != null && auth.uid == resource.data._openid",
  "write": "auth != null && auth.uid == resource.data._openid"
}
```

## 使用指南

### 访问上传页面

开发环境：http://localhost:3000/#/upload
生产环境：https://your-domain.com/#/upload

### 功能操作

1. **登录**: 点击"匿名登录"或"微信登录"
2. **上传图片**: 
   - 拖拽图片到上传区域
   - 或点击上传区域选择文件
   - 支持多文件同时上传
3. **管理文件**:
   - 查看上传进度
   - 复制图片链接  
   - 预览图片
   - 删除文件

## 技术架构

### 核心文件

```
src/
├── utils/cloudbase.js          # CloudBase 服务封装
├── stores/
│   ├── user.js                # 用户认证状态
│   └── upload.js              # 文件上传状态
├── components/ui/
│   ├── UserAuth.vue           # 用户登录组件
│   └── ImageUpload.vue        # 图片上传组件
└── views/Upload.vue           # 上传页面
```

### 服务接口

**CloudBase 服务** (`src/utils/cloudbase.js`):
- `init(config)` - 初始化服务
- `signInAnonymously()` - 匿名登录
- `signInWithWechat()` - 微信登录  
- `uploadImage(file, path)` - 上传图片
- `getDownloadURL(fileId)` - 获取下载链接
- `deleteFile(fileId)` - 删除文件

**用户状态** (`src/stores/user.js`):
- `isLoggedIn` - 登录状态
- `user` - 用户信息
- `signInAnonymously()` - 匿名登录
- `signOut()` - 退出登录

**上传状态** (`src/stores/upload.js`):
- `uploadImage(file)` - 上传图片
- `uploads` - 上传任务列表
- `isUploading` - 上传状态
- `uploadMultipleImages()` - 批量上传

## 开发调试

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 VITE_CLOUDBASE_ENV

# 启动开发服务器
npm run dev
```

### 常见问题

1. **环境ID未配置**
   - 确认 `.env` 文件存在且格式正确
   - 检查环境ID是否有效

2. **登录失败**  
   - 确认CloudBase身份认证服务已开启
   - 检查网络连接

3. **上传失败**
   - 确认用户已登录
   - 检查文件格式和大小限制
   - 确认云存储服务已开启

4. **安全规则限制**
   - 检查CloudBase安全规则配置
   - 确认用户有相应权限

### 生产部署

1. 确保 `.env` 文件配置正确
2. CloudBase 服务已正确开启
3. 安全规则已配置
4. 执行正常构建部署流程

## 成本预估

### 免费额度 (每月)
- **云存储**: 5GB 存储空间
- **CDN**: 5GB 下行流量  
- **云函数**: 40万GBS资源使用量
- **身份认证**: 1万次调用

### 超出免费额度后的计费
请参考 [CloudBase 计费说明](https://cloud.tencent.com/document/product/876/18864)

## 扩展功能

基于当前架构，可以轻松扩展：

- 用户文件管理
- 图片压缩和处理  
- 多媒体文件支持
- 文件分享功能
- 图片相册管理
- 批量操作工具

## 技术支持

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [JavaScript SDK 文档](https://docs.cloudbase.net/api-reference/webv2/initialization)
- [CloudBase 社区](https://cloudbase.net/community.html)