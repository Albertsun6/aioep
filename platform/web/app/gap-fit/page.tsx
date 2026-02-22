"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { FitStatus, Priority, Requirement, GapFitData } from "@/lib/types";
import { useProject } from "@/lib/project-context";
import { Bar, Pie } from "@ant-design/charts";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";

const { Title, Paragraph, Text } = Typography;

const fitColors: Record<FitStatus, string> = {
  Fit: "#22c55e",
  Partial: "#f59e0b",
  Gap: "#ef4444",
  OOS: "#94a3b8",
};

export default function GapFitPage() {
  const { currentProject } = useProject();
  const [gapfit, setGapfit] = useState<GapFitData | null>(null);
  const [search, setSearch] = useState("");
  const [fitFilter, setFitFilter] = useState<FitStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [subdomainFilter, setSubdomainFilter] = useState<string>("all");
  const [msgApi, contextHolder] = message.useMessage();

  const loadData = useCallback(() => {
    if (!currentProject) return;
    fetch(`/api/gap-fit?projectId=${currentProject.id}`)
      .then((r) => r.json())
      .then(setGapfit);
  }, [currentProject]);

  useEffect(() => { setGapfit(null); loadData(); }, [loadData]);

  const updateRequirement = useCallback(
    async (id: string, updates: Partial<Requirement>) => {
      const res = await fetch("/api/gap-fit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, projectId: currentProject?.id, ...updates }),
      });
      if (res.ok) {
        msgApi.success("已保存");
        loadData();
      } else {
        const err = await res.json();
        msgApi.error(err.error || "保存失败");
      }
    },
    [loadData, msgApi]
  );

  const subdomains = useMemo(
    () => (gapfit ? [...new Set(gapfit.requirements.map((r) => r.subdomain))] : []),
    [gapfit]
  );

  const filtered = useMemo(() => {
    if (!gapfit) return [];
    return gapfit.requirements.filter((r) => {
      const s = search.trim().toLowerCase();
      const searchOk = !s || r.id.toLowerCase().includes(s) || r.description.toLowerCase().includes(s) || r.currentCapability.toLowerCase().includes(s);
      const fitOk = fitFilter === "all" || r.fitStatus === fitFilter;
      const prioOk = priorityFilter === "all" || r.priority === priorityFilter;
      const subOk = subdomainFilter === "all" || r.subdomain === subdomainFilter;
      return searchOk && fitOk && prioOk && subOk;
    });
  }, [gapfit, search, fitFilter, priorityFilter, subdomainFilter]);

  if (!gapfit) {
    return <Spin size="large" style={{ display: "block", margin: "80px auto" }} />;
  }

  const fitCounts = (["Fit", "Partial", "Gap", "OOS"] as FitStatus[]).map((s) => ({
    name: s,
    value: gapfit.requirements.filter((r) => r.fitStatus === s).length,
    color: fitColors[s],
  }));

  const subdomainCounts = subdomains.map((sd) => ({
    name: sd,
    fit: gapfit.requirements.filter((r) => r.subdomain === sd && r.fitStatus === "Fit").length,
    partial: gapfit.requirements.filter((r) => r.subdomain === sd && r.fitStatus === "Partial").length,
    gap: gapfit.requirements.filter((r) => r.subdomain === sd && (r.fitStatus === "Gap" || r.fitStatus === "OOS")).length,
  }));

  const fitPieConfig = {
    data: fitCounts.map((item) => ({ type: item.name, value: item.value })),
    angleField: "value",
    colorField: "type",
    innerRadius: 0.62,
    radius: 0.86,
    color: ["#22c55e", "#f59e0b", "#ef4444", "#94a3b8"],
    legend: false,
    label: false,
    tooltip: { formatter: (datum: { type: string; value: number }) => ({ name: datum.type, value: `${datum.value} 项` }) },
    interactions: [{ type: "element-active" }],
  };

  const subdomainBarData = subdomainCounts.flatMap((item) => [
    { subdomain: item.name, type: "Fit", value: item.fit },
    { subdomain: item.name, type: "Partial", value: item.partial },
    { subdomain: item.name, type: "Gap/OOS", value: item.gap },
  ]);

  const subdomainBarConfig = {
    data: subdomainBarData,
    xField: "value",
    yField: "subdomain",
    seriesField: "type",
    isStack: true,
    color: ["#22c55e", "#f59e0b", "#ef4444"],
    legend: { position: "top" as const },
    xAxis: { label: { style: { fontSize: 10 } } },
    yAxis: { label: { style: { fontSize: 10 } } },
    tooltip: { shared: true },
  };

  const columns: TableProps<Requirement>["columns"] = [
    {
      title: "需求描述",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <Text>{record.description}</Text>
          <Space size={6}>
            <Tag>{record.id}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.subdomain}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "匹配度",
      dataIndex: "fitStatus",
      key: "fitStatus",
      width: 130,
      sorter: (a, b) => a.fitStatus.localeCompare(b.fitStatus),
      render: (status: FitStatus, record) => (
        <Select
          size="small"
          value={status}
          onChange={(value) => updateRequirement(record.id, { fitStatus: value as FitStatus })}
          style={{ width: 100 }}
          options={[
            { value: "Fit", label: <Tag color="green">Fit</Tag> },
            { value: "Partial", label: <Tag color="orange">Partial</Tag> },
            { value: "Gap", label: <Tag color="red">Gap</Tag> },
            { value: "OOS", label: <Tag>OOS</Tag> },
          ]}
        />
      ),
    },
    {
      title: "工作量",
      dataIndex: "effort",
      key: "effort",
      width: 100,
      sorter: (a, b) => (a.effort || "").localeCompare(b.effort || ""),
      render: (effort: Requirement["effort"]) => effort || "—",
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      sorter: (a, b) => (a.priority || "").localeCompare(b.priority || ""),
      render: (priority: Requirement["priority"], record) => (
        <Select
          size="small"
          value={priority || undefined}
          placeholder="—"
          allowClear
          onChange={(value) => updateRequirement(record.id, { priority: (value || null) as Priority | null })}
          style={{ width: 80 }}
          options={[
            { value: "P0", label: <Tag color="red">P0</Tag> },
            { value: "P1", label: <Tag color="orange">P1</Tag> },
            { value: "P2", label: <Tag color="blue">P2</Tag> },
            { value: "P3", label: <Tag>P3</Tag> },
          ]}
        />
      ),
    },
    {
      title: "Sprint",
      dataIndex: "sprint",
      key: "sprint",
      width: 120,
      render: (sprint: Requirement["sprint"]) => sprint || "—",
    },
  ];

  const hasFilters = search || fitFilter !== "all" || priorityFilter !== "all" || subdomainFilter !== "all";

  return (
    <>
      {contextHolder}
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 6 }}>Gap-Fit 工作台</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {gapfit.requirements.length} 项需求 · {gapfit.domains.join(", ")} · {gapfit.version}
          </Paragraph>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={24} xl={16}>
            <Card>
              <Space wrap style={{ marginBottom: 12 }}>
                <Input allowClear placeholder="搜索需求编号或描述..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} />
                <Select value={fitFilter} onChange={(v) => setFitFilter(v as FitStatus | "all")} style={{ width: 140 }} options={[{ value: "all", label: "全部匹配度" }, { value: "Fit", label: "Fit" }, { value: "Partial", label: "Partial" }, { value: "Gap", label: "Gap" }, { value: "OOS", label: "OOS" }]} />
                <Select value={priorityFilter} onChange={(v) => setPriorityFilter(v as Priority | "all")} style={{ width: 140 }} options={[{ value: "all", label: "全部优先级" }, { value: "P0", label: "P0" }, { value: "P1", label: "P1" }, { value: "P2", label: "P2" }, { value: "P3", label: "P3" }]} />
                <Select value={subdomainFilter} onChange={(v) => setSubdomainFilter(v)} style={{ width: 180 }} options={[{ value: "all", label: "全部子域" }, ...subdomains.map((sd) => ({ value: sd, label: sd }))]} />
                <Button disabled={!hasFilters} onClick={() => { setSearch(""); setFitFilter("all"); setPriorityFilter("all"); setSubdomainFilter("all"); }}>清除筛选</Button>
              </Space>

              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                显示 {filtered.length} / {gapfit.requirements.length} 项
              </Paragraph>

              <Table<Requirement>
                rowKey="id"
                size="small"
                columns={columns}
                dataSource={filtered}
                pagination={{ pageSize: 12 }}
                scroll={{ x: 900 }}
                expandable={{
                  expandedRowRender: (record) => (
                    <Row gutter={[12, 12]}>
                      <Col xs={24} md={12}>
                        <Text strong>现有能力</Text>
                        <Paragraph style={{ marginBottom: 0, marginTop: 6 }}>{record.currentCapability}</Paragraph>
                      </Col>
                      <Col xs={24} md={12}>
                        <Text strong>处理策略</Text>
                        <Paragraph style={{ marginBottom: 0, marginTop: 6 }}>{record.strategy || "标准功能已满足，无需额外处理"}</Paragraph>
                      </Col>
                    </Row>
                  ),
                }}
              />
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Card title="匹配度分布">
                <div style={{ height: 220 }}><Pie {...fitPieConfig} /></div>
                <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                  {fitCounts.map((item) => (
                    <Space key={item.name} style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space size={8}><span style={{ width: 10, height: 10, borderRadius: 2, display: "inline-block", background: item.color }} /><Text>{item.name}</Text></Space>
                      <Text strong>{item.value} ({Math.round((item.value / gapfit.requirements.length) * 100)}%)</Text>
                    </Space>
                  ))}
                </Space>
              </Card>
              <Card title="子域分布">
                <div style={{ height: 260 }}><Bar {...subdomainBarConfig} /></div>
              </Card>
            </Space>
          </Col>
        </Row>
      </Space>
    </>
  );
}
