# AIOEP 平台架构

> 状态: **已确认** | 版本: v1.0.0 | 创建: 2026-02-17
>
> 本文档定义 AIOEP 平台的技术架构——分层结构、信息流、数据模型、文件协议和引擎规格。
> 回答"怎么组装和运转"，区别于设计文档（是什么）和模块文档（分成几块）。
>
> 上游：[AIOEP-设计.md](./AIOEP-设计.md) | [AIOEP-模块设计.md](./AIOEP-模块设计.md)

---

## 1. 分层架构

AIOEP 平台由四层组成，自上而下依次为应用层、引擎层、知识层、基础层。上层消费下层提供的能力，下层不感知上层。

```
┌──────────────────────────────────────────────────────────┐
│                      应用层 (Application)                  │
│                                                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ Cursor   │    │  CLI     │    │  Web     │           │
│   │  IDE     │    │  工具    │    │  看板    │           │
│   │ (v0.1)   │    │ (v0.2)   │    │ (v0.3)   │           │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘           │
├────────┼───────────────┼───────────────┼─────────────────┤
│        ▼               ▼               ▼                  │
│                      引擎层 (Engine)                       │
│                                                            │
│   ┌──────────────────┐    ┌──────────────────┐           │
│   │   Skills 引擎    │    │  项目上下文管理   │           │
│   │   M4             │    │  M3               │           │
│   │                  │    │                    │           │
│   │  匹配 → 加载     │    │  状态感知          │           │
│   │  → 执行 → 更新   │    │  进度追踪          │           │
│   └────────┬─────────┘    └────────┬─────────┘           │
├────────────┼───────────────────────┼─────────────────────┤
│            ▼                       ▼                      │
│                      知识层 (Knowledge)                    │
│                                                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ 方法论   │    │ 方法     │    │ 模板库   │           │
│   │ 内核     │    │ 引擎     │    │          │           │
│   │ M1       │    │ M2       │    │ (M2子集) │           │
│   │          │    │          │    │          │           │
│   │ 9域体系  │    │ 分析/开发│    │ 模板-    │           │
│   │ 原则/框架│    │ /交付方法│    │ 前缀文件 │           │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘           │
├────────┼───────────────┼───────────────┼─────────────────┤
│        ▼               ▼               ▼                  │
│                      基础层 (Infrastructure)               │
│                                                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │ 文件系统 │    │   Git    │    │ 外部工具 │           │
│   │ Markdown │    │  GitHub  │    │ Archi    │           │
│   │ 目录约定 │    │  CI/CD   │    │ draw.io  │           │
│   └──────────┘    └──────────┘    └──────────┘           │
└──────────────────────────────────────────────────────────┘
```

### 各层职责

| 层 | 职责 | 对上层提供 | 从下层消费 | v0.1 实现 |
|----|------|---------|---------|---------|
| **应用层** | 用户和 AI 直接接触的界面 | 用户体验 | 引擎层的匹配/执行/追踪能力 | Cursor IDE |
| **引擎层** | AI 的"大脑"——匹配 Skill、感知状态、驱动执行 | Skill 匹配 + 上下文感知 | 知识层的方法/模板/方法论 | SKILL.md + project-context.md |
| **知识层** | 结构化的方法论知识——方法论、方法步骤、模板 | 方法导航 + 模板供给 | 基础层的文件读写 | docs/00-方法论/ + docs/01-方法/ |
| **基础层** | 存储、版本控制、外部工具连接 | 持久化 + 协作 + 工具桥接 | 操作系统 / 云服务 | 文件系统 + Git + GitHub |

### 层间规则

1. **严格向下依赖**：上层只调用下层，不能反向调用
2. **跨层禁止**：应用层不直接操作基础层文件，必须通过引擎层和知识层
3. **同层可协作**：同一层内的模块可以互相引用（如 M4 读取 M3 的上下文）

---

## 2. 核心信息流

### 2.1 全局视角

AIOEP 的运转核心是一条信息链路——从"AI 打开对话"到"方法按步骤执行完毕"：

