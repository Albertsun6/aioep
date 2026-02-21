"use client";

import { useCallback, useEffect, useState } from "react";
import type { SDLCState, Phase, Milestone, Deliverable, GateCheck } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import {
  Card,
  Checkbox,
  Collapse,
  Flex,
  InputNumber,
  message,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";

const { Title, Paragraph, Text } = Typography;

export default function SDLCPage() {
  const { currentProject } = useProject();
  const [sdlc, setSdlc] = useState<SDLCState | null>(null);
  const [msgApi, contextHolder] = message.useMessage();

  const loadData = useCallback(() => {
    if (!currentProject) return;
    fetch(`/api/sdlc?projectId=${currentProject.id}`)
      .then((r) => r.json())
      .then(setSdlc);
  }, [currentProject]);

  useEffect(() => {
    setSdlc(null);
    loadData();
  }, [loadData]);

  const patchPhase = useCallback(
    async (phaseId: string, updates: Partial<Phase>) => {
      const res = await fetch("/api/sdlc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject?.id,
          phaseId,
          ...updates,
        }),
      });
      if (res.ok) {
        msgApi.success("已保存");
        loadData();
      } else {
        msgApi.error("保存失败");
      }
    },
    [currentProject, loadData, msgApi]
  );

  const toggleMilestone = useCallback(
    (phase: Phase, milestoneId: string) => {
      const updated = phase.milestones.map((m: Milestone) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      patchPhase(phase.id, { milestones: updated });
    },
    [patchPhase]
  );

  const toggleDeliverable = useCallback(
    (phase: Phase, deliverableId: string) => {
      const updated = phase.deliverables.map((d: Deliverable) =>
        d.id === deliverableId ? { ...d, completed: !d.completed } : d
      );
      patchPhase(phase.id, { deliverables: updated });
    },
    [patchPhase]
  );

  const cycleGateCheck = useCallback(
    (phase: Phase, gateId: string) => {
      const updated = phase.gateChecks.map((g: GateCheck) => {
        if (g.id !== gateId) return g;
        const next =
          g.passed === null ? true : g.passed === true ? false : null;
        return { ...g, passed: next };
      });
      patchPhase(phase.id, { gateChecks: updated });
    },
    [patchPhase]
  );

  if (!sdlc) {
    return (
      <Spin size="large" style={{ display: "block", margin: "80px auto" }} />
    );
  }

  const completedPhases = sdlc.phases.filter(
    (p) => p.status === "completed"
  ).length;
  const totalGates = sdlc.phases.reduce(
    (acc, p) => acc + p.gateChecks.length,
    0
  );
  const passedGates = sdlc.phases.reduce(
    (acc, p) => acc + p.gateChecks.filter((g) => g.passed).length,
    0
  );

  return (
    <>
      {contextHolder}
      <Flex vertical gap={16} style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 6 }}>
            SDLC 看板
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            软件开发生命周期 4 阶段管理 — {completedPhases}/4 阶段已完成 ·{" "}
            {passedGates}/{totalGates} 门禁已通过
          </Paragraph>
        </div>

        <Card>
          <Flex vertical gap={12}>
            {sdlc.phases.map((phase) => (
              <div key={phase.id}>
                <Flex justify="space-between" align="center">
                  <Space>
                    <Text strong>{phase.name}</Text>
                    <Text type="secondary">{phase.subtitle}</Text>
                  </Space>
                  <Select
                    size="small"
                    value={phase.status}
                    onChange={(value) => patchPhase(phase.id, { status: value })}
                    style={{ width: 100 }}
                    options={[
                      {
                        value: "completed",
                        label: <Tag color="green">已完成</Tag>,
                      },
                      {
                        value: "in-progress",
                        label: <Tag color="blue">进行中</Tag>,
                      },
                      {
                        value: "pending",
                        label: <Tag>待开始</Tag>,
                      },
                    ]}
                  />
                </Flex>
                <Flex align="center" gap={8} style={{ marginTop: 8 }}>
                  <Progress
                    percent={phase.progress}
                    size="small"
                    status={
                      phase.status === "completed"
                        ? "success"
                        : phase.status === "in-progress"
                          ? "active"
                          : "normal"
                    }
                    style={{ flex: 1 }}
                  />
                  <InputNumber
                    size="small"
                    min={0}
                    max={100}
                    value={phase.progress}
                    onChange={(val) => {
                      if (val !== null)
                        patchPhase(phase.id, { progress: val });
                    }}
                    style={{ width: 70 }}
                    suffix="%"
                  />
                </Flex>
              </div>
            ))}
          </Flex>
        </Card>

        <Collapse
          defaultActiveKey={["phase-2"]}
          items={sdlc.phases.map((phase) => ({
            key: phase.id,
            label: (
              <Space>
                <Text strong>{phase.name}</Text>
                <Text type="secondary">{phase.subtitle}</Text>
                <Tag
                  color={
                    phase.status === "completed"
                      ? "green"
                      : phase.status === "in-progress"
                        ? "blue"
                        : "default"
                  }
                >
                  {phase.progress}%
                </Tag>
              </Space>
            ),
            children: (
              <Flex vertical gap={16}>
                <Card size="small" title="里程碑">
                  <Flex vertical gap={6}>
                    {phase.milestones.map((item: Milestone) => (
                      <Checkbox
                        key={item.id}
                        checked={item.completed}
                        onChange={() => toggleMilestone(phase, item.id)}
                      >
                        {item.name}
                      </Checkbox>
                    ))}
                  </Flex>
                </Card>
                <Card size="small" title="交付物">
                  <Flex vertical gap={6}>
                    {phase.deliverables.map((item: Deliverable) => (
                      <Flex
                        key={item.id}
                        justify="space-between"
                        align="center"
                      >
                        <Checkbox
                          checked={item.completed}
                          onChange={() =>
                            toggleDeliverable(phase, item.id)
                          }
                        >
                          {item.name}
                        </Checkbox>
                        {item.path ? (
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                          >
                            {item.path}
                          </Text>
                        ) : null}
                      </Flex>
                    ))}
                  </Flex>
                </Card>
                <Card size="small" title="门禁检查（点击切换状态）">
                  <Flex vertical gap={8}>
                    {phase.gateChecks.map((item: GateCheck) => (
                      <div key={item.id}>
                        <Space>
                          <Tag
                            color={
                              item.passed === true
                                ? "green"
                                : item.passed === false
                                  ? "red"
                                  : "default"
                            }
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              cycleGateCheck(phase, item.id)
                            }
                          >
                            {item.passed === true
                              ? "通过"
                              : item.passed === false
                                ? "未通过"
                                : "未检查"}
                          </Tag>
                          <Text>{item.description}</Text>
                        </Space>
                        <div>
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, marginLeft: 8 }}
                          >
                            标准: {item.standard}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </Flex>
                </Card>
              </Flex>
            ),
          }))}
        />
      </Flex>
    </>
  );
}
