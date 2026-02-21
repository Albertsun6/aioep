# Odoo 开发规范

> 状态: **已细化** | 版本: v0.1.0 | 创建: 2026-02-18
>
> 本文档从 ERP 项目 `.cursor/rules/` 7 条实战规则中提炼，与 [odoo-patterns.md](odoo-patterns.md)（设计模式）互补：
> - **odoo-patterns.md** → 怎么设计（模式 + 架构决策）
> - **本文档** → 怎么写（编码规范 + 工程标准）

---

## 一、模块结构

每个自定义模块遵循以下目录结构：

```
erp_{模块名}/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── {model_name}.py
├── views/
│   ├── {model_name}_views.xml
│   └── menu.xml
├── security/
│   ├── ir.model.access.csv
│   └── security_groups.xml
├── data/
│   └── data.xml
├── tests/
│   ├── __init__.py
│   └── test_{model_name}.py
└── static/
    └── description/
        └── icon.png
```

---

## 二、模型规范

| 规则 | 说明 |
|------|------|
| 模型名 | 点分隔：`erp.purchase.request` |
| `_description` | 必填，中文说明 |
| 业务单据 | 继承 `mail.thread` + `mail.activity.mixin` |
| 字段 | 必须有 `string` 参数（中文标签） |
| 业务方法 | 以 `action_` 开头 |
| 计算方法 | 以 `_compute_` 开头 |
| 约束方法 | 以 `_check_` 开头 |
| 继承 | 永远用 `_inherit`，不改 Odoo 源码；调用 `super()` 保持继承链 |
| 继承视图 XML ID | `view_{model}_form_inherit_erp` |

---

## 三、Python 编码风格

基于 PEP 8，附加以下约定：

- 最大行宽 120 字符
- 缩进 4 空格
- 文件末尾保留一个空行

### Import 顺序

```python
# 1. 标准库
import os
from datetime import datetime

# 2. 第三方库
import requests

# 3. Odoo
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

# 4. 本模块
from . import utils
```

### 命名约定

| 类型 | 风格 | 示例 |
|------|------|------|
| 类名 | PascalCase | `PurchaseOrder` |
| 方法名 | snake_case | `action_confirm` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_LIMIT` |
| 私有方法 | 前缀下划线 | `_compute_total` |

### 异常处理

- 使用具体异常类型，不使用裸 `except`
- 业务错误 → `UserError`
- 数据校验 → `ValidationError`

---

## 四、XML 视图规范

### Form 视图标准结构

```xml
<form>
    <header>
        <!-- 操作按钮（按状态 invisible 控制） -->
        <!-- 状态栏 statusbar -->
    </header>
    <sheet>
        <!-- 标题区 oe_title -->
        <!-- 字段分组 group -->
        <!-- 明细 notebook/page -->
    </sheet>
    <div class="oe_chatter">
        <!-- 消息追踪（需要 mail.thread） -->
    </div>
</form>
```

### XML ID 命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 视图 | `view_{model}_{type}` | `view_purchase_order_form` |
| 继承视图 | `view_{model}_{type}_inherit_erp` | `view_purchase_order_form_inherit_erp` |
| 菜单 | `menu_{module}_{功能}` | `menu_purchase_approval` |
| 动作 | `action_{model}` | `action_purchase_order` |
| 权限组 | `group_{角色}` | `group_purchase_manager` |

### 视图继承原则

- 用 `xpath` 定位元素
- `position` 优先 `after` / `before`，避免 `replace`（防升级冲突）
- 按钮用 `type="object"` 调用 Python 方法，主操作加 `class="btn-primary"`

---

## 五、安全与权限规范

### 必须配置

每个新模型必须有：
1. `ir.model.access.csv` — 模型级访问权限
2. `ir.rule`（按需）— 行级记录规则

### 权限组层级

```
base.group_user       → 普通用户（基础读权限）
base.group_manager    → 部门经理（部门范围读写）
base.group_admin      → 系统管理员（全部权限）
```

业务模块在此基础上定义角色（如 `group_purchase_approval_dept`），通过 `implied_ids` 继承上级权限。

### 安全编码红线

| 规则 | 说明 |
|------|------|
| `sudo()` | 仅在确实需要跨权限时使用，**必须注释原因** |
| SQL | 不使用裸 SQL；必须时用 `cr.execute(query, params)` 参数化 |
| 用户输入 | 不直接拼接到 domain 或 SQL |
| 文件上传 | 验证类型和大小 |
| 敏感字段 | 使用 Odoo 加密存储（密码、密钥） |

---

## 六、测试规范

### 框架选择

| 类型 | 用途 |
|------|------|
| `TransactionCase` | 模型逻辑测试（每个方法自动回滚） |
| `HttpCase` | Web 控制器和前端测试 |

### 命名规范

- 文件：`test_{功能模块}.py`
- 类：`Test{功能描述}`
- 方法：`test_{场景描述}`（自然语言描述预期行为）

### TDD 流程

1. Red — 先写失败的测试
2. Green — 写最少代码让测试通过
3. Refactor — 重构

### 覆盖率要求

| 范围 | 目标 |
|------|------|
| 核心业务逻辑 | > 80% |
| 安全相关代码 | > 90% |
| 纯配置/视图 | 不强制 |

### 运行命令

```bash
docker exec erp-odoo odoo --test-enable -d odoo -u {module_name} --stop-after-init
```

---

## 七、Git 工作流

### 分支策略

```
main                    → 生产分支（保持可部署状态）
├── feature/{模块名}    → 功能开发
├── fix/{问题描述}      → 缺陷修复
└── release/v{版本号}   → 发布分支
```

### 提交信息格式

```
<type>(<scope>): <subject>
```

| type | 含义 |
|------|------|
| feat | 新功能 |
| fix | 修复 |
| refactor | 重构 |
| docs | 文档 |
| test | 测试 |
| chore | 构建/工具 |
| model | 建模文件变更 |

scope 示例：`purchase`、`sale`、`stock`、`infra`、`docs`

### 提交红线

- 每次提交做一件事（原子性）
- 不提交敏感信息（密码、密钥、.env）
- 不提交 `node_modules`、`__pycache__`、`.DS_Store`

---

## 八、AI 协作注释规范

AI 生成的代码必须包含：
1. 模块/类级别的中文功能说明
2. 关键业务方法的设计意图注释
3. 非显而易见的逻辑加行内注释

> 注意：不要写"显而易见的叙述性注释"（如 `# 导入模块`、`# 返回结果`），只注释**意图、权衡和约束**。

---

## 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v0.1.0 | 2026-02-18 | 从 ERP 项目 7 条 .cursor/rules 提炼并统一为方法文档 |
