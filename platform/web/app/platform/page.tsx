"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Breadcrumb,
    Card,
    Col,
    Empty,
    Flex,
    Row,
    Spin,
    Tabs,
    Tag,
    Tree,
    Typography,
} from "antd";
import type { DataNode } from "antd/es/tree";
import {
    BookOutlined,
    FileMarkdownOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    ThunderboltOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

const { Title, Paragraph, Text } = Typography;

interface FileNode {
    name: string;
    path: string;
    type: "file" | "directory";
    ext?: string;
    children?: FileNode[];
}

interface PlatformTree {
    docs: FileNode[];
    workflows: FileNode[];
    rules: FileNode[];
}

// Convert our FileNode tree into Ant Design DataNode tree
function toAntdTree(nodes: FileNode[], prefix: string): DataNode[] {
    return nodes.map((node) => ({
        key: node.path,
        title: node.name,
        isLeaf: node.type === "file",
        icon:
            node.type === "directory" ? (
                <FolderOutlined />
            ) : (
                <FileMarkdownOutlined style={{ color: "#6366f1" }} />
            ),
        children: node.children ? toAntdTree(node.children, prefix) : undefined,
    }));
}

// Labels for the three sections
const SECTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    docs: { label: "方法论 & 文档", icon: <BookOutlined />, color: "#2563eb" },
    workflows: { label: "Workflows (Skills)", icon: <ThunderboltOutlined />, color: "#7c3aed" },
    rules: { label: "Rules", icon: <UnorderedListOutlined />, color: "#059669" },
};

export default function PlatformPage({
    defaultSection = "docs",
}: {
    defaultSection?: string;
}) {
    const [tree, setTree] = useState<PlatformTree | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>(defaultSection);
    const [selectedFile, setSelectedFile] = useState<{
        path: string;
        name: string;
        section: string;
    } | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileLoading, setFileLoading] = useState(false);

    useEffect(() => {
        fetch("/api/platform?section=platform")
            .then((r) => r.json())
            .then((data) => {
                setTree(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSelect = useCallback(
        (keys: React.Key[]) => {
            const key = keys[0] as string;
            if (!key || !tree) return;
            // Only load if it's a file (has an extension)
            const dot = key.lastIndexOf(".");
            if (dot === -1) return; // directory

            const name = key.split("/").pop() ?? key;
            setSelectedFile({ path: key, name, section: activeSection });
            setFileContent(null);
            setFileLoading(true);

            fetch(`/api/platform/file?path=${encodeURIComponent(key)}&section=platform`)
                .then((r) => r.json())
                .then((data) => {
                    setFileContent(data.content ?? "（无法读取文件内容）");
                    setFileLoading(false);
                })
                .catch(() => {
                    setFileContent("（读取失败）");
                    setFileLoading(false);
                });
        },
        [tree, activeSection]
    );

    const sectionNodes =
        tree && (tree as unknown as Record<string, FileNode[]>)[activeSection]
            ? toAntdTree(
                (tree as unknown as Record<string, FileNode[]>)[activeSection],
                activeSection
            )
            : [];

    const tabItems = Object.entries(SECTION_LABELS).map(([key, { label, icon }]) => ({
        key,
        label: (
            <span>
                {icon} {label}
            </span>
        ),
    }));

    return (
        <Flex vertical gap={16} style={{ width: "100%", height: "100%" }}>
            <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                    Platform 资源库
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    浏览 AIOEP 平台的方法论、方法文档、Workflow 和 Rules 文件
                </Paragraph>
            </div>

            {loading ? (
                <Spin size="large" style={{ display: "block", margin: "80px auto" }} />
            ) : (
                <Row gutter={[16, 16]} style={{ flex: 1 }}>
                    {/* ─── Left: tree ─── */}
                    <Col xs={24} md={8} lg={7}>
                        <Card
                            size="small"
                            style={{ height: "100%" }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Tabs
                                activeKey={activeSection}
                                onChange={(k) => {
                                    setActiveSection(k);
                                    setSelectedFile(null);
                                    setFileContent(null);
                                }}
                                items={tabItems}
                                style={{ paddingInline: 8 }}
                                size="small"
                            />
                            <div style={{ padding: "0 8px 8px", overflowY: "auto", maxHeight: "70vh" }}>
                                {sectionNodes.length === 0 ? (
                                    <Empty description="目录为空" style={{ margin: "32px 0" }} />
                                ) : (
                                    <Tree
                                        showIcon
                                        defaultExpandAll
                                        treeData={sectionNodes}
                                        onSelect={handleSelect}
                                        selectedKeys={selectedFile ? [selectedFile.path] : []}
                                        icon={({ isLeaf }) =>
                                            isLeaf ? (
                                                <FileMarkdownOutlined style={{ color: "#6366f1" }} />
                                            ) : (
                                                <FolderOpenOutlined style={{ color: "#f59e0b" }} />
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* ─── Right: viewer ─── */}
                    <Col xs={24} md={16} lg={17}>
                        <Card
                            size="small"
                            style={{ height: "100%", minHeight: 400 }}
                            title={
                                selectedFile ? (
                                    <Flex align="center" gap={8}>
                                        <FileMarkdownOutlined style={{ color: SECTION_LABELS[selectedFile.section]?.color }} />
                                        <Breadcrumb
                                            items={selectedFile.path.split("/").map((seg) => ({ title: seg }))}
                                            style={{ fontSize: 13 }}
                                        />
                                        <Tag color={SECTION_LABELS[selectedFile.section]?.color === "#2563eb" ? "blue" : SECTION_LABELS[selectedFile.section]?.color === "#7c3aed" ? "purple" : "green"}>
                                            {SECTION_LABELS[selectedFile.section]?.label}
                                        </Tag>
                                    </Flex>
                                ) : (
                                    <Text type="secondary">← 从左侧选择文件查看</Text>
                                )
                            }
                        >
                            {fileLoading ? (
                                <Spin style={{ display: "block", margin: "60px auto" }} />
                            ) : fileContent ? (
                                <div
                                    className="markdown-body"
                                    style={{ overflowY: "auto", maxHeight: "72vh" }}
                                >
                                    <ReactMarkdown>{fileContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <Empty description="请从左侧选择 .md 文件" style={{ marginTop: 80 }} />
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </Flex>
    );
}
