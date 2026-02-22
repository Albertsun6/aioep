# AIOEP — AI 组织效能平台

> AI Organization Efficiency Platform
>
> 将 AI-EADM 方法论体系软件化，帮助团队以结构化、可追溯、AI 协同的方式开发企业应用系统。

## 这是什么

AIOEP 是一个 AI 驱动的组织效能平台，核心能力：

- **方法论内核**：AI-EADM 9 域方法论体系（核心原则 → 质量框架 → 治理模型）
- **方法引擎**：分析/开发/交付方法 + 模板，按 SDLC 阶段导航
- **Skills 引擎**：L1/L2/L3 三级 AI 技能，自动匹配当前活动
- **Web Dashboard**：可视化看板（SDLC 进度、Gap-Fit 工作台、AI 对话）
- **项目上下文**：AI 每次对话自动感知项目状态
- **工具集成**：Cursor Rules/Skills + Archi + draw.io + GitHub

## 当前版本

**v0.3 — 文件系统 + Web Dashboard**

- v0.1（文件系统驱动）✅
- v0.2（方法论 9 域完整 + 3 个交付方法细化）✅
- **v0.3（Web Dashboard MVP + 数据 API + 行内编辑）✅ ← 当前**
- v1.0（完整产品：数据库 + 权限 + 多项目支持）

## 项目结构

```
aioep/
├── platform/                      # AIOEP 平台核心
│   ├── docs/                      # 平台设计与方法论中心
│   │   ├── AIOEP-设计.md
│   │   ├── 00-方法论/               # AI-EADM 理论体系
│   │   └── 01-方法/                 # 实践指南
│   ├── skills/                    # Skills 模板库
│   ├── models/                    # 数据模型
│   ├── rules/                     # AI Agent 规则
│   └── web/                       # Web Dashboard（Next.js）
├── projects/                      # 项目存放区（支持 Multi-root 工作区）
│   ├── .gitkeep                   # 空目录占位
│   └── (例如将来增加 erp 项目)
├── aioep.code-workspace           # 全局 VS Code/Cursor 工作区配置
└── README.md
```

## Web Dashboard

启动方式：

```bash
cd platform/web && npm install && npm run dev
# 访问 http://localhost:3000
```

功能：
- **Dashboard**：SDLC 进度条 + Gap-Fit 饼图 + Sprint 概览 + 统计卡片
- **SDLC 看板**：4 阶段可折叠卡片（里程碑 / 交付物 / 门禁检查）
- **Gap-Fit 工作台**：Ant Design Table（筛选 + 排序 + 行内编辑 + 持久化）
- **AI 对话**：侧边 Drawer（OpenAI / Claude 切换，自动注入项目上下文）

技术栈：Next.js 16 + TypeScript + Ant Design + Ant Design Charts

## 与项目仓库的关系

AIOEP 是平台/方法论层，项目仓库是应用实例层：

```
aioep（本仓库）              erp（项目实例）
──────────────              ──────────────
方法论 + 方法 + Skills       项目文档 + 代码 + 配置
"用什么、怎么做"             "实际做了什么"
```

- **ERP 项目**：https://github.com/Albertsun6/erp （第一个验证实例，已完成 Phase 0~3 全周期验证）

## 使用方式

1. 克隆本仓库和项目仓库到同一目录
2. 在 Cursor 中打开为多根工作区（Multi-root Workspace）
3. AI 可同时读取方法论文档和项目文件
4. 启动 Web Dashboard 获得可视化操作界面

## 方法论

本平台基于 **AI-EADM**（AI Enterprise Application Development Methodology / AI 企业应用开发方法论）。

详见 [方法论总纲](./platform/docs/00-方法论/README.md)。

## License

MIT