```
用户打开 Cursor 对话
    │
    ▼
Cursor 自动加载 .cursor/rules/project-context.md   ← M3 项目上下文
    │
    ├── AI 知道：当前 Phase、活动、Step 进度
    ├── AI 知道：当前方法文件路径
    └── AI 知道：上次做了什么、下一步是什么
    │
    ▼
用户提出请求（或 AI 根据上下文主动导航）
    │
    ▼
Cursor 匹配 .cursor/skills/ 中的 SKILL.md          ← M4 Skills 引擎
    │
    ├── 按 description 字段匹配用户意图
    └── 加载对应级别的 Skill（L1/L2/L3）
    │
    ▼
Skill 指令 AI 读取方法文件                           ← M2 方法引擎
    │
    ├── 读取 AIOEP 仓库 docs/01-方法/ 下的方法文件
    ├── 获取步骤列表、前置条件、输出格式
    └── 获取模板文件路径
    │
    ▼
AI 按步骤执行方法                                    ← M1 + M2
    │
    ├── 引用方法论原则（00-方法论/）作为质量约束
    ├── 按方法步骤逐步引导用户
    ├── 使用模板格式产出文档
    └── 对照检查清单自检
    │
    ▼
输出产出物到项目仓库                                 ← 项目仓库
    │
    └── docs/02-项目/[产出文件].md
    │
    ▼
更新项目上下文                                       ← M3
    │
    ├── 推进活动进度（Step X → Step X+1）
    ├── 更新"上次对话"摘要
    └── 更新"下一步"行动
    │
    ▼
更新 Chatlog                                         ← 对话记录
```

### 2.2 场景 A：新对话恢复上下文

**触发**：用户在 Cursor 中新开一个对话。

```
时序：

1. Cursor 启动对话
   │
2. Cursor 自动读取 .cursor/rules/ 下所有 Rule 文件
   │  ├── project-context.md（globs: ["**"]，始终加载）
   │  ├── odoo-development.md（项目代码规范）
   │  └── ...其他 Rules
   │
3. AI 解析 project-context.md
   │  ├── 提取：当前阶段 = Phase 1
   │  ├── 提取：当前活动 = Gap-Fit 分析
   │  ├── 提取：活动进度 = Step 0/6
   │  ├── 提取：方法文件 = docs/01-方法/分析方法/gap-fit方法.md
   │  └── 提取：下一步 = 开始 Gap-Fit Step 1
   │
4. AI 形成上下文认知（零人工干预）
   │
5. 用户提问 → AI 基于上下文回答
```

**关键文件**：`项目仓库/.cursor/rules/project-context.md`

**成功标准**：AI 在新对话的第一句回复中，能准确描述项目当前状态，无需用户提供任何背景。

### 2.3 场景 B：触发 Skill 执行方法

**触发**：用户说"开始 Gap-Fit 分析"或类似触发词。

```
时序：

1. 用户输入："开始 Gap-Fit 分析"
   │
2. Cursor 匹配 Skills
   │  ├── 扫描 .cursor/skills/ 下所有 SKILL.md 的 description 字段
   │  ├── 命中：phase-1-analysis（L1，description 含"需求分析"）
   │  └── 如有 gap-fit-analysis（L2），优先匹配更精确的
   │
3. AI 执行 Skill 指令
   │  ├── Step 1: 读取 project-context.md → 确认在 Phase 1
   │  ├── Step 2: 读取方法文件 gap-fit方法.md
   │  │   └── 获取 6 个步骤的定义
   │  ├── Step 3: 读取模板文件（如有）
   │  └── Step 4: 开始按步骤引导用户
   │
4. AI 执行方法 Step 1
   │  ├── 向用户提出引导问题（来自方法文件）
   │  ├── 收集用户回答
   │  └── 按模板格式组织输出
   │
5. Step 1 完成
   │  ├── 对照检查清单自检
   │  ├── 提醒用户更新 project-context.md 进度
   │  └── 导航到 Step 2
```

**关键文件**：
- `项目仓库/.cursor/skills/[skill-name]/SKILL.md`（Skill 指令）
- `AIOEP 仓库/docs/01-方法/[阶段]/[方法文件].md`（方法步骤）

