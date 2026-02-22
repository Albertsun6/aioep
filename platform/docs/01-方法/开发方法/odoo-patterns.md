# Odoo 设计模式

> 状态: **已验证** | 版本: v0.3.0 | 创建: 2026-02-15 | 更新: 2026-02-17

## 定位

Odoo 框架专用的设计模式和最佳实践。这是开发者和 AI 日常使用频率最高的文档。每个模式说明：何时用、怎么用、代码纲要、注意事项。

> 本文档是方法层（AI-EADM for Odoo）的核心文件，将同步精简为 `.cursor/rules/odoo-development.md` 供 AI 使用。

---

## 一、模型层模式

### 1.1 _inherit（类继承）

**何时用**：在已有模型上添加字段、方法或修改行为。这是 Odoo 定制的最常用方式。

```python
class SaleOrderExtend(models.Model):
    _inherit = 'sale.order'

    custom_field = fields.Char('自定义字段')
    approval_state = fields.Selection([
        ('pending', '待审批'),
        ('approved', '已通过'),
    ], default='pending', string='审批状态')

    def action_approve(self):
        self.write({'approval_state': 'approved'})
```

**注意事项**：
- 永远用 `_inherit`，不改 Odoo 源码（核心原则）
- 字段名加项目前缀避免冲突（如 `x_erp_` 或项目约定前缀）
- `super()` 调用不要忘记，保持继承链完整

### 1.2 _inherits（委托继承）

**何时用**：新模型需要复用已有模型的所有字段（如基于 res.partner 创建供应商模型）。

```python
class Supplier(models.Model):
    _name = 'erp.supplier'
    _inherits = {'res.partner': 'partner_id'}

    partner_id = fields.Many2one('res.partner', required=True, ondelete='cascade')
    rating = fields.Selection([('a', 'A级'), ('b', 'B级'), ('c', 'C级')])
```

**注意事项**：
- `_inherits` 创建新表，通过外键关联原表
- 适合"是一个"（is-a）关系，但需要扩展大量字段的场景
- 大多数情况 `_inherit` 够用，优先用 `_inherit`

### 1.3 Mixin 模式

**何时用**：为模型混入通用功能（消息追踪、活动管理等）。

```python
class PurchaseRequest(models.Model):
    _name = 'erp.purchase.request'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = '采购申请'

    name = fields.Char('申请编号', tracking=True)
    state = fields.Selection([...], tracking=True)
```

**常用 Mixin**：
| Mixin | 功能 | 使用场景 |
|-------|------|---------|
| `mail.thread` | 消息追踪和 Chatter | 需要消息记录的业务单据 |
| `mail.activity.mixin` | 活动/待办管理 | 需要分配任务的模型 |
| `image.mixin` | 图片字段管理 | 产品、联系人等需要图片的模型 |
| `portal.mixin` | 门户访问 | 需要客户/供应商在门户查看的单据 |

### 1.4 Wizard 模式（TransientModel）

**何时用**：需要弹窗收集用户输入后执行批量操作。

```python
class StockInventoryWizard(models.TransientModel):
    _name = 'erp.stock.inventory.wizard'
    _description = '库存盘点向导'

    warehouse_id = fields.Many2one('stock.warehouse', required=True)
    date = fields.Date(default=fields.Date.today)

    def action_confirm(self):
        # 执行盘点逻辑
        self.env['stock.inventory'].create({
            'warehouse_id': self.warehouse_id.id,
            'date': self.date,
        })
        return {'type': 'ir.actions.act_window_close'}
```

**注意事项**：
- TransientModel 数据自动清理（不会堆积）
- 向导方法通常返回动作（关闭窗口 / 打开新视图）

### 1.5 Computed Field 模式

**何时用**：字段值通过计算得出，依赖其他字段。

```python
total_amount = fields.Float(
    '总金额',
    compute='_compute_total_amount',
    store=True,  # 存储到数据库，可搜索和排序
)

@api.depends('order_line.price_subtotal')
def _compute_total_amount(self):
    for record in self:
        record.total_amount = sum(record.order_line.mapped('price_subtotal'))
```

**注意事项**：
- `store=True` 存库性能好但占空间；`store=False` 实时计算但不可搜索
- `@api.depends` 的依赖要最小化，避免不必要的重算
- 批量计算时用 `for record in self` 遍历 recordset

### 1.6 Onchange 模式

**何时用**：用户在表单中修改某个字段时，联动更新其他字段。

```python
@api.onchange('partner_id')
def _onchange_partner_id(self):
    if self.partner_id:
        self.payment_term_id = self.partner_id.property_payment_term_id
```

**注意事项**：
- `onchange` 只在前端触发，通过 API 创建记录不会触发
- 如果需要 API 也触发，用 `@api.depends` + computed field 或 `create`/`write` 重写

### 1.7 Constraint 模式

**何时用**：数据完整性校验。

