"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen, Filter, ArrowRight, CheckCircle2,
    Layers, Zap, Truck, FlaskConical,
} from "lucide-react";

interface Methodology {
    id: string;
    name: string;
    nameEn: string;
    category: string;
    phase: string[];
    scenarios: string[];
    prerequisite: string[];
    skill: string | null;
    sop: string | null;
    docPath: string;
    outputs: string[];
    description: string;
}

const CATEGORY_ICONS: Record<string, any> = {
    "分析方法": FlaskConical,
    "开发方法": Zap,
    "交付方法": Truck,
};

const CATEGORY_COLORS: Record<string, string> = {
    "分析方法": "bg-blue-100 text-blue-700 border-blue-200",
    "开发方法": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "交付方法": "bg-purple-100 text-purple-700 border-purple-200",
};

const PHASE_LABELS: Record<string, string> = {
    "Phase 0": "Phase 0 · 战略规划",
    "Phase 0A": "Phase 0A · 战略分析",
    "Phase 1": "Phase 1 · 需求分析",
    "Phase 1A": "Phase 1A · 详细分析",
    "Phase 2": "Phase 2 · 开发实施",
    "Phase 3": "Phase 3 · 交付上线",
};

// All unique scenarios from the registry
const ALL_SCENARIOS = [
    "新公司战略规划", "年度战略刷新", "业务转型", "数字化转型",
    "ERP 选型", "系统替换", "功能评估", "平台迁移",
    "新系统需求分析", "功能增强", "定制开发需求",
    "敏捷开发", "迭代交付", "功能开发",
    "ERP 定制开发", "Odoo 模块开发",
    "AI 原生开发", "全栈开发", "快速原型",
    "系统上线", "UAT 验收", "数据迁移", "用户培训",
];

export default function MethodologyPage() {
    const [methods, setMethods] = useState<Methodology[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<Methodology | null>(null);

    useEffect(() => {
        fetch("/api/methodology")
            .then(r => r.json())
            .then(data => {
                setMethods(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filter methods
    const filtered = methods.filter(m => {
        if (selectedCategory && m.category !== selectedCategory) return false;
        if (selectedScenarios.length > 0) {
            return selectedScenarios.some(s => m.scenarios.includes(s));
        }
        return true;
    });

    // Build dependency chain for a given selection
    const getMethodChain = (methodId: string): string[] => {
        const chain: string[] = [];
        const visited = new Set<string>();
        const walk = (id: string) => {
            if (visited.has(id)) return;
            visited.add(id);
            const m = methods.find(x => x.id === id);
            if (!m) return;
            for (const pre of m.prerequisite) walk(pre);
            chain.push(id);
        };
        walk(methodId);
        return chain;
    };

    const toggleScenario = (s: string) => {
        setSelectedScenarios(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    // Recommended chain: union of all prerequisite chains for filtered methods
    const recommendedIds = new Set<string>();
    filtered.forEach(m => getMethodChain(m.id).forEach(id => recommendedIds.add(id)));
    const recommendedChain = methods.filter(m => recommendedIds.has(m.id));

    if (loading) {
        return (
            <div className="flex w-full flex-col gap-6 pt-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6 pt-2">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    方法论选择器
                </h2>
                <p className="text-sm text-muted-foreground">
                    根据项目场景智能推荐方法组合，自动构建方法依赖链
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left: Scenario filter */}
                <div className="col-span-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                场景选择
                            </CardTitle>
                            <CardDescription className="text-xs">
                                选择你的项目场景，系统推荐适用方法
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Category filter */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">按类别</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {["分析方法", "开发方法", "交付方法"].map(cat => (
                                        <Button
                                            key={cat}
                                            variant={selectedCategory === cat ? "default" : "outline"}
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                        >
                                            {cat}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            {/* Scenario tags */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">按场景</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_SCENARIOS.map(s => (
                                        <Badge
                                            key={s}
                                            variant={selectedScenarios.includes(s) ? "default" : "outline"}
                                            className="cursor-pointer text-[11px] hover:bg-primary/10 transition-colors"
                                            onClick={() => toggleScenario(s)}
                                        >
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedScenarios.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs w-full"
                                    onClick={() => { setSelectedScenarios([]); setSelectedCategory(null); }}
                                >
                                    清除筛选
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle: Recommended chain */}
                <div className="col-span-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                推荐方法链
                                {recommendedChain.length > 0 && (
                                    <Badge variant="secondary" className="ml-1">{recommendedChain.length} 个方法</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recommendedChain.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    请在左侧选择场景以获取推荐
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recommendedChain.map((m, i) => {
                                        const CatIcon = CATEGORY_ICONS[m.category] || BookOpen;
                                        const isActive = filtered.some(f => f.id === m.id);
                                        return (
                                            <div key={m.id}>
                                                <div
                                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMethod?.id === m.id
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "hover:bg-muted/30"
                                                        } ${!isActive ? "opacity-50" : ""}`}
                                                    onClick={() => setSelectedMethod(m)}
                                                >
                                                    <div className="flex flex-col items-center shrink-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                            <CatIcon className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{m.name}</span>
                                                            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[m.category]}`}>
                                                                {m.category}
                                                            </Badge>
                                                            {m.skill && (
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    AI Skill
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.description}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {m.phase.map(p => (
                                                                <span key={p} className="text-[10px] text-muted-foreground/70">{p}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {i < recommendedChain.length - 1 && (
                                                    <div className="flex justify-center py-1">
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground/30 rotate-90" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Method detail */}
                <div className="col-span-4">
                    <Card className="sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">方法详情</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedMethod ? (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    点击方法链中的条目查看详情
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{selectedMethod.name}</h3>
                                        <p className="text-xs text-muted-foreground">{selectedMethod.nameEn}</p>
                                    </div>

                                    <Badge variant="outline" className={CATEGORY_COLORS[selectedMethod.category]}>
                                        {selectedMethod.category}
                                    </Badge>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedMethod.description}
                                    </p>

                                    <Separator />

                                    {/* Phase */}
                                    <div>
                                        <p className="text-xs font-medium mb-1.5">适用阶段</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedMethod.phase.map(p => (
                                                <Badge key={p} variant="secondary" className="text-xs">
                                                    {PHASE_LABELS[p] || p}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scenarios */}
                                    <div>
                                        <p className="text-xs font-medium mb-1.5">适用场景</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedMethod.scenarios.map(s => (
                                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Outputs */}
                                    <div>
                                        <p className="text-xs font-medium mb-1.5">产出物</p>
                                        <div className="space-y-1">
                                            {selectedMethod.outputs.map(o => (
                                                <div key={o} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    {o}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Prerequisites */}
                                    {selectedMethod.prerequisite.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium mb-1.5">前置方法</p>
                                            <div className="space-y-1">
                                                {selectedMethod.prerequisite.map(pre => {
                                                    const preMethod = methods.find(m => m.id === pre);
                                                    return (
                                                        <div
                                                            key={pre}
                                                            className="text-sm text-primary cursor-pointer hover:underline"
                                                            onClick={() => preMethod && setSelectedMethod(preMethod)}
                                                        >
                                                            → {preMethod?.name || pre}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Skill / SOP */}
                                    <div className="flex gap-2">
                                        {selectedMethod.skill && (
                                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                                🤖 AI Skill: {selectedMethod.skill}
                                            </Badge>
                                        )}
                                        {selectedMethod.sop && (
                                            <Badge variant="outline">
                                                📋 {selectedMethod.sop}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