**L1 → L2 导航**：当 L1 Skill（phase-1-analysis）判断当前活动是 Gap-Fit 时，告知用户可触发 L2 Skill（gap-fit-analysis）获取更精细的步骤引导。

### 2.4 场景 C：完成活动推进进度

**触发**：一个方法的所有步骤执行完毕。

```
时序：

1. Gap-Fit 方法 Step 6/6 完成
   │
2. AI 执行自检
   │  ├── 对照方法文件的检查清单逐项检查
   │  └── 输出自检结果
   │
3. AI 产出最终文档
   │  └── 写入 项目仓库/docs/02-项目/gap-fit报告.md
   │
4. AI 更新 project-context.md
   │  ├── 当前活动：Gap-Fit 分析 → 需求建模
   │  ├── 活动进度：Step 6/6 → Step 0/N
   │  ├── 方法文件：gap-fit方法.md → 需求建模方法.md
   │  ├── 上次对话：完成 Gap-Fit 分析 6 步骤
   │  └── 下一步：开始需求建模 Step 1
   │
5. AI 更新 Chatlog.md
   │  └── 追加本次对话记录
   │
6. AI 提示用户
   │  └── "Gap-Fit 分析已完成，下一步是需求建模。"
```

**进度推进规则**：
- 活动内推进：Step X → Step X+1（同一方法文件内）
- 活动间推进：活动 N → 活动 N+1（切换方法文件）
- 阶段间推进：Phase N → Phase N+1（需通过质量门禁评审）

---

## 3. 数据模型

### 3.1 核心实体

AIOEP 的所有数据在 v0.1 中都是 Markdown 文件。以下定义核心实体及其属性。

```
┌─────────────────┐
│  Methodology     │    AI-EADM 方法论
│─────────────────│
│  name            │    "AI-EADM"
│  version         │    "v0.5"
│  domains[]       │    9 个域
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  Domain          │    方法论域（01-核心原则 等）
│─────────────────│
│  id              │    "01"
│  name            │    "核心原则"
│  status          │    纲要 | 已确认 | 已验证
│  documents[]     │    域内文档列表
└─────────────────┘


┌─────────────────┐
│  Method          │    实践方法（战略规划方法 等）
│─────────────────│
│  name            │    "战略规划方法"
│  stage           │    分析 | 开发 | 交付
│  status          │    纲要 | 已细化 | 已验证
│  version         │    "v0.2.0"
│  prerequisites[] │    前置条件列表
│  steps[]         │    步骤列表（有序）
│  checklist[]     │    检查清单
│  output          │    输出文件定义
│  template_ref    │    关联模板路径
│  methodology_ref │    引用的方法论框架
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐
│  Template        │    方法模板
│─────────────────│
│  name            │    "模板-战略规划"
│  method_ref      │    关联方法
│  sections[]      │    模板章节结构
└─────────────────┘


┌─────────────────┐
│  Skill           │    AI 可执行技能
│─────────────────│
│  name            │    "phase-1-analysis"
│  level           │    L1 | L2 | L3
│  description     │    Cursor 匹配用的描述
│  method_refs[]   │    引用的方法文件（可多个）
│  template_refs[] │    引用的模板文件
│  context_fields  │    需要从上下文读取的字段
│  execution_steps │    执行步骤（精简版）
│  post_actions    │    完成后操作
└─────────────────┘


┌──────────────────┐
│  ProjectContext   │    项目上下文
│──────────────────│
│  project_name     │    "ERP 管理系统"
│  methodology_ver  │    "AI-EADM v0.5"
│  aioep_repo       │    AIOEP 仓库地址
│  current_phase    │    Phase 编号和名称
│  current_activity │    当前活动名称
│  progress         │    "Step X/Y"
│  method_file      │    当前方法文件路径
│  last_session     │    上次对话摘要
│  next_action      │    下一步行动
│  activity_list[]  │    当前阶段活动清单
└──────────────────┘


┌─────────────────┐
│  Phase           │    项目阶段
│─────────────────│
│  id              │    0 | 1 | 2 | 3
│  name            │    "需求分析与设计"
│  activities[]    │    活动列表（有序）
│  entry_criteria  │    进入条件
│  exit_criteria   │    退出条件（质量门禁）
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  Activity        │    活动
│─────────────────│
│  name            │    "Gap-Fit 分析"
│  method_ref      │    关联方法文件
│  skill_ref       │    关联 Skill
│  status          │    待开始 | 进行中 | 已完成
│  steps_total     │    总步骤数
│  steps_done      │    已完成步骤数
└─────────────────┘


┌─────────────────┐
│  Rule            │    Cursor Rule
│─────────────────│
│  name            │    "odoo-development"
│  description     │    Rule 描述
│  globs[]         │    作用范围
│  scope           │    shared | project-specific
└─────────────────┘
```

