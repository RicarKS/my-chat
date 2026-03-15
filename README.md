# My Chat

一个类似 DeepSeek 的 AI 聊天 Web 应用，支持多模型提供方、对话分支管理、实时同步和流式响应。

## 功能特性

- **账号系统** — 注册 / 登录，JWT 认证
- **多模型提供方** — 配置多个 OpenAI 兼容 API（OpenAI、DeepSeek、Ollama 等），自动获取可用模型列表
- **流式响应** — SSE 实时输出 AI 回复
- **对话分支** — 编辑消息自动创建分支，`< 1/2 >` 切换浏览不同分支
- **实时同步** — WebSocket 多设备同步
- **富文本渲染** — Markdown、代码高亮 (Shiki)、LaTeX 公式 (KaTeX)
- **导入 / 导出** — 支持 JSON / Markdown / 纯文本格式
- **Docker 部署** — 一键 `docker compose up`

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Nuxt 3 + TypeScript + Pinia |
| 后端 | Nuxt Server API (Nitro) |
| 数据库 | SQLite (better-sqlite3) |
| 实时通信 | Nitro WebSocket (CrossWS) |
| 认证 | JWT + bcryptjs |
| 渲染 | markdown-it + Shiki + KaTeX + DOMPurify |

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npx nuxt dev --host 0.0.0.0 --port 3080
```

访问 `http://localhost:3080`

### Docker 部署

```bash
# 复制并编辑环境变量
cp .env.example .env
# 编辑 .env 中的 JWT_SECRET 和 ENCRYPTION_KEY

# 启动
docker compose up -d
```

访问 `http://localhost:3000`

## 使用流程

1. 注册账号并登录
2. 进入 **设置** 页面，添加模型提供方（填入 API 地址和密钥）
3. 点击 **获取模型** 自动拉取可用模型列表，或手动添加
4. 返回聊天页面，开始对话

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `JWT_SECRET` | JWT 签名密钥 | `dev-secret-change-me` |
| `ENCRYPTION_KEY` | API 密钥加密密钥（64 位十六进制） | 开发用默认值 |
| `DATABASE_PATH` | SQLite 数据库路径 | `./data/chat.db` |

## 许可证

MIT
