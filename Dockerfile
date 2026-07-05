# StockSense Docker 镜像 — Render 部署
# 多阶段构建：前端 → 后端统一镜像

# === 阶段 1: 构建前端 ===
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build:static

# === 阶段 2: 后端运行环境 ===
FROM python:3.11-slim
WORKDIR /app

# 安装 Python 依赖
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 后端代码
COPY backend/ ./backend/

# 前端构建产物
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Render 使用 $PORT 环境变量
EXPOSE 8000

CMD cd /app/backend && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
