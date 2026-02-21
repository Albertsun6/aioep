"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Empty,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { AIProvider } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  "分析当前 Gap 项的优先处理方案",
  "建议下一个 Sprint 的任务规划",
  "总结当前 SDLC 进度和风险",
];

const { Text } = Typography;

export default function AIChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          provider,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "请求失败");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          );
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "未知错误";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: `错误: ${errorMsg}\n\n请检查 .env.local 中的 API Key 配置。` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer
      title="AI 助手"
      placement="right"
      size="default"
      open={open}
      onClose={onClose}
      destroyOnClose={false}
      extra={
        <Select
          value={provider}
          onChange={(value) => setProvider(value)}
          options={[
            { value: "openai", label: "OpenAI" },
            { value: "anthropic", label: "Claude" },
          ]}
          style={{ width: 120 }}
          size="small"
        />
      }
      styles={{ body: { padding: 12 } }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflow: "auto", paddingInline: 4 }}>
          {messages.length === 0 ? (
            <Flex
              vertical
              gap={12}
              style={{ width: "100%", marginTop: 24 }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="我是 AIOEP 智能助手，可协助分析 SDLC 与 Gap-Fit。"
              />
              {quickActions.map((action) => (
                <Button
                  key={action}
                  block
                  onClick={() => handleSubmit(action)}
                  style={{ textAlign: "left", height: "auto", whiteSpace: "normal" }}
                >
                  {action}
                </Button>
              ))}
            </Flex>
          ) : (
            <Flex vertical gap={10}>
              {messages.map((msg) => (
                <Flex
                  key={msg.id}
                  justify={msg.role === "user" ? "flex-end" : "flex-start"}
                  gap={8}
                >
                  {msg.role === "assistant" && (
                    <Avatar
                      size="small"
                      icon={<RobotOutlined />}
                      style={{ background: "#2563eb", flexShrink: 0 }}
                    />
                  )}
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: msg.role === "user" ? "#2563eb" : "var(--secondary)",
                      color: msg.role === "user" ? "#fff" : "inherit",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                      fontSize: 13,
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <Avatar size="small" icon={<UserOutlined />} style={{ flexShrink: 0 }} />
                  )}
                </Flex>
              ))}
            </Flex>
          )}

          {loading && (
            <Space size={8} style={{ marginTop: 8 }}>
              <Spin size="small" />
              <Text type="secondary">思考中...</Text>
            </Space>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ marginTop: 12 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入问题..."
              onPressEnter={() => handleSubmit()}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSubmit()}
              disabled={loading || !input.trim()}
            />
          </Space.Compact>
        </div>
      </div>
    </Drawer>
  );
}
