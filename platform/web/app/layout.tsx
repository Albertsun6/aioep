"use client";

import "./globals.css";
import "antd/dist/reset.css";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  ConfigProvider,
  Layout,
  Menu,
  Select,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import AIChatPanel from "@/components/layout/ai-chat-panel";
import { ProjectProvider, useProject } from "@/lib/project-context";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

function AppShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { projects, currentProject, setCurrentProjectId } = useProject();

  // Determine the active menu key from current path
  const getSelectedKey = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/platform/methodology")) return "platform-methodology";
    if (pathname.startsWith("/platform/methods")) return "platform-methods";
    if (pathname.startsWith("/platform/assets") || pathname.startsWith("/platform")) return "platform-assets";
    if (pathname.match(/\/projects\/[^/]+\/sdlc/)) return "project-sdlc";
    if (pathname.match(/\/projects\/[^/]+\/gap-fit/)) return "project-gapfit";
    if (pathname.match(/\/projects\/[^/]+/)) return "project-dashboard";
    if (pathname === "/projects") return "projects-list";
    return "home";
  };

  const getOpenKeys = () => {
    if (pathname.startsWith("/platform")) return ["platform"];
    if (pathname.startsWith("/projects/") && pathname.split("/").length > 2) return ["projects", `proj-${currentProject?.id}`];
    if (pathname === "/projects") return ["projects"];
    return [];
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "home",
      icon: <DashboardOutlined />,
      label: "Home",
    },

    // ─── Platform (知识层) ───────────────────────────────
    {
      key: "platform",
      icon: <BookOutlined />,
      label: "Platform",
      children: [
        {
          key: "platform-methodology",
          icon: <UnorderedListOutlined />,
          label: "方法论",
        },
        {
          key: "platform-methods",
          icon: <FileSearchOutlined />,
          label: "方法库",
        },
        {
          key: "platform-assets",
          icon: <ThunderboltOutlined />,
          label: "Workflows & Rules",
        },
      ],
    },

    // ─── Projects (执行层) ───────────────────────────────
    {
      key: "projects",
      icon: <FolderOutlined />,
      label: "Projects",
      children: [
        {
          key: "projects-list",
          icon: <AppstoreOutlined />,
          label: "所有项目",
        },
        // Per-project submenu for current project
        ...(currentProject
          ? [
            {
              key: `proj-${currentProject.id}`,
              icon: <FolderOutlined />,
              label: currentProject.name,
              children: [
                { key: "project-dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
                { key: "project-sdlc", icon: <AppstoreOutlined />, label: "SDLC 看板" },
                { key: "project-gapfit", label: "Gap-Fit" },
              ],
            },
          ]
          : []),
      ],
    },

    { key: "ai", icon: <RobotOutlined />, label: "AI 助手" },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "ai") { setChatOpen(true); return; }
    const routes: Record<string, string> = {
      home: "/",
      "platform-methodology": "/platform/methodology",
      "platform-methods": "/platform/methods",
      "platform-assets": "/platform/assets",
      "projects-list": "/projects",
      "project-dashboard": currentProject ? `/projects/${currentProject.id}` : "/projects",
      "project-sdlc": currentProject ? `/projects/${currentProject.id}/sdlc` : "/projects",
      "project-gapfit": currentProject ? `/projects/${currentProject.id}/gap-fit` : "/projects",
    };
    if (routes[key]) router.push(routes[key]);
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          theme="light"
          width={224}
          collapsedWidth={68}
          collapsible
          collapsed={sidebarCollapsed}
          trigger={null}
          style={{ borderInlineEnd: "1px solid var(--border)" }}
        >
          {/* Logo / collapse toggle */}
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "space-between",
              paddingInline: sidebarCollapsed ? 8 : 16,
              borderBottom: "1px solid var(--border)",
            }}
          >
            {!sidebarCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "#2563eb", color: "#fff",
                    display: "grid", placeItems: "center",
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  A
                </div>
                <Text strong>AIOEP</Text>
              </div>
            )}
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderInlineEnd: "none", marginTop: 8 }}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              background: "var(--card)",
              borderBottom: "1px solid var(--border)",
              paddingInline: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Text strong style={{ fontSize: 13, color: "var(--muted-foreground)" }}>AIOEP</Text>
              {projects.length > 0 && (
                <Select
                  size="small"
                  value={currentProject?.id}
                  placeholder="选择项目..."
                  onChange={(id) => {
                    setCurrentProjectId(id);
                    router.push(`/projects/${id}`);
                  }}
                  style={{ minWidth: 200 }}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              )}
            </div>
            <Button icon={<RobotOutlined />} onClick={() => setChatOpen(true)} type="default">
              AI 助手
            </Button>
          </Header>
          <Content style={{ padding: 20 }}>{children}</Content>
        </Layout>
      </Layout>

      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <title>AIOEP Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <AntdRegistry>
          <ConfigProvider theme={{ token: { colorPrimary: "#2563eb", borderRadius: 10 } }}>
            <ProjectProvider>
              <AppShell>{children}</AppShell>
            </ProjectProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