### 3.2 实体关系

```
Methodology ──1:N──► Domain
                       │
                       │ 被引用
                       ▼
Method ──1:1──► Template
   │
   │ 被引用
   ▼
Skill ──N:1──► Method
Skill ──N:1──► Template
   │
   │ 读取
   ▼
ProjectContext ──1:N──► Phase ──1:N──► Activity
                                         │
                                         │ 关联
                                         ▼
                                       Method
```

**关键关系**：
- 一个 Skill 可引用多个 Method（L1 Skill 引用整个阶段的所有方法）
- 一个 Activity 对应一个 Method（活动通过方法文件定义执行步骤）
- ProjectContext 是运行时状态，其他实体是静态定义

### 3.3 实体 → 文件映射

| 实体 | v0.1 文件位置 | 所在仓库 |
|------|-------------|---------|
| Methodology | `docs/00-方法论/README.md` | aioep |
| Domain | `docs/00-方法论/[NN]-[名称]/README.md` | aioep |
| Method | `docs/01-方法/[阶段]方法/[方法名].md` | aioep |
| Template | `docs/01-方法/[阶段]方法/模板-[名称].md` | aioep |
| Skill | `skills/[skill-name]/SKILL.md`（模板） | aioep |
| Skill (部署) | `.cursor/skills/[skill-name]/SKILL.md` | 项目仓库 |
| ProjectContext | `.cursor/rules/project-context.md` | 项目仓库 |
| Phase / Activity | 内嵌在 ProjectContext 和 SDLC 文档中 | 两者 |
| Rule | `.cursor/rules/[rule-name].md` | 项目仓库 |

---

## 4. 文件协议规范

v0.1 中文件就是 API。本节精确定义每类文件的命名、格式和字段约束。

### 4.1 project-context.md

**位置**：`项目仓库/.cursor/rules/project-context.md`

**用途**：AI 每次对话自动读取的项目状态文件。是 AIOEP 最关键的协议文件。

**格式规范**：

```markdown
---
description: 项目上下文。AI 每次对话自动读取，了解当前状态。
globs: ["**"]
---

# 项目上下文

- 项目: {string, 必填, 项目名称和简述}
- 方法论: {string, 必填, "AI-EADM v{X.Y}"}
- AIOEP 仓库: {string, 必填, URL 或本地路径}
- 当前阶段: {string, 必填, "Phase {N}（{阶段名称}）"}
- 当前活动: {string, 必填, 活动名称 + 可选状态}
- 活动进度: {string, 必填, "Step {X}/{Y}（{步骤描述}）"}
- 方法文件: {string, 必填, AIOEP 仓库中的相对路径}
- 上次对话: {string, 必填, 一句话摘要}
- 下一步: {string, 必填, 明确的下一步行动}

## 项目关键信息

{自由格式，包含技术栈、业务领域等项目特定信息}

## {当前阶段}活动清单

{有序列表，标注每个活动的状态}
```

**字段约束**：

