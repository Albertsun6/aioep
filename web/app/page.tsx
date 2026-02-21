"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SDLCState, GapFitData } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import {
  Card,
  Col,
  Flex,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  Button,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/charts";

const { Title, Paragraph, Text } = Typography;

export default function DashboardPage() {
  const { currentProject: project } = useProject();
  const [sdlc, setSdlc] = useState<SDLCState | null>(null);
  const [gapfit, setGapfit] = useState<GapFitData | null>(null);

  useEffect(() => {
    if (!project) return;
    setSdlc(null);
    setGapfit(null);
    fetch(`/api/sdlc?projectId=${project.id}`).then((r) => r.json()).then(setSdlc);
    fetch(`/api/gap-fit?projectId=${project.id}`).then((r) => r.json()).then(setGapfit);
  }, [project]);

  if (!sdlc || !gapfit || !project) {
    return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
  }

  const completedSprints = sdlc.sprints.filter((s) => s.status === "completed").length;
  const totalSprints = sdlc.sprints.length;
  const completedPhases = sdlc.phases.filter((p) => p.status === "completed").length;
  const gapItems = gapfit.requirements.filter(
    (r) => r.fitStatus === "Gap" || r.fitStatus === "Partial"
  ).length;

  const fitCounts = [
    { name: "Fit", value: gapfit.requirements.filter((r) => r.fitStatus === "Fit").length, color: "#22c55e" },
    { name: "Partial", value: gapfit.requirements.filter((r) => r.fitStatus === "Partial").length, color: "#f59e0b" },
    { name: "Gap", value: gapfit.requirements.filter((r) => r.fitStatus === "Gap").length, color: "#ef4444" },
    { name: "OOS", value: gapfit.requirements.filter((r) => r.fitStatus === "OOS").length, color: "#94a3b8" },
  ];

  const fitPieConfig = {
    data: fitCounts.map((item) => ({ type: item.name, value: item.value })),
    angleField: "value",
    colorField: "type",
    innerRadius: 0.62,
    radius: 0.86,
    color: ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8"],
    legend: false,
    label: false,
    tooltip: {
      formatter: (datum: { type: string; value: number }) => ({
        name: datum.type,
        value: `${datum.value} 项`,
      }),
    },
    interactions: [{ type: "element-active" }],
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ marginBottom: 6 }}>{project.name}</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>{project.description}</Paragraph>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={12} xl={6}>
          <Card size="small"><Statistic title="已完成阶段" value={completedPhases} suffix="/ 4" prefix={<CheckCircleOutlined style={{ color: "#22c55e" }} />} /></Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card size="small"><Statistic title="Sprint 进度" value={completedSprints} suffix={`/ ${totalSprints}`} prefix={<ClockCircleOutlined style={{ color: "#2563eb" }} />} /></Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card size="small"><Statistic title="已分析需求" value={gapfit.requirements.length} suffix="项" prefix={<BarChartOutlined style={{ color: "#f59e0b" }} />} /></Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card size="small"><Statistic title="待处理 Gap/Partial" value={gapItems} suffix="项" prefix={<WarningOutlined style={{ color: "#ef4444" }} />} /></Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} xl={12}>
          <Card title="SDLC 阶段进度">
            <Flex vertical gap={12}>
              {sdlc.phases.map((phase) => (
                <div key={phase.id}>
                  <Space><Text strong>{phase.name}</Text><Text type="secondary">{phase.subtitle}</Text></Space>
                  <Progress percent={phase.progress} size="small" status={phase.status === "completed" ? "success" : phase.status === "in-progress" ? "active" : "normal"} style={{ marginTop: 4 }} />
                </div>
              ))}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Gap-Fit 分析概况" extra={<Tag color="green">匹配率 {Math.round((fitCounts[0].value / Math.max(gapfit.requirements.length, 1)) * 100)}%</Tag>}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 160, height: 160 }}><Pie {...fitPieConfig} /></div>
              <Space orientation="vertical" size={6}>
                {fitCounts.map((item) => (
                  <Space key={item.name} style={{ justifyContent: "space-between", width: 180 }}>
                    <Space size={8}>
                      <span style={{ width: 10, height: 10, background: item.color, borderRadius: 2, display: "inline-block" }} />
                      <Text>{item.name}</Text>
                    </Space>
                    <Text strong>{item.value}</Text>
                  </Space>
                ))}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Sprint 概览">
        <Flex vertical gap={8}>
          {sdlc.sprints.map((sprint) => (
            <Flex key={sprint.id} justify="space-between" align="center" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <Text strong>{sprint.name}</Text>
                <br />
                <Text type="secondary">{sprint.content}</Text>
              </div>
              <Tag color={sprint.status === "completed" ? "green" : sprint.status === "in-progress" ? "blue" : "default"}>
                {sprint.status === "completed" ? "已完成" : sprint.status === "in-progress" ? "进行中" : "待开始"}
              </Tag>
            </Flex>
          ))}
        </Flex>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Card title="SDLC 看板" extra={<Link href="/sdlc">进入</Link>}>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>查看阶段详情、门禁检查、交付物与里程碑。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Gap-Fit 工作台" extra={<Link href="/gap-fit">进入</Link>}>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>筛选、排序并评估需求匹配状态。</Paragraph>
          </Card>
        </Col>
      </Row>

      <Space>
        <Link href="/sdlc"><Button type="primary">打开 SDLC 看板</Button></Link>
        <Link href="/gap-fit"><Button>打开 Gap-Fit 工作台</Button></Link>
      </Space>
    </Space>
  );
}
