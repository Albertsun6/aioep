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
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  RobotOutlined,
  TableOutlined,
} from "@ant-design/icons";
import AIChatPanel from "@/components/layout/ai-chat-panel";
import { ProjectProvider, useProject } from "@/lib/project-context";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

function AppShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { projects, currentProject, setCurrentProjectId } = useProject();

  const selectedKey =
    pathname === "/sdlc"
      ? "sdlc"
      : pathname === "/gap-fit"
        ? "gapfit"
        : pathname === "/projects"
          ? "projects"
          : "dashboard";

  const menuItems: MenuProps["items"] = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "sdlc", icon: <AppstoreOutlined />, label: "SDLC 看板" },
    { key: "gapfit", icon: <TableOutlined />, label: "Gap-Fit 工作台" },
    { key: "projects", icon: <ProjectOutlined />, label: "项目管理" },
    { key: "ai", icon: <RobotOutlined />, label: "AI 助手" },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "ai") {
      setChatOpen(true);
      return;
    }
    const routes: Record<string, string> = {
      dashboard: "/",
      sdlc: "/sdlc",
      gapfit: "/gap-fit",
      projects: "/projects",
    };
    if (routes[key]) router.push(routes[key]);
  };

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          theme="light"
          width={224}
          collapsedWidth={72}
          collapsible
          collapsed={sidebarCollapsed}
          trigger={null}
          style={{ borderInlineEnd: "1px solid var(--border)" }}
        >
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
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#2563eb",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  A
                </div>
                <Text strong>AIOEP</Text>
              </div>
            )}
            <Button
              type="text"
              icon={
                sidebarCollapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderInlineEnd: "none", marginTop: 8 }}
          />

          {!sidebarCollapsed && currentProject && (
            <div style={{ padding: 12, marginTop: "auto" }}>
              <div
                style={{
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "var(--secondary)",
                }}
              >
                <Text style={{ fontSize: 12, display: "block" }} strong>
                  {currentProject.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {currentProject.status || currentProject.currentPhase}
                </Text>
              </div>
            </div>
          )}
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
              <Text strong>AIOEP</Text>
              {projects.length > 0 && (
                <Select
                  size="small"
                  value={currentProject?.id}
                  onChange={setCurrentProjectId}
                  style={{ minWidth: 180 }}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              )}
            </div>
            <Button
              icon={<RobotOutlined />}
              onClick={() => setChatOpen(true)}
              type="default"
            >
              AI 助手
            </Button>
          </Header>
          <Content style={{ padding: 16 }}>{children}</Content>
        </Layout>
      </Layout>

      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <title>AIOEP Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <ConfigProvider
          theme={{
            token: { colorPrimary: "#2563eb", borderRadius: 10 },
          }}
        >
          <ProjectProvider>
            <AppShell>{children}</AppShell>
          </ProjectProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