| 字段 | 类型 | 必填 | 格式 | 更新频率 |
|------|------|------|------|---------|
| 项目 | string | 是 | 自由文本 | 初始化时设定 |
| 方法论 | string | 是 | `AI-EADM v{X.Y}` | 方法论升级时 |
| AIOEP 仓库 | string | 是 | URL 或相对路径 | 初始化时设定 |
| 当前阶段 | string | 是 | `Phase {0-3}（{名称}）` | 阶段切换时 |
| 当前活动 | string | 是 | 活动名称 | 活动切换时 |
| 活动进度 | string | 是 | `Step {X}/{Y}（{描述}）` | 每次对话后 |
| 方法文件 | string | 是 | AIOEP 仓库相对路径 | 活动切换时 |
| 上次对话 | string | 是 | 一句话 | 每次对话后 |
| 下一步 | string | 是 | 具体行动 | 每次对话后 |

**frontmatter 约束**：
- `description` 必须包含"项目上下文"关键词
- `globs` 必须为 `["**"]`（确保所有对话都加载）

### 4.2 SKILL.md

**位置**：
- 模板：`aioep/skills/{skill-name}/SKILL.md`
- 部署：`项目仓库/.cursor/skills/{skill-name}/SKILL.md`

**命名规则**：
- 目录名：`kebab-case`，英文
- L1 命名：`phase-{N}-{阶段英文}`（如 `phase-1-analysis`）
- L2 命名：`{方法英文}`（如 `gap-fit-analysis`）
- L3 命名：`{方法}-{具体步骤}`（如 `bpmn-draw-purchase`）

**格式规范**：

```markdown
---
description: {string, 必填, Cursor 用于匹配的描述，包含触发关键词}
---

# {Skill 名称}

## 上下文
{固定模式：读取 project-context.md，确认当前状态}

## 方法引用
{列出引用的方法文件和模板文件路径}

## 执行步骤
{按方法文件精简为 AI 可执行的指令序列}

## 输出要求
{输出格式、存放位置、命名规则}

## 自检清单
{引用方法文件的检查清单，或内联检查项}

## 完成后
{固定模式：更新 project-context.md + 更新 Chatlog.md}
```

**description 字段规则**：
- 必须包含触发关键词（中英文皆可）
- L1 示例：`Phase 1 需求分析与设计阶段的导航和引导。当用户提到"开始 Phase 1"、"需求分析"、"Phase 1 进展"时触发。`
- L2 示例：`Gap-Fit 分析方法的步骤引导。当用户提到"Gap-Fit"、"差距分析"、"功能对比"时触发。`
- L3 示例：`绘制采购流程 BPMN 图的操作指南。当用户提到"采购流程 BPMN"、"画采购流程"时触发。`

### 4.3 方法文件

**位置**：`aioep/docs/01-方法/{阶段}方法/{方法名}.md`

**命名规则**：
- 阶段目录：`分析方法/`、`开发方法/`、`交付方法/`
- 文件名：中文优先（如 `战略规划方法.md`），或 kebab-case（如 `gap-fit方法.md`）

**标准格式**：

```markdown
# {方法名称}

> 状态: {纲要 | 已细化 | 已验证} | 版本: v{X.Y.Z} | 创建: {YYYY-MM-DD} | 上次验证: {日期或"未验证"}

## 定位
{一段话说明方法的目的和适用场景}

## 前置条件
{方法执行前必须满足的条件}

## 步骤
### Step 1: {步骤名称}
**做什么**：{描述}
**AI 引导问题**：{可选，AI 向用户提的问题}
**输出**：{本步骤的产出}

### Step N: ...

## 模板
{关联的模板文件路径}

## 检查清单
- [ ] {检查项 1}
- [ ] {检查项 N}

## 输出
{最终产出文件的路径和格式}

## 方法论引用
{引用的方法论文档}

## 变更记录
```

**状态流转**：`纲要` → `已细化`（步骤完整可执行）→ `已验证`（经过项目实践验证）

### 4.4 模板文件

**位置**：`aioep/docs/01-方法/{阶段}方法/模板-{名称}.md`

**命名规则**：必须以 `模板-` 前缀命名。

**格式**：模板内容即项目文档的骨架结构，项目使用时复制到 `项目仓库/docs/02-项目/` 并填充。

```markdown
# {文档标题}

> 状态: **待填充** | 版本: v0.1.0 | 创建: {YYYY-MM-DD}
>
> 本文档由{方法名称}方法（[链接]）指导产出。

---

## 1. {章节名}
{引导性提示或占位内容}

## N. {章节名}
...

---

## 变更记录
| 版本 | 日期 | 修改内容 |
|------|------|---------|
```