```python
# Python 约束
@api.constrains('amount')
def _check_amount(self):
    for record in self:
        if record.amount <= 0:
            raise ValidationError('金额必须大于 0')

# SQL 约束（更高效）
_sql_constraints = [
    ('unique_code', 'UNIQUE(code)', '编码必须唯一'),
    ('positive_amount', 'CHECK(amount > 0)', '金额必须大于 0'),
]
```

> **`@api.constrains` 触发陷阱**（试跑发现的 P2 Bug）：
> - `@api.constrains('field_a', 'field_b')` **只有**在 `create/write` 的 vals 中**显式包含**列出的字段时才触发
> - 例如：`@api.constrains('approver_group_id', 'approver_user_id')` 在 create 时如果两个字段都没传，约束**不会触发**
> - **解决方案**：把一个必传字段（如 `name`）加入装饰器 `@api.constrains('name', 'approver_group_id', 'approver_user_id')`，确保 create 时至少有一个字段被传递
> - SQL 约束没有此问题，能覆盖所有路径——优先使用 SQL 约束

### 1.8 Sequence 模式

**何时用**：自动生成业务单据编号。

```xml
<!-- data/sequence.xml -->
<record id="seq_purchase_request" model="ir.sequence">
    <field name="name">采购申请编号</field>
    <field name="code">erp.purchase.request</field>
    <field name="prefix">PR%(y)s</field>
    <field name="padding">5</field>
</record>
```

```python
@api.model
def create(self, vals):
    if not vals.get('name'):
        vals['name'] = self.env['ir.sequence'].next_by_code('erp.purchase.request')
    return super().create(vals)
```

---

## 二、视图层模式

### 2.1 Form 标准结构

```xml
<form>
    <header>
        <!-- 操作按钮 -->
        <button name="action_confirm" type="object" string="确认"
                class="btn-primary"
                invisible="state != 'draft'"/>
        <!-- 状态栏 -->
        <field name="state" widget="statusbar"
               statusbar_visible="draft,confirmed,done"/>
    </header>
    <sheet>
        <!-- 标题区 -->
        <div class="oe_title">
            <h1><field name="name"/></h1>
        </div>
        <!-- 字段分组 -->
        <group>
            <group><!-- 左列 --></group>
            <group><!-- 右列 --></group>
        </group>
        <!-- 子表/Tab -->
        <notebook>
            <page string="明细">
                <field name="line_ids"/>
            </page>
        </notebook>
    </sheet>
    <!-- 消息追踪 -->
    <div class="oe_chatter">
        <field name="message_ids"/>
        <field name="activity_ids"/>
    </div>
</form>
```

### 2.2 视图继承

```xml
<!-- 在已有视图上添加字段 -->
<record id="view_sale_order_form_inherit" model="ir.ui.view">
    <field name="name">sale.order.form.inherit.erp</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='partner_id']" position="after">
            <field name="approval_state"/>
        </xpath>
    </field>
</record>
```

**xpath 常用 position**：`before` / `after` / `inside` / `replace` / `attributes`

---

## 三、业务层模式

### 3.1 工作流/状态机

**何时用**：业务单据有明确的生命周期（草稿→确认→完成）。

```python
state = fields.Selection([
    ('draft', '草稿'),
    ('confirmed', '已确认'),
    ('done', '完成'),
    ('cancelled', '已取消'),
], default='draft', string='状态', tracking=True)

def action_confirm(self):
    self.write({'state': 'confirmed'})

def action_done(self):
    self.write({'state': 'done'})

def action_cancel(self):
    self.write({'state': 'cancelled'})

def action_reset_draft(self):
    self.write({'state': 'draft'})
```

> 每个有 state 字段的模型都必须有对应的 UML 状态机图（建模覆盖率要求）。

### 3.2 审批模式

**何时用**：单据需要根据条件走不同审批人。

审批模式 = 状态机 + 权限检查 + 消息通知的组合。

```python
def action_submit_approval(self):
    """提交审批"""
    if self.amount <= 5000:
        self.action_confirm()  # 自动通过
    elif self.amount <= 50000:
        self.write({'state': 'pending_manager'})
        self._notify_approver('manager')
    else:
        self.write({'state': 'pending_director'})
        self._notify_approver('director')

def _notify_approver(self, level):
    """通知审批人"""
    # 通过 mail.thread 发送通知
    self.message_post(
        body=f'请审批：{self.name}，金额：{self.amount}',
        partner_ids=self._get_approver_partners(level).ids,
    )
```

> **`_approval_allowed` 覆盖模式**（试跑发现的 P1 Bug）：
> - Odoo 标准 `purchase.order` 的 `button_confirm` 调用 `_approval_allowed()` 判断是否可以直接确认（跳过审批）
> - 如果当前用户是 `purchase_manager`，标准逻辑会返回 `True`，导致自定义多级审批被绕过
> - **必须 override**：自定义审批模块中覆盖 `_approval_allowed`，当自定义审批行存在且未全部通过时返回 `False`
>
> ```python
> def _approval_allowed(self):
>     self.ensure_one()
>     if self.approval_line_ids and self.approval_status != 'approved':
>         return False
>     return super()._approval_allowed()
> ```

