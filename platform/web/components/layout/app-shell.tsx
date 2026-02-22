"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import AIChatPanel from "@/components/layout/ai-chat-panel";
import { cn } from "@/lib/utils";
import {
    Book,
    BookOpen,
    Bot,
    ChevronDown,
    ChevronRight,
    FileSearch,
    Folder,
    LayoutDashboard,
    LayoutGrid,
    List,
    PanelLeftClose,
    PanelLeftOpen,
    Target,
    Zap,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Helper for rendering a nav link
function NavLink({
    icon: Icon,
    label,
    isActive,
    onClick,
    isNested = false,
}: {
    icon?: any;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    isNested?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                isNested && "pl-8"
            )}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
        </button>
    );
}

// Collapsible group nav
function NavGroup({
    icon: Icon,
    label,
    defaultOpen = false,
    children,
}: {
    icon: any;
    label: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
                <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                </div>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>
            {isOpen && <div className="space-y-1">{children}</div>}
        </div>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { projects, currentProject, setCurrentProjectId } = useProject();

    const getActiveTab = () => {
        if (pathname === "/") return "home";
        if (pathname.startsWith("/methodology")) return "methodology";
        if (pathname.startsWith("/strategy")) return "strategy";
        if (pathname.startsWith("/platform/methodology")) return "platform-methodology";
        if (pathname.startsWith("/platform/methods")) return "platform-methods";
        if (pathname.startsWith("/platform/assets") || pathname.startsWith("/platform")) return "platform-assets";
        if (pathname.match(/\/projects\/[^/]+\/sdlc/)) return "project-sdlc";
        if (pathname.match(/\/projects\/[^/]+\/gap-fit/)) return "project-gapfit";
        if (pathname.match(/\/projects\/[^/]+/)) return "project-dashboard";
        if (pathname === "/projects") return "projects-list";
        if (pathname.startsWith("/settings")) return "settings";
        return "home";
    };
    const activeTab = getActiveTab();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside
                className={cn(
                    "flex flex-col border-r bg-card transition-all duration-300",
                    sidebarCollapsed ? "w-[68px]" : "w-64"
                )}
            >
                <div className="flex h-14 items-center justify-between border-b px-4">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                                A
                            </div>
                            <span className="font-semibold text-sm">AIOEP</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
                    >
                        {sidebarCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <ScrollArea className="flex-1 overflow-x-hidden">
                    <div className="space-y-4 py-4">
                        <div className="px-3">
                            <NavLink
                                icon={LayoutDashboard}
                                label={sidebarCollapsed ? "" : "Home"}
                                isActive={activeTab === "home"}
                                onClick={() => router.push("/")}
                            />
                        </div>

                        {!sidebarCollapsed && (
                            <>
                                <div className="px-3">
                                    <NavGroup
                                        icon={Book}
                                        label="Platform"
                                        defaultOpen={pathname.startsWith("/platform")}
                                    >
                                        <NavLink
                                            icon={List}
                                            label="方法论"
                                            isNested
                                            isActive={activeTab === "platform-methodology"}
                                            onClick={() => router.push("/platform/methodology")}
                                        />
                                        <NavLink
                                            icon={FileSearch}
                                            label="方法库"
                                            isNested
                                            isActive={activeTab === "platform-methods"}
                                            onClick={() => router.push("/platform/methods")}
                                        />
                                        <NavLink
                                            icon={Zap}
                                            label="Workflows & Rules"
                                            isNested
                                            isActive={activeTab === "platform-assets"}
                                            onClick={() => router.push("/platform/assets")}
                                        />
                                    </NavGroup>
                                </div>

                                <div className="px-3">
                                    <NavGroup
                                        icon={Target}
                                        label="Strategy"
                                        defaultOpen={pathname.startsWith("/strategy") || pathname.startsWith("/methodology")}
                                    >
                                        <NavLink
                                            icon={LayoutDashboard}
                                            label="战略规划中心"
                                            isNested
                                            isActive={activeTab === "strategy"}
                                            onClick={() => router.push("/strategy")}
                                        />
                                        <NavLink
                                            icon={BookOpen}
                                            label="方法论选择器"
                                            isNested
                                            isActive={activeTab === "methodology"}
                                            onClick={() => router.push("/methodology")}
                                        />
                                    </NavGroup>
                                </div>

                                <div className="px-3">
                                    <NavGroup
                                        icon={Folder}
                                        label="Projects"
                                        defaultOpen={pathname.startsWith("/projects")}
                                    >
                                        <NavLink
                                            icon={LayoutGrid}
                                            label="所有项目"
                                            isNested
                                            isActive={activeTab === "projects-list"}
                                            onClick={() => router.push("/projects")}
                                        />
                                        {currentProject && (
                                            <div className="mt-2 ml-4 border-l pl-2 space-y-1">
                                                <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                                    <Folder className="h-3 w-3" />
                                                    <span className="truncate">{currentProject.name}</span>
                                                </div>
                                                <NavLink
                                                    icon={LayoutDashboard}
                                                    label="Dashboard"
                                                    isNested
                                                    isActive={activeTab === "project-dashboard"}
                                                    onClick={() => router.push(`/projects/${currentProject.id}`)}
                                                />
                                                <NavLink
                                                    icon={LayoutGrid}
                                                    label="SDLC 看板"
                                                    isNested
                                                    isActive={activeTab === "project-sdlc"}
                                                    onClick={() => router.push(`/projects/${currentProject.id}/sdlc`)}
                                                />
                                                <NavLink
                                                    label="Gap-Fit"
                                                    isNested
                                                    isActive={activeTab === "project-gapfit"}
                                                    onClick={() => router.push(`/projects/${currentProject.id}/gap-fit`)}
                                                />
                                            </div>
                                        )}
                                    </NavGroup>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Settings at bottom */}
                    <div className="border-t px-3 py-3 mt-auto">
                        <NavLink
                            icon={Settings}
                            label={sidebarCollapsed ? "" : "设置"}
                            isActive={activeTab === "settings"}
                            onClick={() => router.push("/settings")}
                        />
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-muted-foreground hidden lg:inline-block">
                            AIOEP
                        </span>
                        {projects.length > 0 && (
                            <Select
                                value={currentProject?.id}
                                onValueChange={(id) => {
                                    setCurrentProjectId(id);
                                    router.push(`/projects/${id}`);
                                }}
                            >
                                <SelectTrigger className="w-[200px] h-8 text-xs bg-muted/50 border-none">
                                    <SelectValue placeholder="选择项目..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
                        <Bot className="mr-2 h-4 w-4" />
                        AI 助手
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-6">
                    {children}
                </main>
            </div>

            <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
    );
}