### 4.5 方法论域文件

**位置**：`aioep/docs/00-方法论/{NN}-{域名}/README.md`

**命名规则**：
- 域目录：`{两位编号}-{中文域名}/`（如 `01-核心原则/`）
- 域主文件：固定为 `README.md`
- L2 文件：在域目录下，`{kebab-case}.md`（如 `sdlc.md`）

**域 README 标准头部**：

```markdown
# {域名}

> 状态: {纲要 | 已确认 | 已验证} | 版本: v{X.Y.Z} | 创建: {日期} | 更新: {日期}

{域的定位和内容概述}
```

**状态定义**：
- `纲要`：结构已建立，内容未填充
- `已确认`：内容已填充并经过审查
- `已验证`：内容经过项目实践验证有效

### 4.6 Chatlog.md

**位置**：
- AIOEP 仓库：`aioep/docs/Chatlog.md`（平台开发对话）
- 项目仓库：`项目仓库/docs/Chatlog.md`（项目对话）

**格式**：

```markdown
# {仓库名} 对话记录 (Chatlog)

> {描述}

---

## {YYYY-MM-DD HH:mm} — {对话标题}

**用户需求**：{原始需求描述}

**关键决策**：
- {决策 1}
- {决策 N}

**解决方案**：
- {步骤摘要}

**代码改动**：
- {文件变动列表}

**状态标签**：✅完成 / ⏳进行中 / ❌未解决

---
```

**规则**：
- 每条记录以二级标题（`##`）开始
- 以分隔线（`---`）结束
- 最新记录在最后（追加模式）
- 时间戳格式：`YYYY-MM-DD HH:mm`

### 4.7 文件状态与版本通用规范

所有 AIOEP 管理的文档使用统一的状态和版本头部：

```markdown
> 状态: {状态值} | 版本: v{主.次.修} | 创建: {YYYY-MM-DD} | 更新: {YYYY-MM-DD}
```

**状态值**（按文件类型）：

| 文件类型 | 可选状态值 | 流转 |
|---------|---------|------|
| 方法论域文件 | 纲要 → 已确认 → 已验证 | 填充 → 审查 → 项目验证 |
| 方法文件 | 纲要 → 已细化 → 已验证 | 创建 → 步骤完善 → 项目验证 |
| 项目文档 | 待填充 → 草稿 → 已确认 | 模板 → 填充 → 评审 |
| 平台文档 | 纲要 → 已确认 | 创建 → 评审 |

**版本号规则**（语义化版本）：
- 主版本：重大结构变化
- 次版本：内容新增或重要修改
- 修订版：小修正、格式调整

---

## 5. Skills 引擎规格

### 5.1 匹配机制

Cursor 的 Skill 匹配基于 SKILL.md 的 frontmatter `description` 字段：

```
用户输入 → Cursor 分词 → 与所有 Skill 的 description 匹配 → 加载最相关的 Skill
```

**匹配优先级规则**：

| 优先级 | 条件 | 示例 |
|--------|------|------|
| 1（最高） | L3 精确匹配 | 用户说"画采购 BPMN" → `bpmn-draw-purchase` |
| 2 | L2 方法匹配 | 用户说"做 Gap-Fit" → `gap-fit-analysis` |
| 3 | L1 阶段匹配 | 用户说"Phase 1 进展" → `phase-1-analysis` |

**description 编写规则**：
1. 以一句话概述 Skill 功能
2. 用"当用户提到"列出触发关键词（包含中英文变体）
3. L2 Skill 的 description 必须比 L1 更具体，避免 L1 抢占 L2 的匹配
4. 避免不同 Skill 使用相同关键词

### 5.2 执行协议

每个 Skill 执行时遵循固定的 5 步协议：

