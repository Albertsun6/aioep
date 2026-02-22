"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Rocket } from "lucide-react";
import { useProject } from "@/lib/project-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function ProjectsContent() {
  const { projects, currentProject, setCurrentProjectId, refreshProjects } = useProject();
  const searchParams = useSearchParams();

  const spawnStrategyId = searchParams.get("spawnStrategyId");
  const spawnStrategyName = searchParams.get("spawnStrategyName");

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    techStack: "",
    strategyId: "",
    strategyName: "",
  });

  useEffect(() => {
    if (spawnStrategyId && spawnStrategyName) {
      setFormData(prev => ({
        ...prev,
        strategyId: spawnStrategyId,
        strategyName: spawnStrategyName
      }));
      setModalOpen(true);
    }
  }, [spawnStrategyId, spawnStrategyName]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("请输入项目名称");
      return;
    }

    setLoading(true);
    try {
      const id = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: formData.name,
          description: formData.description || "",
          techStack: formData.techStack || "",
          currentPhase: "phase-0",
          status: "规划中",
          strategyId: formData.strategyId || undefined,
          strategyName: formData.strategyName || undefined,
        }),
      });

      if (res.ok) {
        toast.success("项目已创建");
        setModalOpen(false);
        setFormData({ name: "", description: "", techStack: "", strategyId: "", strategyName: "" });
        await refreshProjects();
        setCurrentProjectId(id);
      } else {
        const err = await res.json();
        toast.error(err.error || "创建失败");
      }
    } catch {
      toast.error("创建过程发生意外错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">项目管理</h2>
            <p className="text-sm text-muted-foreground">
              管理所有使用 AIOEP 方法论的项目
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                currentProject?.id === project.id && "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              )}
              onClick={() => setCurrentProjectId(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.strategyName && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                        <Rocket className="h-3 w-3" />
                        {project.strategyName}
                      </div>
                    )}
                  </div>
                  {currentProject?.id === project.id && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400">
                      当前
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {project.description || "暂无描述"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack && (
                      <Badge variant="outline">{project.techStack}</Badge>
                    )}
                    {project.status && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        {project.status}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    创建于 {project.createdAt}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>新建项目</DialogTitle>
              <DialogDescription>
                创建新项目工作空间并初始化 AIOEP 规范目录结构。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {formData.strategyName && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-100 dark:border-blue-900/50 flex items-start gap-2">
                  <Rocket className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">孵化自战略举措</div>
                    <div className="text-sm font-medium">{formData.strategyName}</div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-left font-semibold">
                  项目名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：ERP 管理系统"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc" className="text-left font-semibold">
                  项目描述
                </Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="一句话描述项目目标"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tech" className="text-left font-semibold">
                  技术栈
                </Label>
                <Input
                  id="tech"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="例如：Odoo 17 + Docker + PostgreSQL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
