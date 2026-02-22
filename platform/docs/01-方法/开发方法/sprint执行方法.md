# Sprint 执行方法

> 状态: **已细化** | 版本: v0.2.0 | 创建: 2026-02-16 | 上次验证: 2026-02-17（ERP 项目 Sprint 0+1 验证）

## 定位

指导如何执行一个完整的 Scrum Sprint 周期（2~3 周）。适配 1 人 + AI 的团队。

## 前置条件

- Phase 1 分析产出物全部确认
- Sprint Backlog 已从 Gap-Fit 结果中拆分
- 开发环境可用

## 步骤

### Step 1: Sprint Planning（Day 1）

**做什么**：从 Backlog 选取本轮任务，拆分为可执行的技术子任务。

**操作要点**：
- 从 Gap-Fit 报告中提取本 Sprint 对应的需求项
- AI 将每项需求拆分为技术子任务（模型/视图/安全/测试/文档）
- 确认 Sprint 目标（1 句话）和 DoD（引用质量框架 Sprint 门禁）

> **Sprint 类型区分**（试跑经验）：
> - **Sprint 0**（配置型）：安装标准模块 + 启用配置项。任务粒度为"安装模块 X"、"启用功能 Y"。使用 JSON-RPC API 可批量完成，效率远高于浏览器手动操作
> - **Sprint 1~N**（开发型）：自定义模块开发。任务粒度为"创建模型"、"添加视图"、"配置权限"、"编写测试"

### Step 2: 每日开发循环（Day 2~N-2）

**做什么**：按 AI → 人类审查 → 测试的循环推进开发。

**操作要点**：
- 每天开始：回顾 Chatlog，对齐今日目标
- 开发循环：AI 生成代码 → 人类审查逻辑 → AI 修正 → 运行测试
- 每天结束：更新 Chatlog，提交代码

> **1 人 + AI 开发循环实操**（试跑经验）：
> - AI 可一次性生成完整模块骨架（`__init__.py` + `__manifest__.py` + models + views + security + tests）
> - 人类重点审查：业务逻辑正确性、安全组配置、`super()` 调用链
> - 测试先跑一遍 → 修复失败用例 → 再跑 → 全通过后提交
> - 遇到 Odoo 框架级别的 Bug（如 `_approval_allowed` 行为不符预期），先用 JSON-RPC / SQL 查询定位根因，再修改代码

### Step 3: Sprint Review（Day N-1）

**做什么**：功能演示 + 收集反馈。

**操作要点**：
- 在浏览器中走通本 Sprint 完成的功能流程
- 截图或录屏记录关键操作结果
- 对照 Gap-Fit 报告确认需求覆盖度

### Step 4: Sprint Retro（Day N）

**做什么**：回顾方法有效性，记录改进项。

**操作要点**：
- 评估 AI 效率（代码采纳率、修正轮次）
- 记录踩过的坑（尤其是 Odoo 框架级别的陷阱）
- 改进项**反馈到方法文档**（如本次试跑中发现的 `@api.constrains` 触发条件、`implied_ids` 影响等已反馈到 `odoo-patterns.md`）

> **Sprint Retro 的方法论反馈闭环**（试跑经验）：Sprint 中发现的通用问题应向上反馈到方法层文档（`01-方法/`），而非仅记录在 Chatlog 中。这样后续 Sprint 和项目可直接受益。

## 模板

- Sprint Planning 模板：待创建
- Sprint Review 记录模板：待创建
- Sprint Retro 模板：待创建

## 检查清单

- [ ] Sprint 目标明确
- [ ] Backlog 任务已拆分到可执行粒度
- [ ] DoD 已确认（引用质量框架 Sprint 门禁）
- [ ] Review 已完成、反馈已记录
- [ ] Retro 改进项已记录

## 输出

- Sprint 内完成的模块代码
- Sprint Review 记录（追加到 Chatlog）
- Sprint Retro 改进项

## 方法论引用

- [SDLC Phase 2](../../00-方法论/02-过程方法论/sdlc.md)（Sprint 框架定义）
- [05-质量框架](../../00-方法论/05-质量框架/README.md)（Sprint 完成门禁）
- [07-AI协作协议](../../00-方法论/07-AI协作协议/README.md)（AI 协作规则）

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-16 | 纲要创建 |
| v0.2.0 | 2026-02-17 | 基于 Sprint 0+1 试跑细化：Sprint 类型区分（配置型 vs 开发型）、1 人 + AI 开发循环实操、方法论反馈闭环 |
