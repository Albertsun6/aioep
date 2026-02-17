# 04 - 设计模式与开发实践

> 状态: **已确认** | 版本: v0.2.0 | 创建: 2026-02-15 | 更新: 2026-02-15

## 定位

定义项目"怎么写出好代码"。分为三类：开发实践（TDD / BDD）、架构模式（DDD / EDA）、框架专用模式（Odoo Patterns）。每个实践/模式都说明在本项目中如何具体落地。

> Odoo Patterns 已移至方法层 [01-方法/odoo-patterns.md](../../01-方法/odoo-patterns.md)，因为它是 Odoo 平台特定的，不属于通用方法论。
> L2 子文件（DDD/TDD/BDD/EDA）的核心内容已整合在本文档中。当单个实践内容增长超过 100 行时再拆分为独立文件。

---

## 分类总览

### 开发实践（怎么写代码）

| 实践 | 文档 | 核心理念 | 适用阶段 | 状态 |
|------|------|---------|---------|------|
| TDD | 本文档"TDD"章节 | 先写测试再写代码，红-绿-重构 | Phase 2 | 已概述 |
| BDD | 本文档"BDD"章节 | 用 Given/When/Then 规格化业务行为 | Phase 1~3 | 已概述 |

### 架构模式（怎么组织代码）

| 模式 | 文档 | 核心理念 | 适用阶段 | 状态 |
|------|------|---------|---------|------|
| DDD | 本文档"DDD"章节 | 领域模型驱动，限界上下文隔离 | Phase 1~2 | 已概述 |
| EDA | 本文档"EDA"章节 | 事件驱动，解耦系统间通信 | Phase 2~3 | 已概述 |

> L2 文件当前为占位，将在阶段 B（Phase 0 并行期）和实际开发中逐步填充，附带真实代码示例。

---

## 本项目怎么用

### DDD — 划模块边界

DDD 的核心价值在本项目中是**划清模块边界**。

| DDD 概念 | Odoo 映射 | 示例 |
|---------|----------|------|
| Bounded Context（限界上下文） | Odoo Module | erp_sale、erp_purchase 是不同上下文 |
| Aggregate Root（聚合根） | 主模型 | sale.order 是销售上下文的聚合根 |
| Entity（实体） | Odoo Model | sale.order.line 是实体 |
| Value Object（值对象） | Odoo 字段 | Selection / Monetary 等不可变字段 |
| Domain Event（领域事件） | Odoo Signal / Automation | 订单确认事件触发库存和财务 |
| Repository（仓储） | Odoo ORM | search / create / write |
| Domain Service（领域服务） | 模型方法 | action_confirm() 等业务方法 |
| Ubiquitous Language（统一语言） | [术语表](../../术语表.md) | 全项目统一术语 |

**执行要点**：
- Phase 1 做 Gap-Fit 分析时，用 DDD 思维划分限界上下文（哪些需求属于哪个模块）
- 模块之间通过明确的接口交互，不直接访问其他模块的内部模型
- 统一语言写在术语表中，代码中使用业务术语命名

### BDD — 规格化业务行为

BDD 的核心价值是**让业务需求变成可执行的规格**。

```
格式: Given / When / Then

示例：采购审批
  Given 采购员创建了一笔金额为 8000 元的采购订单
  When 采购员提交审批
  Then 系统自动将订单发送给部门经理审批
  And 订单状态变为"待审批"

示例：库存预警
  Given 产品A的安全库存设置为 100
  And 当前库存为 95
  When 系统执行库存检查
  Then 生成库存预警通知
  And 通知发送给仓库经理
```

**执行要点**：
- Phase 1 需求分析时，用 BDD 格式记录关键业务场景
- 这些 Given/When/Then 同时是：需求文档 + 测试用例 + 验收标准
- Phase 2 开发时，将 BDD 场景转化为 Odoo TransactionCase 测试
- Phase 3 UAT 时，业务方按 BDD 场景逐项验证

### TDD — 先测试后编码

TDD 的核心价值是**用测试驱动设计，而非事后补测试**。

