"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    Col,
    Descriptions,
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
    AppstoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TableOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import type { SDLCState, GapFitData } from "@/lib/types";
import { useProject } from "@/lib/project-context";

const { Title, Paragraph, Text } = Typography;

export default function ProjectOverviewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { projects, setCurrentProjectId } = useProject();
    const project = projects.find((p) => p.id === id);
    const [sdlc, setSdlc] = useState<SDLCState | null>(null);
    const [gapfit, setGapfit] = useState<GapFitData | null>(null);

    // Switch active project context when navigating directly
    useEffect(() => {
        if (id) setCurrentProjectId(id);
    }, [id, setCurrentProjectId]);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/sdlc?projectId=${id}`).then((r) => r.json()).then(setSdlc);
        fetch(`/api/gap-fit?projectId=${id}`).then((r) => r.json()).then(setGapfit);
    }, [id]);

    if (!project || !sdlc || !gapfit) {
        return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
    }

    const completedPhases = sdlc.phases.filter((p) => p.status === "completed").length;
    const completedSprints = sdlc.sprints.filter((s) => s.status === "completed").length;
    const gapItems = gapfit.requirements.filter(
        (r) => r.fitStatus === "Gap" || r.fitStatus === "Partial"
    ).length;
    const totalGates = sdlc.phases.reduce((acc, p) => acc + p.gateChecks.length, 0);
    const passedGates = sdlc.phases.reduce(
        (acc, p) => acc + p.gateChecks.filter((g) => g.passed).length,
        0
    );

    return (
        <Flex vertical gap={16} style={{ width: "100%" }}>
            <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                    {project.name}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {project.description}
                </Paragraph>
            </div>

            {/* Meta info */}
            <Card size="small">
                <Descriptions size="small" column={3}>
                    <Descriptions.Item label="技术栈">{project.techStack || "—"}</Descriptions.Item>
                    <Descriptions.Item label="当前阶段">{project.currentPhase || "—"}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                        <Tag color="blue">{project.status || "—"}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="创建日期">{project.createdAt}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Stats */}
            <Row gutter={[12, 12]}>
                <Col xs={12} xl={6}>
                    <Card size="small">
                        <Statistic title="已完成阶段" value={completedPhases} suffix="/ 4"
                            prefix={<CheckCircleOutlined style={{ color: "#22c55e" }} />} />
                    </Card>
                </Col>
                <Col xs={12} xl={6}>
                    <Card size="small">
                        <Statistic title="Sprint 进度" value={completedSprints} suffix={`/ ${sdlc.sprints.length}`}
                            prefix={<ClockCircleOutlined style={{ color: "#2563eb" }} />} />
                    </Card>
                </Col>
                <Col xs={12} xl={6}>
                    <Card size="small">
                        <Statistic title="需求总数" value={gapfit.requirements.length} suffix="项"
                            prefix={<TableOutlined style={{ color: "#f59e0b" }} />} />
                    </Card>
                </Col>
                <Col xs={12} xl={6}>
                    <Card size="small">
                        <Statistic title="待处理 Gap/Partial" value={gapItems} suffix="项"
                            prefix={<WarningOutlined style={{ color: "#ef4444" }} />} />
                    </Card>
                </Col>
            </Row>

            {/* SDLC progress summary */}
            <Card
                title="SDLC 阶段进度"
                extra={<Button icon={<AppstoreOutlined />} size="small"
                    onClick={() => router.push(`/projects/${id}/sdlc`)}>打开 SDLC 看板</Button>}
            >
                <Flex vertical gap={10}>
                    {sdlc.phases.map((phase) => (
                        <div key={phase.id}>
                            <Space>
                                <Text strong>{phase.name}</Text>
                                <Text type="secondary">{phase.subtitle}</Text>
                                <Tag color={phase.status === "completed" ? "green" : phase.status === "in-progress" ? "blue" : "default"}>
                                    {phase.status === "completed" ? "已完成" : phase.status === "in-progress" ? "进行中" : "待开始"}
                                </Tag>
                            </Space>
                            <Progress
                                percent={phase.progress}
                                size="small"
                                status={phase.status === "completed" ? "success" : phase.status === "in-progress" ? "active" : "normal"}
                                style={{ marginTop: 4 }}
                            />
                        </div>
                    ))}
                </Flex>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
                    门禁通过：{passedGates} / {totalGates}
                </Text>
            </Card>

            {/* Quick actions */}
            <Space>
                <Button type="primary" onClick={() => router.push(`/projects/${id}/sdlc`)}>
                    SDLC 看板
                </Button>
                <Button onClick={() => router.push(`/projects/${id}/gap-fit`)}>
                    Gap-Fit 工作台
                </Button>
            </Space>
        </Flex>
    );
}