```
Step 1: 读上下文 (Read Context)
├── 读取 .cursor/rules/project-context.md
├── 确认当前阶段和活动
└── 验证前置条件

Step 2: 读方法 (Load Method)
├── 根据 Skill 的 method_refs 读取方法文件
├── 提取步骤列表
└── 提取模板引用

Step 3: 按步骤执行 (Execute Steps)
├── 按方法文件的步骤顺序逐步执行
├── 每步使用 AI 引导问题与用户交互
└── 每步产出写入指定位置

Step 4: 自检 (Self-Check)
├── 对照方法文件的检查清单逐项验证
└── 输出自检结果

Step 5: 更新状态 (Update State)
├── 更新 project-context.md 进度
├── 更新 Chatlog.md
└── 提示下一步行动
```

### 5.3 Skill 组合与导航

三级 Skill 之间的关系是"导航"而非"调用"。Cursor 一次只加载一个 Skill，级间切换依靠用户触发。

```
L1（阶段导航）
│
├── 列出阶段内的所有活动
├── 根据 project-context 判断当前活动
└── 告知用户："当前活动是 Gap-Fit，你可以说'做 Gap-Fit 分析'来获取详细引导"
    │
    ▼  用户触发
L2（方法引导）
│
├── 加载具体方法文件
├── 按步骤逐步引导
└── 某些复杂步骤可提示："你可以说'画采购 BPMN'来获取建模指南"
    │
    ▼  用户触发
L3（步骤操作）
│
├── 单个步骤的详细操作指南
└── 完成后返回 L2 的下一步骤
```

**组合规则**：
1. L1 Skill 不执行具体方法步骤，只做导航和状态判断
2. L2 Skill 执行完整的方法流程，是最常用的级别
3. L3 Skill 只在步骤复杂度高时才创建（不是每个步骤都需要 L3）
4. 级间切换是用户主动触发，不是自动级联

### 5.4 Skill 生命周期

```
创建 → 测试 → 部署 → 使用 → 改进 → 版本演进
```

| 阶段 | 操作 | 位置 |
|------|------|------|
| **创建** | 编写 SKILL.md，遵循 4.2 节格式规范 | `aioep/skills/` |
| **测试** | 在项目中手动触发，验证匹配和执行效果 | 项目仓库 `.cursor/skills/` |
| **部署** | 从 AIOEP 仓库复制到项目仓库 | v0.1 手动，v0.2 CLI |
| **使用** | 用户在 Cursor 中触发 | 项目仓库 |
| **改进** | 根据使用反馈调整 description、步骤、检查清单 | `aioep/skills/` |
| **版本演进** | 方法文件更新时，对应 Skill 同步更新 | `aioep/skills/` |

**Skill 创建检查清单**：
- [ ] description 字段包含足够的触发关键词
- [ ] 引用的方法文件路径正确
- [ ] 执行步骤与方法文件步骤一致
- [ ] 包含自检清单引用
- [ ] 包含"完成后"更新 project-context 的指令
- [ ] 在项目仓库中测试匹配和执行

---

## 6. 两仓拓扑

### 6.1 AIOEP 仓库结构（当前实际）

```
aioep/                              # 平台仓库 (github.com/Albertsun6/aioep)
├── docs/
│   ├── AIOEP-设计.md               # 平台顶层设计
│   ├── AIOEP-战略规划.md           # 平台战略规划
│   ├── AIOEP-模块设计.md           # 模块拆分设计
│   ├── AIOEP-架构.md               # 平台架构（本文档）
│   ├── 想法收集.md                 # 想法 Backlog
│   ├── 术语表.md                   # 统一术语
│   ├── Chatlog.md                  # AIOEP 开发对话记录
│   ├── README.md                   # 文档索引
│   ├── 00-方法论/                  # AI-EADM 方法论 9 域
│   │   ├── README.md               # 方法论总纲
│   │   ├── 01-核心原则/
│   │   ├── 02-过程方法论/
│   │   ├── 03-建模体系/
│   │   ├── 04-设计模式与开发实践/
│   │   ├── 05-质量框架/
│   │   ├── 06-治理模型/
│   │   ├── 07-AI协作协议/
│   │   ├── 08-角色/
│   │   └── 09-工件/
│   └── 01-方法/                    # 实践方法
│       ├── README.md
│       ├── 分析方法/               # Phase 1 方法
│       ├── 开发方法/               # Phase 2 方法
│       └── 交付方法/               # Phase 3 方法
├── skills/                         # Skills 模板库（源头）
│   └── phase-1-analysis/
│       └── SKILL.md
├── rules/                          # Rules 模板库
│   └── project-context-template.md
├── .gitignore
└── README.md                       # 仓库说明
```

