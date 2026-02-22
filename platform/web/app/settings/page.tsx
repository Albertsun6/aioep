"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Building2, CheckCircle2 } from "lucide-react";

interface CompanySettings {
    companyName: string;
    industry: string;
    annualRevenue: string;
    employeeCount: string;
    description: string;
    strategicCycle: string;
    currentYear: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/settings")
            .then(res => res.json())
            .then(d => { setSettings(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            setSaving(false);
        }
    };

    const update = (field: keyof CompanySettings, value: string | number) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
    };

    if (loading || !settings) {
        return (
            <div className="flex w-full flex-col gap-6 pt-2">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6 pt-2 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    平台设置
                </h2>
                <p className="text-sm text-muted-foreground">
                    管理公司基础信息，这些信息将用于战略建模的上下文输入。
                </p>
            </div>

            <Card className="border border-border/50">
                <CardHeader className="bg-muted/10">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        公司基础信息
                    </CardTitle>
                    <CardDescription>
                        当前平台默认管理一家公司的战略和项目。
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">公司名称</Label>
                            <Input
                                id="companyName"
                                value={settings.companyName}
                                onChange={e => update("companyName", e.target.value)}
                                placeholder="如：某某科技有限公司"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">所属行业</Label>
                            <Input
                                id="industry"
                                value={settings.industry}
                                onChange={e => update("industry", e.target.value)}
                                placeholder="如：制造业、软件/科技、零售"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="annualRevenue">年营收（万元）</Label>
                            <Input
                                id="annualRevenue"
                                value={settings.annualRevenue}
                                onChange={e => update("annualRevenue", e.target.value)}
                                placeholder="如：30000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeCount">员工人数</Label>
                            <Input
                                id="employeeCount"
                                value={settings.employeeCount}
                                onChange={e => update("employeeCount", e.target.value)}
                                placeholder="如：50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">公司简介</Label>
                        <textarea
                            id="description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={settings.description}
                            onChange={e => update("description", e.target.value)}
                            placeholder="简要描述公司业务和战略方向..."
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="currentYear">当前战略年度</Label>
                            <Input
                                id="currentYear"
                                type="number"
                                value={settings.currentYear}
                                onChange={e => update("currentYear", parseInt(e.target.value) || 2026)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="strategicCycle">战略周期</Label>
                            <select
                                id="strategicCycle"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={settings.strategicCycle}
                                onChange={e => update("strategicCycle", e.target.value)}
                            >
                                <option value="annual">年度（1年）</option>
                                <option value="biennial">双年（2年）</option>
                                <option value="triennial">三年</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                    {saving ? (
                        <>保存中...</>
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                            已保存
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            保存设置
                        </>
                    )}
                </Button>
                {saved && <span className="text-sm text-emerald-500">设置已保存成功</span>}
            </div>
        </div>
    );
}
