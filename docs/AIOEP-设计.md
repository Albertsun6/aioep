# AIOEP — AI 组织效能平台

> AI Organization Efficiency Platform
>
> 状态: **纲要** | 版本: v0.1.0 | 创建: 2026-02-16

---

## 1. 愿景

AIOEP 是一个 AI 驱动的组织效能平台，将 AI-EADM 方法论体系软件化，帮助团队以结构化、可追溯、AI 协同的方式开发企业应用系统。

```
AIOEP 的本质：

方法论（AI-EADM）
  + 方法库（分析/开发/交付）
  + 模板库
  + Skills 引擎
  + 项目状态管理
  + 工具集成（Cursor / Archi / draw.io / GitHub）
  ─────────────────────────
  = AIOEP 平台
```

---

## 2. 核心组件

```
AIOEP 架构

┌─────────────────────────────────────────────────┐
│                   AIOEP 平台                      │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ 方法论内核   │  │ 方法引擎     │  │ 项目管理  │ │
│  │ AI-EADM     │  │ 方法+模板    │  │ 多项目    │ │
│  │ 9域体系     │  │ 按阶段导航   │  │ 状态追踪  │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬────┘ │
│         │                │               │       │
│  ┌──────▼────────────────▼───────────────▼────┐ │
│  │              Skills 引擎                     │ │
│  │  L1 阶段级 / L2 方法级 / L3 步骤级           │ │
│  │  自动匹配当前活动 → 加载对应 Skill           │ │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│  ┌──────────────────▼───────────────────────┐   │
│  │              工具集成层                     │   │
│  │  Cursor（Rules/Skills） / Archi / draw.io  │   │
│  │  GitHub（代码+CI） / 文件系统               │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 3. 产品演进路线

| 版本 | 形态 | 核心能力 | 时间 |
|------|------|---------|------|
| **v0.1** | 文件系统驱动 | 目录结构 + Rules + Skills + 约定。Cursor 是 UI | 当前 |
| v0.2 | + CLI 工具 | `aioep init` 创建新项目 / `aioep status` 查看进度 | 后续 |
| v0.3 | + Web 看板 | 多项目状态看板 / 方法导航 / Skills 管理 | 后续 |
| v1.0 | 完整产品 | 全功能平台，可供其他团队使用 | 长期 |

---

## 4. v0.1 文件系统架构（当前实现）

```
aioep-project/                       # 一个 AIOEP 管理的项目
├── .cursor/
│   ├── rules/                       # 始终加载的规则
│   │   ├── project-context.md       # ★ 项目上下文（当前Phase/活动/进度）
│   │   ├── odoo-development.md      # 代码规范
│   │   ├── python-style.md
│   │   ├── xml-views.md
│   │   ├── security-rules.md
│   │   ├── testing.md
│   │   └── git-workflow.md
│   └── skills/                      # 按需加载的技能
│       ├── phase-1-analysis/        # L1: 阶段级
│       │   └── SKILL.md
│       ├── gap-fit-analysis/        # L2: 方法级
│       │   └── SKILL.md
│       ├── bpmn-modeling/           # L2: 方法级
│       │   └── SKILL.md
│       └── ...
│
├── docs/
│   ├── 00-方法论/                   # AI-EADM（共享核心，跨项目不变）
│   ├── 01-方法/                     # 方法+模板（新项目复制此目录）
│   │   ├── 分析方法/
│   │   ├── 开发方法/
│   │   └── 交付方法/
│   ├── 02-项目/                     # 项目层（每个项目独有）
│   ├── 术语表.md
│   ├── Chatlog.md
│   └── README.md
│
├── models/                          # 建模文件
├── custom_addons/                   # 代码（Odoo 项目）
├── docker-compose.yml
└── Makefile
```

---

## 5. Skills 三级颗粒度

| 级别 | 名称 | 触发方式 | 内容 | 示例 |
|------|------|---------|------|------|
| L1 | 阶段级 | "开始 Phase 1" | 该阶段的方法导航和流程总览 | phase-1-analysis |
| L2 | 方法级 | "做 Gap-Fit 分析" | 具体方法的步骤引导 | gap-fit-analysis |
| L3 | 步骤级 | "画采购流程 BPMN" | 单个步骤的操作指南 | bpmn-draw-purchase |

### Skills 与方法文件的关系

```
方法文件（人类可读）           Skill（AI 可执行）
docs/01-方法/分析方法/         .cursor/skills/
├── gap-fit方法.md       →    ├── gap-fit-analysis/SKILL.md
│   （完整方法文档）           │   （精简指令：读方法文件 → 按步骤执行）
```

Skill 不重复方法文件的内容，而是：
1. 告诉 AI 读哪个方法文件
2. 告诉 AI 当前进度（读 project-context.md）
3. 告诉 AI 输出格式（引用模板）
4. 告诉 AI 自检要求（引用检查清单）

---

## 6. 多项目模型

```
共享层（所有项目共用）：
├── 00-方法论/              # AI-EADM 方法论（不变）
├── .cursor/skills/         # Skills 库（共享）
└── 01-方法/                # 方法+模板库（模板来源）

