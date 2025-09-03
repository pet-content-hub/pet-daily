#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./scripts/deploy.sh

set -e

echo "🚀 开始生产环境部署..."

# 检查是否存在生产环境配置
if [ ! -f ".env.production" ]; then
  echo "❌ 错误：未找到 .env.production 文件"
  echo "请复制 .env.production.example 为 .env.production 并填入正确的配置值"
  exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v)
echo "📦 Node.js 版本: $NODE_VERSION"

# 安装依赖
echo "📥 安装依赖..."
npm ci

# 运行 linter 检查
echo "🔍 代码质量检查..."
npm run lint --if-present

# 运行类型检查
echo "📝 TypeScript 检查..."
npm run type-check --if-present

# 运行测试
echo "🧪 运行测试..."
npm test --if-present

# 构建生产版本
echo "🏗️ 构建生产版本..."
npm run build

# 检查构建产物
if [ ! -d "dist" ]; then
  echo "❌ 错误：构建失败，未找到 dist 目录"
  exit 1
fi

echo "✅ 构建成功！"
echo "📁 构建产物位于 dist/ 目录"

# 可选：部署到不同平台
if [ "$1" = "vercel" ]; then
  echo "🌐 部署到 Vercel..."
  npx vercel --prod
elif [ "$1" = "netlify" ]; then
  echo "🌐 部署到 Netlify..."
  npx netlify deploy --prod --dir=dist
elif [ "$1" = "github-pages" ]; then
  echo "🌐 部署到 GitHub Pages..."
  npm run deploy
else
  echo "📋 部署选项："
  echo "  - Vercel: ./scripts/deploy.sh vercel"
  echo "  - Netlify: ./scripts/deploy.sh netlify"
  echo "  - GitHub Pages: ./scripts/deploy.sh github-pages"
  echo "  - 或手动上传 dist/ 目录到你的服务器"
fi

echo "🎉 部署准备完成！"