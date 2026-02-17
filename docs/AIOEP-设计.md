# AIOEP — AI 组织效能平台

> AI Organization Efficiency Platform
>
> 状态: **v0.1 已就绪** | 版本: v0.3.0 | 创建: 2026-02-16 | 更新: 2026-02-17

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

## 2. 四层架构

```
应用层    Cursor IDE (v0.1) / CLI (v0.2) / Web 看板 (v0.3)
            │
引擎层    Skills 引擎 (M4)  +  项目上下文管理 (M3)
            │
知识层    方法论内核 (M1)  +  方法引擎 (M2)  +  模板库
            │
基础层    文件系统 + Git + 外部工具 (Archi/draw.io/GitHub)
```

- **应用层**：用户和 AI 直接接触的界面
- **引擎层**：AI 的"大脑"——匹配 Skill、感知项目状态、驱动方法执行
- **知识层**：结构化的方法论知识——9 域方法论、方法步骤、模板
- **基础层**：存储、版本控制、外部工具连接

> 详细架构设计见 [AIOEP-架构.md](./AIOEP-架构.md)（分层规则、信息流、数据模型、文件协议、Skills 引擎规格）。

---

## 3. 产品演进路线

| 版本 | 形态 | 核心能力 | 时间 |
|------|------|---------|------|
| **v0.1** | 文件系统驱动 | 目录结构 + Rules + Skills + 约定。Cursor 是 UI | 当前 |
| v0.2 | + CLI 工具 | `aioep init` 创建新项目 / `aioep status` 查看进度 | 后续 |
| v0.3 | + Web 看板 | 多项目状态看板 / 方法导航 / Skills 管理 | 后续 |
| v1.0 | 完整产品 | 全功能平台，可供其他团队使用 | 长期 |

---

## 4. v0.1 两仓架构（当前实现）

AIOEP 采用两仓分离架构：平台仓库（共享层）和项目仓库（实例层）。

```
aioep 仓库（平台层）                erp 仓库（项目实例层）
────────────────                  ──────────────────
docs/00-方法论/  方法论 9 域       .cursor/rules/      项目 Rules + 上下文
docs/01-方法/    实践方法+模板     .cursor/skills/      从 AIOEP 同步的 Skills
skills/          Skills 模板       docs/02-项目/        项目文档
rules/           Rules 模板        custom_addons/       项目代码
```

**文件同步**：`aioep/skills/` → 复制 → `项目仓库/.cursor/skills/`（v0.1 手动，v0.2 CLI 自动）

**Cursor 工作方式**：多根工作区同时打开两个仓库，AI 可同时读取方法论和项目文件。

> 详细目录结构和同步机制见 [AIOEP-架构.md 第 6 节](./AIOEP-架构.md#6-两仓拓扑)。

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
aioep 仓库（共享层，一份）              项目仓库（每个项目独立）
├── docs/00-方法论/                     ├── 项目A-ERP/
├── docs/01-方法/                       │   ├── .cursor/rules/project-context.md
├── skills/                             │   ├── .cursor/skills/  ← 从 aioep 同步
└── rules/                              │   ├── docs/02-项目/
                                        │   ├── custom_addons/
                                        │   └── ...
                                        │
                                        ├── 项目B-CRM/
                                        │   ├── .cursor/rules/project-context.md
                                        │   ├── .cursor/skills/  ← 从 aioep 同步
                                        │   └── ...
```

每个项目仓库通过 `.cursor/rules/project-context.md` 维护自己的状态，通过 `.cursor/skills/` 获得 AIOEP 方法引导。

> 详细拓扑和同步机制见 [AIOEP-架构.md 第 6 节](./AIOEP-架构.md#6-两仓拓扑)。

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

| 优先级 | 行动 | 说明 | 状态 |
|--------|------|------|------|
| ~~P0~~ | ~~AIOEP 独立仓库~~ | ~~从 erp 仓库分离~~ | ✅ 已完成 |
| ~~P0~~ | ~~战略规划~~ | ~~AIOEP-战略规划.md~~ | ✅ 已完成 |
| ~~P0~~ | ~~模块拆分~~ | ~~AIOEP-模块设计.md~~ | ✅ 已完成 |
| ~~P0~~ | ~~project-context.md~~ | ~~ERP 项目上下文~~ | ✅ 已完成 |
| ~~P0~~ | ~~第一个 Skill~~ | ~~phase-1-analysis~~ | ✅ 已完成 |
| **P1** | ERP 项目 Phase 1 | 用 ERP 验证 AIOEP v0.1 | **下一步** |
| P2 | 积累 L2 方法级 Skills | 随 Phase 推进逐步添加 | 待启动 |
| P3 | CLI 工具（v0.2） | aioep init/sync/status | 待启动 |
| P4 | 多项目验证 | 第二个项目实例 | 待启动 |

---

## 与其他文档的关系

- 本文档是 AIOEP 平台的顶层设计（"是什么"）
- [AIOEP-战略规划.md](./AIOEP-战略规划.md) — 平台战略目标和演进策略
- [AIOEP-模块设计.md](./AIOEP-模块设计.md) — 8 模块详细设计（"分成几块"）
- [AIOEP-架构.md](./AIOEP-架构.md) — 平台技术架构（"怎么运转"）
- AI-EADM 方法论（[00-方法论/](./00-方法论/README.md)）是 AIOEP 的内核
- ERP 项目（[github.com/Albertsun6/erp](https://github.com/Albertsun6/erp)）是 AIOEP 的第一个验证实例
- [想法收集](./想法收集.md) 中的 #1（AI 引导自动迭代）是 AIOEP Skills 引擎的雏形

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-16 | 纲要创建：愿景、架构、演进路线、Skills 设计、多项目模型 |
| v0.2.0 | 2026-02-17 | 独立仓库后更新：下一步行动刷新、文档索引补充、状态升级 |
| v0.3.0 | 2026-02-17 | 架构升级：第 2/4/6 节更新为四层架构和两仓拓扑，引用 AIOEP-架构.md |
