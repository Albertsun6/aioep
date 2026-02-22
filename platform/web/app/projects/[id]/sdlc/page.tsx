"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { SDLCState, Phase, Milestone, Deliverable, GateCheck } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SDLCPage() {
    const { id } = useParams<{ id: string }>();
    const { currentProject, setCurrentProjectId } = useProject();
    const [sdlc, setSdlc] = useState<SDLCState | null>(null);

    useEffect(() => {
        if (id) setCurrentProjectId(id);
    }, [id, setCurrentProjectId]);

    const loadData = useCallback(() => {
        if (!id) return;
        fetch(`/api/sdlc?projectId=${id}`)
            .then((r) => r.json())
            .then(setSdlc);
    }, [id]);

    useEffect(() => {
        setSdlc(null);
        loadData();
    }, [loadData]);

    const patchPhase = useCallback(
        async (phaseId: string, updates: Partial<Phase>) => {
            const res = await fetch("/api/sdlc", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: id,
                    phaseId,
                    ...updates,
                }),
            });
            if (res.ok) {
                toast.success("已保存");
                loadData();
            } else {
                toast.error("保存失败");
            }
        },
        [id, loadData]
    );

    const toggleMilestone = useCallback(
        (phase: Phase, milestoneId: string) => {
            const updated = phase.milestones.map((m: Milestone) =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            patchPhase(phase.id, { milestones: updated });
        },
        [patchPhase]
    );

    const toggleDeliverable = useCallback(
        (phase: Phase, deliverableId: string) => {
            const updated = phase.deliverables.map((d: Deliverable) =>
                d.id === deliverableId ? { ...d, completed: !d.completed } : d
            );
            patchPhase(phase.id, { deliverables: updated });
        },
        [patchPhase]
    );

    const cycleGateCheck = useCallback(
        (phase: Phase, gateId: string) => {
            const updated = phase.gateChecks.map((g: GateCheck) => {
                if (g.id !== gateId) return g;
                const next =
                    g.passed === null ? true : g.passed === true ? false : null;
                return { ...g, passed: next };
            });
            patchPhase(phase.id, { gateChecks: updated });
        },
        [patchPhase]
    );

    if (!sdlc) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const completedPhases = sdlc.phases.filter((p) => p.status === "completed").length;
    const totalGates = sdlc.phases.reduce((acc, p) => acc + p.gateChecks.length, 0);
    const passedGates = sdlc.phases.reduce((acc, p) => acc + p.gateChecks.filter((g) => g.passed).length, 0);

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pt-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">SDLC 看板</h2>
                <p className="text-sm text-muted-foreground">
                    软件开发生命周期 4 阶段管理 — {completedPhases}/4 阶段已完成 · {passedGates}/{totalGates} 门禁已通过
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6">
                        {sdlc.phases.map((phase) => (
                            <div key={phase.id} className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{phase.name}</span>
                                        <span className="text-xs text-muted-foreground">{phase.subtitle}</span>
                                    </div>
                                    <Select
                                        value={phase.status}
                                        onValueChange={(value) => patchPhase(phase.id, { status: value as Phase["status"] })}
                                    >
                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="completed">
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600">已完成</Badge>
                                            </SelectItem>
                                            <SelectItem value="in-progress">
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">进行中</Badge>
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                <Badge variant="outline">待开始</Badge>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Progress
                                        value={phase.progress}
                                        className="h-2 flex-1"
                                        indicatorColor={
                                            phase.status === "completed" ? "bg-emerald-500" : phase.status === "in-progress" ? "bg-blue-600" : "bg-primary"
                                        }
                                    />
                                    <div className="flex items-center gap-1 w-[80px]">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={phase.progress}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                if (!isNaN(val)) patchPhase(phase.id, { progress: val });
                                            }}
                                            className="h-8 px-2 text-xs"
                                        />
                                        <span className="text-xs text-muted-foreground">%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Accordion type="single" collapsible defaultValue="phase-2" className="w-full">
                {sdlc.phases.map((phase) => (
                    <AccordionItem key={phase.id} value={phase.id} className="bg-card border rounded-lg mb-4 px-4 data-[state=open]:shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold">{phase.name}</span>
                                <span className="hidden sm:inline text-xs font-normal text-muted-foreground">{phase.subtitle}</span>
                                <Badge
                                    variant={phase.status === "completed" ? "default" : phase.status === "in-progress" ? "secondary" : "outline"}
                                    className={cn(
                                        phase.status === "completed" && "bg-emerald-500 hover:bg-emerald-600",
                                        phase.status === "in-progress" && "bg-blue-100 text-blue-700"
                                    )}
                                >
                                    {phase.progress}%
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                            <div className="flex flex-col gap-4">
                                <Card className="shadow-none border-dashed bg-muted/20">
                                    <CardHeader className="py-3 px-4">
                                        <CardTitle className="text-sm">里程碑</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4">
                                        <div className="flex flex-col gap-3">
                                            {phase.milestones.map((item: Milestone) => (
                                                <label
                                                    key={item.id}
                                                    className="flex items-center gap-3 text-sm font-medium leading-none cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={item.completed}
                                                        onCheckedChange={() => toggleMilestone(phase, item.id)}
                                                    />
                                                    <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                                        {item.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none border-dashed bg-muted/20">
                                    <CardHeader className="py-3 px-4">
                                        <CardTitle className="text-sm">交付物</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4">
                                        <div className="flex flex-col gap-3">
                                            {phase.deliverables.map((item: Deliverable) => (
                                                <div key={item.id} className="flex items-start sm:items-center justify-between gap-4">
                                                    <label className="flex items-center gap-3 text-sm font-medium leading-none cursor-pointer">
                                                        <Checkbox
                                                            checked={item.completed}
                                                            onCheckedChange={() => toggleDeliverable(phase, item.id)}
                                                        />
                                                        <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                                            {item.name}
                                                        </span>
                                                    </label>
                                                    {item.path && (
                                                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                                            {item.path}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none border-dashed bg-muted/20">
                                    <CardHeader className="py-3 px-4">
                                        <CardTitle className="text-sm">门禁检查（点击切换状态）</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4">
                                        <div className="flex flex-col gap-4">
                                            {phase.gateChecks.map((item: GateCheck) => (
                                                <div key={item.id} className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "cursor-pointer transition-colors border-transparent text-white",
                                                                item.passed === true ? "bg-emerald-500 hover:bg-emerald-600" :
                                                                    item.passed === false ? "bg-rose-500 hover:bg-rose-600" :
                                                                        "bg-slate-400 hover:bg-slate-500"
                                                            )}
                                                            onClick={() => cycleGateCheck(phase, item.id)}
                                                        >
                                                            {item.passed === true ? "通过" : item.passed === false ? "未通过" : "未检查"}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{item.description}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground pl-16 sm:pl-20 border-l border-muted ml-7 py-0.5">
                                                        标准: {item.standard}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
