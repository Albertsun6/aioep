---
name: strategic-modeling
description: 按照 ArchiMate Motivation Aspect 标准，从自然语言中提取并构建企业战略动机模型。支持自动提取利益相关者、驱动力、痛点、目标、举措，并最终孵化为 AIOEP 项目。
---

# Strategic Modeling Skill

## 概述

本 Skill 实现 [AI 辅助战略建模方法](../../docs/01-方法/分析方法/AI辅助战略建模方法.md) 中定义的 6 步操作流程。
所有输出必须符合 [ArchiMate 动机层建模规范](../../docs/00-方法论/03-建模体系/archimate-motivation.md) 的 JSON Schema。

## 适用阶段

- SDLC Phase 0（战略规划）
- SDLC Phase 0A（战略分析）

## Sub-Skills

本 Skill 由 5 个 Sub-Skill 组成，逐步构建完整的 ArchiMate 动机模型：

| # | Sub-Skill | 对应方法步骤 | 输入 | 输出 |
|---|-----------|------------|------|------|
| 1 | `extract-drivers` | Step 1~2 | 自然语言文本 | Stakeholder[] + Driver[] + Assessment[] |
| 2 | `derive-goals` | Step 3 | Driver[] + Assessment[] | Goal[] + Outcome[] |
| 3 | `decompose-initiatives` | Step 4 | Goal[] + Outcome[] | Initiative[] + Principle[] + Requirement[] |
| 4 | `spawn-projects` | Step 5 | Initiative[] | AIOEP Project 创建请求 |
| 5 | `validate-model` | Step 6 | 完整模型 JSON | 健康报告 + 修正建议 |

## 执行流程

```
用户输入自然语言
      ↓
[extract-drivers] → Stakeholder + Driver + Assessment
      ↓
[derive-goals] → Goal + Outcome
      ↓
[decompose-initiatives] → Initiative + Principle + Requirement
      ↓
[spawn-projects] → AIOEP Project
      ↓
[validate-model] → 健康报告
      ↓
人类审阅确认
```

## Prompt 模板

每个 Sub-Skill 的 System Prompt 存放在 `prompts/` 目录下：

- `prompts/extract-drivers.prompt.md`
- `prompts/derive-goals.prompt.md`
- `prompts/decompose-initiatives.prompt.md`
- `prompts/validate-model.prompt.md`

## 反馈与自修正

执行过程中人类的修正记录存放在 `feedback/` 目录：

- `feedback/corrections.jsonl` — 每次修正的 diff
- `feedback/patterns.md` — 从修正中总结出的常见模式

这些反馈会被用于优化 Prompt 模板，实现 Skill 的自生长。

## 约束规则

1. 所有输出必须严格遵循 ArchiMate Motivation Aspect 的元素和关系定义
2. AI 不可替代人类做最终战略决策
3. 每个步骤的输出必须经过人类审阅才能作为下一步的输入
4. 模型 JSON 必须包含 `metadata.status` 字段标注草稿/已审阅/已确认状态
