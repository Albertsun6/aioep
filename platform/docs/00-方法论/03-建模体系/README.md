# 03 - 建模体系

> 状态: **已确认** | 版本: v0.2.0 | 创建: 2026-02-15 | 更新: 2026-02-15

## 定位

定义项目"怎么描述和表达系统"。采用五层建模架构，从企业架构到开发文档逐层细化。GUI 工具优先（Archi + draw.io），Mermaid 作为轻量补充。渐进式成熟度（L1 → L2 → L3）。

> 对应核心原则 P3（结构化表达）：关键逻辑不接受纯自然语言描述，必须有模型支撑。

---

## 五层建模架构

```
Layer 1  ArchiMate    "企业架构长什么样"     Archi 工具
  ↓ 细化
Layer 2  BPMN 2.0     "业务怎么流转"         draw.io
  ↓ 细化
Layer 3  C4 Model     "系统怎么构成"         draw.io
  ↓ 细化
Layer 4  UML 2.5      "怎么实现"             draw.io
  ↓ 嵌入
Layer 5  Mermaid      "快速参考"             Markdown 内嵌
```

| 层级 | 建模语言 | 工具 | 产出格式 | 存储位置 | 受众 |
|------|---------|------|---------|---------|------|
| Layer 1 | ArchiMate | Archi | .archimate | models/archimate/ | 管理层、业务顾问 |
| Layer 2 | BPMN 2.0 | draw.io | .drawio | models/bpmn/ | 业务顾问、流程负责人 |
| Layer 3 | C4 Model | draw.io | .drawio | models/c4/ | 所有技术干系人 |
| Layer 4 | UML 2.5 | draw.io | .drawio | models/uml/ | 开发者 |
| Layer 5 | Mermaid | Markdown | .md 内嵌 | docs/ 内联 | 开发者（日常参考） |

## 建模语言文档

| 语言 | 文档 | 状态 | 核心用途 |
|------|------|------|---------|
| ArchiMate | [archimate.md](./archimate.md) | 纲要 | 企业架构三层建模 |
| BPMN 2.0 | [bpmn.md](./bpmn.md) | 纲要 | 业务流程建模 |
| C4 Model | 本文档矩阵章节 | 已概述（内容增多时拆分） | 软件架构可视化 |
| UML 2.5 | 本文档矩阵章节 | 已概述（内容增多时拆分） | 系统设计建模 |
| Mermaid | 本文档矩阵章节 | 已概述（内容增多时拆分） | 开发文档内联图 |

---

## 建模对象 x 语言 x 工具矩阵

> 阶段已对齐 4 阶段模型（Phase 0~3）

| 建模对象 | 建模语言 | 正式工具（GUI） | 轻量工具（文本） | 适用阶段 |
|---------|---------|-------------|-------------|---------|
| 企业架构全景 | ArchiMate | Archi | - | Phase 1 |
| 业务流程 | BPMN 2.0 | draw.io | Mermaid flowchart | Phase 1 |
| 业务规则 | 决策表 + 伪代码 | - | Markdown 表格 + 代码块 | Phase 1~2 |
| 系统上下文/容器 | C4 Model | draw.io | Mermaid | Phase 1 末 ~ Phase 2 初 |
| 组件架构 | C4 Component | draw.io | Mermaid | Phase 2 |
| 用例 | UML Use Case | draw.io | - | Phase 1 |
| 数据模型/类 | UML Class | draw.io | Mermaid classDiagram | Phase 2 |
| 系统交互 | UML Sequence | draw.io | Mermaid sequenceDiagram | Phase 2 |
| 状态生命周期 | UML State Machine | draw.io | Mermaid stateDiagram | Phase 2 |
| 数据流转 | DFD | draw.io | Mermaid flowchart | Phase 1~2 |
| 权限模型 | RBAC 矩阵 | - | Markdown 表格 | Phase 1~2 |
| 部署拓扑 | UML Deployment | draw.io | - | Phase 3 |

---

## 渐进式成熟度

| 等级 | 名称 | 要求 | 适用时机 |
|------|------|------|---------|
| L1 初始 | 务实子集 | 每种语言只用最核心元素，重在"有"而非"全" | Phase 0~1 |
| L2 成长 | 扩展子集 | 补充更多元素类型，提高模型精度 | Phase 2 |
| L3 成熟 | 接近标准 | 符合各建模语言的标准规范 | Phase 3 及后续 |

