---
description: 项目上下文模板。复制到项目仓库 .agent/rules/project-context.md 使用。
---

# 项目上下文模板

> 使用方法：
> 1. 复制本文件到项目仓库 `.agent/rules/project-context.md`
> 2. 修改 frontmatter 的 description（去掉"模板"字样）
> 3. 填充各字段的实际值
> 4. 每次对话结束后更新进度

```markdown
---
description: 项目上下文。AI 每次对话自动读取，了解当前状态。
globs: ["**"]
---

# 项目上下文

- 项目: [项目名称和简述]
- 方法论: AI-EADM v0.x
- AIOEP 仓库: https://github.com/Albertsun6/aioep
- 当前阶段: Phase N（阶段名称）
- 当前活动: [活动名称]
- 活动进度: Step X/Y（步骤描述）
- 方法文件: AIOEP 仓库 `docs/01-方法/[分类]/[方法文件].md`
- 上次对话: [简述上次做了什么]
- 下一步: [明确的下一步行动]

## 项目关键信息

- 技术基座: [技术栈]
- 业务领域: [覆盖的业务模块]
- 战略规划: `docs/02-项目/战略规划.md`

## 当前阶段活动清单

1. [活动1] [状态]
2. [活动2] [状态]
3. ...
```
