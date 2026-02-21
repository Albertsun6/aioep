"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useProject } from "@/lib/project-context";

const { Title, Paragraph, Text } = Typography;

export default function ProjectsPage() {
  const { projects, currentProject, setCurrentProjectId, refreshProjects } =
    useProject();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const id = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: values.name,
          description: values.description || "",
          techStack: values.techStack || "",
          currentPhase: "phase-0",
          status: "规划中",
        }),
      });

      if (res.ok) {
        msgApi.success("项目已创建");
        setModalOpen(false);
        form.resetFields();
        await refreshProjects();
        setCurrentProjectId(id);
      } else {
        const err = await res.json();
        msgApi.error(err.error || "创建失败");
      }
    } catch {
      // validation failed
    }
  };

  return (
    <>
      {contextHolder}
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <div>
            <Title level={3} style={{ marginBottom: 6 }}>
              项目管理
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              管理所有使用 AIOEP 方法论的项目
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            新建项目
          </Button>
        </Flex>

        <Row gutter={[12, 12]}>
          {projects.map((project) => (
            <Col xs={24} md={12} xl={8} key={project.id}>
              <Card
                hoverable
                onClick={() => setCurrentProjectId(project.id)}
                style={{
                  borderColor:
                    currentProject?.id === project.id
                      ? "#2563eb"
                      : undefined,
                }}
              >
                <Flex vertical gap={8}>
                  <Flex justify="space-between" align="center">
                    <Text strong style={{ fontSize: 16 }}>
                      {project.name}
                    </Text>
                    {currentProject?.id === project.id && (
                      <Tag color="blue">当前</Tag>
                    )}
                  </Flex>
                  <Text type="secondary">{project.description}</Text>
                  <Space>
                    {project.techStack && (
                      <Tag>{project.techStack}</Tag>
                    )}
                    {project.status && (
                      <Tag color="green">{project.status}</Tag>
                    )}
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    创建于 {project.createdAt}
                  </Text>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>

      <Modal
        title="新建项目"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => setModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: "请输入项目名称" }]}
          >
            <Input placeholder="例如：ERP 管理系统" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea
              rows={2}
              placeholder="一句话描述项目目标"
            />
          </Form.Item>
          <Form.Item name="techStack" label="技术栈">
            <Input placeholder="例如：Odoo 17 + Docker + PostgreSQL" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
