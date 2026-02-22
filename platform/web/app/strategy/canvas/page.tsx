"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Layers, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModelElement {
    id: string;
    type: string;
    name: string;
    description?: string;
    [key: string]: any;
}

interface ModelRelationship {
    id: string;
    type: string;
    sourceId: string;
    targetId: string;
    label?: string;
}

interface ArchiModel {
    elements: ModelElement[];
    relationships: ModelRelationship[];
    metadata?: any;
}

const TYPE_LAYERS: Record<string, number> = {
    Stakeholder: 0, Driver: 1, Assessment: 2, Goal: 3,
    Outcome: 4, Principle: 5, Requirement: 5, WorkPackage: 6,
};

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    Stakeholder: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    Driver: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
    Assessment: { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
    Goal: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    Outcome: { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" },
    Principle: { bg: "#fef9c3", border: "#eab308", text: "#854d0e" },
    Requirement: { bg: "#ffe4e6", border: "#f43f5e", text: "#9f1239" },
    WorkPackage: { bg: "#f0fdf4", border: "#22c55e", text: "#166534" },
};

const TYPE_LABELS: Record<string, string> = {
    Stakeholder: "利益相关者", Driver: "驱动力", Assessment: "痛点评估",
    Goal: "战略目标", Outcome: "预期结果", Principle: "原则",
    Requirement: "需求", WorkPackage: "工作包",
};

const REL_COLORS: Record<string, string> = {
    Association: "#6b7280", Influence: "#3b82f6",
    Aggregation: "#8b5cf6", Realization: "#10b981",
};

const REL_LABELS: Record<string, string> = {
    Association: "关联", Influence: "影响",
    Aggregation: "聚合", Realization: "实现",
};

const NODE_W = 180;
const NODE_H = 56;
const LAYER_GAP = 110;
const NODE_GAP = 24;
const PADDING = 60;

export default function CanvasPage() {
    const router = useRouter();
    const svgRef = useRef<SVGSVGElement>(null);
    const [models, setModels] = useState<any[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [model, setModel] = useState<ArchiModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [highlightId, setHighlightId] = useState<string | null>(null);
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        fetch("/api/strategy/models")
            .then(r => r.json())
            .then(list => {
                setModels(list);
                if (list.length > 0) setSelectedModelId(list[0].id);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedModelId) return;
        fetch(`/api/strategy/models/${selectedModelId}`)
            .then(r => r.json())
            .then(data => setModel(data))
            .catch(() => { });
    }, [selectedModelId]);

    // Centered layout: each layer is horizontally centered within the widest layer
    const computeLayout = useCallback(() => {
        if (!model) return { nodes: new Map<string, { x: number; y: number }>(), width: 0, height: 0 };

        const layers = new Map<number, ModelElement[]>();
        for (const el of model.elements) {
            const layer = TYPE_LAYERS[el.type] ?? 6;
            if (!layers.has(layer)) layers.set(layer, []);
            layers.get(layer)!.push(el);
        }

        let maxWidth = 0;
        const sortedLayers = [...layers.entries()].sort(([a], [b]) => a - b);
        for (const [, elements] of sortedLayers) {
            const w = elements.length * NODE_W + (elements.length - 1) * NODE_GAP;
            maxWidth = Math.max(maxWidth, w);
        }

        const canvasWidth = maxWidth + PADDING * 2;
        const nodes = new Map<string, { x: number; y: number }>();

        sortedLayers.forEach(([, elements], visualIdx) => {
            const layerWidth = elements.length * NODE_W + (elements.length - 1) * NODE_GAP;
            const offsetX = (canvasWidth - layerWidth) / 2; // center
            elements.forEach((el, i) => {
                nodes.set(el.id, {
                    x: offsetX + i * (NODE_W + NODE_GAP),
                    y: PADDING + visualIdx * LAYER_GAP,
                });
            });
        });

        return {
            nodes,
            width: canvasWidth,
            height: PADDING * 2 + sortedLayers.length * LAYER_GAP,
        };
    }, [model]);

    const { nodes, width, height } = computeLayout();

    const getConnected = (id: string): Set<string> => {
        if (!model) return new Set();
        const connected = new Set<string>([id]);
        for (const r of model.relationships) {
            if (r.sourceId === id) connected.add(r.targetId);
            if (r.targetId === id) connected.add(r.sourceId);
        }
        return connected;
    };

    const connectedSet = highlightId ? getConnected(highlightId) : null;

    // Hover tooltip info
    const hoverElement = hoverId ? model?.elements.find(e => e.id === hoverId) : null;
    const hoverRelCount = hoverId && model ? model.relationships.filter(
        r => r.sourceId === hoverId || r.targetId === hoverId
    ).length : 0;

    // Export PNG
    const handleExportPNG = () => {
        const svg = svgRef.current;
        if (!svg) return;
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svg);
        const canvas = document.createElement("canvas");
        const svgW = Math.max(width, 800);
        const svgH = Math.max(height, 400);
        canvas.width = svgW * 2;
        canvas.height = svgH * 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(2, 2);
        const img = new Image();
        const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        img.onload = () => {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, svgW, svgH);
            ctx.drawImage(img, 0, 0, svgW, svgH);
            URL.revokeObjectURL(url);
            const link = document.createElement("a");
            link.download = `archimate-model-${selectedModelId || "canvas"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
        img.src = url;
    };

    if (loading) {
        return (
            <div className="flex w-full flex-col gap-6 pt-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    const svgW = Math.max(width, 800);
    const svgH = Math.max(height, 400);

    return (
        <div className="flex w-full flex-col gap-4 pt-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/strategy")}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> 返回规划中心
                    </Button>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        ArchiMate 可视化画布
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {models.length > 1 && (
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={selectedModelId || ""}
                            onChange={e => setSelectedModelId(e.target.value)}
                        >
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPNG}>
                        <Download className="h-4 w-4 mr-1" /> 导出 PNG
                    </Button>
                    {highlightId && (
                        <Button variant="outline" size="sm" onClick={() => setHighlightId(null)}>
                            清除高亮
                        </Button>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
                {Object.entries(TYPE_LABELS).map(([type, label]) => (
                    <Badge key={type} variant="outline" style={{
                        backgroundColor: TYPE_COLORS[type]?.bg,
                        borderColor: TYPE_COLORS[type]?.border,
                        color: TYPE_COLORS[type]?.text,
                    }}>
                        {label}
                    </Badge>
                ))}
                <span className="text-muted-foreground/60 ml-1">|</span>
                {Object.entries(REL_LABELS).map(([type, label]) => (
                    <span key={type} className="flex items-center gap-1">
                        <span className="inline-block w-4 h-0.5" style={{
                            backgroundColor: REL_COLORS[type],
                            borderTop: type === "Influence" ? "1px dashed" : undefined,
                        }} />
                        <span style={{ color: REL_COLORS[type] }}>{label}</span>
                    </span>
                ))}
                <span className="text-muted-foreground ml-2">点击元素高亮关联链 · 悬浮查看详情</span>
            </div>

            {/* Canvas */}
            {!model ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                    暂无模型数据
                </div>
            ) : (
                <div className="relative">
                    <Card className="overflow-auto border bg-background/50">
                        <CardContent className="p-0">
                            <svg
                                ref={svgRef}
                                width={svgW * zoom}
                                height={svgH * zoom}
                                viewBox={`0 0 ${svgW} ${svgH}`}
                                className="select-none"
                                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                            >
                                {/* Relationships */}
                                {model.relationships.map(rel => {
                                    const src = nodes.get(rel.sourceId);
                                    const tgt = nodes.get(rel.targetId);
                                    if (!src || !tgt) return null;

                                    const sx = src.x + NODE_W / 2;
                                    const sy = src.y + NODE_H;
                                    const tx = tgt.x + NODE_W / 2;
                                    const ty = tgt.y;

                                    const dimmed = connectedSet && (!connectedSet.has(rel.sourceId) || !connectedSet.has(rel.targetId));
                                    const color = REL_COLORS[rel.type] || "#9ca3af";
                                    const relLabel = REL_LABELS[rel.type] || rel.type;

                                    return (
                                        <g key={rel.id} opacity={dimmed ? 0.08 : 0.65}>
                                            <line
                                                x1={sx} y1={sy} x2={tx} y2={ty}
                                                stroke={color}
                                                strokeWidth={2}
                                                strokeDasharray={rel.type === "Influence" ? "6,3" : undefined}
                                                markerEnd="url(#arrowhead)"
                                            />
                                            {/* Relationship label */}
                                            <text
                                                x={(sx + tx) / 2}
                                                y={(sy + ty) / 2 - 5}
                                                textAnchor="middle"
                                                fontSize={8}
                                                fill={color}
                                                opacity={0.8}
                                                className="pointer-events-none"
                                            >
                                                {rel.label || relLabel}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Arrow marker */}
                                <defs>
                                    <marker id="arrowhead" viewBox="0 0 10 10" refX="10" refY="5"
                                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                                    </marker>
                                    <filter id="shadow" x="-4%" y="-4%" width="108%" height="116%">
                                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
                                    </filter>
                                </defs>

                                {/* Nodes */}
                                {model.elements.map(el => {
                                    const pos = nodes.get(el.id);
                                    if (!pos) return null;

                                    const colors = TYPE_COLORS[el.type] || { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" };
                                    const dimmed = connectedSet && !connectedSet.has(el.id);
                                    const highlighted = highlightId === el.id;
                                    const hovered = hoverId === el.id;

                                    return (
                                        <g
                                            key={el.id}
                                            opacity={dimmed ? 0.12 : 1}
                                            onClick={() => setHighlightId(highlightId === el.id ? null : el.id)}
                                            onMouseEnter={() => setHoverId(el.id)}
                                            onMouseLeave={() => setHoverId(null)}
                                            className="cursor-pointer"
                                            filter={hovered && !dimmed ? "url(#shadow)" : undefined}
                                        >
                                            <rect
                                                x={pos.x} y={pos.y}
                                                width={NODE_W} height={NODE_H}
                                                rx={8}
                                                fill={colors.bg}
                                                stroke={highlighted ? "#000" : hovered ? colors.text : colors.border}
                                                strokeWidth={highlighted ? 3 : hovered ? 2.5 : 1.5}
                                            />
                                            <text
                                                x={pos.x + NODE_W / 2}
                                                y={pos.y + 20}
                                                textAnchor="middle"
                                                fontSize={10}
                                                fill={colors.border}
                                                fontWeight={600}
                                            >
                                                {TYPE_LABELS[el.type] || el.type}
                                            </text>
                                            <text
                                                x={pos.x + NODE_W / 2}
                                                y={pos.y + 38}
                                                textAnchor="middle"
                                                fontSize={11}
                                                fill={colors.text}
                                                fontWeight={500}
                                            >
                                                {el.name.length > 14 ? el.name.slice(0, 13) + "…" : el.name}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </CardContent>
                    </Card>

                    {/* Tooltip overlay */}
                    {hoverElement && (() => {
                        const pos = nodes.get(hoverElement.id);
                        if (!pos) return null;
                        return (
                            <div
                                className="absolute pointer-events-none z-50"
                                style={{
                                    left: (pos.x + NODE_W + 12) * zoom,
                                    top: pos.y * zoom,
                                }}
                            >
                                <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 max-w-[260px] text-xs">
                                    <div className="font-semibold text-sm mb-1">{hoverElement.name}</div>
                                    <Badge variant="outline" className="mb-2 text-[10px]" style={{
                                        backgroundColor: TYPE_COLORS[hoverElement.type]?.bg,
                                        borderColor: TYPE_COLORS[hoverElement.type]?.border,
                                        color: TYPE_COLORS[hoverElement.type]?.text,
                                    }}>
                                        {TYPE_LABELS[hoverElement.type] || hoverElement.type}
                                    </Badge>
                                    {hoverElement.description && (
                                        <p className="text-muted-foreground mt-1 leading-relaxed">{hoverElement.description}</p>
                                    )}
                                    {hoverElement.severity && (
                                        <p className="mt-1">严重程度: <span className="font-medium text-red-500">{hoverElement.severity}</span></p>
                                    )}
                                    {hoverElement.category && (
                                        <p className="mt-1">分类: <span className="font-medium">{hoverElement.category}</span></p>
                                    )}
                                    <p className="text-muted-foreground/60 mt-1">关联关系: {hoverRelCount} 条</p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