### 3.3 Cron 模式

```xml
<record id="cron_stock_alert" model="ir.cron">
    <field name="name">库存预警检查</field>
    <field name="model_id" ref="model_erp_stock_alert"/>
    <field name="code">model.check_stock_alerts()</field>
    <field name="interval_number">1</field>
    <field name="interval_type">days</field>
    <field name="active">True</field>
</record>
```

---

## 四、安全层模式

### 4.1 访问控制（ir.model.access.csv）

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_purchase_request_user,erp.purchase.request.user,model_erp_purchase_request,erp_purchase.group_buyer,1,1,1,0
access_purchase_request_manager,erp.purchase.request.manager,model_erp_purchase_request,erp_purchase.group_purchase_manager,1,1,1,1
```

**规则**：每个新模型必须有至少一条访问权限记录，否则无人能访问。

### 4.2 安全组继承（implied_ids）

> v0.3.0 新增。基于试跑中 RBAC 测试发现的问题。

**何时用**：定义安全组的层级关系（高级组自动包含低级组权限）。

```xml
<record id="group_purchase_approval_gm" model="res.groups">
    <field name="name">总经理审批</field>
    <field name="implied_ids" eval="[(4, ref('group_purchase_approval_dept'))]"/>
</record>
```

**注意事项**：
- `implied_ids` 是**自动继承**：GM 组的用户自动获得 Dept Manager 组的所有权限
- 这意味着 GM 可以执行 Dept Manager 级别的审批操作——**这不是 Bug，是设计如此**
- 设计 RBAC 时**必须画出组继承关系图**，否则测试会出现意外的权限边界
- 如果确实需要"只有 A 组权限、不含 B 组"，不要使用 `implied_ids`，改用独立的组定义

### 4.3 记录规则（ir.rule）

```xml
<!-- 销售员只能看自己的订单 -->
<record id="rule_sale_order_salesperson" model="ir.rule">
    <field name="name">销售员：只看自己的订单</field>
    <field name="model_id" ref="sale.model_sale_order"/>
    <field name="domain_force">[('user_id', '=', user.id)]</field>
    <field name="groups" eval="[(4, ref('erp_sale.group_salesperson'))]"/>
</record>
```

---

## 五、反模式（不要这样做）

| 反模式 | 正确做法 |
|--------|---------|
| 直接修改 Odoo 源码 | 用 `_inherit` 继承扩展 |
| `sudo()` 到处用 | 仅在确实需要跨权限操作时使用，并加注释说明原因 |
| 在 `create`/`write` 中做复杂逻辑 | 抽取为独立方法，`create`/`write` 只做数据准备 |
| 裸 SQL 查询 | 优先用 ORM，必须用 SQL 时用参数化查询防注入 |
| 在 computed field 中写入其他字段 | computed 只设置自身值，联动用 onchange 或 write 重写 |
| 忽略 `for record in self` | 方法可能接收 recordset，必须遍历处理 |
| 不写 `_description` | 每个模型必须有 `_description`（中文说明） |
| 不配 ir.model.access | 新模型没权限配置 = 谁都不能用 |

---

## 六、模式组合指南

### 典型业务单据模块 = 以下模式的组合

```
一个标准业务单据（如采购订单）由以下模式组成：

模型层:
  _inherit           → 扩展标准模型
  Mixin (mail.thread) → 消息追踪
  Computed Field      → 金额汇总
  Constraint          → 数据校验
  Sequence            → 编号自动生成

视图层:
  Form 标准结构       → header + sheet + chatter
  视图继承            → 在标准视图上添加字段

业务层:
  状态机              → draft → confirmed → done
  审批模式            → 基于金额的多级审批
  Cron（可选）        → 定时检查超时订单

安全层:
  ir.model.access     → 角色访问权限
  ir.rule             → 行级数据隔离
```

---

## 与其他文档的关系

- **上游方法论**：[04-设计模式与开发实践](../00-方法论/04-设计模式与开发实践/README.md)（DDD 概念的 Odoo 实现）
- **AI Rules 同步**：`.cursor/rules/odoo-development.md`（本文档精简版）
- **建模配合**：[03-建模体系/uml.md](../00-方法论/03-建模体系/uml.md)（模型 → UML Class 图）
- **质量配合**：[05-质量框架](../00-方法论/05-质量框架/README.md)（代码审查清单引用本文档）

---

## 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| v0.1.0 | 2026-02-15 | 占位创建 |
| v0.2.0 | 2026-02-15 | 填充全部模式：模型层8个 + 视图层2个 + 业务层3个 + 安全层2个 + 反模式 + 组合指南 |
| v0.3.0 | 2026-02-17 | 基于 Phase 2~3 试跑反馈：新增 `@api.constrains` 触发陷阱、`_approval_allowed` 覆盖模式、安全组 `implied_ids` 继承说明 |