```
TDD 循环（在 Odoo 中）:

1. Red    → 写一个失败的 Odoo TransactionCase 测试
2. Green  → 写最少的代码让测试通过
3. Refactor → 重构代码，保持测试通过
4. 重复
```

**执行要点**：
- Phase 2 每个 Sprint 的业务逻辑开发使用 TDD
- AI 先生成测试用例 → 人类审查 → AI 生成实现代码 → 运行测试
- 纯配置工作（视图、菜单）不需要 TDD
- 覆盖率目标 > 80%（核心业务逻辑）

### EDA — 解耦外部集成

EDA 的核心价值是**将外部系统集成从同步调用解耦为异步事件**。

```
EDA 在本项目的应用场景：

Odoo 内部（同步）:
  订单确认 → 直接调用库存模块（Odoo ORM，同步）

Odoo ↔ 外部服务（异步）:
  订单确认 → 发送事件到 Redis Stream → 外部服务消费
  支付回调 → Webhook → API 网关 → 更新 Odoo 订单状态
```

**执行要点**：
- Odoo 模块之间：直接调用（不需要 EDA，Odoo ORM 天然支持）
- Odoo 与外部服务：使用 EDA（Redis Stream / Webhook）
- Phase 2 的集成 Sprint 才开始落地，之前不需要

---

## 选用决策树

```
收到一个开发任务：

1. 这是新的业务模块？
   ├── 是 → DDD: 划清边界，映射到 Odoo Module
   └── 否 → Odoo Patterns: _inherit 扩展

2. 有业务行为需要定义？
   ├── 是 → BDD: 写 Given/When/Then 规格
   └── 否 → 跳过

3. 需要写业务逻辑代码？
   ├── 是 → TDD: 先写测试后写代码
   └── 否（纯配置）→ 跳过

4. 涉及外部系统？
   ├── 是 → EDA: 事件驱动解耦
   └── 否 → 直接调用
```

---

## 实践 x 阶段映射

> 已对齐 4 阶段模型

| 实践/模式 | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|----------|:---:|:---:|:---:|:---:|
| DDD | - | **主导** | **主导** | - |
| BDD | - | 辅助 | **主导** | **主导** |
| TDD | - | - | **主导** | 辅助 |
| EDA | - | - | 辅助 | 辅助 |
| Odoo Patterns | - | 辅助 | **主导** | - |

---

## 组合使用指南

典型的一个功能开发流程中，四种实践如何协作：

```
需求输入："采购金额超过5000需要经理审批"

Step 1 — DDD 划边界
  这属于 erp_purchase 上下文
  聚合根: purchase.order

Step 2 — BDD 写规格
  Given 采购订单金额为 8000 元
  When 提交审批
  Then 发送给部门经理

Step 3 — TDD 写测试
  class TestPurchaseApproval(TransactionCase):
      def test_amount_over_5000_needs_manager(self):
          ...

Step 4 — 编码实现（AI 生成 + 人类审查）
  purchase.order._inherit 添加审批逻辑

Step 5 — 如果涉及外部通知
  EDA: 审批通过 → 事件 → 通知服务 → 钉钉/微信
```

---

## 与其他文档的关系

- **上游**：[01-核心原则](../01-核心原则/README.md)（P5 可验证 → TDD/BDD）
- **DDD 建模**：[03-建模体系/uml.md](../03-建模体系/uml.md)（领域模型 → UML Class 图）
- **BDD 验收**：[05-质量框架](../05-质量框架/README.md)（BDD 场景是 L4 UAT 的基础）
- **TDD 测试**：[05-质量框架](../05-质量框架/README.md)（TDD 是 L3 自动化测试的执行方式）
- **Odoo 实现**：[01-方法/odoo-patterns.md](../../01-方法/odoo-patterns.md)（DDD 概念在 Odoo 中的具体模式）
- **统一语言**：[术语表](../../术语表.md)（DDD Ubiquitous Language 的载体）

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-15 | 纲要创建 |
| v0.2.0 | 2026-02-15 | 填充"本项目怎么用"、选用决策树、组合使用指南、对齐4阶段 |
