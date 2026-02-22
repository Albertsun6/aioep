"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Flag, Rocket, Plus, Sparkles, Building2, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function StrategyPage() {
    const [objectives, setObjectives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const router = useRouter();

    useEffect(() => {
        fetch("/api/strategy")
            .then(res => res.json())
            .then(d => {
                setObjectives(d);
                setLoading(false);
            })
            .catch((e) => {
                console.error("Failed to fetch strategy", e)
                setLoading(false);
            });
        fetch("/api/settings")
            .then(res => res.json())
            .then(d => setCompanyName(d.companyName || ""))
            .catch(() => { });
    }, []);

    const filteredObjectives = objectives.filter(obj => obj.year === selectedYear);
    const years = [...new Set(objectives.map(obj => obj.year))].sort((a, b) => b - a);
    // Ensure current year is always in the tab list
    if (!years.includes(selectedYear)) years.unshift(selectedYear);

    return (
        <div className="flex w-full flex-col gap-6 pt-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                        战略规划中心 (Strategy Planning Center)
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {companyName && (
                            <>
                                <Building2 className="h-3.5 w-3.5" />
                                <span className="font-medium text-foreground/80">{companyName}</span>
                                <span className="text-muted-foreground/30">·</span>
                            </>
                        )}
                        企业级战略目标的制定、追踪与落地
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/strategy/canvas")}>
                        <Eye className="mr-2 h-4 w-4" />
                        可视化画布
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/strategy/modeling")}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI 战略建模
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新建战略目标
                    </Button>
                </div>
            </div>

            {/* Year Tabs */}
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mr-1">战略年度:</span>
                {years.map(year => (
                    <Button
                        key={year}
                        variant={year === selectedYear ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedYear(year)}
                        className="min-w-[72px]"
                    >
                        {year}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            ) : filteredObjectives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">{selectedYear} 年度暂无战略目标</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">点击"AI 战略建模"或"新建战略目标"开始规划</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2">
                    {filteredObjectives.map((obj) => (
                        <Card key={obj.id} className="flex flex-col border border-border/50 shadow-sm bg-card hover:shadow-md transition-shadow">
                            <CardHeader className="bg-muted/10 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                        {obj.year} 年度战略
                                    </Badge>
                                    <span className="text-sm font-medium text-muted-foreground">{obj.progress}% 完成</span>
                                </div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    {obj.name}
                                </CardTitle>
                                <CardDescription className="pt-2 text-sm leading-relaxed">
                                    {obj.description}
                                </CardDescription>
                                <div className="mt-4">
                                    <Progress value={obj.progress} className="h-2" />
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col">
                                {/* Key Results */}
                                <div className="p-6 pb-4">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-4 text-foreground/80">
                                        <Flag className="h-4 w-4 text-emerald-500" />
                                        衡量指标 (Key Results)
                                    </h4>
                                    <div className="space-y-3">
                                        {obj.keyResults?.map((kr: any) => (
                                            <div key={kr.id} className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{kr.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{kr.current}</span>
                                                    <span className="text-muted-foreground/50">/</span>
                                                    <span className="text-muted-foreground">{kr.target}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!obj.keyResults || obj.keyResults.length === 0) && (
                                            <div className="text-sm text-muted-foreground italic">尚无关键指标</div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Initiatives */}
                                <div className="p-6 bg-muted/5 flex-1 rounded-b-lg">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-4 text-foreground/80">
                                        <Rocket className="h-4 w-4 text-blue-500" />
                                        战略举措 (Initiatives)
                                    </h4>
                                    <div className="space-y-3">
                                        {obj.initiatives?.map((ini: any) => (
                                            <div
                                                key={ini.id}
                                                className="group flex flex-col rounded-md border bg-background p-3 hover:border-primary/50 cursor-pointer transition-colors shadow-sm"
                                                onClick={() => router.push(`/strategy/${ini.id}`)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{ini.name}</span>
                                                    <Badge variant="outline" className="text-xs">{ini.status === "active" ? "执行中" : "规划中"}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{ini.description}</p>
                                                <div className="mt-2 text-xs text-muted-foreground/80 flex items-center justify-between">
                                                    <span>关联落地项目: {ini.projects?.length || 0} 个</span>
                                                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">详情 &rarr;</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!obj.initiatives || obj.initiatives.length === 0) && (
                                            <div className="text-sm text-muted-foreground italic">尚无战略举措</div>
                                        )}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
