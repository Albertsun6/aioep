# AI 辅助战略建模方法

> 状态: **已确认** | 版本: v1.0.0 | 创建: 2026-02-22
>
> 本方法定义如何使用 AI 辅助，基于 ArchiMate Motivation Aspect 标准，从自然语言自动构建企业战略结构化模型。
> 本方法是 [战略规划方法](./战略规划方法.md) 的建模增强层——战略规划方法负责"定内容"，本方法负责"建模型"。

---

## 定位

| 维度 | 说明 |
|------|------|
| 前序方法 | [战略规划方法](./战略规划方法.md)（Step 1~9 产出战略规划文档） |
| 建模标准 | [ArchiMate 动机层规范](../../00-方法论/03-建模体系/archimate-motivation.md) |
| 核心价值 | 让 AI 从自然语言中自动提取标准建模元素，生成可追溯的战略→项目血缘图 |
| 触发时机 | 战略规划方法完成后，或与 Step 1~9 同步执行 |

---

## 前置条件

- ArchiMate 动机层规范已确认（[archimate-motivation.md](../../00-方法论/03-建模体系/archimate-motivation.md)）
- 战略规划方法的输入材料已准备（自然语言：会议纪要 / 愿景描述 / 痛点列表等）
- AI Skill `strategy-modeling` 已可用（或人工按步骤执行）

---

## 6 步操作流程

### Step 1: 愿景采集与利益相关者识别

**输入**：自然语言文本（如 CEO 致辞、战略会议纪要、商业计划书摘要）

**AI 动作**：
1. 从文本中进行 NLP 实体抽取
2. 识别出 `Stakeholder`（利益相关者）和 `Driver`（驱动力/内外部因素）
3. 输出标准 JSON 格式

**人类动作**：
- 确认 Stakeholder 列表的完整性
- 补充 AI 未识别到的隐含驱动力

**输出**：`Stakeholder[]` + `Driver[]`（JSON，符合 archimate-motivation.md 中的 Schema）

**对应战略规划方法**：Step 1（企业概况） + Step 2（愿景）

**质量检查**：
- [ ] 每个 Driver 至少关联一个 Stakeholder
- [ ] 驱动力覆盖了内部因素和外部因素

---

### Step 2: 痛点评估与现状分析

**输入**：Step 1 的 Driver 列表 + 已有的痛点描述

**AI 动作**：
1. 基于 Driver 进行语义分析，生成 `Assessment`（评估/痛点节点）
2. 建立 `Driver → Assessment` 的 Influence（影响）关系
3. 对 Assessment 进行严重程度评级（高/中/低）

**人类动作**：
- 审阅 Assessment 的准确性
- 补充 AI 可能遗漏的系统性痛点
- 确认影响关系的方向（正面/负面）

**输出**：`Assessment[]` + `Relationship[]`（Driver → Assessment）

**对应战略规划方法**：Step 3（痛点分析）

**质量检查**：
- [ ] 每个 Assessment 有明确的严重程度标注
- [ ] Assessment 与 Driver 的关系方向正确

---

### Step 3: 目标与结果推导

**输入**：Assessment 列表 + 愿景描述 + 行业知识

**AI 动作**：
1. 从 Assessment（痛点）反向推导出 `Goal`（目标）候选项
2. 为每个 Goal 生成可量化的 `Outcome`（结果/KPI）
3. SMART 原则自动检查：每个 Outcome 是否 Specific、Measurable、Time-bound
4. 建立 `Assessment → Goal`（影响）和 `Goal → Outcome`（聚合）关系

**人类动作**：
- 从候选目标中选择/合并/调整
- 确认 KPI 目标值和时间线
- 决定目标优先级

**输出**：`Goal[]` + `Outcome[]` + 关系链

**对应战略规划方法**：Step 4（战略目标）+ Step 7（成功标准）

**质量检查**：
- [ ] 每个 Goal 至少有一个 Outcome
- [ ] 每个 Outcome 有可度量的 target 值
- [ ] Goal 体系不存在孤岛（每个 Goal 可追溯到 Assessment）

---

### Step 4: 战略举措拆解

**输入**：Goal-Outcome 树 + 约束条件

**AI 动作**：
1. 将 Goal 分解为可执行的 `Strategic Initiative`（战略举措，对应 Work Package 组合级）
2. 识别约束条件，生成 `Principle`（原则）和/或 `Constraint`（约束）  
3. 按"影响范围 × 紧迫程度"矩阵建议优先级
4. 建立 `Requirement → Goal`（实现）关系

**人类动作**：
- 确认举措拆解的粒度是否合适
- 排定优先级（P0 → P3）
- 确认原则和约束的刚性程度