各语言的 L1/L2/L3 元素清单定义在各自的 L2 文件中。

---

## 建模覆盖率要求

每个业务模块（如 erp_sale）在 Sprint 交付时，必须包含以下最低模型集合：

| 模型类型 | 要求 | 说明 |
|---------|------|------|
| BPMN 业务流程图 | 必须 | 至少 1 个端到端流程 |
| UML 状态机图 | 有状态字段时必须 | 如订单状态、审批状态 |
| UML 类图 | 必须 | 模块内模型关系 |
| 决策表 | 有复杂业务规则时必须 | 如审批阈值、价格策略 |
| RBAC 矩阵 | 必须 | 角色-模型-操作映射 |
| UML 序列图 | 涉及跨模块/跨系统交互时必须 | 如 Odoo→外部服务 |

> 此要求纳入 Sprint 完成门禁（DoD），详见 [05-质量框架](../05-质量框架/README.md)。

---

## AI 与正式建模的协作流程

```
Step 1: 人类描述需求
  "采购订单金额超过5000需要经理审批"

Step 2: AI 生成 Mermaid 草稿
  AI 输出 Mermaid 状态机图 / 流程图 / 类图

Step 3: 人类审阅草稿
  ├── 确认逻辑正确性
  ├── 补充遗漏的分支和异常
  └── 修正业务术语

Step 4: 人类在 GUI 工具中正式建模
  ├── draw.io 中绘制正式 BPMN / UML 图
  └── Archi 中绘制 ArchiMate 模型

Step 5: 导出并存档
  ├── 源文件 (.drawio / .archimate) → models/
  ├── 导出图片 (PNG/SVG) → models/exports/
  └── 在文档中引用导出图片
```

**关键规则**：
- AI 生成的 Mermaid 图是**草稿**，不是正式模型
- 简单场景（如 README 中的快速说明）可以只用 Mermaid，不必升级到 GUI
- 判断标准：**如果这个模型会被业务方或审计看** → 必须用 GUI 正式建模

---

## 模型文件管理规范

```
models/                          # 正式模型文件根目录
├── archimate/                   # ArchiMate（.archimate 格式）
├── bpmn/                        # BPMN（.drawio 格式）
├── c4/                          # C4（.drawio 格式）
├── uml/                         # UML（.drawio 格式）
│   ├── use-cases/
│   ├── class-diagrams/
│   ├── sequence-diagrams/
│   └── state-machines/
└── exports/                     # 导出图片（PNG/SVG）
```

### 命名规范

| 类型 | 命名格式 | 示例 |
|------|---------|------|
| BPMN 流程 | `{模块}-{流程名}.drawio` | `purchase-approval-process.drawio` |
| UML 类图 | `{模块}-class.drawio` | `sale-class.drawio` |
| UML 状态机 | `{模块}-{模型}-state.drawio` | `purchase-order-state.drawio` |
| UML 序列图 | `{模块}-{场景}-sequence.drawio` | `payment-callback-sequence.drawio` |
| C4 架构 | `{层级}-{范围}.drawio` | `container-erp-system.drawio` |
| ArchiMate | `{范围}.archimate` | `erp-enterprise.archimate` |
| 导出图片 | 与源文件同名，扩展名改为 `.png` | `purchase-approval-process.png` |

### 版本管理规则

- 模型源文件（.archimate / .drawio）纳入 Git 版本控制
- 每次修改模型后，**同步导出** PNG/SVG 到 `models/exports/`
- 提交信息格式：`model({类型}): {描述}`，如 `model(bpmn): 新增采购审批流程`

---

## 与其他文档的关系

- **上游**：[01-核心原则](../01-核心原则/README.md)（P3 结构化表达）
- **过程配合**：[02-过程方法论](../02-过程方法论/README.md)（各阶段建模需求不同）
- **工件关联**：[09-工件](../09-工件/README.md)（模型是核心工件类型）
- **AI 协作**：[07-AI协作协议](../07-AI协作协议/README.md)（AI 生成草稿的规范）
- **质量门禁**：[05-质量框架](../05-质量框架/README.md)（建模覆盖率是 DoD 条件）
- **模型存储**：`models/` 目录

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-15 | 纲要创建 |
| v0.2.0 | 2026-02-15 | 对齐4阶段模型，新增建模覆盖率要求、AI协作流程、命名规范 |