项目实例（每个项目独立）：
├── 项目A-ERP/
│   ├── 01-方法/            # 从共享层复制（可项目定制）
│   ├── 02-项目/            # 项目独有文档
│   ├── models/             # 项目独有模型
│   ├── custom_addons/      # 项目代码
│   └── .cursor/rules/project-context.md  # 项目独有上下文
│
├── 项目B-CRM/
│   ├── 01-方法/
│   ├── 02-项目/
│   └── ...
```

---

## 7. AIOEP 与 Cursor 交互协议

```
AIOEP 管理                          Cursor 消费
────────────                        ────────────

project-context.md                  AI 每次对话自动读取
  ├── current_phase: 1              → 知道当前阶段
  ├── current_activity: gap-fit     → 知道当前活动
  ├── method_file: 01-方法/...      → 知道用哪个方法
  ├── progress: step 3/6            → 知道做到哪了
  └── next_action: ...              → 知道下一步

Skills（.cursor/skills/）           AI 按触发词加载
  ├── SKILL.md 引用方法文件          → AI 读取方法步骤
  ├── SKILL.md 引用模板文件          → AI 知道输出格式
  └── SKILL.md 引用检查清单          → AI 自动自检
```

### project-context.md 格式规范

```markdown
---
description: 项目上下文。AI 每次对话自动读取，了解当前状态。
globs: ["**"]
---

# 项目上下文

- 项目: ERP 管理系统（进口贸易/电子产品）
- 方法论: AI-EADM v0.x
- 当前阶段: Phase 1（需求分析与设计）
- 当前活动: Gap-Fit 分析
- 活动进度: Step 2/6（对比 Odoo 标准功能）
- 方法文件: docs/01-方法/分析方法/gap-fit方法.md
- 上次对话: 完成了战略规划，开始 Gap-Fit
- 下一步: 完成 Gap-Fit Step 2，进入 Step 3
```

---

## 8. 下一步行动

| 优先级 | 行动 | 说明 |
|--------|------|------|
| **P0** | 创建 project-context.md | 立即让 AI 有项目上下文 |
| **P0** | 创建第一个 Skill（phase-1-analysis） | Phase 1 开始时 AI 有导航 |
| P1 | ERP 项目继续推进 Phase 1 | 用实际项目验证 AIOEP v0.1 |
| P2 | 积累更多 Skills（L2 方法级） | 随 Phase 推进逐步添加 |
| P3 | 开发 CLI 工具（v0.2） | 项目初始化和状态管理自动化 |
| P4 | 多项目目录结构验证 | 用第二个项目验证共享模型 |

---

## 与其他文档的关系

- 本文档是 AIOEP 平台的顶层设计
- AI-EADM 方法论（[00-方法论/](./00-方法论/README.md)）是 AIOEP 的内核
- ERP 项目（[02-项目/](./02-项目/)）是 AIOEP 的第一个实例
- [想法收集](./想法收集.md) 中的 #1（AI 引导自动迭代）是 AIOEP Skills 引擎的雏形

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-16 | 纲要创建：愿景、架构、演进路线、Skills 设计、多项目模型 |
