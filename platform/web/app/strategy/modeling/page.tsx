"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    CircleDot,
    Circle,
    Loader2,
    Sparkles,
    PenLine,
    Target,
    Flag,
    Rocket,
    Shield,
    FileCheck2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

// Stage definitions
const STAGES = [
    {
        id: "input",
        name: "愿景输入",
        description: "输入自然语言文本（如战略会议纪要、CEO 致辞等）",
        icon: PenLine,
        subSkill: null,
    },
    {
        id: "extract",
        name: "驱动力提取",
        description: "AI 识别利益相关者、驱动力和痛点",
        icon: Target,
        subSkill: "extract-drivers",
    },
    {
        id: "goals",
        name: "目标推导",
        description: "AI 从痛点推导战略目标和可量化结果",
        icon: Flag,
        subSkill: "derive-goals",
    },
    {
        id: "initiatives",
        name: "举措拆解",
        description: "AI 将目标拆解为可执行的战略举措",
        icon: Rocket,
        subSkill: "decompose-initiatives",
    },
    {
        id: "validate",
        name: "模型验证",
        description: "AI 检查模型的完整性、一致性和可追溯性",
        icon: Shield,
        subSkill: "validate-model",
    },
    {
        id: "confirm",
        name: "确认归档",
        description: "审阅最终模型并确认归档",
        icon: FileCheck2,
        subSkill: null,
    },
];

interface ModelElement {
    id: string;
    type: string;
    name: string;
    description: string;
    [key: string]: any;
}

interface ModelRelationship {
    id: string;
    type: string;
    sourceId: string;
    targetId: string;
    label?: string;
}

interface StageResult {
    elements: ModelElement[];
    relationships: ModelRelationship[];
}

// Element type display config
const ELEMENT_COLORS: Record<string, string> = {
    Stakeholder: "bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100",
    Driver: "bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100",
    Assessment: "bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100",
    Goal: "bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-100",
    Outcome: "bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100",
    Principle: "bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-amber-100",
    Requirement: "bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100",
    WorkPackage: "bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100",
};

const ELEMENT_LABELS: Record<string, string> = {
    Stakeholder: "利益相关者",
    Driver: "驱动力",
    Assessment: "痛点评估",
    Goal: "战略目标",
    Outcome: "预期结果",
    Principle: "原则",
    Requirement: "需求",
    WorkPackage: "工作包/项目",
};

