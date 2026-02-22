# ArchiMate

> 状态: **已确认** | 版本: v0.3.0 | 创建: 2026-02-15 | 更新: 2026-02-16

## 定位

企业架构建模语言（Layer 1）。描述从战略动机到技术实现的全链路。配合 TOGAF ADM 使用。工具：**Archi**（免费开源）。

ArchiMate 3.x 有 5 层，本项目全部使用：

```
Motivation Layer（动机层）    → WHY：为什么做
Strategy Layer（策略层）      → HOW（战略）：用什么能力和资源
Business Layer（业务层）      → WHAT（业务）：业务流程和服务
Application Layer（应用层）   → WHAT（系统）：应用组件和数据
Technology Layer（技术层）    → WHAT（基础设施）：部署和运行

从上到下形成全链路追溯：战略目标 → 能力 → 业务流程 → 应用模块 → 技术部署
```

---

## L1 初始子集

### 动机层（Motivation Layer）— Phase 0 战略规划使用

| 元素 | 含义 | 示例 |
|------|------|------|
| Stakeholder | 干系人 | 项目负责人、业务顾问、管理层 |
| Driver | 驱动力（促使变革的因素） | 信息孤岛、手工效率低、决策滞后 |
| Assessment | 评估（对驱动力的分析） | "采购流程耗时 3 天，目标 1 天" |
| Goal | 目标 | 运营效率提升 50%、库存周转提升 30% |
| Outcome | 成果（可衡量的结果） | 采购处理时间 ≤ 1 天 |
| Principle | 原则 | AI-EADM 10 条核心原则 |
| Requirement | 需求 | 多级审批、库存预警 |
| Constraint | 约束 | 预算限制、1人+AI团队 |
| Value | 价值 | 降低运营成本、提高客户满意度 |

**关系**：
| 关系 | 含义 | 示例 |
|------|------|------|
| Association | 关联 | Stakeholder → Goal |
| Influence | 影响 | Driver → Goal（驱动力影响目标） |
| Realization | 实现 | Requirement → Goal（需求实现目标） |

### 策略层（Strategy Layer）— Phase 0~1 使用

| 元素 | 含义 | 示例 |
|------|------|------|
| Resource | 资源（有形/无形） | 开发者、AI 工具、Odoo 平台、服务器 |
| Capability | 能力（组织能做什么） | 采购管理能力、库存管理能力 |
| Value Stream | 价值流（创造价值的活动序列） | 采购到付款、订单到交付 |
| Course of Action | 行动方案 | "基于 Odoo 标准功能 + 定制开发" |

### 业务层（Business Layer）— Phase 1 使用

| 元素 | 含义 | 示例 |
|------|------|------|
| Business Actor | 业务参与者 | 采购员、销售经理 |
| Business Process | 业务流程 | 采购流程、销售流程 |
| Business Service | 业务能力 | 采购管理服务 |
| Business Object | 业务实体 | 采购订单、销售订单 |

### 应用层（Application Layer）— Phase 1~2 使用

| 元素 | 含义 | 示例 |
|------|------|------|
| Application Component | 应用模块 | erp_sale、erp_purchase |
| Application Service | 应用能力 | 订单管理 API |
| Data Object | 数据实体 | sale.order 表 |

### 技术层（Technology Layer）— Phase 1~2 使用

| 元素 | 含义 | 示例 |
|------|------|------|
| Node | 计算资源 | Odoo Server、PostgreSQL |
| System Software | 基础软件 | Docker、Nginx |
| Artifact | 部署单元 | Docker Image |

### 关系（L1 使用 5 种）

| 关系 | 含义 | 使用场景 |
|------|------|---------|
| Serving | 服务于 | 采购管理服务 → 采购员 |
| Realization | 实现 | erp_purchase → 采购管理服务 |
| Composition | 组成 | Odoo Server → erp_base + erp_sale |
| Association | 关联 | Stakeholder → Goal |
| Influence | 影响 | Driver → Goal |

---

## L2 成长子集（Phase 2 补充）

- Business Function、Application Interface、Technology Service
- 关系：Flow、Triggering、Access
- Implementation & Migration 层元素

## L3 成熟子集（Phase 3+）

- 完整 ArchiMate 3.x 元素集

---

## 视图（View）规划

| 视图名 | Viewpoint | 内容 | Phase | 使用的层 |
|--------|-----------|------|-------|---------|
| **战略动机** | Motivation | Driver→Goal→Outcome→Requirement 链 | Phase 0 | 动机层 |
| **能力地图** | Strategy | Capability→Value Stream→Course of Action | Phase 0~1 | 策略层 |
| 企业全景 | Layered | 业务+应用+技术三层总览 | Phase 1 | 业务+应用+技术 |
| 业务协作 | Business Process Cooperation | 业务流程和角色协作 | Phase 1 | 业务层 |
| 应用架构 | Application Cooperation | Odoo 模块间关系 | Phase 1~2 | 应用层 |
| 技术部署 | Technology Usage | 部署拓扑 | Phase 2 | 技术层 |

---

## Archi 工具使用规范

### 安装

- 下载：https://www.archimatetool.com/download/
- 免费开源，支持 macOS / Windows / Linux
- 原生支持 ArchiMate 3.x（含 Motivation + Strategy 层）

### 工作流

```
1. 打开 Archi → 新建模型
2. 先建动机层 → 策略层 → 业务层 → 应用层 → 技术层（自上而下）
3. 用关系连接各层元素（Goal → Capability → Process → Component → Node）
4. 使用 Viewpoint 创建不同视角的视图
5. 保存 .archimate 到 models/archimate/
6. 导出 PNG/SVG 到 models/exports/archimate/
```

### 文件管理

- 源文件：`models/archimate/erp-enterprise.archimate`
- 导出图：`models/exports/archimate/{视图名}.png`
- 提交信息：`model(archimate): {描述}`

---

## 与其他文档的关系

- **上游**：[03-建模体系 README](./README.md)
- **方法论配合**：[TOGAF](../02-过程方法论/togaf.md)
- **战略规划方法**：[战略规划方法](../../01-方法/分析方法/战略规划方法.md)（动机层+策略层的具体建模步骤）
- **模型存储**：`models/archimate/`

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-15 | 占位创建 |
| v0.2.0 | 2026-02-15 | L1 元素清单（业务+应用+技术） |
| v0.3.0 | 2026-02-16 | L1 扩充 Motivation + Strategy 层，全 5 层覆盖，视图规划更新 |
