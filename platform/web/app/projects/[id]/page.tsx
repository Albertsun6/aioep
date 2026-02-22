"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CheckCircle,
    Clock,
    LayoutGrid,
    TableProperties,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import type { SDLCState, GapFitData } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectOverviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { projects, setCurrentProjectId } = useProject();
    const project = projects.find((p) => p.id === id);
    const [sdlc, setSdlc] = useState<SDLCState | null>(null);
    const [gapfit, setGapfit] = useState<GapFitData | null>(null);

    useEffect(() => {
        if (id) setCurrentProjectId(id);
    }, [id, setCurrentProjectId]);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/sdlc?projectId=${id}`).then((r) => r.json()).then(setSdlc);
        fetch(`/api/gap-fit?projectId=${id}`).then((r) => r.json()).then(setGapfit);
    }, [id]);

    if (!project || !sdlc || !gapfit) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const completedPhases = sdlc.phases.filter((p) => p.status === "completed").length;
    const completedSprints = sdlc.sprints.filter((s) => s.status === "completed").length;
    const gapItems = gapfit.requirements.filter(
        (r) => r.fitStatus === "Gap" || r.fitStatus === "Partial"
    ).length;
    const totalGates = sdlc.phases.reduce((acc, p) => acc + p.gateChecks.length, 0);
    const passedGates = sdlc.phases.reduce(
        (acc, p) => acc + p.gateChecks.filter((g) => g.passed).length,
        0
    );

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pt-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">{project.name}</h2>
                <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            {/* Meta info */}
            <Card className="bg-muted/30">
                <CardContent className="p-4">
                    <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">技术栈</dt>
                            <dd className="font-medium">{project.techStack || "—"}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">当前阶段</dt>
                            <dd className="font-medium">{project.currentPhase || "—"}</dd>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">状态</dt>
                            <dd>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                    {project.status || "—"}
                                </Badge>
                            </dd>
                        </div>
                        <div className="flex flex-col gap-1">
                            <dt className="text-muted-foreground">创建日期</dt>
                            <dd className="font-medium">{project.createdAt}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">已完成阶段</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedPhases} <span className="text-base font-normal text-muted-foreground">/ 4</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sprint 进度</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completedSprints} <span className="text-base font-normal text-muted-foreground">/ {sdlc.sprints.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">需求总数</CardTitle>
                        <TableProperties className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {gapfit.requirements.length} <span className="text-base font-normal text-muted-foreground">项</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">待处理 Gap/Partial</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {gapItems} <span className="text-base font-normal text-muted-foreground">项</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SDLC progress summary */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-base">SDLC 阶段进度</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${id}/sdlc`)}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        打开 SDLC 看板
                    </Button>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-col gap-6">
                        {sdlc.phases.map((phase) => (
                            <div key={phase.id} className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-sm">{phase.name}</span>
                                    <span className="text-xs text-muted-foreground">{phase.subtitle}</span>
                                    <Badge
                                        variant={phase.status === "completed" ? "default" : phase.status === "in-progress" ? "secondary" : "outline"}
                                        className={cn(
                                            phase.status === "completed" && "bg-emerald-500 hover:bg-emerald-600",
                                            phase.status === "in-progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                        )}
                                    >
                                        {phase.status === "completed" ? "已完成" : phase.status === "in-progress" ? "进行中" : "待开始"}
                                    </Badge>
                                </div>
                                <Progress
                                    value={phase.progress}
                                    className="h-2"
                                    indicatorColor={
                                        phase.status === "completed" ? "bg-emerald-500" : phase.status === "in-progress" ? "bg-blue-600" : "bg-primary"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-6 border-t pt-4">
                        门禁通过：{passedGates} / {totalGates}
                    </p>
                </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="flex gap-4">
                <Button onClick={() => router.push(`/projects/${id}/sdlc`)}>
                    SDLC 看板
                </Button>
                <Button variant="secondary" onClick={() => router.push(`/projects/${id}/gap-fit`)}>
                    Gap-Fit 工作台
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
