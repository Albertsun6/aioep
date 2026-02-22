"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Rocket, Target, FolderGit2, Plus } from "lucide-react";

export default function InitiativePage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/strategy/initiatives/${params.id}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 pt-2">
                <Skeleton className="h-8 w-24 mb-4" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (!data || data.error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <h2 className="text-xl font-bold mb-2">未找到该战略举措</h2>
                <Button variant="outline" onClick={() => router.push("/strategy")}>返回规划中心</Button>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6 pt-2">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/strategy")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    返回战略规划中心
                </div>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                            {data.status === "active" ? "执行中" : "规划中"}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            归属目标: <Target className="h-3 w-3 inline" /> {data.objective?.name}
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Rocket className="h-7 w-7 text-primary" />
                        {data.name}
                    </h2>
                    <p className="text-muted-foreground max-w-3xl">
                        {data.description}
                    </p>
                </div>
                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    onClick={() => router.push(`/projects?spawnStrategyId=${data.id}&spawnStrategyName=${encodeURIComponent(data.name)}`)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    孵化落地项目
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <Card className="md:col-span-2 shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FolderGit2 className="h-5 w-5 text-muted-foreground" />
                            关联落地项目 ({data.projects?.length || 0})
                        </CardTitle>
                        <CardDescription>该战略举措直接孵化和支撑的所有项目</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.projects?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.projects.map((p: any) => (
                                    <div key={p.id} className="border rounded-lg p-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
                                        <div className="font-semibold text-primary mb-1">{p.name}</div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <Badge variant="outline">{p.currentPhase}</Badge>
                                            <span className="text-muted-foreground">{p.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/5">
                                <FolderGit2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground font-medium mb-1">暂无落地项目</p>
                                <p className="text-xs text-muted-foreground/70 mb-4">该战略尚未孵化出具体的执行项目</p>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/projects?spawnStrategyId=${data.id}&spawnStrategyName=${encodeURIComponent(data.name)}`)}>
                                    立即孵化
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50">
                    <CardHeader className="bg-muted/10 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            父级战略目标
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="font-medium mb-2">{data.objective?.name}</div>
                        <p className="text-sm text-muted-foreground mb-4">
                            {data.objective?.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                            年度: {data.objective?.year}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