export default function ModelingPage() {
    const router = useRouter();
    const [currentStage, setCurrentStage] = useState(0);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [stageResults, setStageResults] = useState<Record<string, StageResult>>({});
    const [stageConfirmed, setStageConfirmed] = useState<Record<string, boolean>>({});
    const [validationReport, setValidationReport] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [targetYear, setTargetYear] = useState(new Date().getFullYear());
    const [fixing, setFixing] = useState<number | null>(null);

    // Load company context as pre-fill for vision input
    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(settings => {
                const parts: string[] = [];
                if (settings.companyName) parts.push(`公司：${settings.companyName}`);
                if (settings.industry) parts.push(`行业：${settings.industry}`);
                if (settings.annualRevenue) parts.push(`年营收：${settings.annualRevenue}万元`);
                if (settings.employeeCount) parts.push(`员工：${settings.employeeCount}人`);
                if (settings.description) parts.push(`简介：${settings.description}`);
                if (parts.length > 0) {
                    setInputText(`【公司背景】${parts.join("；")}\n\n【战略愿景与痛点】\n`);
                }
                if (settings.currentYear) setTargetYear(settings.currentYear);
            })
            .catch(() => { });
    }, []);

    // Collect all elements & relationships from all confirmed stages
    const getAllModel = (): StageResult => {
        const allElements: ModelElement[] = [];
        const allRelationships: ModelRelationship[] = [];
        Object.values(stageResults).forEach(r => {
            if (r.elements) allElements.push(...r.elements);
            if (r.relationships) allRelationships.push(...r.relationships);
        });
        return { elements: allElements, relationships: allRelationships };
    };

    const handleAIGenerate = async () => {
        const stage = STAGES[currentStage];
        if (!stage.subSkill) return;

        setLoading(true);
        setError(null);
        try {
            const existingModel = getAllModel();
            const res = await fetch("/api/strategy/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subSkill: stage.subSkill,
                    input: inputText,
                    existingModel: existingModel.elements.length > 0 ? existingModel : undefined,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || `AI API 返回错误 (${res.status})`);
                return;
            }

            if (data.result) {
                // Guard: if result has 'raw' field, parsing failed on server
                if (data.result.raw && !data.result.elements) {
                    setError("AI 返回了非标准格式，正在尝试重新解析...\n" + data.result.raw.substring(0, 200));
                } else {
                    setStageResults(prev => ({ ...prev, [stage.id]: data.result }));
                }
            } else {
                setError("AI 未返回有效结果，请重试。");
            }

            if (stage.subSkill === "validate-model" && data.result) {
                setValidationReport(data.result);
            }
        } catch (e: any) {
            setError(`AI 调用失败: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmStage = () => {
        const stage = STAGES[currentStage];
        setStageConfirmed(prev => ({ ...prev, [stage.id]: true }));
        if (currentStage < STAGES.length - 1) {
            setCurrentStage(currentStage + 1);
        }
    };

    const handleFinalConfirm = async () => {
        const fullModel = getAllModel();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/strategy/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `战略模型 ${new Date().toLocaleDateString("zh-CN")}`,
                    source: "AI Wizard",
                    targetYear,
                    elements: fullModel.elements,
                    relationships: fullModel.relationships,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "保存失败");
                return;
            }
            router.push("/strategy");
        } catch (e: any) {
            setError(`保存失败: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const stage = STAGES[currentStage];
    const StageIcon = stage.icon;
    const currentResult = stageResults[stage.id];

    return (
        <div className="flex w-full flex-col gap-6 pt-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/strategy")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">返回战略规划中心</span>
            </div>

            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI 辅助战略建模
                </h2>
                <p className="text-sm text-muted-foreground">
                    基于 ArchiMate Motivation Aspect 标准，分阶段生成 → 人工审核 → 逐步确认
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-400/50 bg-red-950/20 p-3 text-sm text-red-300">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                </div>
            )}

            {/* Stage Progress */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3">
                {STAGES.map((s, idx) => {
                    const confirmed = stageConfirmed[s.id];
                    const isCurrent = idx === currentStage;
                    const Icon = s.icon;
                    return (
                        <div key={s.id} className="flex items-center gap-2">
                            <button
                                onClick={() => idx <= currentStage && setCurrentStage(idx)}
                                disabled={idx > currentStage}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border ${isCurrent
                                    ? "bg-primary text-primary-foreground shadow-lg border-primary"
                                    : confirmed
                                        ? "bg-emerald-600 text-white dark:bg-emerald-600 border-emerald-500"
                                        : "bg-muted/30 text-muted-foreground border-border/50"
                                    }`}
                            >
                                {confirmed ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : isCurrent ? (
                                    <CircleDot className="h-4 w-4" />
                                ) : (
                                    <Circle className="h-4 w-4 opacity-40" />
                                )}
                                {s.name}
                            </button>
                            {idx < STAGES.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Stage Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Stage Description & Input */}
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader className="bg-muted/10 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <StageIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                                阶段 {currentStage + 1}: {stage.name}
                            </CardTitle>
                        </div>
                        <CardDescription>{stage.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {currentStage === 0 ? (
                            /* Input Stage */
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="请输入战略相关的自然语言文本，例如：&#10;&#10;• CEO 年度致辞&#10;• 战略会议纪要&#10;• 商业计划书摘要&#10;• 痛点和目标描述"
                                    rows={12}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="text-sm"
                                />
                                <Button
                                    className="w-full"
                                    disabled={!inputText.trim()}
                                    onClick={handleConfirmStage}
                                >
                                    确认输入，进入下一阶段
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : currentStage === STAGES.length - 1 ? (
                            /* Final Confirm */
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    所有阶段已完成审阅。请确认最终模型并归档。
                                </div>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">模型统计</div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <div>元素总数: {getAllModel().elements.length}</div>
                                        <div>关系总数: {getAllModel().relationships.length}</div>
                                    </div>
                                </div>
                                <Button className="w-full" onClick={handleFinalConfirm}>
                                    <FileCheck2 className="mr-2 h-4 w-4" />
                                    确认并归档模型
                                </Button>
                            </div>
                        ) : (
                            /* AI Generation Stages */
                            <div className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    点击下方按钮，AI 将基于已确认的上下文，执行 <code className="bg-muted px-1 py-0.5 rounded text-xs">{stage.subSkill}</code> 分析。
                                </div>

                                {!currentResult && (
                                    <Button
                                        className="w-full"
                                        onClick={handleAIGenerate}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                AI 分析中...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                AI 生成
                                            </>
                                        )}
                                    </Button>
                                )}

                                {currentResult && !stageConfirmed[stage.id] && (
                                    <div className="space-y-2">
                                        <Button variant="outline" onClick={handleAIGenerate} disabled={loading} className="w-full">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                            重新生成
                                        </Button>
                                        <Button className="w-full" onClick={handleConfirmStage}>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            审阅通过，进入下一阶段
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: AI Output / Results */}
                <Card className="lg:col-span-2 shadow-sm min-h-[400px]">
                    <CardHeader className="border-b bg-muted/10 pb-4">
                        <CardTitle className="text-base">
                            {currentStage === 0
                                ? "输入预览"
                                : currentResult
                                    ? "AI 输出结果 — 请审阅"
                                    : "等待 AI 生成..."}
                        </CardTitle>
                        {currentResult && !stageConfirmed[stage.id] && (
                            <CardDescription className="text-xs">
                                ⚠️ 请仔细审阅以下内容。确认无误后点击左侧"审阅通过"按钮。
                            </CardDescription>
                        )}
                        {stageConfirmed[stage.id] && (
                            <Badge className="bg-emerald-500 w-fit">已确认 ✓</Badge>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading && !currentResult ? (
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : currentStage === 0 ? (
                            /* Show input preview */
                            inputText ? (
                                <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border">
                                    {inputText}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <PenLine className="h-10 w-10 opacity-20 mb-3" />
                                    <p className="text-sm">请在左侧输入战略文本</p>
                                </div>
                            )
                        ) : currentResult ? (
                            /* Show stage results */
                            <div className="space-y-6">
                                {/* Elements */}
                                {currentResult.elements && currentResult.elements.length > 0 && (
                                    <div>
                                        <h4 className="text-base font-bold mb-4 text-foreground">提取的元素 ({currentResult.elements.length})</h4>
                                        <div className="space-y-3">
                                            {currentResult.elements.map((elem) => (
                                                <div
                                                    key={elem.id}
                                                    className="flex items-start gap-4 rounded-xl border border-border/60 p-4 bg-card hover:bg-muted/30 transition-colors"
                                                >
                                                    <Badge className={`${ELEMENT_COLORS[elem.type] || "bg-gray-200"} shrink-0 text-sm px-3 py-1`}>
                                                        {ELEMENT_LABELS[elem.type] || elem.type}
                                                    </Badge>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-base text-foreground">{elem.name}</div>
                                                        <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{elem.description}</div>
                                                        {elem.severity && (
                                                            <Badge variant="outline" className="mt-2 text-sm border-red-400 text-red-400 dark:border-red-400 dark:text-red-300">
                                                                严重程度: {elem.severity}
                                                            </Badge>
                                                        )}
                                                        {elem.target && (
                                                            <span className="text-sm text-foreground/70 ml-2">
                                                                目标: {elem.target}
                                                            </span>
                                                        )}
                                                        {elem.priority && (
                                                            <Badge variant="outline" className="mt-2 text-sm ml-2">
                                                                {elem.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Relationships */}
                                {currentResult.relationships && currentResult.relationships.length > 0 && (
                                    <div>
                                        <Separator className="my-5" />
                                        <h4 className="text-base font-bold mb-4 text-foreground">识别的关系 ({currentResult.relationships.length})</h4>
                                        <div className="space-y-2">
                                            {currentResult.relationships.map((rel) => {
                                                const source = getAllModel().elements.find(e => e.id === rel.sourceId) ||
                                                    currentResult.elements?.find(e => e.id === rel.sourceId);
                                                const target = getAllModel().elements.find(e => e.id === rel.targetId) ||
                                                    currentResult.elements?.find(e => e.id === rel.targetId);
                                                return (
                                                    <div key={rel.id} className="flex items-center gap-3 text-sm bg-muted/40 dark:bg-muted/20 border border-border/40 p-3 rounded-lg">
                                                        <span className="font-semibold text-foreground">{source?.name || rel.sourceId}</span>
                                                        <span className="shrink-0 text-primary font-medium">— {rel.type} →</span>
                                                        <span className="font-semibold text-foreground">{target?.name || rel.targetId}</span>
                                                        {rel.label && <span className="text-muted-foreground ml-auto">({rel.label})</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Validation Report */}
                                {validationReport && stage.id === "validate" && (
                                    <div>
                                        <Separator className="my-4" />
                                        <h4 className="text-sm font-semibold mb-3">模型健康报告</h4>
                                        <div className={`p-4 rounded-lg border ${validationReport.summary?.overallHealth === "healthy"
                                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20"
                                            : "bg-amber-50 border-amber-200 dark:bg-amber-950/20"
                                            }`}>
                                            <div className="text-sm font-medium mb-2">
                                                状态: {validationReport.summary?.overallHealth || "未知"}
                                            </div>
                                            {validationReport.checks?.map((check: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <span className={`font-bold ${check.status === 'PASS' ? 'text-emerald-500' : check.status === 'FAIL' ? 'text-red-500' : 'text-amber-500'}`}>
                                                        [{check.status}]
                                                    </span>
                                                    <span className="flex-1">{check.name}: {check.detail || check.message}</span>
                                                    {(check.status === 'WARNING' || check.status === 'FAIL') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs text-primary"
                                                            disabled={fixing === i}
                                                            onClick={async () => {
                                                                setFixing(i);
                                                                try {
                                                                    const fullModel = getAllModel();
                                                                    const res = await fetch("/api/strategy/ai", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({
                                                                            subSkill: "validate-model",
                                                                            input: `请修正以下问题并返回修正后的 elements 和 relationships：\n问题：${check.name} - ${check.detail || check.message}`,
                                                                            existingModel: fullModel,
                                                                        }),
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.result?.elements) {
                                                                        setStageResults(prev => ({
                                                                            ...prev,
                                                                            validate: data.result,
                                                                        }));
                                                                        setValidationReport(data.result);
                                                                    }
                                                                } catch (e: any) {
                                                                    setError(`自修正失败: ${e.message}`);
                                                                } finally {
                                                                    setFixing(null);
                                                                }
                                                            }}
                                                        >
                                                            {fixing === i ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <><RefreshCw className="h-3 w-3 mr-1" />AI 修正</>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {validationReport.issues?.map((issue: any, i: number) => (
                                                <div key={`issue-${i}`} className="text-xs text-muted-foreground mt-1">
                                                    [{issue.severity}] {issue.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Sparkles className="h-10 w-10 opacity-20 mb-3" />
                                <p className="text-sm">点击左侧"AI 生成"按钮开始分析</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
