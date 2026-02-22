# 修正模式总结

> 本文档由系统自动维护，记录 AI 战略建模过程中人类修正的常见模式。
> 每次积累足够的修正案例后，AI 会分析并更新此文档，用于优化 Prompt 模板。

---

## 已识别的修正模式

### Pattern-001: Driver 缺少内外部分类
- **发现日期**: 2026-02-22
- **验证案例**: AIOEP 自身战略建模
- **现象**: AI 输出 Driver 时，有时在 description 中标注"内部/外部因素"，有时遗漏
- **根因**: Prompt 中仅建议"在 description 中标注"，非硬约束
- **修正**: 为 Driver 增加必填 `category` 字段（`internal` | `external`）
- **状态**: ✅ 已修正（extract-drivers.prompt.md v1.1）

### Pattern-002: validate-model 检查项不足
- **发现日期**: 2026-02-22
- **验证案例**: AIOEP 自身战略建模 Step 6
- **现象**: 人工审阅发现了 AI 验证未覆盖的问题（如 Assessment 悬空、优先级缺失）
- **根因**: 验证 Prompt 仅有 5 项基础检查
- **修正**: 增加 3 项新检查（Driver 分类、Goal-Assessment 平衡、优先级覆盖）
- **状态**: ✅ 已修正（validate-model.prompt.md v1.1）

### Pattern-003: Step 5 无 AI 支持
- **发现日期**: 2026-02-22
- **验证案例**: AIOEP 自身战略建模 Step 5
- **现象**: Initiative→Project 的转化完全依赖人工
- **根因**: 缺少 spawn-projects Sub-Skill
- **修正**: 新增 spawn-projects.prompt.md
- **状态**: ✅ 已修正（spawn-projects.prompt.md v1.0）

---

## 修正统计

| 指标 | 值 |
|------|---|
| 总修正次数 | 3 |
| 最常被修正的元素类型 | Driver（缺少分类） |
| 最常被修正的关系类型 | — |
| 上次更新 | 2026-02-22 |
