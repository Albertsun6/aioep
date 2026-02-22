# ArchiMate 动机层建模规范（Motivation Aspect）

> 状态: **已确认** | 版本: v1.0.0 | 创建: 2026-02-22
>
> 本文档定义 ArchiMate 动机层 (Motivation Aspect) 在 AIOEP 战略管理中的建模规范。
> 动机层是 ArchiMate 3.2 标准中专门用于描述企业"为什么做"的建模视角。

---

## 1. 定位与价值

| 维度 | 说明 |
|------|------|
| 标准来源 | ArchiMate® 3.2 Specification (The Open Group) |
| 所属层级 | AIOEP 五层建模架构 Layer 1（企业架构层） |
| 核心问题 | 为什么做（Why）— 企业的动因、目标和约束 |
| 在 AIOEP 中的角色 | **战略管理的标准建模语言**，战略 → 项目血缘的结构化表达 |

> **与其他层次关系**：动机层是所有后续建模的"为什么"。每一个 BPMN 流程（Layer 2）、C4 系统（Layer 3）和代码实现（Layer 4）都应能追溯到动机层中的某个 Goal 或 Requirement。

---

## 2. L1 务实子集（核心元素）

> 对应渐进式成熟度 L1 — 只用最核心的元素，重在"有"而非"全"。

### 2.1 元素定义

| 元素 | ArchiMate 标准名 | 图标/颜色 | AIOEP 含义 | 示例 |
|------|------------------|-----------|-----------|------|
| **利益相关者** | Stakeholder | 紫色人形 | 对战略有利益诉求的角色 | CEO、CTO、客户 |
| **驱动力** | Driver | 紫色菱形 | 推动变革的内外部因素 | 市场竞争加剧、成本压力 |
| **评估** | Assessment | 紫色三角 | 对现状的判断和痛点识别 | 供应链效率不足、IT老旧 |
| **目标** | Goal | 紫色椭圆 | 企业希望达到的定性方向 | 降本增效、数字化转型 |
| **结果** | Outcome | 绿色椭圆 | 目标的可量化预期结果 | 库存周转率提升20% |
| **原则** | Principle | 紫色矩形 | 指导决策的不可违背规则 | 数据主权不可让渡 |
| **需求** | Requirement | 黄色矩形 | 实现目标所需的具体条件 | 多语言支持、GDPR合规 |
| **工作包** | Work Package | 蓝色矩形 | 实际执行的项目单元 | ERP升级项目 → **映射为 AIOEP Project** |

### 2.2 关系约束

| 关系类型 | ArchiMate 名称 | 语义 | 允许的连接 |
|---------|---------------|------|-----------|
| **影响** | Influence | A 影响 B（正/负/不确定） | Driver → Assessment, Assessment → Goal |
| **实现** | Realization | A 实现 B | Work Package → Requirement, Requirement → Goal |
| **聚合** | Aggregation | A 由 B 组成 | Goal → Sub-Goal, Outcome → Sub-Outcome |
| **关联** | Association | 一般关系 | Stakeholder → Driver, Principle → Goal |
| **组合** | Composition | 强聚合 | Initiative（作为 Work Package 组合）→ Sub-Work Package |

### 2.3 L1 建模模板

```
Stakeholder ──关联──→ Driver ──影响──→ Assessment
                                        │
                                     ┌──影响──┐
                                     ↓        ↓
                                   Goal    Principle
                                     │
                                  ┌──聚合──┐
                                  ↓        ↓
                               Outcome   Outcome
                                  │
                               ┌──实现──┐
                               ↓        ↓
                           Requirement  Requirement
                               │
                            ┌──实现──┐
                            ↓        ↓
                        Work Package  Work Package
                        (= AIOEP Project)
```

---

## 3. L2 扩展子集

> 在 L1 稳定使用后，按需引入以下元素提高模型精度：

