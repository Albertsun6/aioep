"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import type { FitStatus, Priority, Requirement, GapFitData } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const fitColors: Record<FitStatus, string> = {
    Fit: "#10b981", // emerald-500
    Partial: "#f59e0b", // amber-500
    Gap: "#ef4444", // rose-500
    OOS: "#94a3b8", // slate-400
};

export default function GapFitPage() {
    const { id } = useParams<{ id: string }>();
    const { currentProject, setCurrentProjectId } = useProject();
    const [gapfit, setGapfit] = useState<GapFitData | null>(null);
    const [search, setSearch] = useState("");
    const [fitFilter, setFitFilter] = useState<FitStatus | "all">("all");
    const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
    const [subdomainFilter, setSubdomainFilter] = useState<string>("all");

    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (id) setCurrentProjectId(id);
    }, [id, setCurrentProjectId]);

    const loadData = useCallback(() => {
        if (!id) return;
        fetch(`/api/gap-fit?projectId=${id}`)
            .then((r) => r.json())
            .then(setGapfit);
    }, [id]);

    useEffect(() => {
        setGapfit(null);
        loadData();
    }, [loadData]);

    const updateRequirement = useCallback(
        async (reqId: string, updates: Partial<Requirement>) => {
            const res = await fetch("/api/gap-fit", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: reqId, projectId: id, ...updates }),
            });
            if (res.ok) {
                toast.success("已保存");
                loadData();
            } else {
                const err = await res.json();
                toast.error(err.error || "保存失败");
            }
        },
        [id, loadData]
    );

    const toggleRow = (reqId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(reqId)) next.delete(reqId);
            else next.add(reqId);
            return next;
        });
    };

    const subdomains = useMemo(
        () => (gapfit ? Array.from(new Set(gapfit.requirements.map((r) => r.subdomain))) : []),
        [gapfit]
    );

    const filtered = useMemo(() => {
        if (!gapfit) return [];
        return gapfit.requirements.filter((r) => {
            const s = search.trim().toLowerCase();
            const searchOk =
                !s ||
                r.id.toLowerCase().includes(s) ||
                r.description.toLowerCase().includes(s) ||
                r.currentCapability.toLowerCase().includes(s);
            const fitOk = fitFilter === "all" || r.fitStatus === fitFilter;
            const prioOk = priorityFilter === "all" || r.priority === priorityFilter;
            const subOk = subdomainFilter === "all" || r.subdomain === subdomainFilter;
            return searchOk && fitOk && prioOk && subOk;
        });
    }, [gapfit, search, fitFilter, priorityFilter, subdomainFilter]);

    if (!gapfit) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const fitCounts = (["Fit", "Partial", "Gap", "OOS"] as FitStatus[]).map((s) => ({
        name: s,
        value: gapfit.requirements.filter((r) => r.fitStatus === s).length,
        color: fitColors[s],
    }));

    const subdomainCounts = subdomains.map((sd) => ({
        name: sd,
        Fit: gapfit.requirements.filter((r) => r.subdomain === sd && r.fitStatus === "Fit").length,
        Partial: gapfit.requirements.filter((r) => r.subdomain === sd && r.fitStatus === "Partial").length,
        Gap: gapfit.requirements.filter((r) => r.subdomain === sd && (r.fitStatus === "Gap" || r.fitStatus === "OOS")).length,
    }));

    const hasFilters = search || fitFilter !== "all" || priorityFilter !== "all" || subdomainFilter !== "all";

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pt-2">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1">Gap-Fit 工作台</h2>
                <p className="text-sm text-muted-foreground">
                    {gapfit.requirements.length} 项需求 · {gapfit.domains.join(", ")} · {gapfit.version}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Table and Filters */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="搜索需求编号或描述..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <Select value={fitFilter} onValueChange={(v) => setFitFilter(v as any)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="全部匹配度" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部匹配度</SelectItem>
                                        <SelectItem value="Fit">Fit</SelectItem>
                                        <SelectItem value="Partial">Partial</SelectItem>
                                        <SelectItem value="Gap">Gap</SelectItem>
                                        <SelectItem value="OOS">OOS</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="全部优先级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部优先级</SelectItem>
                                        <SelectItem value="P0">P0</SelectItem>
                                        <SelectItem value="P1">P1</SelectItem>
                                        <SelectItem value="P2">P2</SelectItem>
                                        <SelectItem value="P3">P3</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={subdomainFilter} onValueChange={setSubdomainFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="全部子域" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">全部子域</SelectItem>
                                        {subdomains.map((sd) => (
                                            <SelectItem key={sd} value={sd}>
                                                {sd}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearch("");
                                        setFitFilter("all");
                                        setPriorityFilter("all");
                                        setSubdomainFilter("all");
                                    }}
                                    disabled={!hasFilters}
                                >
                                    清除筛选
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-6 py-3 border-b bg-muted/20 text-sm text-muted-foreground">
                                显示 {filtered.length} / {gapfit.requirements.length} 项
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%] min-w-[300px]">需求描述</TableHead>
                                            <TableHead className="w-[140px]">匹配度</TableHead>
                                            <TableHead className="w-[100px]">工作量</TableHead>
                                            <TableHead className="w-[120px]">优先级</TableHead>
                                            <TableHead className="w-[100px]">Sprint</TableHead>
                                            <TableHead className="w-[40px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map((req) => (
                                            <React.Fragment key={req.id}>
                                                <TableRow className="group cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(req.id)}>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1.5 py-1">
                                                            <span className="font-medium text-foreground">{req.description}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">{req.id}</Badge>
                                                                <span className="text-xs text-muted-foreground">{req.subdomain}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Select
                                                            value={req.fitStatus}
                                                            onValueChange={(v) => updateRequirement(req.id, { fitStatus: v as FitStatus })}
                                                        >
                                                            <SelectTrigger className="h-8 w-[110px] text-xs">
                                                                <Badge
                                                                    className={cn(
                                                                        "px-1.5 py-0 font-normal hover:opacity-80",
                                                                        req.fitStatus === "Fit" && "bg-emerald-500",
                                                                        req.fitStatus === "Partial" && "bg-amber-500",
                                                                        req.fitStatus === "Gap" && "bg-rose-500",
                                                                        req.fitStatus === "OOS" && "bg-slate-400"
                                                                    )}
                                                                >
                                                                    {req.fitStatus}
                                                                </Badge>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Fit"><Badge className="bg-emerald-500 px-1.5 py-0 font-normal">Fit</Badge></SelectItem>
                                                                <SelectItem value="Partial"><Badge className="bg-amber-500 px-1.5 py-0 font-normal">Partial</Badge></SelectItem>
                                                                <SelectItem value="Gap"><Badge className="bg-rose-500 px-1.5 py-0 font-normal">Gap</Badge></SelectItem>
                                                                <SelectItem value="OOS"><Badge className="bg-slate-400 px-1.5 py-0 font-normal">OOS</Badge></SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {req.effort || "—"}
                                                    </TableCell>
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Select
                                                            value={req.priority || "none"}
                                                            onValueChange={(v) => updateRequirement(req.id, { priority: v === "none" ? null : (v as Priority) })}
                                                        >
                                                            <SelectTrigger className="h-8 w-[90px] text-xs">
                                                                <SelectValue placeholder="—" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none"><span className="text-muted-foreground">—</span></SelectItem>
                                                                <SelectItem value="P0"><Badge variant="outline" className="border-rose-500 text-rose-500 px-1.5 py-0 font-normal">P0</Badge></SelectItem>
                                                                <SelectItem value="P1"><Badge variant="outline" className="border-amber-500 text-amber-500 px-1.5 py-0 font-normal">P1</Badge></SelectItem>
                                                                <SelectItem value="P2"><Badge variant="outline" className="border-blue-500 text-blue-500 px-1.5 py-0 font-normal">P2</Badge></SelectItem>
                                                                <SelectItem value="P3"><Badge variant="outline" className="px-1.5 py-0 font-normal">P3</Badge></SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {req.sprint || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            {expandedRows.has(req.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedRows.has(req.id) && (
                                                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                        <TableCell colSpan={6} className="px-6 py-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="flex flex-col gap-2">
                                                                    <span className="font-semibold text-sm">现有能力</span>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed bg-background p-3 rounded-md border">
                                                                        {req.currentCapability}
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <span className="font-semibold text-sm">处理策略</span>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed bg-background p-3 rounded-md border">
                                                                        {req.strategy || "标准功能已满足，无需额外处理"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Charts */}
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">匹配度分布</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={fitCounts}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {fitCounts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: any) => [`${value} 项`, "数量"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                {fitCounts.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 rounded-sm"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-medium text-muted-foreground">
                                            {item.value} ({Math.round((item.value / gapfit.requirements.length) * 100)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">子域分布</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subdomainCounts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={80} />
                                        <RechartsTooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="Fit" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="Partial" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="Gap" stackId="a" fill="#ef4444" radius={[0, 2, 2, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
