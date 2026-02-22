"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Book,
    ChevronDown,
    ChevronRight,
    FileText,
    FolderOpen,
    Loader2,
    Zap,
    List as ListIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileNode {
    name: string;
    path: string;
    type: "file" | "directory";
    ext?: string;
    children?: FileNode[];
}

interface PlatformTree {
    docs: FileNode[];
    methods: FileNode[];
    workflows: FileNode[];
    rules: FileNode[];
}

const SECTION_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    docs: { label: "方法论", icon: Book, color: "text-blue-600" },
    methods: { label: "方法库", icon: Book, color: "text-cyan-600" },
    workflows: { label: "Workflows", icon: Zap, color: "text-purple-600" },
    rules: { label: "Rules", icon: ListIcon, color: "text-emerald-600" },
};

// Custom Tree Component
function FileTreeView({
    nodes,
    selectedPath,
    onSelect,
    level = 0,
}: {
    nodes: FileNode[];
    selectedPath?: string;
    onSelect: (path: string) => void;
    level?: number;
}) {
    return (
        <ul className={cn("space-y-1", level > 0 && "ml-4 border-l pl-2")}>
            {nodes.map((node) => (
                <FileTreeNode
                    key={node.path}
                    node={node}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    level={level}
                />
            ))}
        </ul>
    );
}

function FileTreeNode({
    node,
    selectedPath,
    onSelect,
    level,
}: {
    node: FileNode;
    selectedPath?: string;
    onSelect: (path: string) => void;
    level: number;
}) {
    const isDir = node.type === "directory";
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = selectedPath === node.path;

    const handleClick = () => {
        if (isDir) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.path);
        }
    };

    return (
        <li>
            <button
                onClick={handleClick}
                className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50",
                    isSelected && "bg-primary/10 text-primary font-medium",
                    !isSelected && "text-muted-foreground hover:text-foreground"
                )}
            >
                {isDir ? (
                    isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                    <span className="w-4 shrink-0" /> // spacer for leaf alignment
                )}

                {isDir ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                    <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
                )}

                <span className="truncate text-left">{node.name}</span>
            </button>

            {isDir && isOpen && node.children && (
                <FileTreeView
                    nodes={node.children}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    level={level + 1}
                />
            )}
        </li>
    );
}

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
        (key: string) => {
            if (!key || !tree) return;
            const dot = key.lastIndexOf(".");
            if (dot === -1) return; // ignore directory selection in this handler

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
            ? (tree as unknown as Record<string, FileNode[]>)[activeSection]
            : [];

    const ActiveIcon = SECTION_LABELS[activeSection]?.icon || Book;

    return (
        <div className="flex h-full w-full flex-col gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Platform 资源库</h2>
                <p className="text-muted-foreground mt-1">
                    浏览 AIOEP 平台的方法论、方法文档、Workflow 和 Rules 文件
                </p>
            </div>

            {loading ? (
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex flex-1 flex-col gap-4 md:flex-row min-h-0">
                    {/* Left: Tree */}
                    <Card className="flex flex-col md:w-80 lg:w-96 shrink-0 min-h-[400px]">
                        <div className="border-b p-2">
                            <Tabs
                                value={activeSection}
                                onValueChange={(k) => {
                                    setActiveSection(k);
                                    setSelectedFile(null);
                                    setFileContent(null);
                                }}
                                className="w-full"
                            >
                                <TabsList className="w-full flex">
                                    {Object.entries(SECTION_LABELS).map(([key, { label, icon: Icon }]) => (
                                        <TabsTrigger key={key} value={key} className="flex-1 text-xs">
                                            <Icon className="mr-1.5 h-3.5 w-3.5" />
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {sectionNodes.length === 0 ? (
                                <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                                    <FolderOpen className="mb-2 h-8 w-8 opacity-20" />
                                    <p className="text-sm">目录为空</p>
                                </div>
                            ) : (
                                <FileTreeView
                                    nodes={sectionNodes}
                                    selectedPath={selectedFile?.path}
                                    onSelect={handleSelect}
                                />
                            )}
                        </div>
                    </Card>

                    {/* Right: Viewer */}
                    <Card className="flex flex-1 flex-col overflow-hidden min-h-[500px]">
                        <div className="flex h-14 items-center border-b px-4 bg-muted/20 shrink-0">
                            {selectedFile ? (
                                <div className="flex items-center gap-3 w-full">
                                    <ActiveIcon className={cn("h-5 w-5", SECTION_LABELS[selectedFile.section]?.color)} />

                                    <nav className="flex text-sm font-medium text-muted-foreground flex-1 truncate">
                                        <ol className="flex items-center space-x-2">
                                            {selectedFile.path.split("/").map((seg, idx, arr) => (
                                                <li key={idx} className="flex items-center">
                                                    <span className={idx === arr.length - 1 ? "text-foreground font-semibold" : ""}>
                                                        {seg}
                                                    </span>
                                                    {idx < arr.length - 1 && <ChevronRight className="mx-1 h-4 w-4 shrink-0 opacity-50" />}
                                                </li>
                                            ))}
                                        </ol>
                                    </nav>

                                    <Badge variant="secondary" className="hidden sm:inline-flex">
                                        {SECTION_LABELS[selectedFile.section]?.label}
                                    </Badge>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">← 从左侧选择文件查看</span>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {fileLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : fileContent ? (
                                <div className="markdown-body prose prose-slate dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                    <FileText className="mb-4 h-12 w-12 opacity-20" />
                                    <p>请从左侧选择 .md 文件</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
