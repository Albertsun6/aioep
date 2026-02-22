# E2E 测试用例 · 战略建模模块

从**方法论 → Skills → 前端 UI** 三层覆盖，确保全流程可验证。

---

## Layer 1: 方法论层

| ID | 测试项 | 预期 | 状态 |
|----|--------|------|------|
| M-01 | 6 步建模流程完整性 | 愿景→驱动力→目标→举措→验证→归档，每步有输入/输出 | [ ] |
| M-02 | ArchiMate 元素覆盖 | 至少包含 Stakeholder/Driver/Assessment/Goal/Outcome/WorkPackage | [ ] |
| M-03 | 关系一致性 | Association 连 S↔D，Influence 连 D→A/A→G，Aggregation 连 G→O，Realization 连 WP→G | [ ] |
| M-04 | Driver 必须有 category | 每个 Driver 含 internal/external 分类 | [ ] |
| M-05 | 验证规则 8 项全覆盖 | validate-model 输出检查项 ≥ 8 | [ ] |
| M-06 | 模型可归档为 JSON | 产出符合 ArchiMate Motivation schema 的 JSON 文件 | [ ] |

## Layer 2: Skills 层（Prompt 输入/输出校验）

| ID | Sub-Skill | 测试项 | 预期 | 状态 |
|----|-----------|--------|------|------|
| S-01 | extract-drivers | 给定战略文本，提取 Stakeholder | 返回 ≥1 个 Stakeholder 元素 | [ ] |
| S-02 | extract-drivers | 提取 Driver + category | 每个 Driver 有 category 字段 (internal/external) | [ ] |
| S-03 | extract-drivers | 提取 Assessment + severity | 每个 Assessment 有 severity (high/medium/low) | [ ] |
| S-04 | derive-goals | 给定 existingModel，推导 Goal | 返回 ≥1 个 Goal 元素 | [ ] |
| S-05 | derive-goals | 推导 Outcome | 每个 Goal 至少关联 1 个 Outcome | [ ] |
| S-06 | decompose-initiatives | 拆解 WorkPackage | 返回 ≥1 个 WorkPackage (Initiative) | [ ] |
| S-07 | decompose-initiatives | 生成 Principle/Requirement | 至少包含 1 个约束类元素 | [ ] |
| S-08 | validate-model | 完整模型检查 | 返回 checks[] 数组，每项有 status (PASS/WARNING/FAIL) | [ ] |
| S-09 | validate-model | 识别孤立节点 | 无关系的元素标记为 WARNING | [ ] |
| S-10 | spawn-projects | Initiative → Project 映射 | 返回 projects 数组，每项有 name/description/phase | [ ] |
| S-11 | 所有 Sub-Skills | JSON 合规性 | 响应可被 JSON.parse 解析（无 markdown 包裹） | [ ] |

## Layer 3: 前端 UI 层

| ID | 页面 | 测试项 | 预期 | 状态 |
|----|------|--------|------|------|
| U-01 | Settings | 打开设置页 | 显示公司名称/行业/营收/员工数/简介 | [ ] |
| U-02 | Settings | 修改并保存 | 点击保存 → 显示"已保存"反馈 | [ ] |
| U-03 | Settings | 刷新后数据保持 | 刷新页面后字段值与保存值一致 | [ ] |
| U-04 | Dashboard | 年度 Tab 渲染 | 顶部显示年度按钮（至少 2026） | [ ] |
| U-05 | Dashboard | 公司名称显示 | 副标题区域显示已设置的公司名 | [ ] |
| U-06 | Dashboard | 年度过滤 | 点击不同年度 Tab，卡片按年过滤 | [ ] |
| U-07 | Dashboard | 空年度提示 | 选择无数据年度 → 显示"暂无战略目标" | [ ] |
| U-08 | Wizard | 公司背景预填 | 打开建模页 → textarea 自动带入公司信息 | [ ] |
| U-09 | Wizard | AI 生成 Stage 2 | 点击 AI 生成 → 元素列表渲染 | [ ] |
| U-10 | Wizard | AI 生成 Stage 3 | 目标推导 → Goal/Outcome 渲染 | [ ] |
| U-11 | Wizard | AI 生成 Stage 4 | 举措拆解 → WorkPackage/Principle 渲染 | [ ] |
| U-12 | Wizard | AI 生成 Stage 5 | 模型验证 → 检查报告渲染 | [ ] |
| U-13 | Wizard | 错误处理 | AI 失败 → 红色 AlertCircle 横幅 | [ ] |
| U-14 | Wizard | 确认归档 | 点击归档 → 保存 JSON + 跳转大盘 | [ ] |
| U-15 | Dashboard | 归档后刷新 | 大盘显示新归档的战略目标 | [ ] |
| U-16 | Canvas | 可视化页面 | 打开画布 → 渲染元素节点和关系连线 | [ ] |
| U-17 | Canvas | 元素交互 | 点击元素 → 高亮关联链 | [ ] |
