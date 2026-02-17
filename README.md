# AIOEP — AI 组织效能平台

> AI Organization Efficiency Platform
>
> 将 AI-EADM 方法论体系软件化，帮助团队以结构化、可追溯、AI 协同的方式开发企业应用系统。

## 这是什么

AIOEP 是一个 AI 驱动的组织效能平台，核心能力：

- **方法论内核**：AI-EADM 9 域方法论体系
- **方法引擎**：分析/开发/交付方法 + 模板，按阶段导航
- **Skills 引擎**：L1/L2/L3 三级 AI 技能，自动匹配当前活动
- **项目上下文**：AI 每次对话自动感知项目状态
- **工具集成**：Cursor Rules/Skills + Archi + draw.io + GitHub

## 当前版本

**v0.1 — 文件系统驱动**

Cursor 是 UI，方法论和方法通过目录结构 + 文件约定承载。

```
演进路线: v0.1(文件系统) → v0.2(+CLI) → v0.3(+Web看板) → v1.0(完整产品)
```

## 项目结构

```
aioep/
├── docs/
│   ├── AIOEP-设计.md           # 平台顶层设计
│   ├── AIOEP-战略规划.md       # 平台战略规划
│   ├── AIOEP-模块设计.md       # 模块拆分与设计
│   ├── 想法收集.md             # 待探索想法
│   ├── 术语表.md               # 统一术语表
│   ├── Chatlog.md              # 对话记录
│   ├── 00-方法论/              # AI-EADM 方法论（9域体系）
│   └── 01-方法/                # 实践方法（分析/开发/交付）
├── skills/                     # Skills 模板库
├── rules/                      # Rules 模板库
└── README.md
```

## 与项目仓库的关系

AIOEP 是平台/方法论层，项目仓库是应用实例层：

```
aioep（本仓库）              erp（项目实例）
──────────────              ──────────────
方法论 + 方法 + Skills       项目文档 + 代码 + 配置
"用什么、怎么做"             "实际做了什么"
```

- **ERP 项目**：https://github.com/Albertsun6/erp （第一个验证实例）
- **管理看板**：https://github.com/Albertsun6/erp-portal （Web 可视化）

## 使用方式（v0.1）

1. 克隆本仓库和项目仓库到同一目录
2. 在 Cursor 中打开为多根工作区（Multi-root Workspace）
3. AI 可同时读取方法论文档和项目文件

## 方法论

本平台基于 **AI-EADM**（AI Enterprise Application Development Methodology / AI 企业应用开发方法论）。

详见 [方法论总纲](./docs/00-方法论/README.md)。

## License

MIT
