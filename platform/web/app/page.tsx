"use client";

import { useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import {
  Book,
  FolderOpen,
  Plus,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { projects, currentProject } = useProject();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pt-6">
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">AIOEP</h2>
        <p className="text-muted-foreground">
          AI 组织效能平台 — 基于 AI-EADM 方法论，以结构化、可追溯、AI 协同的方式开发企业应用系统
        </p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => router.push("/platform/methodology")}
        >
          <CardContent className="flex flex-col gap-2 p-6">
            <Book className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-lg">方法论</h3>
            <p className="text-sm text-muted-foreground">
              AI-EADM 9 域方法论体系：核心原则、过程方法论、建模体系、质量框架等
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => router.push("/platform/methods")}
        >
          <CardContent className="flex flex-col gap-2 p-6">
            <Zap className="h-6 w-6 text-cyan-600" />
            <h3 className="font-semibold text-lg">方法库</h3>
            <p className="text-sm text-muted-foreground">
              分析方法、开发方法、交付方法及其模板
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => router.push("/platform/assets")}
        >
          <CardContent className="flex flex-col gap-2 p-6">
            <FolderOpen className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-lg">Workflows & Rules</h3>
            <p className="text-sm text-muted-foreground">
              Antigravity Workflows 和 Rules 文件管理
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects */}
      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">项目</h3>
          <Button size="sm" onClick={() => router.push("/projects")}>
            <Plus className="mr-2 h-4 w-4" />
            管理项目
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card
              key={p.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                currentProject?.id === p.id && "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              )}
              onClick={() => router.push(`/projects/${p.id}`)}
            >
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    {currentProject?.id === p.id && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400">
                        当前
                      </Badge>
                    )}
                  </div>
                  {p.strategyName && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Rocket className="h-3 w-3" />
                      {p.strategyName}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {p.techStack && <Badge variant="outline">{p.techStack}</Badge>}
                    {p.status && <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">{p.status}</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
