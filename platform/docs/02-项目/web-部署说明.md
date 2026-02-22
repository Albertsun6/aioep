# AIOEP Web Dashboard 部署说明

> 版本: v0.1.0 | 创建: 2026-02-18

## 架构概览

```
用户浏览器
    ↓
Vercel Edge Network (CDN + Serverless Functions)
    ↓
Next.js 16 App Router
    ├── 静态页面 (/, /sdlc, /gap-fit, /projects)
    └── API Routes (/api/projects, /api/sdlc, /api/gap-fit, /api/chat)
        ↓
Neon Serverless Postgres (数据持久化)
```

## 前置条件

- GitHub 账号（代码托管）
- Vercel 账号（https://vercel.com，可用 GitHub 登录）
- Neon 账号（https://neon.tech，免费额度足够）

## 部署步骤

### 1. 创建 Neon 数据库

1. 登录 https://console.neon.tech
2. 点击 "New Project"，命名为 `aioep`
3. 选择区域（建议与 Vercel 同区域，如 AWS us-east-1）
4. 创建后，复制 Connection String（格式：`postgres://user:pass@host/dbname?sslmode=require`）

### 2. 初始化数据库

在本地执行迁移脚本，将现有 JSON 数据导入 Neon：

```bash
cd aioep/web
DATABASE_URL="你的连接字符串" npx tsx scripts/migrate.ts
```

预期输出：
```
Creating tables...
Tables created.
Imported 1 project(s).
Imported 4 SDLC phases.
Imported 5 sprints.
Imported 25 requirements.
Migration complete!
```

### 3. 部署到 Vercel

**方式 A：通过 Vercel Dashboard（推荐）**

1. 将 `aioep` 仓库推送到 GitHub
2. 登录 https://vercel.com/dashboard
3. 点击 "Add New Project" → Import GitHub 仓库
4. Root Directory 设置为 `web`
5. 在 Environment Variables 中添加：
   - `DATABASE_URL` = Neon 连接字符串
   - `OPENAI_API_KEY` = OpenAI API Key（可选）
   - `ANTHROPIC_API_KEY` = Anthropic API Key（可选）
6. 点击 Deploy

**方式 B：通过 CLI**

```bash
cd aioep/web
npm i -g vercel
vercel login
vercel --prod
```

部署时会提示设置环境变量。

### 4. 验证

部署完成后，访问 Vercel 分配的域名，检查：

- [ ] `/` Dashboard 页面加载正常
- [ ] `/sdlc` SDLC 看板正常，Milestone 可勾选
- [ ] `/gap-fit` 表格正常，匹配度可编辑
- [ ] `/projects` 项目管理页正常
- [ ] 顶部项目切换器可用
- [ ] AI 助手 Drawer 可打开（若配置了 API Key，可正常对话）

## 环境变量清单

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 生产必填 | Neon Postgres 连接字符串 |
| `OPENAI_API_KEY` | 可选 | OpenAI GPT-4o API Key |
| `ANTHROPIC_API_KEY` | 可选 | Anthropic Claude API Key |

## 本地开发

不配置 `DATABASE_URL` 时，系统自动回退到 `data/*.json` 文件读写，无需数据库。

```bash
cd aioep/web
npm install
npm run dev
# 访问 http://localhost:3000
```

## 更新部署

推送到 GitHub `main` 分支后 Vercel 自动部署。

若需要更新数据库 schema，重新执行迁移脚本即可（脚本使用 `ON CONFLICT` 幂等设计）。

## 回滚

Vercel Dashboard → Deployments → 选择之前的部署 → Promote to Production。
