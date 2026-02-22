# 建模文件组织规范

> 本目录存放项目建模产出文件，按建模语言分子目录。

## 目录结构

```
models/
├── archimate/      # ArchiMate 企业架构模型（.archimate 文件）
├── bpmn/           # BPMN 业务流程图（.drawio 文件）
├── uml/            # UML 图（.drawio 文件）
├── c4/             # C4 架构图（.drawio 文件）
└── README.md       # 本文件
```

## 命名规则

- ArchiMate: `{项目名}-{视图名}.archimate`（如 `erp-motivation.archimate`）
- BPMN: `{流程名}.drawio`（如 `purchase-order.drawio`）
- UML: `{图类型}-{主题}.drawio`（如 `class-inventory.drawio`）
- C4: `{层级}-{系统名}.drawio`（如 `context-erp.drawio`）

## 工具

- ArchiMate: [Archi](https://www.archimatetool.com/)（开源）
- BPMN / UML / C4: [draw.io](https://app.diagrams.net/)（开源）

## 方法论引用

- [ArchiMate 建模体系](../docs/00-方法论/03-建模体系/archimate.md)
- [BPMN 建模体系](../docs/00-方法论/03-建模体系/bpmn.md)
