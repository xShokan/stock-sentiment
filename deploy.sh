#!/bin/bash
# StockSense 一键部署脚本
# 用法: bash deploy.sh 你的GitHub用户名

set -e

USERNAME="${1}"
if [ -z "$USERNAME" ]; then
  echo "用法: bash deploy.sh 你的GitHub用户名"
  echo "例如: bash deploy.sh zhangsan"
  exit 1
fi

REPO="stock-sentiment"
echo "🚀 正在部署 StockSense 到 GitHub..."

# 1. 检查是否已安装 gh
if ! command -v gh &> /dev/null; then
  echo "📦 请先安装 GitHub CLI: https://cli.github.com"
  exit 1
fi

# 2. 登录 GitHub
echo "🔐 登录 GitHub..."
gh auth status || gh auth login

# 3. 创建仓库
echo "📁 创建仓库 ${USERNAME}/${REPO}..."
gh repo create "${USERNAME}/${REPO}" --public --description "股票情绪分析平台 — A股+美股+港股全覆盖" --push --source . 2>/dev/null || {
  echo "仓库可能已存在，直接推送..."
  git remote add origin "https://github.com/${USERNAME}/${REPO}.git" 2>/dev/null || true
  git push -u origin master
}

# 4. 启用 GitHub Pages
echo "📄 配置 GitHub Pages..."
gh api repos/${USERNAME}/${REPO}/pages -X POST -f "source[branch]=gh-pages" -f "source[path]=/" 2>/dev/null || true

# 5. 触发 Actions 部署
echo "⚡ 推送到 master 触发自动部署..."
git push origin master 2>/dev/null || echo "已是最新"

echo ""
echo "✅ 部署完成！"
echo "🔗 访问地址: https://${USERNAME}.github.io/${REPO}/"
echo "📊 Actions 进度: https://github.com/${USERNAME}/${REPO}/actions"
echo ""
echo "⏳ 首次部署需要 1-2 分钟，稍等片刻即可访问。"