### 6.2 项目仓库结构（ERP 示例）

```
erp/                                # 项目仓库 (github.com/Albertsun6/erp)
├── .cursor/
│   ├── rules/                      # 项目 Rules
│   │   ├── project-context.md      # ★ 项目上下文（核心协议文件）
│   │   ├── odoo-development.md     # Odoo 代码规范
│   │   ├── python-style.md         # Python 风格
│   │   ├── xml-views.md            # XML 视图规范
│   │   ├── security-rules.md       # 安全规则
│   │   ├── testing.md              # 测试规范
│   │   └── git-workflow.md         # Git 工作流
│   └── skills/                     # 从 AIOEP 同步的 Skills
│       └── phase-1-analysis/
│           └── SKILL.md
├── docs/
│   ├── README.md                   # 项目文档索引
│   ├── Chatlog.md                  # 项目对话记录
│   └── 02-项目/                    # 项目文档
│       ├── 战略规划.md
│       ├── 项目章程.md
│       ├── 系统架构设计.md
│       └── 项目路线图.md
├── custom_addons/                  # Odoo 模块代码
├── config/                         # 配置文件
├── models/                         # 建模文件
├── .github/workflows/              # CI/CD
├── docker-compose.yml
├── Makefile
└── README.md
```

### 6.3 文件同步机制

AIOEP 仓库是 Skills 和 Rules 模板的"源头"，项目仓库是"消费方"。

```
aioep/skills/               ──复制──►  erp/.cursor/skills/
aioep/rules/                ──参考──►  erp/.cursor/rules/
aioep/docs/01-方法/模板-*   ──复制──►  erp/docs/02-项目/*
```

| 版本 | 同步方式 | 操作 |
|------|---------|------|
| v0.1 | 手动复制 | `cp aioep/skills/*/SKILL.md erp/.cursor/skills/*/SKILL.md` |
| v0.2 | CLI 命令 | `aioep sync` 自动检测差异并同步 |
| v0.3+ | Web 管理 | 看板中一键同步 |

**同步触发时机**：
1. AIOEP 仓库中新增或更新 Skill 后
2. 项目启动新 Phase 需要新 Skills 时
3. 方法文件更新导致 Skill 需要同步更新时

### 6.4 Cursor 多根工作区

v0.1 推荐使用 Cursor 的多根工作区（Multi-root Workspace）同时打开两个仓库：

**配置方式**（`.code-workspace` 文件）：

```json
{
  "folders": [
    { "path": "/Users/albert/Desktop/erp", "name": "ERP 项目" },
    { "path": "/Users/albert/Desktop/aioep", "name": "AIOEP 平台" }
  ]
}
```

**效果**：
- AI 可直接读取 AIOEP 仓库中的方法论和方法文件
- project-context.md 中引用的 AIOEP 路径可被解析
- Skills 中 `AIOEP 仓库 docs/01-方法/...` 的路径引用可直接访问

---

## 与其他文档的关系

- **上游**：[AIOEP-设计.md](./AIOEP-设计.md)（纲要级设计）→ 本文档细化
- **平级**：[AIOEP-模块设计.md](./AIOEP-模块设计.md)（模块职责）→ 本文档描述运转
- **下游**：各模块的具体实现文件（Skills、Rules、方法文件）遵循本文档的协议

```
AIOEP-设计.md         "是什么"
    ↓
AIOEP-模块设计.md     "分成几块"
    ↓
AIOEP-架构.md         "怎么组装和运转"（本文档）
    ↓
实际文件               遵循本文档的协议规范
```

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v1.0.0 | 2026-02-17 | 完整创建：分层架构 + 信息流 + 数据模型 + 文件协议 + Skills 引擎 + 两仓拓扑 |
