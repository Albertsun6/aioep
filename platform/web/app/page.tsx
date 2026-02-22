"use client";

import { useRouter } from "next/navigation";
import { useProject } from "@/lib/project-context";
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  BookOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  RightOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const router = useRouter();
  const { projects, currentProject } = useProject();

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 960, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ paddingTop: 24 }}>
        <Title level={2} style={{ marginBottom: 6 }}>
          AIOEP
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 0 }}>
          AI 组织效能平台 — 基于 AI-EADM 方法论，以结构化、可追溯、AI 协同的方式开发企业应用系统
        </Paragraph>
      </div>

      {/* Quick nav cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push("/platform/methodology")}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" size={8}>
              <BookOutlined style={{ fontSize: 24, color: "#2563eb" }} />
              <Text strong style={{ fontSize: 15 }}>方法论</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                AI-EADM 9 域方法论体系：核心原则、过程方法论、建模体系、质量框架等
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push("/platform/methods")}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" size={8}>
              <ThunderboltOutlined style={{ fontSize: 24, color: "#0891b2" }} />
              <Text strong style={{ fontSize: 15 }}>方法库</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                分析方法、开发方法、交付方法及其模板
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            onClick={() => router.push("/platform/assets")}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" size={8}>
              <FolderOpenOutlined style={{ fontSize: 24, color: "#7c3aed" }} />
              <Text strong style={{ fontSize: 15 }}>Workflows & Rules</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Antigravity Workflows 和 Rules 文件管理
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Projects */}
      <div>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <Title level={4} style={{ marginBottom: 0 }}>项目</Title>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => router.push("/projects")}
          >
            管理项目
          </Button>
        </Flex>
        <Row gutter={[12, 12]}>
          {projects.map((p) => (
            <Col xs={24} md={12} key={p.id}>
              <Card
                hoverable
                onClick={() => router.push(`/projects/${p.id}`)}
                style={{
                  borderColor: currentProject?.id === p.id ? "#2563eb" : undefined,
                }}
              >
                <Flex justify="space-between" align="center">
                  <Space direction="vertical" size={4}>
                    <Space>
                      <Text strong>{p.name}</Text>
                      {currentProject?.id === p.id && <Tag color="blue">当前</Tag>}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 13 }}>{p.description}</Text>
                    <Space size={6}>
                      {p.techStack && <Tag>{p.techStack}</Tag>}
                      {p.status && <Tag color="green">{p.status}</Tag>}
                    </Space>
                  </Space>
                  <RightOutlined style={{ color: "var(--muted-foreground)" }} />
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Flex>
  );
}