| 元素 | ArchiMate 标准名 | 用途 | 引入时机 |
|------|------------------|------|---------|
| **约束** | Constraint | 限制条件（Requirement 的特殊类型） | 有明确法规/技术约束时 |
| **含义** | Meaning | 知识/语义的表达 | 需定义业务术语标准时 |
| **价值** | Value | 利益相关者从服务/产品获得的价值 | 需做价值流分析时 |

---

## 4. 与 BMM (Business Motivation Model) 的映射

> BMM 是 OMG 的标准，与 ArchiMate 高度互补。本映射确保团队在两种标准间可无缝切换。

| BMM 概念 | ArchiMate 对应 | 说明 |
|---------|---------------|------|
| Vision | Goal（顶层） | BMM 的愿景对应 ArchiMate 最高层级 Goal |
| Mission | — | ArchiMate 无直接对应；可用 Principle 表达 |
| Goal | Goal | 直接对应 |
| Objective | Outcome | BMM Objective 是可度量的，对应 Outcome |
| Strategy | Work Package (组合级) | 战略举措 = 一组 Work Package |
| Tactic | Work Package (叶子级) | 具体项目 |
| Influencer | Driver | 内外部影响因素 |
| Assessment | Assessment | 直接对应 |
| Directive (Policy/Rule) | Principle + Constraint | 指导与约束 |

---

## 5. AI 协作规范

### 5.1 AI 生成边界

| 能力 | AI 可以做 | AI 不可以做 |
|------|----------|------------|
| 实体提取 | 从自然语言中识别 Stakeholder/Driver/Goal 等 | 替代人类做最终战略决策 |
| 关系推导 | 推荐元素间的 Influence/Realization 关系 | 独立决定关系的正/负方向 |
| 一致性检查 | 验证模型是否符合 L1 约束规则 | 删除人类确认过的元素 |
| 建议补充 | 提示可能遗漏的 Assessment 或 Requirement | 跳过人类审阅步骤 |

### 5.2 JSON 数据结构标准

AI 生成的动机模型必须遵循以下 JSON Schema：

```json
{
  "modelVersion": "1.0",
  "modelType": "archimate-motivation",
  "elements": [
    {
      "id": "elem-001",
      "type": "Stakeholder | Driver | Assessment | Goal | Outcome | Principle | Requirement | WorkPackage",
      "name": "元素名称",
      "description": "元素描述"
    }
  ],
  "relationships": [
    {
      "id": "rel-001",
      "type": "Influence | Realization | Aggregation | Association | Composition",
      "sourceId": "elem-001",
      "targetId": "elem-002",
      "label": "可选标注（如影响方向 +/-）"
    }
  ],
  "metadata": {
    "createdBy": "ai | human",
    "createdAt": "ISO 8601",
    "status": "draft | reviewed | confirmed"
  }
}
```

---

## 6. 模型文件管理

| 类型 | 格式 | 存储位置 | 命名规范 |
|------|------|---------|---------|
| AI 生成草稿 | `.json` | `models/archimate/drafts/` | `{战略名}-motivation-draft.json` |
| 人类确认模型 | `.json` + `.archimate` | `models/archimate/` | `{战略名}-motivation.json` |
| 导出图片 | `.png` / `.svg` | `models/exports/` | `{战略名}-motivation.png` |

---

## 与其他文档的关系

- **上游**：[03-建模体系 README](./README.md)（本文档遵循其五层架构和渐进式成熟度）
- **方法配套**：[战略建模方法](../../01-方法/分析方法/战略建模方法.md)（具体操作步骤）
- **AI Skills**：`platform/skills/strategy-modeling/`（AI 可执行指令）
- **质量门禁**：[05-质量框架](../05-质量框架/README.md)（模型审阅是 Phase 0 门禁条件）

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v1.0.0 | 2026-02-22 | 完整创建：L1/L2 元素定义、关系约束、BMM 映射、AI 协作规范、JSON Schema |