**输出**：`StrategicInitiative[]` + `Principle[]` + `Requirement[]`

**对应战略规划方法**：Step 5（范围优先级）+ Step 8（约束和风险）

**质量检查**：
- [ ] 每个 Initiative 可追溯到至少一个 Goal
- [ ] 优先级已排定
- [ ] 约束条件与原则不冲突

---

### Step 5: 项目孵化

**输入**：Strategic Initiative 列表 + 确认的优先级

**AI 动作**：
1. 将每个 P0/P1 级 Initiative 转化为 `Work Package`（即 AIOEP 中的 Project）
2. 自动填充项目的 `strategyId` 和 `strategyName` 字段
3. 生成项目初始描述和技术栈建议

**人类动作**：
- 确认项目范围和命名
- 分配负责人
- 确认启动时间

**输出**：AIOEP Project 创建请求（通过 `/api/projects` 接口落地）

**对应战略规划方法**：Step 9（变革管理）+ 项目启动

**质量检查**：
- [ ] 每个 Project 的 `strategyId` 已正确关联
- [ ] Project 描述包含其战略归属信息

---

### Step 6: 模型审阅与确认

**输入**：Step 1~5 的完整动机模型 JSON

**AI 动作**：
1. **完整性检查**：所有 8 类元素是否至少有 1 个实例
2. **一致性检查**：关系方向是否符合 ArchiMate 规范
3. **孤岛检查**：是否存在没有任何关系的孤立元素
4. **可追溯性检查**：每个 Work Package 是否可追溯到 Goal
5. 生成《模型健康报告》

**人类动作**：
- 审阅健康报告
- 修正 AI 标注的问题
- 最终确认模型状态为 `confirmed`

**输出**：
- 确认的完整 ArchiMate Motivation 模型 JSON
- 归档至 `models/archimate/{战略名}-motivation.json`
- 导出可视化图至 `models/exports/{战略名}-motivation.png`

**质量检查**：
- [ ] 模型健康报告无 Critical 级问题
- [ ] 模型状态已更新为 `confirmed`
- [ ] 文件已归档到正确位置

---

## 与战略规划方法的对照表

| 战略规划方法步骤 | 本方法步骤 | 产出的 ArchiMate 元素 |
|---------------|----------|---------------------|
| Step 1 企业概况 | Step 1 愿景采集 | Stakeholder |
| Step 2 愿景 | Step 1 愿景采集 | Driver |
| Step 3 痛点 | Step 2 痛点评估 | Assessment |
| Step 4 目标 | Step 3 目标推导 | Goal + Outcome |
| Step 5 优先级 | Step 4 举措拆解 | Requirement (优先级) |
| Step 6 现有系统 | Step 2 痛点评估 | Assessment (现状) |
| Step 7 成功标准 | Step 3 目标推导 | Outcome (KPI) |
| Step 8 约束 | Step 4 举措拆解 | Principle + Constraint |
| Step 9 变革管理 | Step 5 项目孵化 | Work Package |

---

## 模板

```json
{
  "modelVersion": "1.0",
  "modelType": "archimate-motivation",
  "elements": [],
  "relationships": [],
  "metadata": {
    "createdBy": "ai",
    "createdAt": "",
    "status": "draft"
  }
}
```

完整 JSON Schema 详见 [archimate-motivation.md](../../00-方法论/03-建模体系/archimate-motivation.md) 第 5.2 节。

---

## 检查清单

- [ ] Stakeholder 和 Driver 已识别并关联
- [ ] Assessment 覆盖了关键痛点
- [ ] Goal 符合 SMART 原则，有对应 Outcome
- [ ] Initiative 已拆解并排定优先级
- [ ] P0/P1 Initiative 已孵化为 AIOEP Project
- [ ] 完整模型通过一致性和完整性检查
- [ ] 模型 JSON 已归档至 `models/archimate/`

---

## AI Skill 对应

| 本方法步骤 | AI Sub-Skill | Skill 级别 |
|-----------|-------------|-----------|
| Step 1~2 | `extract-drivers` | L1 |
| Step 3 | `derive-goals` | L1 |
| Step 4 | `decompose-initiatives` | L1 |
| Step 5 | `spawn-projects` | L1 |
| Step 6 | `validate-model` | L2 |

---

## 方法论引用

- [ArchiMate 动机层建模规范](../../00-方法论/03-建模体系/archimate-motivation.md)
- [战略规划方法](./战略规划方法.md)（内容层面的前序方法）
- [03-建模体系 README](../../00-方法论/03-建模体系/README.md)（五层建模架构）

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v1.0.0 | 2026-02-22 | 完整创建：6 步操作流程、与战略规划方法对照表、AI Skill 映射、JSON 模板 |
