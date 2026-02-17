# Sprint 执行方法

> 状态: **纲要** | 版本: v0.1.0 | 创建: 2026-02-16 | 上次验证: 未验证

## 定位

指导如何执行一个完整的 Scrum Sprint 周期（2~3 周）。适配 1 人 + AI 的团队。

## 前置条件

- Phase 1 分析产出物全部确认
- Sprint Backlog 已从 Gap-Fit 结果中拆分
- 开发环境可用

## 步骤

1. Sprint Planning（Day 1）
   - 从 Backlog 选取本轮任务
   - AI 拆分为技术子任务
   - 确认 Sprint 目标和 DoD
2. 每日开发循环（Day 2~N-2）
   - 每天开始：回顾 Chatlog，对齐今日目标
   - 开发循环：AI 生成 → 人类审查 → AI 修正 → 测试
   - 每天结束：更新 Chatlog，提交代码
3. Sprint Review（Day N-1）
   - 功能演示
   - 收集反馈
4. Sprint Retro（Day N）
   - 方法有效性回顾
   - AI 效率评估
   - 改进项纳入下轮

> 各步骤的详细操作待细化。

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
